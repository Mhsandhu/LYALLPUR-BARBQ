const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authAdmin = require('../middleware/authAdmin');

// GET /api/customers — admin only
router.get('/', authAdmin, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: { phone: '$phone' },
          customerName: { $last: '$customerName' },
          phone: { $last: '$phone' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      { $sort: { lastOrderDate: -1 } },
    ]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// GET /api/customers/:phone/orders — admin only
router.get('/:phone/orders', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders.' });
  }
});

module.exports = router;
