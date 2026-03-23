const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  orderType: {
    type: String,
    enum: ['delivery', 'takeaway'],
    required: true,
  },
  selectedDeal: {
    dealId: Number,
    dealName: String,
    price: Number,
  },
  individualItems: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  specialInstructions: {
    type: String,
    trim: true,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 100,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
