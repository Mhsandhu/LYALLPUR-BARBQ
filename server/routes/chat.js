const express = require('express');
const router = express.Router();
const axios = require('axios');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(apiKey, systemPrompt, contents) {
  const { data } = await axios.post(
    `${GEMINI_ENDPOINT}?key=${apiKey}`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
  );
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// GET /api/chat/ping — quick diagnostic (safe, key never exposed)
router.get('/ping', (req, res) => {
  const keySet = !!(process.env.GEMINI_API_KEY);
  res.json({ ok: true, geminiKeySet: keySet, geminiKeyLength: keySet ? process.env.GEMINI_API_KEY.length : 0 });
});

// GET /api/chat/test — live Gemini call test
router.get('/test', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ ok: false, error: 'No API key' });
    const reply = await callGemini(
      apiKey,
      'You are a helpful assistant.',
      [{ role: 'user', parts: [{ text: 'Say "Lyallpur BarBQ test OK" in one sentence.' }] }]
    );
    res.json({ ok: true, model: 'gemini-2.0-flash', reply });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'AI service not configured.' });
    }

    // Fetch live menu + settings in parallel
    const [menuItems, settings] = await Promise.all([
      MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }),
      Settings.findOne(),
    ]);

    // Group menu by category
    const menuByCategory = {};
    menuItems.forEach((item) => {
      if (!menuByCategory[item.category]) menuByCategory[item.category] = [];
      const desc = item.description ? ` — ${item.description}` : '';
      menuByCategory[item.category].push(`${item.name}: Rs. ${item.price}${desc}`);
    });

    const menuText = Object.entries(menuByCategory)
      .map(([cat, items]) => `${cat}:\n${items.map((i) => `  • ${i}`).join('\n')}`)
      .join('\n\n');

    const restaurantName = settings?.restaurantName || 'Lyallpur BarBQ';
    const address = settings?.address || 'Faisalabad, Pakistan';
    const phone = settings?.phone || 'N/A';
    const hours = settings?.openingHours || '12:00 PM – 12:00 AM';
    const deliveryCharge = settings?.deliveryCharge || 0;
    const deliveryInfo = settings?.deliveryAvailable
      ? `Haan, delivery available hai. Delivery charge: Rs. ${deliveryCharge}`
      : 'Abhi delivery available nahi hai. Dine-in ya takeaway ho sakta hai.';

    const systemPrompt = `Aap ${restaurantName} ke liye ek professional aur friendly AI customer service agent hain. Aapka naam "Barbq Assistant" hai.

Aap Roman Urdu aur English dono mein naturally baat karte hain — jaise customer bolta hai waisi hi language use karein. Har jawab professional, helpful aur concise hona chahiye.

=== Restaurant Info ===
Naam: ${restaurantName}
Address: ${address}
Phone/WhatsApp: ${phone}
Opening Hours: ${hours}
Delivery: ${deliveryInfo}

=== Complete Menu ===
${menuText || 'Menu update ho raha hai, thodi der mein available hoga.'}

=== Aapke Rules ===
- Sirf restaurant, menu, food, orders, delivery, hours aur location ke baare mein jawab dein
- Menu se exact prices batayein — kabhi guess mat karein
- Order karne ke liye website ka Order section ya WhatsApp use karne ki guide karein
- Har reply 2-4 sentences mein rakhen — concise aur clear
- Agar koi cheez pata nahi, politely batayein aur kuch aur help offer karein
- Unrelated questions (politics, jokes, general knowledge) ka jawab mat dein
- Tone friendly aur welcoming rakhen — aap ${restaurantName} ki pehchaan hain`;

    // Build contents array — strict user/model alternation
    const contents = [];
    const validHistory = history.filter((m) => m.role && m.text && m.text.trim());
    for (const m of validHistory) {
      const role = m.role === 'user' ? 'user' : 'model';
      if (contents.length > 0 && contents[contents.length - 1].role === role) continue;
      contents.push({ role, parts: [{ text: m.text.trim() }] });
    }
    // Must start with user
    if (contents.length > 0 && contents[0].role !== 'user') contents.shift();
    // Add current message
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    const reply = await callGemini(apiKey, systemPrompt, contents);

    if (!reply) {
      return res.status(500).json({ error: 'Empty response from AI.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('[Chat API Error]', err.message);
    res.status(500).json({ error: 'Chat service temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
