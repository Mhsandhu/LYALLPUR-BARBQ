const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `LBQ-${y}${m}${d}-${rand}`;
}

// POST /api/orders — Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, city, orderType, selectedDeal, individualItems, specialInstructions, subtotal } = req.body;

    if (!customerName || !phone || !orderType) {
      return res.status(400).json({ error: 'Customer name, phone, and order type are required.' });
    }

    if (orderType === 'delivery' && !address) {
      return res.status(400).json({ error: 'Address is required for delivery orders.' });
    }

    const deliveryCharge = orderType === 'delivery' ? 100 : 0;
    const totalPrice = (subtotal || 0) + deliveryCharge;

    const order = new Order({
      orderNumber: generateOrderNumber(),
      customerName,
      phone,
      address: address || '',
      city: city || '',
      orderType,
      selectedDeal: selectedDeal || null,
      individualItems: individualItems || [],
      specialInstructions: specialInstructions || '',
      subtotal: subtotal || 0,
      deliveryCharge,
      totalPrice,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// GET /api/orders — Get all orders (for admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// PATCH /api/orders/:id/status — Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// DELETE /api/orders/:id — Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// PATCH /api/orders/bulk-status — Bulk update status
router.patch('/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Order.updateMany({ _id: { $in: ids } }, { status });
    res.json({ success: true, updated: ids.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk update orders.' });
  }
});

module.exports = router;
