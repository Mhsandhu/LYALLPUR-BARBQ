const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Deal = require('../models/Deal');
const Settings = require('../models/Settings');

// GET /api/chat/ping
router.get('/ping', (req, res) => {
  res.json({ ok: true, mode: 'rule-based', noApiKeyNeeded: true });
});

// ══════════════════════════════════════════════════════════════
//  RULE-BASED RESPONSE ENGINE  — No API key required
// ══════════════════════════════════════════════════════════════
function buildResponse(message, menuItems, deals, settings) {
  const msg   = message.toLowerCase().trim();

  const name      = settings?.restaurantName || 'Lyallpur BarBQ';
  const phone     = settings?.phone          || 'N/A';
  const whatsapp  = settings?.whatsapp       || settings?.phone || 'N/A';
  const address   = settings?.address        || 'Faisalabad, Pakistan';
  const hours     = settings?.openingHours   || '12:00 PM – 12:00 AM';
  const delAvail  = settings?.deliveryAvailable ?? false;
  const delCharge = settings?.deliveryCharge || 0;

  const pr = (price) => price > 0 ? `Rs. ${price}` : `price ke liye WhatsApp karein: ${whatsapp}`;

  // Build category map
  const byCat = {};
  menuItems.forEach(i => {
    if (!byCat[i.category]) byCat[i.category] = [];
    byCat[i.category].push(i);
  });

  // ── 1. DYNAMIC: any menu item name in message ──────────────
  for (const item of menuItems) {
    if (msg.includes(item.name.toLowerCase())) {
      const desc  = item.description ? ` ${item.description}.` : '';
      return `${item.name} hamare menu mein available hai.${desc} Iski price ${pr(item.price)} hai. Order ke liye website ka "Order Now" button ya WhatsApp ${whatsapp} use karein!`;
    }
  }

  // ── 2. DYNAMIC: any deal/thaal name in message ─────────────
  for (const deal of deals) {
    if (msg.includes(deal.dealName.toLowerCase())) {
      return `${deal.dealName} hamare behtareen deals mein se ek hai! Is mein shamil hai: ${deal.items}. Price sirf ${pr(deal.price)} hai. Order ke liye website ya WhatsApp ${whatsapp} karein!`;
    }
  }

  // ── 3. GREETINGS ───────────────────────────────────────────
  if (/\b(hi|hello|hey|howdy|greetings|assalam|salaam|salam|aoa|adaab|السلام|عليكم|ہیلو)\b/.test(msg)) {
    return `Wa Alaikum Assalam! ${name} mein aapka khair maqdam! Main aapka Barbq Assistant hun. Aap pooch sakte hain:\n• Menu aur prices\n• Deals aur Thaals\n• Delivery info\n• Location aur timings\n\nBatayein kya madad chahiye?`;
  }

  // ── 4. HOW ARE YOU ─────────────────────────────────────────
  if (/\b(kaisa|kaisi|kaise|how are|kya haal|kya hal|theek ho|kaisy|hows it)\b/.test(msg)) {
    return `Bilkul theek hun, shukriya poochne ka! ${name} ki puri team aapki khidmat ke liye tayyar hai. Kya order karna chahte hain ya kuch poochna hai?`;
  }

  // ── 5. WHO ARE YOU ─────────────────────────────────────────
  if (/\b(kaun ho|who are|aap kaun|kya ho|tumhara naam|apna naam|naam kya|naam batao)\b/.test(msg)) {
    return `Main ${name} ka Barbq Assistant hun! Aapko menu, prices, deals, delivery aur restaurant ki puri info de sakta hun. Kya jaanna chahte hain?`;
  }

  // ── 6. FULL MENU ───────────────────────────────────────────
  if (/\b(menu|poora menu|full menu|sab kuch|all items|kya kya|kya milta|kya available|kya hai aap ke|list|items|khana kya)\b/.test(msg)) {
    let r = `${name} ka poora menu:\n\n`;
    for (const [cat, items] of Object.entries(byCat)) {
      r += `🍖 *${cat}:*\n`;
      items.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
      r += '\n';
    }
    if (deals.length) {
      r += `🎯 *Special Deals/Thaals:*\n`;
      deals.forEach(d => { r += `  • ${d.dealName}: ${pr(d.price)}\n`; });
    }
    r += `\nOrder ke liye website ya WhatsApp ${whatsapp} use karein!`;
    return r;
  }

  // ── 7. CHICKEN CATEGORY ────────────────────────────────────
  if (/\b(chicken|murgi|murgha|chicken items|chicken menu|chicken kya)\b/.test(msg)) {
    const items = Object.entries(byCat).find(([k]) => /chicken/i.test(k))?.[1] || [];
    if (!items.length) return `Chicken items ke liye poora menu dekhein — "menu" type karein!`;
    let r = `🍗 Hamare Chicken items:\n`;
    items.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
    r += `\nOrder ke liye WhatsApp: ${whatsapp}`;
    return r;
  }

  // ── 8. RICE CATEGORY ───────────────────────────────────────
  if (/\b(rice|chawal|biryani|pulao|rice items|chawal kya)\b/.test(msg)) {
    const items = Object.entries(byCat).find(([k]) => /rice/i.test(k))?.[1]?.filter(i => /rice|chawal/i.test(i.name)) || [];
    if (!items.length) return `Rice items ke liye "menu" type karein ya WhatsApp karein: ${whatsapp}`;
    let r = `🍚 Rice items:\n`;
    items.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
    return r;
  }

  // ── 9. BREAD / NAAN / ROTI ─────────────────────────────────
  if (/\b(naan|roti|bread|rogni|tandoori roti|paratha|roti kya)\b/.test(msg)) {
    const allBread = Object.values(byCat).flat().filter(i => /naan|roti|bread|rogni/i.test(i.name));
    if (!allBread.length) return `Bread items ke liye "menu" type karein!`;
    let r = `🫓 Bread items:\n`;
    allBread.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
    return r;
  }

  // ── 10. EXTRAS / SAUCES ────────────────────────────────────
  if (/\b(extras|extra|sauce|raita|salad|imli|chutney|condiment|salan|side)\b/.test(msg)) {
    const items = Object.entries(byCat).find(([k]) => /extra/i.test(k))?.[1] || [];
    if (!items.length) return `Extras ke liye "menu" type karein ya WhatsApp: ${whatsapp}`;
    let r = `🥗 Extras / Sauces:\n`;
    items.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
    return r;
  }

  // ── 11. ALL DEALS / THAALS / COMBOS ───────────────────────
  if (/\b(deal|deals|thaal|thaals|thali|combo|combos|package|packages|bundles|bundle|special deals|koi deal|koi thaal)\b/.test(msg)) {
    if (!deals.length) return `Abhi koi active deal nahi hai. Jald naye deals aayenge! Menu ke liye "menu" type karein.`;
    let r = `🎯 ${name} ke Special Deals/Thaals:\n\n`;
    deals.forEach(d => { r += `✨ *${d.dealName}* — ${pr(d.price)}\n   Items: ${d.items}\n\n`; });
    r += `Order ke liye website ya WhatsApp ${whatsapp} use karein!`;
    return r;
  }

  // ── 12. PRICE LIST ─────────────────────────────────────────
  if (/\b(price list|rate list|prices|rates|pricelist|rate card|sab ki price|tamam price|poori price)\b/.test(msg)) {
    let r = `💰 ${name} Price List:\n\n`;
    for (const [cat, items] of Object.entries(byCat)) {
      r += `*${cat}:*\n`;
      items.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
      r += '\n';
    }
    return r;
  }

  // ── 13. CHEAPEST ITEMS ─────────────────────────────────────
  if (/\b(sasta|saste|cheap|affordable|budget|kam price|sab se kam|lowest price|minimum price)\b/.test(msg)) {
    const priced = menuItems.filter(i => i.price > 0).sort((a, b) => a.price - b.price).slice(0, 4);
    if (!priced.length) return `Price info ke liye WhatsApp karein: ${whatsapp}`;
    let r = `💰 Hamare sab se saste items:\n`;
    priced.forEach(i => { r += `  • ${i.name}: Rs. ${i.price}\n`; });
    return r;
  }

  // ── 14. MOST EXPENSIVE / PREMIUM ──────────────────────────
  if (/\b(mehenga|expensive|premium|best quality|sab se mehenga|highest price)\b/.test(msg)) {
    const priced = menuItems.filter(i => i.price > 0).sort((a, b) => b.price - a.price).slice(0, 3);
    if (!priced.length) return `Price info ke liye WhatsApp karein: ${whatsapp}`;
    let r = `👑 Hamare premium items:\n`;
    priced.forEach(i => { r += `  • ${i.name}: Rs. ${i.price}\n`; });
    return r;
  }

  // ── 15. DELIVERY (GENERAL) ─────────────────────────────────
  if (/\b(delivery|home delivery|deliver|ghar bhejo|doorstep|parcel delivery|khana bhejo|food delivery)\b/.test(msg)) {
    if (delAvail) return `Haan! ${name} home delivery available hai! 🛵\nDelivery charge: Rs. ${delCharge}\nOrder ke liye WhatsApp karein: ${whatsapp}\nYa website pe "Order Now" click karein!`;
    return `Filhaal ${name} ki home delivery available nahi hai. Aap dine-in ya takeaway kar sakte hain.\nAddress: ${address}\nWhatsApp: ${whatsapp}`;
  }

  // ── 16. DELIVERY CHARGE / COST ────────────────────────────
  if (/\b(delivery charge|delivery cost|delivery fee|delivery ka kiraya|delivery paisa|delivery ka paisa|kitna lagta delivery)\b/.test(msg)) {
    if (delAvail) return `Delivery charge Rs. ${delCharge} hai. Order ke liye WhatsApp ${whatsapp} karein!`;
    return `Filhaal delivery available nahi hai. Dine-in ya takeaway ke liye aayein: ${address}`;
  }

  // ── 17. FREE DELIVERY ─────────────────────────────────────
  if (/\b(free delivery|free hai|bina charge|no charge delivery|delivery free|muft delivery)\b/.test(msg)) {
    if (!delAvail) return `Filhaal home delivery available nahi hai.`;
    return delCharge === 0
      ? `Haan! Abhi ${name} ki delivery FREE hai! Order ke liye WhatsApp ${whatsapp} karein.`
      : `Delivery charge Rs. ${delCharge} hai — free nahi. Order ke liye WhatsApp ${whatsapp} karein.`;
  }

  // ── 18. DELIVERY TIME ─────────────────────────────────────
  if (/\b(delivery time|kitni der|kitna waqt|kab aayega|time kitna|eta|delivery mein kitna)\b/.test(msg)) {
    if (delAvail) return `Delivery time area ke mutabiq vary karta hai — usually 30 se 45 minutes. Exact time ke liye WhatsApp karein: ${whatsapp}`;
    return `Filhaal home delivery available nahi hai. Restaurant visit karein: ${address}`;
  }

  // ── 19. DELIVERY AREA ─────────────────────────────────────
  if (/\b(delivery area|kahan tak delivery|area mein|konsa area|delivery zone|delivery kahan)\b/.test(msg)) {
    if (delAvail) return `Delivery area ke details ke liye WhatsApp karein: ${whatsapp} — ham available areas bata denge!`;
    return `Filhaal home delivery available nahi hai. Restaurant visit karein: ${address}`;
  }

  // ── 20. LOCATION / ADDRESS ────────────────────────────────
  if (/\b(address|location|kahan hai|kahan hain|where|kidhar|jagah|map|directions|raasta|kahan milega|locate)\b/.test(msg)) {
    return `📍 ${name} ka address:\n${address}\n\nGoogle Maps pe search karein ya WhatsApp ${whatsapp} pe message karein exact directions ke liye!`;
  }

  // ── 21. PHONE / WHATSAPP / CONTACT ────────────────────────
  if (/\b(contact|phone|number|call|whatsapp|helpline|mobile|telephone|number kya|contact info|get in touch)\b/.test(msg)) {
    return `📞 ${name} contact info:\nPhone: ${phone}\nWhatsApp: ${whatsapp}\n\nSidha call ya WhatsApp karein — jaldi jawab milega!`;
  }

  // ── 22. TIMINGS / HOURS ───────────────────────────────────
  if (/\b(timing|timings|hours|waqt|kab khulta|kab band|opening|closing|schedule|time kya|kab se kab|schedule kya)\b/.test(msg)) {
    return `🕐 ${name} timings:\n${hours}\n\nAane se pehle WhatsApp ${whatsapp} pe confirm kar lein!`;
  }

  // ── 23. OPEN NOW ──────────────────────────────────────────
  if (/\b(abhi khula|open hai|abhi open|open now|closed|band hai|khula hai|is it open)\b/.test(msg)) {
    return `Hamare opening hours hain: ${hours}\nAbhi visit karein ya WhatsApp ${whatsapp} pe confirm karein ke restaurant khula hai ya nahi!`;
  }

  // ── 24. SUNDAY / WEEKEND ──────────────────────────────────
  if (/\b(sunday|saturday|weekend|hafta|chutti|holiday|eid|special day)\b/.test(msg)) {
    return `Weekend aur holidays ke schedule ke liye WhatsApp karein: ${whatsapp}. Regular timings: ${hours}`;
  }

  // ── 25. HOW TO ORDER ──────────────────────────────────────
  if (/\b(order kaise|kaise order|how to order|order karna|ordering process|order karne ka|mangwana kaise)\b/.test(msg)) {
    return `Order karne ke 2 tarike:\n\n1️⃣ *Website se:* "Order Now" button pe click karein — items add karein aur place karein\n\n2️⃣ *WhatsApp se:* ${whatsapp} pe apna order message karein\n\nDono tarike easy hain! Koi aur sawaal?`;
  }

  // ── 26. ONLINE ORDER ──────────────────────────────────────
  if (/\b(online order|website order|app order|order online|internet se order)\b/.test(msg)) {
    return `Haan, hamare website se online order kar sakte hain! "Order Now" button pe click karein, menu se items add karein aur place karein. Ya WhatsApp ${whatsapp} pe bhi order de sakte hain!`;
  }

  // ── 27. WHATSAPP ORDER ────────────────────────────────────
  if (/\b(whatsapp se order|whatsapp order|whatsapp pe order|message order)\b/.test(msg)) {
    return `WhatsApp pe order dena bilkul easy hai! ${whatsapp} pe apne items ka naam aur quantity bhejein. Ham confirm karke process karenge. 😊`;
  }

  // ── 28. MINIMUM ORDER ────────────────────────────────────
  if (/\b(minimum order|min order|kam se kam|kitna order|minimum kitna)\b/.test(msg)) {
    return `Minimum order details ke liye WhatsApp karein: ${whatsapp} — ham puri info denge!`;
  }

  // ── 29. ORDER CANCEL ─────────────────────────────────────
  if (/\b(cancel|order cancel|wapas|return|refund|cancel karna|order wapas)\b/.test(msg)) {
    return `Order cancel ya refund ke liye foran WhatsApp karein: ${whatsapp} ya call karein: ${phone}. Ham jaldi se madad karenge!`;
  }

  // ── 30. ORDER STATUS / TRACKING ──────────────────────────
  if (/\b(order status|track order|kahan hai order|kab aayega|order tracking|kitni der mein)\b/.test(msg)) {
    return `Order track karne ke liye WhatsApp karein: ${whatsapp} apna order number ke saath — ham update denge!`;
  }

  // ── 31. PAYMENT ───────────────────────────────────────────
  if (/\b(payment|cash|card|easypaisa|jazzcash|paisa|online payment|transfer|pay kaise|payment kaise)\b/.test(msg)) {
    return `💳 Payment options ke liye WhatsApp karein: ${whatsapp}. Ham cash aur available online payment methods bata denge!`;
  }

  // ── 32. HALAL / FRESH / QUALITY ──────────────────────────
  if (/\b(halal|zabiha|fresh|quality|hygienic|clean|saaf|khalis|pure|organic|taaza|healthy)\b/.test(msg)) {
    return `Bilkul! ${name} mein 100% Halal aur fresh ingredients use hote hain. Tamam khana open flame pe fresh bana ke serve kiya jata hai. Quality hamare liye sabse pehle hai! 🔥`;
  }

  // ── 33. SPICE LEVEL ───────────────────────────────────────
  if (/\b(spicy|teekha|mirchi|teekh|masaledar|spice level|mild|hot|extra spicy|kam mirchi)\b/.test(msg)) {
    return `Hamare items mein spice level customizable hai! Order karte waqt apni preference batayein — mild, medium ya extra spicy. WhatsApp ${whatsapp} pe mention karein.`;
  }

  // ── 34. VEGETARIAN / VEG ─────────────────────────────────
  if (/\b(vegetarian|veg|sabzi|no meat|bina gosht|meatless|veg items|veg option)\b/.test(msg)) {
    const vegItems = menuItems.filter(i => /salad|raita|imli|rice|roti|naan|bread/i.test(i.name));
    if (!vegItems.length) return `Vegetarian options ke liye WhatsApp karein: ${whatsapp} — ham bata denge kya available hai!`;
    let r = `🥗 Hamare vegetarian friendly items:\n`;
    vegItems.forEach(i => { r += `  • ${i.name}: ${pr(i.price)}\n`; });
    return r;
  }

  // ── 35. KIDS / CHILDREN ──────────────────────────────────
  if (/\b(kids|children|bachon|bacche|child|bacha|bache ke liye|kids meal|small portion)\b/.test(msg)) {
    return `Bacchon ke liye suitable items ke baare mein WhatsApp karein: ${whatsapp}. Ham recommend karenge kya best rahega!`;
  }

  // ── 36. RECOMMENDATION / BEST ────────────────────────────
  if (/\b(recommend|suggestion|best|tasty|famous|popular|mashoor|specialty|signature|must try|zaroor khao|kya khaon|kya loon|acha kya|suggest karo)\b/.test(msg)) {
    const topItems = menuItems.filter(i => i.price > 0).slice(0, 3);
    let r = `🌟 ${name} ke sabse popular items:\n`;
    topItems.forEach(i => { r += `  ⭐ ${i.name}: ${pr(i.price)}\n`; });
    if (deals.length) {
      r += `\nAur hamare special deals bhi zaroor try karein:\n`;
      deals.slice(0, 2).forEach(d => { r += `  🎯 ${d.dealName}: ${pr(d.price)}\n`; });
    }
    r += `\nSab kuch fresh aur delicious hai!`;
    return r;
  }

  // ── 37. FOR X PEOPLE ─────────────────────────────────────
  if (/(\d+)\s*(log|banda|bande|person|people|afraad|members|family ke liye|ke liye)/.test(msg)) {
    const match = msg.match(/(\d+)/);
    const count = match ? parseInt(match[1]) : 2;
    if (deals.length) {
      const best = [...deals].sort((a, b) => b.price - a.price)[0];
      return `${count} logon ke liye "${best.dealName}" best rahega! Price: ${pr(best.price)}, items: ${best.items}. Order ke liye WhatsApp ${whatsapp} karein!`;
    }
    return `${count} logon ke liye hamare Thaals best rehte hain. "Deals" type karein ya WhatsApp ${whatsapp} pe poochein!`;
  }

  // ── 38. FAMILY DEAL ───────────────────────────────────────
  if (/\b(family deal|family thaal|family package|family ke liye|puri family|sara khandaan)\b/.test(msg)) {
    if (!deals.length) return `Family deals ke liye WhatsApp karein: ${whatsapp}!`;
    const fam = deals.find(d => /family/i.test(d.dealName)) || deals[deals.length - 1];
    return `Family ke liye "${fam.dealName}" perfect hai! Price: ${pr(fam.price)}, items: ${fam.items}. Order ke liye WhatsApp ${whatsapp} karein!`;
  }

  // ── 39. BEST DEAL / VALUE ─────────────────────────────────
  if (/\b(best deal|sab se acha deal|value for money|sasta deal|acha combo|best value|great deal)\b/.test(msg)) {
    if (!deals.length) return `Deals ke liye "deals" type karein ya WhatsApp: ${whatsapp}`;
    const best = [...deals].sort((a, b) => a.price - b.price)[0];
    return `Sabse value for money deal hai "${best.dealName}" — sirf ${pr(best.price)} mein! Items: ${best.items}. Order ke liye WhatsApp ${whatsapp} karein!`;
  }

  // ── 40. DISCOUNTS / OFFERS ────────────────────────────────
  if (/\b(discount|offer|sale|promotion|coupon|code|rebate|off|concession|offer koi|koi offer)\b/.test(msg)) {
    return `Current offers aur discounts ke liye WhatsApp karein: ${whatsapp} ya hamare social media follow karein! Deals section mein bhi great value milti hai — "deals" type karein.`;
  }

  // ── 41. STUDENT DISCOUNT ─────────────────────────────────
  if (/\b(student|student discount|university|college|school student)\b/.test(msg)) {
    return `Student discount details ke liye WhatsApp karein: ${whatsapp}. Ham dekhenge kya available hai!`;
  }

  // ── 42. DAILY SPECIAL ─────────────────────────────────────
  if (/\b(daily special|aaj ka special|today special|aaj kya|special today|naya kya)\b/.test(msg)) {
    return `Aaj ke specials ke liye WhatsApp karein: ${whatsapp} ya hamare social media check karein!`;
  }

  // ── 43. NEW ITEMS ─────────────────────────────────────────
  if (/\b(naya|new items|naye items|latest|recently added|koi naya|menu mein kya naya)\b/.test(msg)) {
    return `Naye items ke baare mein WhatsApp karein: ${whatsapp} ya hamare social media follow karein latest updates ke liye!`;
  }

  // ── 44. TAKEAWAY / PARCEL ─────────────────────────────────
  if (/\b(takeaway|take away|parcel|packing|pack|le jana|ghar le jana|apna saath|pickup|pick up)\b/.test(msg)) {
    return `Haan! ${name} se takeaway/parcel available hai. Pehle WhatsApp ${whatsapp} pe order karein aur phir pick up karein: ${address}`;
  }

  // ── 45. DINE-IN ───────────────────────────────────────────
  if (/\b(dine in|dine-in|baith ke khana|restaurant mein|table chahiye|seating|andar baith|eat in)\b/.test(msg)) {
    return `${name} mein dine-in available hai! Warmly welcome karte hain. 😊\nAddress: ${address}\nTimings: ${hours}\nReservation ke liye WhatsApp: ${whatsapp}`;
  }

  // ── 46. RESERVATION / BOOKING ────────────────────────────
  if (/\b(reservation|booking|book karna|table book|seat reserve|pehle se|advance booking|table chahiye)\b/.test(msg)) {
    return `Table reservation ke liye WhatsApp karein: ${whatsapp} ya call karein: ${phone}. Ham aapke liye seat arrange karenge!`;
  }

  // ── 47. PARTY / EVENT / CATERING ─────────────────────────
  if (/\b(party|event|function|shadi|wedding|birthday|catering|dawat|mehfil|gathering|bulk order|bada order)\b/.test(msg)) {
    return `Party ya event catering ke liye ${name} se contact karein! 🎉\nPhone: ${phone}\nWhatsApp: ${whatsapp}\nHam large orders aur events ke liye special arrangements karte hain!`;
  }

  // ── 48. CORPORATE ORDER ───────────────────────────────────
  if (/\b(corporate|office order|bulk|company|business order|office ke liye)\b/.test(msg)) {
    return `Corporate ya bulk orders ke liye WhatsApp karein: ${whatsapp} ya call karein: ${phone}. Ham special rates de sakte hain!`;
  }

  // ── 49. WAITING TIME / BUSY ───────────────────────────────
  if (/\b(wait|waiting time|kitni wait|busy hai|bheed|rush|queue|line lagti|der lagti)\b/.test(msg)) {
    return `Wait time aur current restaurant status ke liye call karein: ${phone} ya WhatsApp: ${whatsapp}. Ham real-time update denge!`;
  }

  // ── 50. PARKING ───────────────────────────────────────────
  if (/\b(parking|car park|gaadi|gadi khadi|parking available|vehicle)\b/.test(msg)) {
    return `Parking details ke liye restaurant visit karein: ${address} ya WhatsApp ${whatsapp} pe poochein!`;
  }

  // ── 51. WIFI ──────────────────────────────────────────────
  if (/\b(wifi|wi-fi|internet|network|wireless)\b/.test(msg)) {
    return `WiFi availability ke baare mein WhatsApp ${whatsapp} pe poochein ya restaurant visit karein: ${address}`;
  }

  // ── 52. AC / AMBIANCE ─────────────────────────────────────
  if (/\b(ac|air condition|seating|seats|comfortable|mahaul|ambiance|atmosphere|indoor|outdoor)\b/.test(msg)) {
    return `${name} ka experience khud visit karke mahsoos karein! Address: ${address}. Info ke liye WhatsApp: ${whatsapp}`;
  }

  // ── 53. FEEDBACK / REVIEW ────────────────────────────────
  if (/\b(review|feedback|rating|stars|experience|aapke baare mein|recommend karein|apni baat)\b/.test(msg)) {
    return `Aapki feedback hamare liye bohot zaroori hai! Google ya hamare WhatsApp ${whatsapp} pe review zaroor dein. Shukriya!`;
  }

  // ── 54. COMPLAINT ─────────────────────────────────────────
  if (/\b(complaint|bura|ganda|kharab|problem|issue|unhappy|disappointed|bura laga|galat|wrong)\b/.test(msg)) {
    return `Hum dil se maafi chahte hain! Aapki feedback hamare liye bohot zaroori hai. Seedha WhatsApp karein: ${whatsapp} ya call karein: ${phone} — hum zaroor hal karenge!`;
  }

  // ── 55. SOCIAL MEDIA ──────────────────────────────────────
  if (/\b(instagram|facebook|social media|follow|page|handle|social|tiktok)\b/.test(msg)) {
    return `Hamare social media pages follow karein latest updates, deals aur offers ke liye! Restaurant name search karein ya WhatsApp ${whatsapp} pe social media links maangein.`;
  }

  // ── 56. WEBSITE ───────────────────────────────────────────
  if (/\b(website|site|web|online|app|application|portal)\b/.test(msg)) {
    return `Hamare website pe aap menu dekh sakte hain aur directly order kar sakte hain! "Order Now" button use karein. Koi masla ho toh WhatsApp ${whatsapp} karein.`;
  }

  // ── 57. GIFT VOUCHER / GIFT CARD ─────────────────────────
  if (/\b(gift|voucher|gift card|present|tohfa|gift karein)\b/.test(msg)) {
    return `Gift vouchers ke baare mein WhatsApp karein: ${whatsapp}. Kisi ko Lyallpur BarBQ ka gift dena ek zabardast idea hai! 🎁`;
  }

  // ── 58. HALAL CERTIFICATION ───────────────────────────────
  if (/\b(certificate|certification|halal cert|proof|guarantee)\b/.test(msg)) {
    return `${name} mein 100% Halal ingredients use hote hain. Certification details ke liye WhatsApp karein: ${whatsapp}`;
  }

  // ── 59. INGREDIENTS / ALLERGENS ──────────────────────────
  if (/\b(ingredients|allergen|allergy|contains|kya kya hai|recipe|bana kaise)\b/.test(msg)) {
    return `Specific items ke ingredients ke baare mein WhatsApp karein: ${whatsapp}. Ham detail se bata denge kya kya use hota hai!`;
  }

  // ── 60. PORTION SIZE ──────────────────────────────────────
  if (/\b(portion|size|quantity|kitna milta|kitni miqdar|bada|chota|half|full)\b/.test(msg)) {
    return `Portion sizes ke baare mein WhatsApp karein: ${whatsapp} ya "menu" type karein full/half plate options dekhne ke liye!`;
  }

  // ── 61. CUSTOMIZATION ────────────────────────────────────
  if (/\b(customize|custom|change|modify|apni marzi|special request|extra chatni|bina mirchi|without)\b/.test(msg)) {
    return `Haan, special requests accept karte hain! Order karte waqt WhatsApp ${whatsapp} pe apni preference zaroor batayein. Ham koshish karenge!`;
  }

  // ── 62. LATE NIGHT ────────────────────────────────────────
  if (/\b(late night|raat ko|midnight|late|der raat|2 baje|3 baje|raat mein|night time)\b/.test(msg)) {
    return `Late night availability ke liye WhatsApp karein: ${whatsapp}. Regular timings: ${hours}`;
  }

  // ── 63. EARLY MORNING / BREAKFAST ────────────────────────
  if (/\b(breakfast|subah|morning|naashta|nashta|early morning|subah ka)\b/.test(msg)) {
    return `Breakfast ya morning timings ke liye WhatsApp karein: ${whatsapp}. Regular opening hours: ${hours}`;
  }

  // ── 64. CATERING QUOTE / PRICE ───────────────────────────
  if (/\b(quote|estimate|kitna lagega|total price|final price|calculate|budget)\b/.test(msg)) {
    return `Catering ya bulk order ka estimate ke liye WhatsApp karein: ${whatsapp} — items aur quantity batayein, ham quote denge!`;
  }

  // ── 65. NEAR ME / BRANCH ─────────────────────────────────
  if (/\b(near me|qareeb|nazdik|branch|outlet|location kahan|koi aur branch|multiple locations)\b/.test(msg)) {
    return `${name} ka address: ${address}\nDusri branches ke baare mein WhatsApp karein: ${whatsapp}`;
  }

  // ── 66. COOKING METHOD ───────────────────────────────────
  if (/\b(grill|grilled|bbq|barbecue|smoked|tandoor|open flame|kaise banta|cooking)\b/.test(msg)) {
    return `${name} mein sab khana authentic open flame BBQ aur tandoor pe fresh banta hai. Yahi hamari specialty hai! 🔥`;
  }

  // ── 67. HOW LONG TO PREPARE ──────────────────────────────
  if (/\b(tayyar|ready|prepare|kitni der|banne mein|waiting|order ready|kab ready)\b/.test(msg)) {
    return `Fresh khana tayyar karne mein usually 15-30 minutes lagte hain. Exact wait time ke liye call karein: ${phone}`;
  }

  // ── 68. THANKS ───────────────────────────────────────────
  if (/\b(thanks|thank you|shukriya|jazakallah|shukria|mehrbani|bahut acha|bohat acha|great|excellent|zabardast|wah|shabaash)\b/.test(msg)) {
    return `Shukriya! ${name} mein aapka swagat hai. Koi aur sawaal ho toh zaroor poochein. Khidmat mein hamesha haazir hoon! 😊`;
  }

  // ── 69. GOODBYE ──────────────────────────────────────────
  if (/\b(bye|goodbye|khuda hafiz|allah hafiz|alvida|baad mein|phir milenge|ok bye|tc|take care|ciao)\b/.test(msg)) {
    return `Allah Hafiz! ${name} mein phir zaroor aayein. Aapka din mubarak ho! 😊🔥`;
  }

  // ── 70. YES / CONFIRM ─────────────────────────────────────
  if (/^\s*(haan|han|yes|yep|yup|ok|okay|sure|bilkul|theek|zaroor|confirm)\s*$/.test(msg)) {
    return `Shukriya! Kya main aur kuch help kar sakta hun? Menu, deals, delivery ya order ke baare mein poochein!`;
  }

  // ── 71. NO ────────────────────────────────────────────────
  if (/^\s*(nahi|na|no|nope|nahin|nain)\s*$/.test(msg)) {
    return `Theek hai! Jab bhi zaroorat ho, main yahan hun. ${name} mein aapka swagat hai! 😊`;
  }

  // ── 72. FALLBACK ──────────────────────────────────────────
  return `Mujhe ye samajh nahi aaya. Main in baaton mein madad kar sakta hun:\n\n• "menu" — poora menu dekhein\n• "deals" — special thaals/combos\n• "delivery" — delivery info\n• "address" — location\n• "timing" — opening hours\n• "contact" — phone/WhatsApp\n• "order kaise karein" — ordering guide\n\nYa seedha WhatsApp karein: ${whatsapp}`;
}

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const [menuItems, deals, settings] = await Promise.all([
      MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 }),
      Deal.find({ isActive: true }).sort({ dealId: 1 }),
      Settings.findOne(),
    ]);

    const reply = buildResponse(message, menuItems, deals, settings);
    res.json({ reply });
  } catch (err) {
    console.error('[Chat Error]', err.message);
    res.status(500).json({ error: 'Chat service temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
