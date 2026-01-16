// ============================================================================
// Reward Controller
// Handles reward creation, updates, and management
// ============================================================================

const pool = require('../config/database');

exports.createReward = async (req, res) => {
  try {
    const { family_id, reward_name, description, points_required, quantity_available } = req.body;
    const creatorId = req.user.user_id;

    const result = await pool.query(
      `INSERT INTO rewards (family_id, created_by, reward_name, description, points_required, quantity_available)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [family_id, creatorId, reward_name, description, points_required, quantity_available]
    );

    res.status(201).json({ success: true, message: 'Reward created successfully', data: { reward: result.rows[0] } });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reward', error: error.message });
  }
};

exports.getRewards = async (req, res) => {
  try {
    const { familyId, status } = req.query;
    let query = 'SELECT * FROM rewards WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (familyId) {
      query += ` AND family_id = $${paramCount}`;
      values.push(familyId);
      paramCount++;
    }
    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);

    res.status(200).json({ success: true, data: { rewards: result.rows } });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to get rewards', error: error.message });
  }
};

exports.getRewardById = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const result = await pool.query('SELECT * FROM rewards WHERE reward_id = $1', [rewardId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    res.status(200).json({ success: true, data: { reward: result.rows[0] } });
  } catch (error) {
    console.error('Get reward error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reward', error: error.message });
  }
};

exports.updateReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { reward_name, description, points_required, quantity_available } = req.body;

    const result = await pool.query(
      `UPDATE rewards SET reward_name = $1, description = $2, points_required = $3, 
       quantity_available = $4, updated_at = CURRENT_TIMESTAMP
       WHERE reward_id = $5 RETURNING *`,
      [reward_name, description, points_required, quantity_available, rewardId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    res.status(200).json({ success: true, message: 'Reward updated successfully', data: { reward: result.rows[0] } });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ success: false, message: 'Failed to update reward', error: error.message });
  }
};

exports.deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    await pool.query('DELETE FROM rewards WHERE reward_id = $1', [rewardId]);
    res.status(200).json({ success: true, message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reward', error: error.message });
  }
};

exports.updateRewardStatus = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE rewards SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE reward_id = $2 RETURNING *',
      [status, rewardId]
    );

    res.status(200).json({ success: true, message: 'Reward status updated', data: { reward: result.rows[0] } });
  } catch (error) {
    console.error('Update reward status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

exports.uploadRewardImage = async (req, res) => {
  try {
    const { rewardId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/rewards/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE rewards SET reward_image = $1, updated_at = CURRENT_TIMESTAMP WHERE reward_id = $2 RETURNING *',
      [fileUrl, rewardId]
    );

    res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { reward: result.rows[0] } });
  } catch (error) {
    console.error('Upload reward image error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
  }
};

exports.deleteRewardImage = async (req, res) => {
  try {
    const { rewardId } = req.params;
    await pool.query(
      'UPDATE rewards SET reward_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE reward_id = $1',
      [rewardId]
    );

    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete reward image error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image', error: error.message });
  }
};

exports.getFamilyRewards = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query('SELECT * FROM rewards WHERE family_id = $1 ORDER BY created_at DESC', [familyId]);
    res.status(200).json({ success: true, data: { rewards: result.rows } });
  } catch (error) {
    console.error('Get family rewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to get rewards', error: error.message });
  }
};

exports.getAvailableRewards = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query(
      `SELECT * FROM rewards 
       WHERE family_id = $1 AND status = 'available' AND quantity_available > quantity_redeemed
       ORDER BY points_required ASC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { rewards: result.rows } });
  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to get rewards', error: error.message });
  }
};

exports.getAffordableRewards = async (req, res) => {
  try {
    const { familyId, childId } = req.params;
    
    const balanceResult = await pool.query(
      'SELECT points_balance FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, childId]
    );

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    const points_balance = balanceResult.rows[0].points_balance;

    const result = await pool.query(
      `SELECT * FROM rewards 
       WHERE family_id = $1 AND status = 'available' AND points_required <= $2
       AND quantity_available > quantity_redeemed
       ORDER BY points_required ASC`,
      [familyId, points_balance]
    );

    res.status(200).json({ success: true, data: { rewards: result.rows, points_balance } });
  } catch (error) {
    console.error('Get affordable rewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to get rewards', error: error.message });
  }
};

exports.getRewardStatistics = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_rewards,
        COUNT(*) FILTER (WHERE status = 'available') as available_rewards,
        SUM(quantity_redeemed) as total_redemptions,
        AVG(points_required) as avg_points_cost
       FROM rewards WHERE family_id = $1`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get reward statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};
