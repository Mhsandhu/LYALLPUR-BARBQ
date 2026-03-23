const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const authAdmin = require('../middleware/authAdmin');

// GET /api/deals — public
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ dealId: 1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deals.' });
  }
});

// PUT /api/deals/:id — admin only
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { dealName, price, items, isActive } = req.body;
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { dealName, price: Number(price), items, isActive },
      { new: true }
    );
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deal.' });
  }
});

module.exports = router;
