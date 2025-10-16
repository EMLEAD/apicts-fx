const emailService = require('./src/lib/email/service');
const { verifyConnection } = require('./src/lib/email/config');

async function testEmailSystem() {
  console.log('🧪 Testing APICTS Email System...\n');

  // Test 1: Verify SMTP Connection
  console.log('1️⃣ Testing SMTP Connection...');
  try {
    const isConnected = await verifyConnection();
    if (isConnected) {
      console.log('✅ SMTP Connection: SUCCESS\n');
    } else {
      console.log('❌ SMTP Connection: FAILED\n');
      return;
    }
  } catch (error) {
    console.log('❌ SMTP Connection Error:', error.message, '\n');
    return;
  }

  // Test 2: Send Test Welcome Email
  console.log('2️⃣ Testing Welcome Email...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const result = await emailService.sendWelcomeEmail(testEmail, 'Test User');
    console.log('✅ Welcome Email: SUCCESS');
    console.log('   Message ID:', result.messageId);
    console.log('   Sent to:', result.to, '\n');
  } catch (error) {
    console.log('❌ Welcome Email Error:', error.message, '\n');
  }

  // Test 3: Send Test Contact Email
  console.log('3️⃣ Testing Contact Email...');
  try {
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+234 123 456 7890',
      subject: 'Test Contact Form',
      message: 'This is a test message from the email system.'
    };
    
    const result = await emailService.sendContactEmail(contactData);
    console.log('✅ Contact Email: SUCCESS');
    console.log('   Message ID:', result.messageId);
    console.log('   Sent to:', result.to, '\n');
  } catch (error) {
    console.log('❌ Contact Email Error:', error.message, '\n');
  }

  // Test 4: Send Test Password Reset Email
  console.log('4️⃣ Testing Password Reset Email...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const resetToken = 'test-reset-token-123';
    const result = await emailService.sendPasswordResetEmail(testEmail, 'Test User', resetToken);
    console.log('✅ Password Reset Email: SUCCESS');
    console.log('   Message ID:', result.messageId);
    console.log('   Sent to:', result.to, '\n');
  } catch (error) {
    console.log('❌ Password Reset Email Error:', error.message, '\n');
  }

  // Test 5: Send Test Verification Email
  console.log('5️⃣ Testing Verification Email...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const verificationToken = 'test-verification-token-123';
    const result = await emailService.sendVerificationEmail(testEmail, 'Test User', verificationToken);
    console.log('✅ Verification Email: SUCCESS');
    console.log('   Message ID:', result.messageId);
    console.log('   Sent to:', result.to, '\n');
  } catch (error) {
    console.log('❌ Verification Email Error:', error.message, '\n');
  }

  // Test 6: Send Test Transaction Notification
  console.log('6️⃣ Testing Transaction Notification...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const transactionData = {
      transactionId: 'TXN-TEST-123',
      type: 'Currency Exchange',
      amount: '₦50,000',
      fromCurrency: 'NGN',
      toCurrency: 'USD',
      exchangeRate: '1 USD = ₦750',
      fee: '₦500',
      status: 'completed'
    };
    
    const result = await emailService.sendTransactionNotification(testEmail, 'Test User', transactionData);
    console.log('✅ Transaction Notification: SUCCESS');
    console.log('   Message ID:', result.messageId);
    console.log('   Sent to:', result.to, '\n');
  } catch (error) {
    console.log('❌ Transaction Notification Error:', error.message, '\n');
  }

  console.log('🎉 Email System Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check your email inbox for test emails');
  console.log('2. Verify email templates render correctly');
  console.log('3. Test with real email addresses');
  console.log('4. Set up production SMTP provider');
}

// Run the test
testEmailSystem().catch(console.error);

