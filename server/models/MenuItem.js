const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Chicken', 'Rice & Bread', 'Extras'] },
  price: { type: Number, default: 0 },
  description: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
