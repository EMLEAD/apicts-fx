const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP Server connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP Server connection failed:', error.message);
    return false;
  }
};

// Email configuration
const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'APICTS Support',
    address: process.env.SMTP_USER
  },
  replyTo: process.env.EMAIL_REPLY_TO || process.env.SMTP_USER,
  templates: {
    path: './src/lib/email/templates/',
    engine: 'ejs'
  }
};

module.exports = {
  transporter,
  verifyConnection,
  emailConfig
};
