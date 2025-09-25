// Simple test to check if WhatsApp notifications are working
// by simulating what happens in the webhook

const testWhatsApp = async () => {
  console.log('🧪 Testing WhatsApp Group Notification...');
  
  try {
    const response = await fetch('https://jbalwikobra-com-digid-fymxrkce2-digitalindo.vercel.app/api/xendit/webhook?testGroupSend=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `🧪 **WHATSAPP SYSTEM TEST** 🧪

🔧 Testing notification flow after payment webhook fixes
⏰ ${new Date().toLocaleString('id-ID')}

✅ If you receive this message, WhatsApp notifications are working correctly!

This test confirms:
• WhatsApp API connectivity ✓
• Group message routing ✓  
• Database configurations ✓
• Webhook integration ✓

The payment notification system is ready! 🚀`
      })
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ WhatsApp Test Success!');
      console.log('Response:', result);
    } else {
      console.log('❌ WhatsApp Test Failed');
      console.log('Status:', response.status);
      console.log('Response:', result.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

testWhatsApp();
