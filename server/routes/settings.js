const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authAdmin = require('../middleware/authAdmin');
const bcrypt = require('bcryptjs');

// GET /api/settings — public (for announcement etc)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings — admin only
router.put('/', authAdmin, async (req, res) => {
  try {
    const {
      restaurantName, address, phone, whatsapp, openingHours,
      deliveryCharge, deliveryAvailable, announcementEnabled, announcementText,
      owner1Name, owner1Photo, owner2Name, owner2Photo,
    } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    if (restaurantName !== undefined) settings.restaurantName = restaurantName;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (whatsapp !== undefined) settings.whatsapp = whatsapp;
    if (openingHours !== undefined) settings.openingHours = openingHours;
    if (deliveryCharge !== undefined) settings.deliveryCharge = Number(deliveryCharge);
    if (deliveryAvailable !== undefined) settings.deliveryAvailable = deliveryAvailable;
    if (announcementEnabled !== undefined) settings.announcementEnabled = announcementEnabled;
    if (announcementText !== undefined) settings.announcementText = announcementText;
    if (owner1Name !== undefined) settings.owner1Name = owner1Name;
    if (owner1Photo !== undefined) settings.owner1Photo = owner1Photo;
    if (owner2Name !== undefined) settings.owner2Name = owner2Name;
    if (owner2Photo !== undefined) settings.owner2Photo = owner2Photo;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// PUT /api/settings/password — admin only
router.put('/password', authAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password required.' });
    }
    const adminPassword = process.env.ADMIN_PASSWORD;
    let isMatch = false;
    if (adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(currentPassword, adminPassword);
    } else {
      isMatch = currentPassword === adminPassword;
    }
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    // Note: Cannot update .env at runtime. Return the hashed password for manual update.
    const hashed = await bcrypt.hash(newPassword, 12);
    res.json({
      success: true,
      message: 'Password changed. Update your .env ADMIN_PASSWORD to:',
      hashedPassword: hashed,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
