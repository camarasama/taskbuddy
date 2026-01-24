// ============================================================================
// Family Controller
// Handles family creation, management, and member operations
// ============================================================================

const { pool } = require('../config/database');
const { generateFamilyCode } = require('../utils/helpers');

// ============================================================================
// CREATE FAMILY
// ============================================================================
exports.createFamily = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { family_name } = req.body;
    const creatorId = req.user.user_id;

    await client.query('BEGIN');

    // Generate unique family code
    let familyCode;
    let isUnique = false;
    
    while (!isUnique) {
      familyCode = generateFamilyCode();
      const codeCheck = await client.query(
        'SELECT family_id FROM families WHERE family_code = $1',
        [familyCode]
      );
      isUnique = codeCheck.rows.length === 0;
    }

    // Create family
    const familyResult = await client.query(
      `INSERT INTO families (family_name, created_by, family_code)
       VALUES ($1, $2, $3)
       RETURNING family_id, family_name, family_code, created_at`,
      [family_name, creatorId, familyCode]
    );

    const family = familyResult.rows[0];

    // Add creator as family member with 'parent' relationship
    await client.query(
      `INSERT INTO family_members (family_id, user_id, relationship)
       VALUES ($1, $2, 'parent')`,
      [family.family_id, creatorId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Family created successfully',
      data: {
        family
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create family error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create family',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET USER'S FAMILIES
// ============================================================================
exports.getUserFamilies = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT f.family_id, f.family_name, f.family_code, f.created_at,
              fm.relationship, fm.joined_at, fm.points_balance,
              u.full_name as creator_name
       FROM families f
       INNER JOIN family_members fm ON f.family_id = fm.family_id
       INNER JOIN users u ON f.created_by = u.user_id
       WHERE fm.user_id = $1 AND fm.is_active = TRUE AND f.is_active = TRUE
       ORDER BY fm.joined_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        families: result.rows
      }
    });

  } catch (error) {
    console.error('Get user families error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get families',
      error: error.message
    });
  }
};

