const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Deal = require('./models/Deal');
const MenuItem = require('./models/MenuItem');
const Settings = require('./models/Settings');

const deals = [
  { dealId: 1, dealName: 'Protein Thaal', price: 1150, items: 'Full Plate Rice, Leg Piece, Chicken Wings ×2, Candy Boti ×2, Tikka Boti ×2, Chicken Kebab, Naan ×2, Imli Sauce, Raita & Salad' },
  { dealId: 2, dealName: 'Lyalupuri Thaal', price: 1250, items: 'Full Plate Rice, Chest Piece, Chicken Wings ×2, Candy Boti ×2, Tikka Boti ×1, Chicken Kebab, Naan ×2, Imli Sauce, Raita & Salad' },
  { dealId: 3, dealName: 'Malai Special Thaal', price: 1350, items: 'Full Plate Rice, Malai Chest Piece, Malai Boti ×2, Candy Boti ×2, Tikka Boti ×2, Chicken Kebab, Naan ×2, Imli Sauce, Raita & Salad' },
  { dealId: 4, dealName: 'Single Person Thaal', price: 650, items: 'Half Plate Rice, Leg Piece, Chicken Kebab, Half Rogni Naan, Imli Sauce, Raita & Salad' },
  { dealId: 5, dealName: 'Malai Special Thaal', price: 1800, items: 'Full Plate Rice, Malai Leg Piece, Sada Leg Piece, Candy Boti ×2, Malai Wings ×3, Chicken Kebab ×2, Roti ×4, Imli Sauce, Raita & Salad ×2' },
  { dealId: 6, dealName: 'Malai Special Thaal', price: 1900, items: 'Full (1.5) Plate Rice, Malai Chest Piece, Sada Chest Piece, Candy Boti ×2, Tandoori Wings ×2, Chicken Kebab, Tikka Boti ×2, Malai Boti ×2, Roti ×2, Imli Sauce, Raita & Salad ×2' },
];

const menuItems = [
  { name: 'Leg Piece', category: 'Chicken', price: 0 },
  { name: 'Chest Piece', category: 'Chicken', price: 0 },
  { name: 'Malai Chest Piece', category: 'Chicken', price: 0 },
  { name: 'Malai Leg Piece', category: 'Chicken', price: 0 },
  { name: 'Chicken Wings', category: 'Chicken', price: 0 },
  { name: 'Malai Wings', category: 'Chicken', price: 0 },
  { name: 'Tandoori Wings', category: 'Chicken', price: 0 },
  { name: 'Candy Boti', category: 'Chicken', price: 0 },
  { name: 'Tikka Boti', category: 'Chicken', price: 0 },
  { name: 'Malai Boti', category: 'Chicken', price: 0 },
  { name: 'Chicken Kebab', category: 'Chicken', price: 0 },
  { name: 'Full Plate Rice', category: 'Rice & Bread', price: 0 },
  { name: 'Half Plate Rice', category: 'Rice & Bread', price: 0 },
  { name: 'Naan', category: 'Rice & Bread', price: 0 },
  { name: 'Roti', category: 'Rice & Bread', price: 0 },
  { name: 'Rogni Naan', category: 'Rice & Bread', price: 0 },
  { name: 'Imli Sauce', category: 'Extras', price: 0 },
  { name: 'Raita', category: 'Extras', price: 0 },
  { name: 'Salad', category: 'Extras', price: 0 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed Deals
    await Deal.deleteMany({});
    await Deal.insertMany(deals);
    console.log(`Seeded ${deals.length} deals`);

    // Seed Menu Items
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${menuItems.length} menu items`);

    // Seed Settings
    await Settings.deleteMany({});
    await Settings.create({});
    console.log('Seeded default settings');

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
