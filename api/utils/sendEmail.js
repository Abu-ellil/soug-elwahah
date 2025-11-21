/**
 * @file utils/sendEmail.js - Email utility
 * @description وحدة إرسال البريد الإلكتروني
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// إعداد transporter للبريد الإلكتروني
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password'
  }
});

/**
 * إرسال بريد إلكتروني
 * @param {Object} options - خيارات البريد الإلكتروني
 * @param {string} options.email - عنوان البريد الإلكتروني للمستقبل
 * @param {string} options.subject - موضوع البريد الإلكتروني
 * @param {string} options.html - محتوى HTML للبريد الإلكتروني
 * @param {string} options.text - نص بسيط للبريد الإلكتروني (اختياري)
 * @returns {Promise<Object>} - نتيجة إرسال البريد الإلكتروني
 */
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@tawseela.com',
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '') // إزالة HTML للحصول على النص البسيط
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${options.email}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    logger.error(`Failed to send email to ${options.email}: ${error.message}`);
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * إرسال بريد إلكتروني للتحقق من البريد الإلكتروني
 * @param {string} email - عنوان البريد الإلكتروني
 * @param {string} verificationToken - رمز التحقق
 * @returns {Promise<Object>} - نتيجة إرسال البريد الإلكتروني
 */
exports.sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p>Thank you for registering with Tawseela!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">If you didn't create an account with us, please ignore this email.</p>
    </div>
  `;

  return await exports.sendEmail({
    email,
    subject: 'Verify Your Email Address - Tawseela',
    html
  });
};

/**
 * إرسال بريد إلكتروني لاستعادة كلمة المرور
 * @param {string} email - عنوان البريد الإلكتروني
 * @param {string} resetToken - رمز الاستعادة
 * @returns {Promise<Object>} - نتيجة إرسال البريد الإلكتروني
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You have requested to reset your password for your Tawseela account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return await exports.sendEmail({
    email,
    subject: 'Password Reset - Tawseela',
    html
  });
};