// ============================================================================
// GET FAMILY BY ID
// ============================================================================
exports.getFamilyById = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user is a member of this family
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    // Get family details
    const familyResult = await pool.query(
      `SELECT f.family_id, f.family_name, f.family_code, f.is_active, 
              f.created_at, f.updated_at,
              u.user_id as creator_id, u.full_name as creator_name
       FROM families f
       INNER JOIN users u ON f.created_by = u.user_id
       WHERE f.family_id = $1`,
      [familyId]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    // Get family members count
    const membersCount = await pool.query(
      `SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN fm.relationship = 'child' THEN 1 END) as children_count,
        COUNT(CASE WHEN fm.relationship IN ('parent', 'spouse') THEN 1 END) as parents_count
       FROM family_members fm
       WHERE fm.family_id = $1 AND fm.is_active = TRUE`,
      [familyId]
    );

    const family = {
      ...familyResult.rows[0],
      ...membersCount.rows[0]
    };

    res.status(200).json({
      success: true,
      data: {
        family
      }
    });

  } catch (error) {
    console.error('Get family by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE FAMILY
// ============================================================================
exports.updateFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { family_name } = req.body;
    const userId = req.user.user_id;

    // Check if user has permission (parent or spouse)
    const memberCheck = await pool.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only parents and spouses can update family information'
      });
    }

    const result = await pool.query(
      `UPDATE families 
       SET family_name = $1, updated_at = CURRENT_TIMESTAMP
       WHERE family_id = $2
       RETURNING family_id, family_name, family_code, updated_at`,
      [family_name, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Family updated successfully',
      data: {
        family: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE FAMILY
// ============================================================================
exports.deleteFamily = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Check if user is the creator
    const familyCheck = await client.query(
      'SELECT created_by FROM families WHERE family_id = $1',
      [familyId]
    );

    if (familyCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    if (familyCheck.rows[0].created_by !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Only the family creator can delete the family'
      });
    }

    // Soft delete family
    await client.query(
      `UPDATE families 
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE family_id = $1`,
      [familyId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Family deleted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete family error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete family',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// JOIN FAMILY WITH CODE
// ============================================================================
exports.joinFamily = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { family_code } = req.body;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Find family by code
    const familyResult = await client.query(
      'SELECT family_id, family_name FROM families WHERE family_code = $1 AND is_active = TRUE',
      [family_code]
    );

    if (familyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Invalid family code'
      });
    }

    const family = familyResult.rows[0];

    // Check if user is already a member
    const memberCheck = await client.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [family.family_id, userId]
    );

    if (memberCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this family'
      });
    }

    // Get user role to determine relationship
    const userResult = await client.query(
      'SELECT role FROM users WHERE user_id = $1',
      [userId]
    );

    const relationship = userResult.rows[0].role;

    // Add user to family
    await client.query(
      `INSERT INTO family_members (family_id, user_id, relationship)
       VALUES ($1, $2, $3)`,
      [family.family_id, userId, relationship]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `Successfully joined ${family.family_name}`,
      data: {
        family
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Join family error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join family',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET FAMILY MEMBERS
// ============================================================================
exports.getFamilyMembers = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user is a member
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    // Get all family members
    const result = await pool.query(
      `SELECT fm.member_id, fm.relationship, fm.points_balance, fm.joined_at,
              u.user_id, u.email, u.full_name, u.role, u.profile_picture, u.date_of_birth
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       WHERE fm.family_id = $1 AND fm.is_active = TRUE AND u.is_active = TRUE
       ORDER BY 
         CASE fm.relationship 
           WHEN 'parent' THEN 1 
           WHEN 'spouse' THEN 2 
           WHEN 'child' THEN 3 
         END,
         fm.joined_at ASC`,
      [familyId]
    );

    res.status(200).json({
      success: true,
      data: {
        members: result.rows
      }
    });

  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family members',
      error: error.message
    });
  }
};

