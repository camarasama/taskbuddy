// ============================================================================
// Family Member Controller - NEW FILE
// Handles creation of child and spouse accounts by parents
// ============================================================================

const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { generateRandomPassword } = require('../utils/passwordGenerator');
const emailService = require('../services/email.service');

// ============================================================================
// ADD CHILD TO FAMILY
// Parent or Spouse can add a child to their family
// ============================================================================
exports.addChild = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const { full_name, date_of_birth, email, phone_number } = req.body;
    const parentUserId = req.user.user_id;
    
    await client.query('BEGIN');
    
    // Verify parent is member of this family
    const memberCheck = await client.query(
      `SELECT member_id FROM family_members 
       WHERE family_id = $1 AND user_id = $2 AND relationship IN ('parent', 'spouse') AND is_active = true`,
      [familyId, parentUserId]
    );
    
    if (memberCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add members to this family'
      });
    }
    
    // Validate child age (10-16)
    const age = calculateAge(date_of_birth);
    if (age < 10 || age > 16) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Child must be between 10 and 16 years old'
      });
    }
    
    // Check if email already exists
    if (email) {
      const emailCheck = await client.query(
        'SELECT user_id FROM users WHERE email = $1',
        [email]
      );
      
      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Email address is already registered'
        });
      }
    }
    
    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, date_of_birth, phone_number, is_active, email_verified)
       VALUES ($1, $2, $3, 'child', $4, $5, true, true)
       RETURNING user_id, email, full_name, role, created_at`,
      [email, password_hash, full_name, date_of_birth, phone_number]
    );
    
    const newUser = userResult.rows[0];
    
    // Add to family_members table
    await client.query(
      `INSERT INTO family_members (family_id, user_id, relationship, points_balance)
       VALUES ($1, $2, 'child', 0)`,
      [familyId, newUser.user_id]
    );
    
    await client.query('COMMIT');
    
    // Send email with login credentials (if email provided)
    if (email) {
      try {
        await emailService.sendAccountCreationEmail(email, full_name, tempPassword, 'child');
      } catch (emailError) {
        console.error('Failed to send account creation email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Child account created successfully',
      child: {
        user_id: newUser.user_id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: newUser.created_at,
        temporary_password: tempPassword // Return in response for parent to share
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add child error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add child',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// ADD SPOUSE TO FAMILY
// Only the parent (family creator) can add a spouse
// ============================================================================
exports.addSpouse = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { familyId } = req.params;
    const { full_name, date_of_birth, email, phone_number } = req.body;
    const parentUserId = req.user.user_id;
    
    await client.query('BEGIN');
    
    // Verify user is parent (creator) of this family
    const familyCheck = await client.query(
      `SELECT created_by FROM families WHERE family_id = $1 AND is_active = true`,
      [familyId]
    );
    
    if (familyCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Family not found'
      });
    }
    
    if (familyCheck.rows[0].created_by !== parentUserId) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Only the family creator can add a spouse'
      });
    }
    
    // Check if spouse already exists in this family
    const spouseCheck = await client.query(
      `SELECT member_id FROM family_members 
       WHERE family_id = $1 AND relationship = 'spouse' AND is_active = true`,
      [familyId]
    );
    
    if (spouseCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'This family already has a spouse'
      });
    }
    
    // Validate spouse age (18+)
    const age = calculateAge(date_of_birth);
    if (age < 18) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Spouse must be at least 18 years old'
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
        message: 'Email address is already registered'
      });
    }
    
    // Generate temporary password
    const tempPassword = generateRandomPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, date_of_birth, phone_number, is_active, email_verified)
       VALUES ($1, $2, $3, 'spouse', $4, $5, true, true)
       RETURNING user_id, email, full_name, role, created_at`,
      [email, password_hash, full_name, date_of_birth, phone_number]
    );
    
    const newUser = userResult.rows[0];
    
    // Add to family_members table
    await client.query(
      `INSERT INTO family_members (family_id, user_id, relationship, points_balance)
       VALUES ($1, $2, 'spouse', 0)`,
      [familyId, newUser.user_id]
    );
    
    await client.query('COMMIT');
    
    // Send email with login credentials
    try {
      await emailService.sendAccountCreationEmail(email, full_name, tempPassword, 'spouse');
    } catch (emailError) {
      console.error('Failed to send account creation email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Spouse account created successfully',
      spouse: {
        user_id: newUser.user_id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: newUser.created_at,
        temporary_password: tempPassword // Return in response for parent to share
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add spouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add spouse',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// ============================================================================
// HELPER FUNCTION: Calculate Age
// ============================================================================
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
