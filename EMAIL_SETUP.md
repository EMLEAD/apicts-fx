# APICTS Email System Setup Guide

## Overview
The APICTS email system uses **Nodemailer** with **EJS templates** for sending professional, responsive emails via SMTP. This system supports multiple email types including welcome emails, contact forms, password resets, and transaction notifications.

## Features
- ✅ **SMTP Integration** - Works with Gmail, Outlook, and other SMTP providers
- ✅ **EJS Templates** - Professional, responsive email templates
- ✅ **Multiple Email Types** - Welcome, contact, verification, password reset, transaction notifications
- ✅ **Email Validation** - Built-in email format validation
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **Security** - Secure token-based operations

## Quick Setup

### 1. Install Dependencies
```bash
npm install nodemailer ejs
```

### 2. Configure Environment Variables
Add these to your `.env.local` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Email Settings
EMAIL_FROM_NAME=APICTS Support
EMAIL_REPLY_TO=support@apicts.com
CONTACT_EMAIL=contact@apicts.com
SITE_URL=http://localhost:3000
```

### 3. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

### 4. Test Email Connection
```bash
curl http://localhost:3000/api/email/contact
```

## Email Templates

### Available Templates
- **Welcome Email** (`welcome.ejs`) - Sent to new users
- **Contact Form** (`contact.ejs`) - Contact form submissions
- **Password Reset** (`password-reset.ejs`) - Password reset links
- **Email Verification** (`verification.ejs`) - Account verification
- **Transaction Notification** (`transaction.ejs`) - Transaction updates

### Template Features
- 📱 **Responsive Design** - Works on all devices
- 🎨 **APICTS Branding** - Blue and red color scheme
- 🔒 **Security Notices** - Built-in security warnings
- ⚡ **Fast Loading** - Optimized HTML/CSS

## API Endpoints

### 1. Contact Form Email
```javascript
POST /api/email/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+234 123 456 7890",
  "subject": "General Inquiry",
  "message": "Hello, I need help with..."
}
```

### 2. Welcome Email
```javascript
POST /api/email/welcome
{
  "userEmail": "user@example.com",
  "userName": "John Doe"
}
```

### 3. Password Reset Email
```javascript
POST /api/email/password-reset
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "resetToken": "abc123xyz789"
}
```

### 4. Verification Email
```javascript
POST /api/email/verification
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "verificationToken": "verify123abc"
}
```

### 5. Transaction Notification
```javascript
POST /api/email/transaction
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "transactionData": {
    "transactionId": "TXN123456",
    "type": "Currency Exchange",
    "amount": "₦50,000",
    "fromCurrency": "NGN",
    "toCurrency": "USD",
    "exchangeRate": "1 USD = ₦750",
    "fee": "₦500",
    "status": "completed"
  }
}
```

## Usage Examples

### Frontend Integration
```javascript
// Contact form submission
const handleContactSubmit = async (formData) => {
  try {
    const response = await fetch('/api/email/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Message sent successfully!');
    } else {
      alert('Failed to send message: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Send welcome email after registration
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const response = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, userName })
    });
    
    const result = await response.json();
    console.log('Welcome email sent:', result);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};
```

### Backend Integration
```javascript
import emailService from '@/lib/email/service';

// Send email after user registration
const sendWelcomeEmail = async (user) => {
  try {
    await emailService.sendWelcomeEmail(user.email, user.name);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// Send transaction notification
const notifyTransaction = async (user, transaction) => {
  try {
    await emailService.sendTransactionNotification(
      user.email,
      user.name,
      transaction
    );
  } catch (error) {
    console.error('Failed to send transaction notification:', error);
  }
};
```

## SMTP Providers

### Gmail (Recommended)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

### Custom SMTP
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Security Features

### 1. Email Validation
- Validates email format before sending
- Prevents invalid email addresses

### 2. Token Security
- Password reset tokens expire in 1 hour
- Verification tokens expire in 24 hours
- Secure token generation

### 3. Rate Limiting
- Built-in protection against spam
- Email sending limits

### 4. Error Handling
- Comprehensive error logging
- Graceful failure handling
- User-friendly error messages

## Troubleshooting

### Common Issues

#### 1. SMTP Connection Failed
```
Error: SMTP Server connection failed
```
**Solution:**
- Check your SMTP credentials
- Verify 2FA is enabled (for Gmail)
- Use App Password instead of regular password
- Check firewall settings

#### 2. Template Not Found
```
Error: Failed to render email template
```
**Solution:**
- Ensure template files exist in `src/lib/email/templates/`
- Check template file permissions
- Verify EJS syntax in templates

#### 3. Email Not Delivered
**Check:**
- Spam folder
- Email address validity
- SMTP provider limits
- Network connectivity

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Production Considerations

### 1. Email Service Providers
For production, consider:
- **SendGrid** - Reliable delivery
- **Mailgun** - Developer-friendly
- **Amazon SES** - Cost-effective
- **Postmark** - Transactional emails

### 2. Monitoring
- Set up email delivery monitoring
- Track bounce rates
- Monitor spam complaints

### 3. Compliance
- Follow CAN-SPAM Act
- Include unsubscribe links
- Respect user preferences

## Support

For issues with the email system:
1. Check the console logs
2. Verify SMTP configuration
3. Test with a simple email first
4. Contact support if issues persist

---

**Your email system is now ready! 🚀**

Test it by sending a contact form email or welcome email to verify everything works correctly.

