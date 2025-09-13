// Test API endpoint untuk membuat notifications
// File: api/test-notification.ts

import { adminNotificationService } from '../src/services/adminNotificationService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, userName, userPhone, customerName, productName, amount, customerPhone } = req.body;

    switch (type) {
      case 'user_signup':
        await adminNotificationService.createUserSignupNotification(
          `test-user-${Date.now()}`,
          userName,
          userPhone
        );
        break;

      case 'new_order':
        await adminNotificationService.createOrderNotification(
          `test-order-${Date.now()}`,
          customerName,
          productName,
          amount,
          'new_order',
          customerPhone
        );
        break;

      case 'paid_order':
        await adminNotificationService.createOrderNotification(
          `test-order-paid-${Date.now()}`,
          customerName,
          productName,
          amount,
          'paid_order',
          customerPhone
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }

    res.status(200).json({ 
      success: true, 
      message: `${type} notification created successfully` 
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ 
      error: 'Failed to create notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
