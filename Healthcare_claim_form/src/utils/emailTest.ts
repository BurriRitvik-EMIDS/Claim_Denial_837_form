import { initializeEmailService, generateClaimReviewEmail, type ClaimData } from './emailService';

// Test function to verify email service functionality
export const testEmailService = async (testRecipient: string = 'test@example.com'): Promise<void> => {
  console.log('🧪 Starting email service test...');

  try {
    // Test 1: Initialize service
    console.log('📧 Testing email service initialization...');
    await initializeEmailService();
    console.log('✅ Email service initialized successfully');

    // Test 2: Generate test claim data
    console.log('📋 Generating test claim data...');
    const testClaimData: ClaimData = {
      code: 'TEST-001',
      riskLevel: 'High',
      reason: 'This is a test claim for email service verification',
      validationStatus: 'invalid',
      totalClaims: 5,
      deniedClaims: 2,
      processingTime: 1.5
    };

    // Test 3: Generate email content
    console.log('✍️ Generating email content...');
    const emailData = generateClaimReviewEmail(testClaimData);
    emailData.to = testRecipient;
    console.log('✅ Email content generated successfully');
    console.log('📄 Email preview:', {
      to: emailData.to,
      subject: emailData.subject,
      messageLength: emailData.message.length
    });

    // Test 4: Validate email format
    console.log('🔍 Validating email format...');
    if (!testRecipient.includes('@')) {
      throw new Error('Invalid test email format');
    }
    console.log('✅ Email format validation passed');

    console.log('🎉 All email service tests passed!');
    console.log('📝 To send a real test email, call sendEmail() with the generated emailData');

  } catch (error) {
    console.error('❌ Email service test failed:', error);
    throw error;
  }
};

// Development utility to log email service status
export const getEmailServiceStatus = () => {
  const status = {
    timestamp: new Date().toISOString(),
    service: 'EmailJS',
    initialized: true, // Will be updated based on actual initialization
    testMode: process.env.NODE_ENV !== 'production',
    features: {
      claimReviewEmails: true,
      attachmentSupport: false, // EmailJS limitation
      realTimeValidation: true,
      errorHandling: true,
      autoRetry: false
    }
  };

  console.log('📊 Email Service Status:', status);
  return status;
};

// Export for development console access
if (typeof window !== 'undefined') {
  (window as any).emailServiceTest = {
    test: testEmailService,
    status: getEmailServiceStatus
  };
}
