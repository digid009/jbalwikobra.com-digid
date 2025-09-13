/**
 * Create Test Notification for Mark as Read Testing
 * This script creates a test notification that can be used to test 
 * mark as read functionality directly in the browser
 */

console.log('🔧 Creating Test Notification for Mark as Read Testing');
console.log('====================================================\n');

// This should be run in the browser console while on the admin page
// Import the service first
import { adminNotificationService } from './src/services/adminNotificationService.js';

async function createTestNotification() {
  try {
    console.log('Creating test notification...');
    
    // Create directly through the service
    await adminNotificationService.createOrderNotification(
      'test-order-' + Date.now(),
      'Test Mark Read Customer',
      'Mobile Legends 1000 Diamond',
      150000,
      'new_order',
      '081234567890'
    );
    
    console.log('✅ Test notification created successfully!');
    console.log('📱 Check the floating notifications to see it appear');
    console.log('📋 Go to admin notifications tab to see it in the list');
    console.log('🔘 Try clicking "Tandai Sudah Dibaca" button to test mark as read');
    
  } catch (error) {
    console.error('❌ Failed to create test notification:', error);
  }
}

// For browser console usage
window.createTestNotification = createTestNotification;
