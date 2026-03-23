const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const authAdmin = require('../middleware/authAdmin');
const multer = require('multer');
const path = require('path');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menu-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/menu — public
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

// POST /api/menu — admin only
router.post('/', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, isAvailable } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || '');
    const item = new MenuItem({
      name,
      category,
      price: Number(price) || 0,
      description: description || '',
      image,
      isAvailable: isAvailable !== 'false',
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

// PUT /api/menu/:id — admin only
router.put('/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description, imageUrl, isAvailable } = req.body;
    const update = { name, category, price: Number(price) || 0, description: description || '', isAvailable: isAvailable !== 'false' };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      update.image = imageUrl;
    }
    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

// DELETE /api/menu/:id — admin only
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

module.exports = router;
