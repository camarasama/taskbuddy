// ============================================================================
// Email Service - UPDATED
// Handles email sending using Nodemailer
// Changes: Added sendAccountCreationEmail function for child/spouse accounts
// ============================================================================

const nodemailer = require('nodemailer');

// ============================================================================
// CREATE Transport
// ============================================================================
const createTransport= () => {
  // For development: Use Gmail or other SMTP service
  // For production: Use a service like SendGrid, AWS SES, etc.
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// ============================================================================
// SEND EMAIL VERIFICATION
// ============================================================================
exports.sendVerificationEmail = async (email, fullName, verificationToken) => {
  try {
    const Transport= createTransport();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - TaskBuddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to TaskBuddy!</h2>
          <p>Hi ${fullName},</p>
          <p>Thank you for registering with TaskBuddy. Please verify your email address to get started.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account with TaskBuddy, 
            please ignore this email.
          </p>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log('Verification email sent to:', email);

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// ============================================================================
// SEND PASSWORD RESET EMAIL
// ============================================================================
exports.sendPasswordResetEmail = async (email, fullName, resetToken) => {
  try {
    const Transport= createTransport();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - TaskBuddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hi ${fullName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, 
            please ignore this email and your password will remain unchanged.
          </p>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// ============================================================================
// SEND ACCOUNT CREATION EMAIL - NEW FUNCTION
// Sends login credentials to child/spouse accounts created by parent
// ============================================================================
exports.sendAccountCreationEmail = async (email, fullName, temporaryPassword, accountType = 'child') => {
  try {
    const Transport= createTransport();
    
    const accountTypeName = accountType === 'child' ? 'Child' : 'Spouse';
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your TaskBuddy Account Has Been Created`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to TaskBuddy, ${fullName}!</h2>
          <p>A family member has created a ${accountTypeName.toLowerCase()} account for you on TaskBuddy.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border: 2px solid #4F46E5; margin: 10px 0;">
              <code style="font-size: 18px; font-weight: bold; color: #4F46E5;">${temporaryPassword}</code>
            </div>
          </div>
          
          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <p style="margin: 0; color: #92400E;">
              <strong>⚠️ Important:</strong> Please change your password after your first login for security.
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to TaskBuddy
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            If you did not expect this email, please contact your family administrator or 
            ignore this message.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          
          <p style="color: #6B7280; font-size: 12px;">
            This is an automated email from TaskBuddy. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log(`Account creation email sent to: ${email} (${accountType})`);

  } catch (error) {
    console.error('Error sending account creation email:', error);
    // Don't throw error - account is still created even if email fails
  }
};

// ============================================================================
// SEND TASK NOTIFICATION EMAIL
// ============================================================================
exports.sendTaskNotificationEmail = async (email, fullName, taskTitle, notificationType) => {
  try {
    const Transport= createTransport();
    
    let subject, message;
    
    switch (notificationType) {
      case 'task_assigned':
        subject = 'New Task Assigned - TaskBuddy';
        message = `You have been assigned a new task: "${taskTitle}". Log in to TaskBuddy to view the details.`;
        break;
      case 'task_approved':
        subject = 'Task Approved - TaskBuddy';
        message = `Great job! Your task "${taskTitle}" has been approved. You've earned points!`;
        break;
      case 'task_rejected':
        subject = 'Task Needs Revision - TaskBuddy';
        message = `Your task "${taskTitle}" needs some improvements. Please check the feedback and resubmit.`;
        break;
      case 'deadline_reminder':
        subject = 'Task Deadline Reminder - TaskBuddy';
        message = `Reminder: Your task "${taskTitle}" is due soon. Don't forget to complete it!`;
        break;
      default:
        return;
    }
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">TaskBuddy Notification</h2>
          <p>Hi ${fullName},</p>
          <p>${message}</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log('Task notification email sent to:', email);

  } catch (error) {
    console.error('Error sending task notification email:', error);
    // Don't throw error for notification emails
  }
};

// ============================================================================
// SEND REWARD NOTIFICATION EMAIL
// ============================================================================
exports.sendRewardNotificationEmail = async (email, fullName, rewardName, notificationType) => {
  try {
    const Transport= createTransport();
    
    let subject, message;
    
    switch (notificationType) {
      case 'reward_approved':
        subject = 'Reward Approved - TaskBuddy';
        message = `Congratulations! Your reward redemption for "${rewardName}" has been approved!`;
        break;
      case 'reward_denied':
        subject = 'Reward Request Denied - TaskBuddy';
        message = `Your reward redemption request for "${rewardName}" was not approved. Please check the feedback.`;
        break;
      default:
        return;
    }
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">TaskBuddy Notification</h2>
          <p>Hi ${fullName},</p>
          <p>${message}</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log('Reward notification email sent to:', email);

  } catch (error) {
    console.error('Error sending reward notification email:', error);
    // Don't throw error for notification emails
  }
};

// ============================================================================
// SEND WELCOME EMAIL
// ============================================================================
exports.sendWelcomeEmail = async (email, fullName) => {
  try {
    const Transport= createTransport();
    
    const mailOptions = {
      from: `"TaskBuddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to TaskBuddy!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to TaskBuddy!</h2>
          <p>Hi ${fullName},</p>
          <p>Your email has been verified successfully. You can now start using TaskBuddy to manage family activities!</p>
          <p>Here's what you can do:</p>
          <ul style="line-height: 1.8;">
            <li>Create and assign tasks to family members</li>
            <li>Track task completion with photo verification</li>
            <li>Award points for completed tasks</li>
            <li>Set up rewards for motivation</li>
            <li>Generate family activity reports</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            Need help? Contact us at support@taskbuddy.com
          </p>
        </div>
      `
    };

    await Transport.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome emails
  }
};