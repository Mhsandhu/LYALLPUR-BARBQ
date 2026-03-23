const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Lyallpur BarBQ' },
  address: { type: String, default: 'Faisalabad, Pakistan' },
  phone: { type: String, default: '0300-0000000' },
  whatsapp: { type: String, default: '+923706050759' },
  openingHours: { type: String, default: 'Mon-Sun: 12:00 PM — 12:00 AM' },
  deliveryCharge: { type: Number, default: 100 },
  deliveryAvailable: { type: Boolean, default: true },
  announcementEnabled: { type: Boolean, default: false },
  announcementText: { type: String, default: '' },
  owner1Name: { type: String, default: 'Moiz Ur Rehman Khalid' },
  owner1Photo: { type: String, default: '' },
  owner2Name: { type: String, default: 'Hammad' },
  owner2Photo: { type: String, default: '' },
});

module.exports = mongoose.model('Settings', settingsSchema);
