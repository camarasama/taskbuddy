// ============================================================================
// Redemption Controller - Reward redemption operations
// ============================================================================

const pool = require('../config/database');
const pointsService = require('../services/points.service');
const notificationService = require('../services/notification.service');

exports.requestRedemption = async (req, res) => {
  const client = await pool.connect();
  try {
    const { reward_id } = req.body;
    const childId = req.user.user_id;

    await client.query('BEGIN');

    // Get reward and check availability
    const rewardResult = await client.query(
      'SELECT * FROM rewards WHERE reward_id = $1',
      [reward_id]
    );

    if (rewardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    const reward = rewardResult.rows[0];

    // Check if reward is available
    if (reward.status !== 'available' || reward.quantity_available <= reward.quantity_redeemed) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Reward not available' });
    }

    // Check child's points balance
    const balanceResult = await client.query(
      'SELECT points_balance, family_id FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, reward.family_id]
    );

    if (balanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Not a member of this family' });
    }

    const { points_balance, family_id } = balanceResult.rows[0];

    if (points_balance < reward.points_required) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient points',
        required: reward.points_required,
        available: points_balance
      });
    }

    // Create redemption request
    const redemptionResult = await client.query(
      `INSERT INTO reward_redemptions (reward_id, child_id, family_id, points_spent)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [reward_id, childId, family_id, reward.points_required]
    );

    // Notify parents
    const parentsResult = await client.query(
      `SELECT user_id FROM family_members WHERE family_id = $1 AND relationship IN ('parent', 'spouse')`,
      [family_id]
    );

    for (const parent of parentsResult.rows) {
      await notificationService.createNotification(parent.user_id, 'reward_requested',
        'Reward Redemption Request', `A child requested to redeem: ${reward.reward_name}`,
        'redemption', redemptionResult.rows[0].redemption_id);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Redemption requested', data: { redemption: redemptionResult.rows[0] } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Request redemption error:', error);
    res.status(500).json({ success: false, message: 'Failed to request redemption', error: error.message });
  } finally {
    client.release();
  }
};

exports.getMyRedemptions = async (req, res) => {
  try {
    const childId = req.user.user_id;
    
    const result = await pool.query(
      `SELECT rr.*, r.reward_name, r.description 
       FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       WHERE rr.child_id = $1 ORDER BY rr.requested_at DESC`,
      [childId]
    );

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get my redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.cancelRedemption = async (req, res) => {
  try {
    const { redemptionId } = req.params;
    const childId = req.user.user_id;

    const result = await pool.query(
      `UPDATE reward_redemptions SET status = 'cancelled' 
       WHERE redemption_id = $1 AND child_id = $2 AND status = 'pending'
       RETURNING *`,
      [redemptionId, childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cannot cancel this redemption' });
    }

    res.status(200).json({ success: true, message: 'Redemption cancelled' });
  } catch (error) {
    console.error('Cancel redemption error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel redemption', error: error.message });
  }
};

exports.getRedemptions = async (req, res) => {
  try {
    const { familyId, status, childId } = req.query;
    let query = `
      SELECT rr.*, r.reward_name, u.full_name as child_name
      FROM reward_redemptions rr
      INNER JOIN rewards r ON rr.reward_id = r.reward_id
      INNER JOIN users u ON rr.child_id = u.user_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (familyId) {
      query += ` AND rr.family_id = $${paramCount}`;
      values.push(familyId);
      paramCount++;
    }
    if (status) {
      query += ` AND rr.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    if (childId) {
      query += ` AND rr.child_id = $${paramCount}`;
      values.push(childId);
      paramCount++;
    }

    query += ' ORDER BY rr.requested_at DESC';
    const result = await pool.query(query, values);

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.getRedemptionById = async (req, res) => {
  try {
    const { redemptionId } = req.params;
    
    const result = await pool.query(
      `SELECT rr.*, r.reward_name, r.description, u.full_name as child_name
       FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       INNER JOIN users u ON rr.child_id = u.user_id
       WHERE rr.redemption_id = $1`,
      [redemptionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Redemption not found' });
    }

    res.status(200).json({ success: true, data: { redemption: result.rows[0] } });
  } catch (error) {
    console.error('Get redemption error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemption', error: error.message });
  }
};

exports.reviewRedemption = async (req, res) => {
  const client = await pool.connect();
  try {
    const { redemptionId } = req.params;
    const { status, review_notes } = req.body;
    const reviewerId = req.user.user_id;

    await client.query('BEGIN');

    // Get redemption details
    const redemptionResult = await client.query(
      `SELECT rr.*, r.reward_name FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       WHERE rr.redemption_id = $1`,
      [redemptionId]
    );

    if (redemptionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Redemption not found' });
    }

    const redemption = redemptionResult.rows[0];

    // Update redemption status
    await client.query(
      `UPDATE reward_redemptions 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, review_notes = $3
       WHERE redemption_id = $4`,
      [status, reviewerId, review_notes, redemptionId]
    );

    if (status === 'approved') {
      // Deduct points from child
      await pointsService.deductPoints(redemption.child_id, redemption.family_id,
        redemption.points_spent, 'reward', redemption.reward_id, `Redeemed: ${redemption.reward_name}`);

      // Update reward quantity redeemed
      await client.query(
        'UPDATE rewards SET quantity_redeemed = quantity_redeemed + 1 WHERE reward_id = $1',
        [redemption.reward_id]
      );

      // Notify child - approved
      await notificationService.createNotification(redemption.child_id, 'reward_approved',
        'Reward Approved!', `Your redemption request for ${redemption.reward_name} has been approved!`,
        'redemption', redemptionId);
    } else if (status === 'denied') {
      // Notify child - denied
      await notificationService.createNotification(redemption.child_id, 'reward_denied',
        'Reward Request Denied', review_notes || 'Your redemption request was denied',
        'redemption', redemptionId);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: `Redemption ${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Review redemption error:', error);
    res.status(500).json({ success: false, message: 'Failed to review redemption', error: error.message });
  } finally {
    client.release();
  }
};

exports.getPendingRedemptions = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT rr.*, r.reward_name, u.full_name as child_name
       FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       INNER JOIN users u ON rr.child_id = u.user_id
       WHERE rr.family_id = $1 AND rr.status = 'pending'
       ORDER BY rr.requested_at ASC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get pending redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.getFamilyRedemptions = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT rr.*, r.reward_name, u.full_name as child_name
       FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       INNER JOIN users u ON rr.child_id = u.user_id
       WHERE rr.family_id = $1
       ORDER BY rr.requested_at DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get family redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.getChildRedemptions = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      `SELECT rr.*, r.reward_name FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.reward_id
       WHERE rr.child_id = $1
       ORDER BY rr.requested_at DESC`,
      [childId]
    );

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get child redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.getRewardRedemptions = async (req, res) => {
  try {
    const { rewardId } = req.params;
    
    const result = await pool.query(
      `SELECT rr.*, u.full_name as child_name FROM reward_redemptions rr
       INNER JOIN users u ON rr.child_id = u.user_id
       WHERE rr.reward_id = $1
       ORDER BY rr.requested_at DESC`,
      [rewardId]
    );

    res.status(200).json({ success: true, data: { redemptions: result.rows } });
  } catch (error) {
    console.error('Get reward redemptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get redemptions', error: error.message });
  }
};

exports.getChildRedemptionStats = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'denied') as denied,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        SUM(points_spent) FILTER (WHERE status = 'approved') as total_points_spent
       FROM reward_redemptions WHERE child_id = $1`,
      [childId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get child redemption stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};

exports.getFamilyRedemptionStats = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        SUM(points_spent) FILTER (WHERE status = 'approved') as total_points_redeemed
       FROM reward_redemptions WHERE family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get family redemption stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};