// ============================================================================
// ADD FAMILY MEMBER (Create child account)
// ============================================================================
exports.addFamilyMember = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const { email, password, full_name, date_of_birth } = req.body;
    const creatorId = req.user.user_id;

    await client.query('BEGIN');

    // Check if user has permission
    const permissionCheck = await client.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, creatorId]
    );

    if (permissionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Only parents and spouses can add family members'
      });
    }

    // Check if email already exists
    const emailCheck = await client.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create child user account
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, date_of_birth, email_verified)
       VALUES ($1, $2, $3, 'child', $4, TRUE)
       RETURNING user_id, email, full_name, role, date_of_birth`,
      [email, password_hash, full_name, date_of_birth]
    );

    const childUser = userResult.rows[0];

    // Add child to family
    await client.query(
      `INSERT INTO family_members (family_id, user_id, relationship)
       VALUES ($1, $2, 'child')`,
      [familyId, childUser.user_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Child account created and added to family successfully',
      data: {
        user: childUser
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add family member',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET FAMILY MEMBER BY ID
// ============================================================================
exports.getFamilyMemberById = async (req, res) => {
  try {
    const { familyId, userId } = req.params;
    const requesterId = req.user.user_id;

    // Check if requester is a member
    const memberCheck = await pool.query(
      'SELECT member_id FROM family_members WHERE family_id = $1 AND user_id = $2',
      [familyId, requesterId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    // Get member details
    const result = await pool.query(
      `SELECT fm.member_id, fm.relationship, fm.points_balance, fm.joined_at,
              u.user_id, u.email, u.full_name, u.role, u.profile_picture, 
              u.date_of_birth, u.phone_number
       FROM family_members fm
       INNER JOIN users u ON fm.user_id = u.user_id
       WHERE fm.family_id = $1 AND fm.user_id = $2 AND fm.is_active = TRUE`,
      [familyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        member: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get family member by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family member',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE FAMILY MEMBER
// ============================================================================
exports.updateFamilyMember = async (req, res) => {
  try {
    const { familyId, userId } = req.params;
    const { relationship } = req.body;
    const requesterId = req.user.user_id;

    // Check if requester has permission
    const permissionCheck = await pool.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, requesterId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only parents and spouses can update family members'
      });
    }

    const result = await pool.query(
      `UPDATE family_members 
       SET relationship = $1
       WHERE family_id = $2 AND user_id = $3
       RETURNING member_id, family_id, user_id, relationship`,
      [relationship, familyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Family member updated successfully',
      data: {
        member: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family member',
      error: error.message
    });
  }
};

// ============================================================================
// REMOVE FAMILY MEMBER
// ============================================================================
exports.removeFamilyMember = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId, userId } = req.params;
    const requesterId = req.user.user_id;

    await client.query('BEGIN');

    // Check if requester has permission
    const permissionCheck = await client.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, requesterId]
    );

    if (permissionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Only parents and spouses can remove family members'
      });
    }

    // Check if trying to remove family creator
    const familyCheck = await client.query(
      'SELECT created_by FROM families WHERE family_id = $1',
      [familyId]
    );

    if (familyCheck.rows[0].created_by === userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the family creator. Delete the family instead.'
      });
    }

    // Soft delete family member
    const result = await client.query(
      `UPDATE family_members 
       SET is_active = FALSE
       WHERE family_id = $1 AND user_id = $2
       RETURNING member_id`,
      [familyId, userId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Family member removed successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Remove family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove family member',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// LEAVE FAMILY
// ============================================================================
exports.leaveFamily = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Check if user is the family creator
    const familyCheck = await client.query(
      'SELECT created_by FROM families WHERE family_id = $1',
      [familyId]
    );

    if (familyCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    if (familyCheck.rows[0].created_by === userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Family creator cannot leave. Delete the family or transfer ownership first.'
      });
    }

    // Remove user from family
    const result = await client.query(
      `UPDATE family_members 
       SET is_active = FALSE
       WHERE family_id = $1 AND user_id = $2
       RETURNING member_id`,
      [familyId, userId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this family'
      });
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'You have left the family'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Leave family error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave family',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// GET FAMILY CODE
// ============================================================================
exports.getFamilyCode = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    // Check if user has permission
    const permissionCheck = await pool.query(
      `SELECT relationship FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse')`,
      [familyId, userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only parents and spouses can view the family code'
      });
    }

    const result = await pool.query(
      'SELECT family_code FROM families WHERE family_id = $1',
      [familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        family_code: result.rows[0].family_code
      }
    });

  } catch (error) {
    console.error('Get family code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family code',
      error: error.message
    });
  }
};

// ============================================================================
// REGENERATE FAMILY CODE
// ============================================================================
exports.regenerateFamilyCode = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const userId = req.user.user_id;

    await client.query('BEGIN');

    // Check if user is family creator
    const familyCheck = await client.query(
      'SELECT created_by FROM families WHERE family_id = $1',
      [familyId]
    );

    if (familyCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }

    if (familyCheck.rows[0].created_by !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Only the family creator can regenerate the family code'
      });
    }

    // Generate new unique code
    let newCode;
    let isUnique = false;
    
    while (!isUnique) {
      newCode = generateFamilyCode();
      const codeCheck = await client.query(
        'SELECT family_id FROM families WHERE family_code = $1',
        [newCode]
      );
      isUnique = codeCheck.rows.length === 0;
    }

    // Update family code
    const result = await client.query(
      `UPDATE families 
       SET family_code = $1, updated_at = CURRENT_TIMESTAMP
       WHERE family_id = $2
       RETURNING family_id, family_name, family_code`,
      [newCode, familyId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Family code regenerated successfully',
      data: {
        family: result.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Regenerate family code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate family code',
      error: error.message
    });
  } finally {
    client.release();
  }
};
