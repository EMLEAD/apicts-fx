const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { transporter, emailConfig } = require('./config');

class EmailService {
  constructor() {
    this.templatesPath = path.join(process.cwd(), 'src/lib/email/templates');
  }

  // Render EJS template
  async renderTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
      const template = await fs.readFile(templatePath, 'utf8');
      
      return ejs.render(template, {
        ...data,
        siteName: 'APICTS',
        siteUrl: process.env.SITE_URL || 'http://localhost:3000',
        currentYear: new Date().getFullYear()
      });
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      throw new Error(`Failed to render email template: ${templateName}`);
    }
  }

  // Send email with template
  async sendEmail({ to, subject, template, data = {}, attachments = [] }) {
    try {
      const html = await this.renderTemplate(template, data);
      
      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        replyTo: emailConfig.replyTo,
        subject,
        html,
        attachments
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        to,
        subject
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to APICTS - Your Currency Exchange Journey Begins!',
      template: 'welcome',
      data: {
        userName,
        userEmail
      }
    });
  }

  // Send contact form email
  async sendContactEmail(formData) {
    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission from ${formData.name}`,
      template: 'contact',
      data: {
        ...formData,
        timestamp: new Date().toLocaleString()
      }
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: userEmail,
      subject: 'Reset Your APICTS Password',
      template: 'password-reset',
      data: {
        userName,
        resetUrl,
        resetToken
      }
    });
  }

  // Send verification email
  async sendVerificationEmail(userEmail, userName, verificationToken) {
    const verificationUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    return this.sendEmail({
      to: userEmail,
      subject: 'Verify Your APICTS Account',
      template: 'verification',
      data: {
        userName,
        verificationUrl,
        verificationToken
      }
    });
  }

  // Send transaction notification
  async sendTransactionNotification(userEmail, userName, transactionData) {
    return this.sendEmail({
      to: userEmail,
      subject: `Transaction ${transactionData.status} - ${transactionData.type}`,
      template: 'transaction',
      data: {
        userName,
        ...transactionData
      }
    });
  }

  // Send newsletter
  async sendNewsletter(subscribers, newsletterData) {
    const results = [];
    
    for (const subscriber of subscribers) {
      try {
        const result = await this.sendEmail({
          to: subscriber.email,
          subject: newsletterData.subject,
          template: 'newsletter',
          data: {
            subscriberName: subscriber.name,
            ...newsletterData
          }
        });
        results.push({ success: true, email: subscriber.email, ...result });
      } catch (error) {
        results.push({ success: false, email: subscriber.email, error: error.message });
      }
    }
    
    return results;
  }
}

module.exports = new EmailService();

