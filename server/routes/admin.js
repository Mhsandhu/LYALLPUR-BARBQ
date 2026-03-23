const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lbq_secret_key_2025';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: 'Admin password not configured on server.' });
    }

    // Compare: if ADMIN_PASSWORD is already hashed use compare, otherwise do direct match
    let isMatch = false;
    if (adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, adminPassword);
    } else {
      isMatch = password === adminPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
