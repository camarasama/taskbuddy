// ============================================================================
// Points Controller
// ============================================================================

const pool = require('../config/database');
const pointsService = require('../services/points.service');

exports.getMyBalance = async (req, res) => {
  try {
    const childId = req.user.user_id;
    const result = await pool.query(
      'SELECT points_balance FROM family_members WHERE user_id = $1',
      [childId]
    );

    const balance = result.rows.length > 0 ? result.rows[0].points_balance : 0;
    res.status(200).json({ success: true, data: { points_balance: balance } });
  } catch (error) {
    console.error('Get my balance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get balance', error: error.message });
  }
};

exports.getChildBalance = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await pool.query(
      'SELECT points_balance FROM family_members WHERE user_id = $1',
      [childId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    res.status(200).json({ success: true, data: { points_balance: result.rows[0].points_balance } });
  } catch (error) {
    console.error('Get child balance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get balance', error: error.message });
  }
};

exports.getFamilyBalances = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query(
      `SELECT fm.user_id, u.full_name, fm.points_balance
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       WHERE fm.family_id = $1 AND fm.relationship = 'child'
       ORDER BY fm.points_balance DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { balances: result.rows } });
  } catch (error) {
    console.error('Get family balances error:', error);
    res.status(500).json({ success: false, message: 'Failed to get balances', error: error.message });
  }
};

exports.getMyHistory = async (req, res) => {
  try {
    const childId = req.user.user_id;
    const result = await pool.query(
      `SELECT pl.*, u.full_name as created_by_name
       FROM points_log pl
       LEFT JOIN users u ON pl.created_by = u.user_id
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1
       ORDER BY pl.created_at DESC`,
      [childId]
    );

    res.status(200).json({ success: true, data: { history: result.rows } });
  } catch (error) {
    console.error('Get my history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
  }
};

exports.getChildHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await pool.query(
      `SELECT pl.*, u.full_name as created_by_name
       FROM points_log pl
       LEFT JOIN users u ON pl.created_by = u.user_id
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1
       ORDER BY pl.created_at DESC`,
      [childId]
    );

    res.status(200).json({ success: true, data: { history: result.rows } });
  } catch (error) {
    console.error('Get child history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
  }
};

exports.getFamilyHistory = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query(
      `SELECT pl.*, u1.full_name as child_name, u2.full_name as created_by_name
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       INNER JOIN users u1 ON fm.user_id = u1.user_id
       LEFT JOIN users u2 ON pl.created_by = u2.user_id
       WHERE fm.family_id = $1
       ORDER BY pl.created_at DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { history: result.rows } });
  } catch (error) {
    console.error('Get family history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { logId } = req.params;
    const result = await pool.query('SELECT * FROM points_log WHERE log_id = $1', [logId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: { transaction: result.rows[0] } });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to get transaction', error: error.message });
  }
};

exports.adjustPoints = async (req, res) => {
  try {
    const { child_id, family_id, points_amount, description } = req.body;
    const creatorId = req.user.user_id;

    await pointsService.adjustPoints(child_id, family_id, points_amount, description, creatorId);
    res.status(200).json({ success: true, message: 'Points adjusted successfully' });
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust points', error: error.message });
  }
};

exports.awardBonus = async (req, res) => {
  try {
    const { child_id, family_id, points_amount, description } = req.body;
    const creatorId = req.user.user_id;

    await pointsService.awardPoints(child_id, family_id, points_amount, 'manual', null, description || 'Bonus points', creatorId);
    res.status(200).json({ success: true, message: 'Bonus points awarded' });
  } catch (error) {
    console.error('Award bonus error:', error);
    res.status(500).json({ success: false, message: 'Failed to award bonus', error: error.message });
  }
};

exports.deductPenalty = async (req, res) => {
  try {
    const { child_id, family_id, points_amount, description } = req.body;
    const creatorId = req.user.user_id;

    await pointsService.deductPoints(child_id, family_id, points_amount, 'manual', null, description || 'Penalty deduction', creatorId);
    res.status(200).json({ success: true, message: 'Penalty points deducted' });
  } catch (error) {
    console.error('Deduct penalty error:', error);
    res.status(500).json({ success: false, message: 'Failed to deduct penalty', error: error.message });
  }
};

exports.getChildPointsStats = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(points_amount) FILTER (WHERE transaction_type = 'earned') as total_earned,
        SUM(points_amount) FILTER (WHERE transaction_type = 'spent') as total_spent,
        (SELECT points_balance FROM family_members WHERE user_id = $1 LIMIT 1) as current_balance
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1`,
      [childId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get child points stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};

exports.getFamilyPointsStats = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT fm.user_id) as total_children,
        SUM(fm.points_balance) as total_points,
        AVG(fm.points_balance) as avg_points,
        MAX(fm.points_balance) as highest_balance
       FROM family_members fm
       WHERE fm.family_id = $1 AND fm.relationship = 'child'`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { statistics: result.rows[0] } });
  } catch (error) {
    console.error('Get family points stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics', error: error.message });
  }
};

exports.getFamilyLeaderboard = async (req, res) => {
  try {
    const { familyId } = req.params;
    const result = await pool.query(
      `SELECT fm.user_id, u.full_name, u.profile_picture, fm.points_balance
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       WHERE fm.family_id = $1 AND fm.relationship = 'child'
       ORDER BY fm.points_balance DESC`,
      [familyId]
    );

    res.status(200).json({ success: true, data: { leaderboard: result.rows } });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get leaderboard', error: error.message });
  }
};

exports.getTotalPointsEarned = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await pool.query(
      `SELECT SUM(points_amount) as total_earned
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1 AND pl.transaction_type = 'earned'`,
      [childId]
    );

    res.status(200).json({ success: true, data: { total_earned: result.rows[0].total_earned || 0 } });
  } catch (error) {
    console.error('Get total earned error:', error);
    res.status(500).json({ success: false, message: 'Failed to get total', error: error.message });
  }
};

exports.getTotalPointsSpent = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await pool.query(
      `SELECT SUM(ABS(points_amount)) as total_spent
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1 AND pl.transaction_type = 'spent'`,
      [childId]
    );

    res.status(200).json({ success: true, data: { total_spent: result.rows[0].total_spent || 0 } });
  } catch (error) {
    console.error('Get total spent error:', error);
    res.status(500).json({ success: false, message: 'Failed to get total', error: error.message });
  }
};
