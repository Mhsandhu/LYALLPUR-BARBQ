const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  dealId: { type: Number, required: true, unique: true },
  dealName: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  items: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Deal', dealSchema);
