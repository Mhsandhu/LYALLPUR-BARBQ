const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');

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
    const address = settings?.address || 'Lyallpur, Pakistan';
    const phone = settings?.phone || 'N/A';
    const hours = settings?.openingHours || '12:00 PM – 12:00 AM';
    const deliveryAvailable = settings?.deliveryAvailable;
    const deliveryCharge = settings?.deliveryCharge || 0;
    const deliveryInfo = deliveryAvailable
      ? `Yes, delivery is available. Delivery charge: Rs. ${deliveryCharge}`
      : 'Delivery is not currently available. Dine-in and takeaway only.';

    const systemPrompt = `You are a helpful and friendly AI customer service agent for ${restaurantName}, a traditional BBQ restaurant in Pakistan. Your name is "Barbq Assistant".

You speak naturally in both English and Roman Urdu (mix them as the customer does). Be warm, concise, and helpful.

=== Restaurant Info ===
Name: ${restaurantName}
Address: ${address}
Phone/WhatsApp: ${phone}
Opening Hours: ${hours}
Delivery: ${deliveryInfo}

=== Full Menu ===
${menuText || 'Menu is currently being updated.'}

=== Your Rules ===
- Only answer questions about the restaurant, menu, food, orders, delivery, hours, and location
- Give exact prices from the menu above — never guess or make up prices
- For placing orders, guide customers to use the Order section on the website or call/WhatsApp
- Keep replies short and conversational (2–4 sentences)
- If you don't know something, say so politely and offer to help with something else
- Do NOT answer unrelated questions (politics, jokes, general knowledge, etc.)
- Use a friendly tone — you represent ${restaurantName}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
    });

    // Map history for Gemini — must alternate user/model, start with user
    const geminiHistory = [];
    const validHistory = history.filter((m) => m.role && m.text && m.text.trim());
    for (const m of validHistory) {
      const role = m.role === 'user' ? 'user' : 'model';
      // Skip consecutive same-role entries (Gemini requires strict alternation)
      if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === role) continue;
      geminiHistory.push({ role, parts: [{ text: m.text.trim() }] });
    }
    // History must start with 'user' if non-empty
    if (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
      geminiHistory.shift();
    }

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('[Chat API Error]', err.message);
    console.error('[Chat API Stack]', err.stack);
    const status = err.status || 500;
    res.status(status).json({
      error: 'Chat service temporarily unavailable. Please try again.',
      code: err.message || 'UNKNOWN',
    });
  }
});

module.exports = router;
