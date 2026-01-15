const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `TaskBuddy <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email
  welcome: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TaskBuddy! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to TaskBuddy - your family's activity planning companion!</p>
          <p>We're excited to help your family stay organized and engaged.</p>
          <p>Get started by creating tasks and setting up rewards for your family members.</p>
          <p>Happy organizing! 🚀</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 TaskBuddy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Task assigned notification
  taskAssigned: (childName, taskTitle, deadline, points) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .task-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10B981; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Task Assigned! 📋</h1>
        </div>
        <div class="content">
          <p>Hi ${childName},</p>
          <p>You have a new task assigned to you:</p>
          <div class="task-box">
            <h3>${taskTitle}</h3>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <p><strong>Points:</strong> ${points} 🌟</p>
          </div>
          <p>Log in to TaskBuddy to view the full details and get started!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 TaskBuddy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Task completed notification (for parents)
  taskCompleted: (parentName, childName, taskTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Task Ready for Review! 👀</h1>
        </div>
        <div class="content">
          <p>Hi ${parentName},</p>
          <p>${childName} has completed the task: <strong>${taskTitle}</strong></p>
          <p>Please log in to TaskBuddy to review and approve or reject the submission.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 TaskBuddy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Task approved notification
  taskApproved: (childName, taskTitle, points) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success-box { background: #D1FAE5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Task Approved! ✅</h1>
        </div>
        <div class="content">
          <p>Hi ${childName},</p>
          <div class="success-box">
            <p>Great job! Your task "<strong>${taskTitle}</strong>" has been approved!</p>
            <p><strong>Points Earned:</strong> ${points} 🌟</p>
          </div>
          <p>Keep up the excellent work!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 TaskBuddy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Reward redemption request (for parents)
  rewardRequested: (parentName, childName, rewardName, pointsRequired) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reward Redemption Request! 🎁</h1>
        </div>
        <div class="content">
          <p>Hi ${parentName},</p>
          <p>${childName} has requested to redeem a reward:</p>
          <p><strong>Reward:</strong> ${rewardName}</p>
          <p><strong>Points Required:</strong> ${pointsRequired} 🌟</p>
          <p>Please log in to TaskBuddy to approve or deny this request.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 TaskBuddy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
};
