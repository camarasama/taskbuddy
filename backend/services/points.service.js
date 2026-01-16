// ============================================================================
// Points Service
// Manages points transactions and balances
// ============================================================================

const pool = require('../config/database');

// ============================================================================
// AWARD POINTS (When task is approved)
// ============================================================================
exports.awardPoints = async (
  childId,
  familyId,
  pointsAmount,
  referenceType = 'task',
  referenceId = null,
  description = 'Task completed',
  createdBy = null
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get family member record
    const memberResult = await client.query(
      'SELECT member_id, points_balance FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, familyId]
    );

    if (memberResult.rows.length === 0) {
      throw new Error('Family member not found');
    }

    const { member_id, points_balance } = memberResult.rows[0];

    // Update points balance
    const newBalance = points_balance + pointsAmount;
    await client.query(
      'UPDATE family_members SET points_balance = $1 WHERE member_id = $2',
      [newBalance, member_id]
    );

    // Log transaction
    await client.query(
      `INSERT INTO points_log (
        family_member_id, transaction_type, points_amount, 
        reference_type, reference_id, description, created_by
       )
       VALUES ($1, 'earned', $2, $3, $4, $5, $6)`,
      [member_id, pointsAmount, referenceType, referenceId, description, createdBy]
    );

    await client.query('COMMIT');

    console.log(`Awarded ${pointsAmount} points to child ${childId}`);
    return newBalance;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error awarding points:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// DEDUCT POINTS (When reward is redeemed)
// ============================================================================
exports.deductPoints = async (
  childId,
  familyId,
  pointsAmount,
  referenceType = 'reward',
  referenceId = null,
  description = 'Reward redeemed',
  createdBy = null
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get family member record
    const memberResult = await client.query(
      'SELECT member_id, points_balance FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, familyId]
    );

    if (memberResult.rows.length === 0) {
      throw new Error('Family member not found');
    }

    const { member_id, points_balance } = memberResult.rows[0];

    // Check if sufficient balance
    if (points_balance < pointsAmount) {
      throw new Error('Insufficient points balance');
    }

    // Update points balance
    const newBalance = points_balance - pointsAmount;
    await client.query(
      'UPDATE family_members SET points_balance = $1 WHERE member_id = $2',
      [newBalance, member_id]
    );

    // Log transaction (negative amount)
    await client.query(
      `INSERT INTO points_log (
        family_member_id, transaction_type, points_amount, 
        reference_type, reference_id, description, created_by
       )
       VALUES ($1, 'spent', $2, $3, $4, $5, $6)`,
      [member_id, -pointsAmount, referenceType, referenceId, description, createdBy]
    );

    await client.query('COMMIT');

    console.log(`Deducted ${pointsAmount} points from child ${childId}`);
    return newBalance;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deducting points:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// ADJUST POINTS (Manual adjustment by parent)
// ============================================================================
exports.adjustPoints = async (
  childId,
  familyId,
  pointsAmount,
  description = 'Manual adjustment',
  createdBy
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get family member record
    const memberResult = await client.query(
      'SELECT member_id, points_balance FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, familyId]
    );

    if (memberResult.rows.length === 0) {
      throw new Error('Family member not found');
    }

    const { member_id, points_balance } = memberResult.rows[0];

    // Calculate new balance
    const newBalance = points_balance + pointsAmount;

    // Prevent negative balance
    if (newBalance < 0) {
      throw new Error('Adjustment would result in negative balance');
    }

    // Update points balance
    await client.query(
      'UPDATE family_members SET points_balance = $1 WHERE member_id = $2',
      [newBalance, member_id]
    );

    // Log transaction
    const transactionType = pointsAmount > 0 ? 'earned' : 'spent';
    await client.query(
      `INSERT INTO points_log (
        family_member_id, transaction_type, points_amount, 
        reference_type, reference_id, description, created_by
       )
       VALUES ($1, 'adjusted', $2, 'manual', NULL, $3, $4)`,
      [member_id, pointsAmount, description, createdBy]
    );

    await client.query('COMMIT');

    console.log(`Adjusted points for child ${childId} by ${pointsAmount}`);
    return newBalance;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adjusting points:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// GET POINTS BALANCE
// ============================================================================
exports.getBalance = async (childId, familyId) => {
  try {
    const result = await pool.query(
      'SELECT points_balance FROM family_members WHERE user_id = $1 AND family_id = $2',
      [childId, familyId]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    return result.rows[0].points_balance;

  } catch (error) {
    console.error('Error getting points balance:', error);
    throw error;
  }
};

// ============================================================================
// GET POINTS HISTORY
// ============================================================================
exports.getHistory = async (childId, familyId, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT pl.*, u.full_name as created_by_name
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       LEFT JOIN users u ON pl.created_by = u.user_id
       WHERE fm.user_id = $1 AND fm.family_id = $2
       ORDER BY pl.created_at DESC
       LIMIT $3`,
      [childId, familyId, limit]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting points history:', error);
    throw error;
  }
};

// ============================================================================
// GET TOTAL POINTS EARNED
// ============================================================================
exports.getTotalEarned = async (childId, familyId) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(points_amount), 0) as total_earned
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1 AND fm.family_id = $2 
         AND pl.transaction_type = 'earned'`,
      [childId, familyId]
    );

    return parseInt(result.rows[0].total_earned);

  } catch (error) {
    console.error('Error getting total points earned:', error);
    throw error;
  }
};

// ============================================================================
// GET TOTAL POINTS SPENT
// ============================================================================
exports.getTotalSpent = async (childId, familyId) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(ABS(points_amount)), 0) as total_spent
       FROM points_log pl
       INNER JOIN family_members fm ON pl.family_member_id = fm.member_id
       WHERE fm.user_id = $1 AND fm.family_id = $2 
         AND pl.transaction_type = 'spent'`,
      [childId, familyId]
    );

    return parseInt(result.rows[0].total_spent);

  } catch (error) {
    console.error('Error getting total points spent:', error);
    throw error;
  }
};

// ============================================================================
// GET FAMILY LEADERBOARD
// ============================================================================
exports.getFamilyLeaderboard = async (familyId) => {
  try {
    const result = await pool.query(
      `SELECT fm.user_id, u.full_name, u.profile_picture, fm.points_balance,
              COUNT(ta.assignment_id) FILTER (WHERE ta.status = 'approved') as tasks_completed
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       LEFT JOIN task_assignments ta ON u.user_id = ta.assigned_to
       WHERE fm.family_id = $1 AND fm.relationship = 'child' AND fm.is_active = TRUE
       GROUP BY fm.user_id, u.full_name, u.profile_picture, fm.points_balance
       ORDER BY fm.points_balance DESC, tasks_completed DESC`,
      [familyId]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting family leaderboard:', error);
    throw error;
  }
};

// ============================================================================
// CALCULATE POINTS FOR TASK (Based on priority, deadline, etc.)
// ============================================================================
exports.calculateTaskPoints = (basePoints, priority, isOverdue = false) => {
  let points = basePoints;

  // Bonus for priority
  switch (priority) {
    case 'urgent':
      points *= 1.5;
      break;
    case 'high':
      points *= 1.25;
      break;
    case 'medium':
      points *= 1.0;
      break;
    case 'low':
      points *= 0.75;
      break;
  }

  // Penalty for overdue (if applicable in your system)
  if (isOverdue) {
    points *= 0.5;
  }

  return Math.round(points);
};

// ============================================================================
// CHECK IF CHILD CAN AFFORD REWARD
// ============================================================================
exports.canAfford = async (childId, familyId, pointsRequired) => {
  try {
    const balance = await this.getBalance(childId, familyId);
    return balance >= pointsRequired;

  } catch (error) {
    console.error('Error checking if child can afford reward:', error);
    throw error;
  }
};
