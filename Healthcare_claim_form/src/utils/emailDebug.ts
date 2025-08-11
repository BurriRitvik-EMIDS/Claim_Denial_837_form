import emailjs from '@emailjs/browser';

// Direct EmailJS test with minimal parameters to identify the correct template variables
export const debugEmailJS = async (recipientEmail: string) => {
  try {
    console.log('🔍 Testing EmailJS with minimal parameters...');
    
    // Initialize EmailJS
    emailjs.init('sbbkKdTIO2Lb7K8QT');
    
    // Test with the most common EmailJS parameter names
    const testParams = {
      // Try the most common recipient parameter names one by one
      to_email: recipientEmail,
      from_email: 'burriritvik@outlook.com',
      subject: 'Test Email - Parameter Debug',
      message: 'This is a test email to debug EmailJS parameters.',
      from_name: 'Healthcare System',
      to_name: recipientEmail.split('@')[0]
    };
    
    console.log('📧 Sending test email with parameters:', testParams);
    
    const response = await emailjs.send(
      'service_yw567xd',
      'template_f2oeq78', 
      testParams,
      'sbbkKdTIO2Lb7K8QT'
    );
    
    console.log('✅ EmailJS test successful:', response);
    return { success: true, response };
    
  } catch (error: any) {
    console.error('❌ EmailJS test failed:', error);
    console.error('Error details:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    return { success: false, error };
  }
};

// Alternative test with different parameter combinations
export const testEmailJSVariations = async (recipientEmail: string) => {
  const variations = [
    // Variation 1: Standard EmailJS parameters
    {
      name: 'Standard',
      params: {
        to_email: recipientEmail,
        from_email: 'burriritvik@outlook.com',
        subject: 'Test - Standard Parameters',
        message: 'Testing standard EmailJS parameters'
      }
    },
    // Variation 2: Simple parameters
    {
      name: 'Simple',
      params: {
        email: recipientEmail,
        subject: 'Test - Simple Parameters',
        message: 'Testing simple EmailJS parameters'
      }
    },
    // Variation 3: User-focused parameters
    {
      name: 'User-focused',
      params: {
        user_email: recipientEmail,
        user_name: recipientEmail.split('@')[0],
        email_subject: 'Test - User Parameters',
        email_message: 'Testing user-focused EmailJS parameters'
      }
    }
  ];

  for (const variation of variations) {
    try {
      console.log(`🧪 Testing ${variation.name} parameter variation...`);
      console.log('Parameters:', variation.params);
      
      const response = await emailjs.send(
        'service_yw567xd',
        'template_f2oeq78',
        variation.params,
        'sbbkKdTIO2Lb7K8QT'
      );
      
      console.log(`✅ ${variation.name} variation successful:`, response);
      return { success: true, variation: variation.name, response };
      
    } catch (error: any) {
      console.log(`❌ ${variation.name} variation failed:`, error.text || error.message);
    }
  }
  
  return { success: false, message: 'All parameter variations failed' };
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).emailDebug = {
    test: debugEmailJS,
    testVariations: testEmailJSVariations
  };
}
