// Simple API test to verify endpoints locally
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock the admin handler for testing
app.get('/api/admin', async (req, res) => {
  const { action } = req.query;
  
  console.log(`API call received: ${action}`);
  
  try {
    switch (action) {
      case 'dashboard':
        res.json({
          success: true,
          data: {
            orders: { count: 25, completed: 18, revenue: 15000000, completedRevenue: 12000000 },
            users: { count: 156 },
            products: { count: 89 },
            flashSales: { count: 12 }
          }
        });
        break;
        
      case 'orders':
        res.json({
          success: true,
          data: []
        });
        break;
        
      case 'users':
        res.json({
          success: true,
          data: []
        });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log('- http://localhost:3001/api/admin?action=dashboard');
  console.log('- http://localhost:3001/api/admin?action=orders');
  console.log('- http://localhost:3001/api/admin?action=users');
});
