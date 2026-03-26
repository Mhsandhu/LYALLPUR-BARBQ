const express = require('express');
const router = express.Router();
const axios = require('axios');
const MenuItem = require('../models/MenuItem');
const Deal = require('../models/Deal');
const Settings = require('../models/Settings');

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(apiKey, systemPrompt, contents) {
  const { data } = await axios.post(
    `${GEMINI_ENDPOINT}?key=${apiKey}`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 55000 }
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

    // Fetch live menu, deals + settings in parallel
    const [menuItems, deals, settings] = await Promise.all([
      MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }),
      Deal.find({ isActive: true }).sort({ dealId: 1 }),
      Settings.findOne(),
    ]);

    // Group menu by category — skip items with no price set
    const menuByCategory = {};
    menuItems.forEach((item) => {
      if (!menuByCategory[item.category]) menuByCategory[item.category] = [];
      const desc = item.description ? ` — ${item.description}` : '';
      const price = item.price && item.price > 0 ? `Rs. ${item.price}` : 'price pata karein (call/WhatsApp karein)';
      menuByCategory[item.category].push(`${item.name}: ${price}${desc}`);
    });

    const menuText = Object.entries(menuByCategory)
      .map(([cat, items]) => `${cat}:\n${items.map((i) => `  • ${i}`).join('\n')}`)
      .join('\n\n');

    // Build deals text
    const dealsText = deals.length
      ? deals.map((d) => {
          const price = d.price && d.price > 0 ? `Rs. ${d.price}` : 'price pata karein (call/WhatsApp karein)';
          return `  • ${d.dealName}: ${price}\n    Items: ${d.items}`;
        }).join('\n')
      : 'Abhi koi active deal nahi hai.';

    const restaurantName = settings?.restaurantName || 'Lyallpur BarBQ';
    const address = settings?.address || 'Faisalabad, Pakistan';
    const phone = settings?.phone || 'N/A';
    const hours = settings?.openingHours || '12:00 PM – 12:00 AM';
    const deliveryCharge = settings?.deliveryCharge || 0;
    const deliveryInfo = settings?.deliveryAvailable
      ? `Haan, delivery available hai. Delivery charge: Rs. ${deliveryCharge}`
      : 'Abhi delivery available nahi hai. Dine-in ya takeaway ho sakta hai.';

    const systemPrompt = `Aap ${restaurantName} ke liye ek professional aur friendly AI customer service agent hain. Aapka naam "Barbq Assistant" hai.

=== LANGUAGE RULE — SABSE ZAROORI ===
AAP HAMESHA SIRF ROMAN URDU MEIN JAWAB DEIN.
Chahe customer Urdu script (اردو) mein likhe, Roman Urdu mein likhe, ya English mein — aap ka jawab HAMESHA Roman Urdu mein hona chahiye.
Kabhi bhi Arabic/Urdu script (اردو حروف) use mat karein apne jawab mein.
Sirf Roman Urdu (jaise: "Assalam o Alaikum", "haan ji", "bilkul") aur zaroorat ho tu English words use karein.

=== Restaurant Info ===
Naam: ${restaurantName}
Address: ${address}
Phone/WhatsApp: ${phone}
Opening Hours: ${hours}
Delivery: ${deliveryInfo}

=== Complete Menu (Individual Items) ===
${menuText || 'Menu update ho raha hai, thodi der mein available hoga.'}

=== Special Deals / Thaals / Combos ===
${dealsText}

=== Aapke Rules ===
- Sirf restaurant, menu, food, orders, delivery, hours aur location ke baare mein jawab dein
- Menu se exact prices batayein jo upar diye hain — agar price "pata karein" likha ho toh customer ko WhatsApp/call karne ko kahein
- Order karne ke liye website ka Order section ya WhatsApp use karne ki guide karein
- Har reply 2-4 sentences mein rakhen — concise aur clear
- Agar koi cheez pata nahi, politely batayein aur kuch aur help offer karein
- Unrelated questions (politics, jokes, general knowledge) ka jawab mat dein
- Tone friendly aur welcoming rakhen — aap ${restaurantName} ki pehchaan hain
- DOBARA YAAD DILANA: Jawab hamesha Roman Urdu mein dein, kabhi Urdu script mein nahi`;

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
    const detail = err.response?.data || err.message;
    console.error('[Chat API Error]', JSON.stringify(detail));
    res.status(500).json({ error: 'Chat service temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
