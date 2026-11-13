import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

// ==========================================
// MONGOOSE SCHEMAS
// ==========================================

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'waiter', 'cook', 'delivery'], default: 'waiter' },
  phone: { type: String, default: '' },
  active: { type: Boolean, default: true },
  assignedTables: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const foodSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true }, // in PKR
  category: { type: String, required: true }, // category name or slug
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 20 }, // in minutes
  spicyLevel: { type: Number, default: 0 }, // 0 to 3
  isVegetarian: { type: Boolean, default: false },
  isChefSpecial: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const tableSchema = new Schema({
  tableNumber: { type: String, required: true, unique: true }, // e.g. T01
  name: { type: String, required: true }, // e.g. Window Booth 1
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  currentOrderId: { type: String, default: null },
  qrCodeUrl: { type: String, default: '' },
  location: { type: String, default: 'Main Dining Hall' },
});

const orderItemSchema = new Schema({
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String, default: '' },
  image: { type: String, default: '' },
});

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true }, // e.g. ORD-1001
  orderType: { type: String, enum: ['dine_in', 'takeaway', 'delivery'], default: 'dine_in' },
  tableNumber: { type: String, default: '' },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 }, // 16% GST
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['new', 'accepted', 'preparing', 'ready', 'served', 'delivered', 'cancelled'],
    default: 'new',
  },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
  paidAt: { type: Date, default: null },
  confirmedBy: { type: String, default: '' },
  customerName: { type: String, default: 'Guest' },
  customerPhone: { type: String, default: '' },
  deliveryAddress: { type: String, default: '' },
  specialNotes: { type: String, default: '' },
  waiterId: { type: String, default: null },
  waiterName: { type: String, default: null },
  cookId: { type: String, default: null },
  deliveryBoyId: { type: String, default: null },
  deliveryBoyName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const notificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['order_new', 'order_status', 'waiter_call', 'bill_request', 'system'],
    default: 'order_new',
  },
  roleTarget: { type: String, enum: ['admin', 'waiter', 'cook', 'delivery', 'all'], default: 'all' },
  tableNumber: { type: String, default: '' },
  orderId: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new Schema({
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  dishName: { type: String, default: '' },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const settingSchema = new Schema({
  restaurantName: { type: String, default: 'KRISPIER' },
  tagline: { type: String, default: 'Delight In Every Sauce' },
  currency: { type: String, default: 'PKR' },
  taxRate: { type: Number, default: 16 }, // 16% GST
  deliveryFee: { type: Number, default: 200 },
  phone: { type: String, default: '+92 300 4882200' },
  email: { type: String, default: 'info@krispierkasur.com' },
  address: { type: String, default: 'Main Ferozepur Road, Opposite Sports Stadium, Kasur, Pakistan' },
  openingHours: { type: String, default: 'Mon - Sun: 1:00 PM – 2:00 AM' },
  isOpen: { type: Boolean, default: true },
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const FoodModel = mongoose.models.Food || mongoose.model('Food', foodSchema);
export const TableModel = mongoose.models.Table || mongoose.model('Table', tableSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const SettingModel = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

// ==========================================
// RESILIENT IN-MEMORY + HYBRID STORE
// Ensures instant preview & 100% reliability,
// while syncing to MongoDB Atlas when connected!
// ==========================================

export interface IStoreData {
  users: any[];
  categories: any[];
  foods: any[];
  tables: any[];
  orders: any[];
  notifications: any[];
  reviews: any[];
  settings: any;
}

let isMongoConnected = false;

export const memoryStore: IStoreData = {
  users: [],
  categories: [],
  foods: [],
  tables: [],
  orders: [],
  notifications: [],
  reviews: [],
  settings: {},
};

export async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  const production = process.env.NODE_ENV === 'production';

  if (uri && uri.startsWith('mongodb')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      isMongoConnected = true;
      if (production) await loadExistingData();
      console.log('✅ Successfully connected to MongoDB Atlas!');
    } catch (err: any) {
      if (production) {
        throw new Error(`Production requires a reachable MongoDB database: ${err.message}`);
      }
      console.warn('⚠️ MongoDB connection attempt failed, running with resilient embedded store:', err.message);
      isMongoConnected = false;
    }
  } else {
    if (production) {
      throw new Error('MONGODB_URI is required in production. Refusing to start with temporary in-memory data.');
    }
    console.log('ℹ️ MONGODB_URI not provided or local. Using resilient embedded memory storage with full schema matching.');
  }

  if (!production) await seedInitialData();
}

async function loadExistingData() {
  const [users, categories, foods, tables, orders, notifications, reviews, settings] = await Promise.all([
    UserModel.find().lean(),
    CategoryModel.find().lean(),
    FoodModel.find().lean(),
    TableModel.find().lean(),
    OrderModel.find().lean(),
    NotificationModel.find().sort({ createdAt: -1 }).lean(),
    ReviewModel.find().lean(),
    SettingModel.findOne().lean(),
  ]);

  memoryStore.users = users;
  memoryStore.categories = categories;
  memoryStore.foods = foods;
  memoryStore.tables = tables;
  memoryStore.orders = orders;
  memoryStore.notifications = notifications;
  memoryStore.reviews = reviews;
  memoryStore.settings = settings || {};
}

export function isDbConnected(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

// Generate QR Code data URL helper
export async function generateTableQr(tableNumber: string, baseUrl?: string): Promise<string> {
  const appUrl = baseUrl || process.env.APP_URL || 'http://localhost:3000';
  const qrData = `${appUrl}/menu?table=${tableNumber}`;
  try {
    return await QRCode.toDataURL(qrData, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    return '';
  }
}

// SEED DATA
export async function seedInitialData() {
  // Check if already seeded
  if (memoryStore.users.length > 0) return;

  const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 10);
  const hashedPasswordWaiter = await bcrypt.hash('Waiter@123', 10);
  const hashedPasswordCook = await bcrypt.hash('Cook@123', 10);
  const hashedPasswordDelivery = await bcrypt.hash('Delivery@123', 10);

  // 1. Initial Users
  const users = [
    {
      _id: 'usr_admin_1',
      name: 'Super Admin',
      email: 'admin123@gmail.com',
      password: hashedPasswordAdmin,
      role: 'admin',
      phone: '+92 300 0000001',
      active: true,
      assignedTables: [],
      createdAt: new Date(),
    },
    {
      _id: 'usr_waiter_1',
      name: 'Farhan Ali',
      email: 'waiter@smartdine.com',
      password: hashedPasswordWaiter,
      role: 'waiter',
      phone: '+92 301 1122334',
      active: true,
      assignedTables: ['T01', 'T02', 'T03', 'T04'],
      createdAt: new Date(),
    },
    {
      _id: 'usr_waiter_2',
      name: 'Zubair Khan',
      email: 'waiter2@smartdine.com',
      password: hashedPasswordWaiter,
      role: 'waiter',
      phone: '+92 302 2233445',
      active: true,
      assignedTables: ['T05', 'T06', 'T07', 'T08', 'T09', 'T10'],
      createdAt: new Date(),
    },
    {
      _id: 'usr_cook_1',
      name: 'Chef Tariq Mehmood',
      email: 'cook@smartdine.com',
      password: hashedPasswordCook,
      role: 'cook',
      phone: '+92 303 3344556',
      active: true,
      assignedTables: [],
      createdAt: new Date(),
    },
    {
      _id: 'usr_cook_2',
      name: 'Chef Hamza',
      email: 'cook2@smartdine.com',
      password: hashedPasswordCook,
      role: 'cook',
      phone: '+92 304 4455667',
      active: true,
      assignedTables: [],
      createdAt: new Date(),
    },
    {
      _id: 'usr_delivery_1',
      name: 'Bilal Ahmed',
      email: 'delivery@smartdine.com',
      password: hashedPasswordDelivery,
      role: 'delivery',
      phone: '+92 305 5566778',
      active: true,
      assignedTables: [],
      createdAt: new Date(),
    },
  ];

  // 2. Initial Categories (8 categories)
  const categories = [
    {
      _id: 'cat_burgers',
      name: 'Crispy Burgers & Zingers',
      slug: 'burgers',
      description: 'Golden fried crispy chicken fillets and smash beef patties dripping with signature sauce',
      image: '/src/assets/images/food_krispier_burger_1794472995581.jpg',
      order: 1,
      active: true,
    },
    {
      _id: 'cat_pizzas',
      name: 'Loaded Pizzas',
      slug: 'pizzas',
      description: 'Cheesy crust pizzas with generous chicken chunks and dipping sauce edges',
      image: '/src/assets/images/food_artisan_pizza_1794471433335.jpg',
      order: 2,
      active: true,
    },
    {
      _id: 'cat_broast',
      name: 'Golden Broast & Fried Chicken',
      slug: 'broast',
      description: 'Extra crunchy southern broast fried to crispy perfection with garlic dip and buns',
      image: '/src/assets/images/food_krispier_fried_chicken_1794472997574.jpg',
      order: 3,
      active: true,
    },
    {
      _id: 'cat_wings_sauces',
      name: 'Signature Wings & Dips',
      slug: 'wings-sauces',
      description: 'Crispy chicken wings tossed in secret sauces with an array of handcrafted dipping sauces',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      order: 4,
      active: true,
    },
    {
      _id: 'cat_loaded_fries',
      name: 'Loaded Cheesy Fries',
      slug: 'loaded-fries',
      description: 'Crispy crinkle and straight cut fries smothered in hot cheddar cheese and chicken chunks',
      image: '/src/assets/images/food_krispier_loaded_fries_1794472995792.jpg',
      order: 5,
      active: true,
    },
    {
      _id: 'cat_pastas',
      name: 'Sizzling Baked Pastas',
      slug: 'pastas',
      description: 'Oven baked penne and fettuccine pastas blanketed with golden melted mozzarella',
      image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
      order: 6,
      active: true,
    },
    {
      _id: 'cat_drinks',
      name: 'Cold Beverages & Shakes',
      slug: 'drinks',
      description: 'Ice-cold carbonated sodas, thick gourmet milkshakes, and mineral water',
      image: '/src/assets/images/hero_krispier_feast_1794472994683.jpg',
      order: 7,
      active: true,
    },
    {
      _id: 'cat_desserts',
      name: 'Sweet Delights',
      slug: 'desserts',
      description: 'Warm chocolate cakes and sweet treats to complete your meal',
      image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
      order: 8,
      active: true,
    },
  ];

  // 3. Initial Food Items (Krispier Kasur fast food items with PKR prices)
  const foods = [
    {
      _id: 'food_1',
      name: 'Krispier Monster Zinger Burger',
      description: 'Double crunchy fried chicken thigh fillets, double melted American cheddar cheese, fresh iceberg lettuce, and copious signature Krispier yellow sauce on a toasted sesame brioche bun.',
      price: 790,
      category: 'Crispy Burgers & Zingers',
      image: '/src/assets/images/food_krispier_burger_1794472995581.jpg',
      isAvailable: true,
      preparationTime: 12,
      spicyLevel: 2,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Bestseller', 'Extra Crunchy', 'Chef Special'],
      createdAt: new Date(),
    },
    {
      _id: 'food_2',
      name: 'Double Smash Beef Burger',
      description: 'Twin 100% prime beef patties smashed with caramelized onions, American cheese slices, dill pickles, and smoky chipotle mayo sauce.',
      price: 950,
      category: 'Crispy Burgers & Zingers',
      image: '/src/assets/images/food_krispier_burger_1794472995581.jpg',
      isAvailable: true,
      preparationTime: 15,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Prime Beef', 'Juicy'],
      createdAt: new Date(),
    },
    {
      _id: 'food_3',
      name: 'Krispier Special Loaded Pizza (Large)',
      description: 'Signature crispy crust loaded with smoked chicken tikka, fajita chunks, beef pepperoni, black olives, sweet corn, mushrooms, and a swirl of signature Krispier sauce.',
      price: 1650,
      category: 'Loaded Pizzas',
      image: '/src/assets/images/food_artisan_pizza_1794471433335.jpg',
      isAvailable: true,
      preparationTime: 20,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Large 13 Inch', 'Signature Sauce', 'Heavy Cheese'],
      createdAt: new Date(),
    },
    {
      _id: 'food_4',
      name: 'Chicken Tikka Supreme Pizza (Large)',
      description: 'Spicy marinated chicken tikka cubes, red onions, bell peppers, mozzarella blend, and garlic herb dipping dip included.',
      price: 1550,
      category: 'Loaded Pizzas',
      image: '/src/assets/images/food_artisan_pizza_1794471433335.jpg',
      isAvailable: true,
      preparationTime: 18,
      spicyLevel: 2,
      isVegetarian: false,
      isChefSpecial: false,
      tags: ['Traditional Favorite', 'Spicy'],
      createdAt: new Date(),
    },
    {
      _id: 'food_5',
      name: 'Golden Crunchy Broast (4 Pieces)',
      description: 'Four pieces of fresh chicken marinated in 12 secret spices and pressure-fried to a golden crackle. Served with signature garlic mayo, dinner roll, and fries.',
      price: 850,
      category: 'Golden Broast & Fried Chicken',
      image: '/src/assets/images/food_krispier_fried_chicken_1794472997574.jpg',
      isAvailable: true,
      preparationTime: 15,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Crispy Crust', 'Dinner Roll Included'],
      createdAt: new Date(),
    },
    {
      _id: 'food_6',
      name: 'Fire Buffalo Crispy Wings (8 Pcs)',
      description: 'Jumbo wings fried super crispy and tossed in tangy, spicy Louisiana red buffalo sauce, topped with scallions and served with cooling buttermilk ranch.',
      price: 650,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 12,
      spicyLevel: 3,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Spicy', 'Saucy'],
      createdAt: new Date(),
    },
    {
      _id: 'food_7',
      name: 'Honey BBQ Glazed Wings (8 Pcs)',
      description: 'Sweet and smoky honey hickory BBQ glaze over crunchy wings, garnished with toasted white sesame seeds. Served with creamy garlic dip.',
      price: 620,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 12,
      spicyLevel: 0,
      isVegetarian: false,
      isChefSpecial: false,
      tags: ['Sweet BBQ', 'Kids Favorite'],
      createdAt: new Date(),
    },
    {
      _id: 'food_8',
      name: 'Extreme Cheesy Loaded Fries',
      description: 'Crispy crinkle-cut fries smothered in molten liquid cheddar cheese sauce, topped with shredded crispy chicken tenders, sliced jalapeños, and secret orange sauce.',
      price: 690,
      category: 'Loaded Cheesy Fries',
      image: '/src/assets/images/food_krispier_loaded_fries_1794472995792.jpg',
      isAvailable: true,
      preparationTime: 10,
      spicyLevel: 2,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Loaded', 'Cheese Lover'],
      createdAt: new Date(),
    },
    {
      _id: 'food_9',
      name: 'Peri-Peri Crinkle Fries',
      description: 'Basket of hot crispy crinkle cut french fries dusted with our house-ground fiery peri-peri seasoning. Served with garlic dip.',
      price: 350,
      category: 'Loaded Cheesy Fries',
      image: '/src/assets/images/food_krispier_loaded_fries_1794472995792.jpg',
      isAvailable: true,
      preparationTime: 8,
      spicyLevel: 1,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Crispy', 'Snack'],
      createdAt: new Date(),
    },
    {
      _id: 'food_10',
      name: 'Secret Spicy Krispier Sauce Dip',
      description: 'The legendary signature sauce of Krispier Kasur. A rich blend of spiced mayo, smoked paprika, relish, and secret herbs.',
      price: 120,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 2,
      spicyLevel: 2,
      isVegetarian: true,
      isChefSpecial: true,
      tags: ['Signature Dip', 'Must Try'],
      createdAt: new Date(),
    },
    {
      _id: 'food_11',
      name: 'Creamy Garlic Mayo & Herb Dip',
      description: 'Velvety whipped garlic mayonnaise infused with fragrant Mediterranean herbs and cracked black pepper.',
      price: 120,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 2,
      spicyLevel: 0,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Classic Dip'],
      createdAt: new Date(),
    },
    {
      _id: 'food_12',
      name: 'Smoky Chipotle Mayo Dip',
      description: 'Roasted Mexican chipotle peppers blended into smooth mayonnaise with a hint of lime and smoked sea salt.',
      price: 120,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 2,
      spicyLevel: 2,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Smoky'],
      createdAt: new Date(),
    },
    {
      _id: 'food_13',
      name: 'Honey Mustard Dressing Dip',
      description: 'Real raw wildflower honey churned with coarse dijon mustard and cider vinegar for the ultimate sweet-tangy flavor.',
      price: 120,
      category: 'Signature Wings & Dips',
      image: '/src/assets/images/food_krispier_wings_1794472995763.jpg',
      isAvailable: true,
      preparationTime: 2,
      spicyLevel: 0,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Sweet & Tangy'],
      createdAt: new Date(),
    },
    {
      _id: 'food_14',
      name: 'Chicken Alfredo Baked Penne Pasta',
      description: 'Penne pasta tossed in heavy garlic cream sauce, grilled chicken strips, sliced mushrooms, and baked under a thick crust of golden cheese.',
      price: 890,
      category: 'Sizzling Baked Pastas',
      image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
      isAvailable: true,
      preparationTime: 16,
      spicyLevel: 0,
      isVegetarian: false,
      isChefSpecial: false,
      tags: ['Cheesy', 'Comfort Food'],
      createdAt: new Date(),
    },
    {
      _id: 'food_15',
      name: 'Krispier Mega Crunch Feast Platter',
      description: 'Ultimate family bundle: 1 Large Loaded Pizza, 2 Monster Zinger Burgers, 4 Pcs Crispy Broast, 1 Loaded Fries, 3 Signature Dips, and 1.5L Coke bottle.',
      price: 2450,
      category: 'Crispy Burgers & Zingers',
      image: '/src/assets/images/hero_krispier_feast_1794472994683.jpg',
      isAvailable: true,
      preparationTime: 25,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: true,
      tags: ['Mega Deal', 'Best Value', 'Feast for 4-5'],
      createdAt: new Date(),
    },
    {
      _id: 'food_16',
      name: 'Crispy Chicken Tenders (6 Pcs)',
      description: 'Tender chicken breast strips coated in crunchy panko flakes, fried golden and served with two signature dips of your choice.',
      price: 590,
      category: 'Golden Broast & Fried Chicken',
      image: '/src/assets/images/food_krispier_fried_chicken_1794472997574.jpg',
      isAvailable: true,
      preparationTime: 10,
      spicyLevel: 1,
      isVegetarian: false,
      isChefSpecial: false,
      tags: ['Tenders', 'Finger Food'],
      createdAt: new Date(),
    },
    {
      _id: 'food_17',
      name: 'Belgian Chocolate Thick Shake',
      description: 'Hand-spun ice cream milkshake with rich Belgian dark cocoa, chocolate drizzle, and whipped cream topping.',
      price: 520,
      category: 'Cold Beverages & Shakes',
      image: '/src/assets/images/hero_restaurant_dining_1794471432725.jpg',
      isAvailable: true,
      preparationTime: 5,
      spicyLevel: 0,
      isVegetarian: true,
      isChefSpecial: true,
      tags: ['Thick Shake', 'Chocolate'],
      createdAt: new Date(),
    },
    {
      _id: 'food_18',
      name: 'Chilled Soft Drink (Can 330ml)',
      description: 'Choice of ice-cold Coca-Cola, Sprite, or Fanta.',
      price: 150,
      category: 'Cold Beverages & Shakes',
      image: '/src/assets/images/hero_krispier_feast_1794472994683.jpg',
      isAvailable: true,
      preparationTime: 2,
      spicyLevel: 0,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Chilled'],
      createdAt: new Date(),
    },
    {
      _id: 'food_19',
      name: 'Warm Chocolate Lava Cake',
      description: 'Oven-fresh chocolate sponge cake with rich molten center, served hot.',
      price: 490,
      category: 'Sweet Delights',
      image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
      isAvailable: true,
      preparationTime: 8,
      spicyLevel: 0,
      isVegetarian: true,
      isChefSpecial: false,
      tags: ['Molten Cake', 'Sweet'],
      createdAt: new Date(),
    },
  ];

  // 4. Initial Tables (10 Tables T01 to T10) with real QR codes
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const tableNum = `T${i < 10 ? '0' + i : i}`;
    const qrCode = await generateTableQr(tableNum);
    tables.push({
      _id: `tbl_${tableNum}`,
      tableNumber: tableNum,
      name: i <= 4 ? `Window Booth ${i}` : i <= 7 ? `Central Terrace Table ${i}` : `Private Dining Suite ${i}`,
      capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
      status: i === 1 ? 'occupied' : i === 4 ? 'reserved' : 'available',
      currentOrderId: i === 1 ? 'ORD-1001' : null,
      qrCodeUrl: qrCode,
      location: i <= 4 ? 'Window View' : i <= 7 ? 'Main Dining Hall' : 'Terrace Suite',
    });
  }

  // 5. Initial Sample Orders
  const orders = [
    {
      _id: 'ord_1001',
      orderNumber: 'ORD-1001',
      orderType: 'dine_in',
      tableNumber: 'T01',
      items: [
        {
          foodId: 'food_1',
          name: 'Prime Grilled Ribeye Steak',
          price: 3850,
          quantity: 1,
          specialInstructions: 'Medium rare please, extra rosemary garlic',
          image: '/src/assets/images/food_grilled_steak_1794471432639.jpg',
        },
        {
          foodId: 'food_19',
          name: 'Fresh Mint & Lime Botanical Cooler',
          price: 550,
          quantity: 2,
          specialInstructions: 'Less ice',
          image: '/src/assets/images/hero_restaurant_dining_1794471432725.jpg',
        },
      ],
      subtotal: 4950,
      tax: 792,
      deliveryFee: 0,
      grandTotal: 5742,
      status: 'preparing',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAt: null,
      confirmedBy: '',
      customerName: 'Ahmad Raza',
      customerPhone: '+92 321 4455667',
      deliveryAddress: '',
      specialNotes: 'Anniversary celebration table',
      waiterId: 'usr_waiter_1',
      waiterName: 'Farhan Ali',
      cookId: 'usr_cook_1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      _id: 'ord_1002',
      orderNumber: 'ORD-1002',
      orderType: 'dine_in',
      tableNumber: 'T02',
      items: [
        {
          foodId: 'food_2',
          name: 'Artisan Neapolitan Margherita',
          price: 2450,
          quantity: 1,
          specialInstructions: 'Well done crust',
          image: '/src/assets/images/food_artisan_pizza_1794471433335.jpg',
        },
        {
          foodId: 'food_4',
          name: 'Truffle Fettuccine Alfredo',
          price: 2150,
          quantity: 1,
          specialInstructions: '',
          image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
        },
      ],
      subtotal: 4600,
      tax: 736,
      deliveryFee: 0,
      grandTotal: 5336,
      status: 'ready',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAt: null,
      confirmedBy: '',
      customerName: 'Sarah Jenkins',
      customerPhone: '+92 333 9988776',
      deliveryAddress: '',
      specialNotes: '',
      waiterId: 'usr_waiter_1',
      waiterName: 'Farhan Ali',
      cookId: 'usr_cook_1',
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      _id: 'ord_1003',
      orderNumber: 'ORD-1003',
      orderType: 'delivery',
      tableNumber: '',
      items: [
        {
          foodId: 'food_9',
          name: 'Pepperoni & Hot Honey Pizza',
          price: 2650,
          quantity: 2,
          specialInstructions: 'Cut into 8 slices each',
          image: '/src/assets/images/food_artisan_pizza_1794471433335.jpg',
        },
        {
          foodId: 'food_20',
          name: 'Wild Berry & Passionfruit Mojito',
          price: 750,
          quantity: 2,
          specialInstructions: '',
          image: '/src/assets/images/hero_restaurant_dining_1794471432725.jpg',
        },
      ],
      subtotal: 6800,
      tax: 1088,
      deliveryFee: 250,
      grandTotal: 8138,
      status: 'accepted',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAt: null,
      confirmedBy: '',
      customerName: 'Kamran Qureshi',
      customerPhone: '+92 300 8877665',
      deliveryAddress: 'House 14-B, Street 3, DHA Phase 5, Lahore',
      specialNotes: 'Ring bell on arrival',
      deliveryBoyId: 'usr_delivery_1',
      deliveryBoyName: 'Bilal Ahmed',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      _id: 'ord_1000',
      orderNumber: 'ORD-1000',
      orderType: 'dine_in',
      tableNumber: 'T05',
      items: [
        {
          foodId: 'food_3',
          name: 'Pan-Seared Norwegian Salmon',
          price: 3600,
          quantity: 2,
          specialInstructions: '',
          image: '/src/assets/images/food_salmon_fillet_1794471434258.jpg',
        },
        {
          foodId: 'food_17',
          name: 'Belgian Molten Chocolate Cake',
          price: 1250,
          quantity: 2,
          specialInstructions: '',
          image: '/src/assets/images/food_creamy_pasta_1794471434207.jpg',
        },
      ],
      subtotal: 9700,
      tax: 1552,
      deliveryFee: 0,
      grandTotal: 11252,
      status: 'served',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      paidAt: new Date(Date.now() - 30 * 60 * 1000),
      confirmedBy: 'Farhan Ali (Waiter)',
      customerName: 'Malik Usman',
      customerPhone: '+92 322 7766554',
      deliveryAddress: '',
      specialNotes: '',
      waiterId: 'usr_waiter_1',
      waiterName: 'Farhan Ali',
      createdAt: new Date(Date.now() - 75 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ];

  // 6. Initial Notifications
  const notifications = [
    {
      _id: 'notif_1',
      title: 'New Table Order Received',
      message: 'Table T01 placed a new order for Ribeye Steak and Coolers.',
      type: 'order_new',
      roleTarget: 'all',
      tableNumber: 'T01',
      orderId: 'ord_1001',
      read: false,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      _id: 'notif_2',
      title: 'Food Ready for Table T02',
      message: 'Chef Tariq marked order ORD-1002 as READY. Please serve.',
      type: 'order_status',
      roleTarget: 'waiter',
      tableNumber: 'T02',
      orderId: 'ord_1002',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      _id: 'notif_3',
      title: 'Delivery Order Assigned',
      message: 'New delivery order ORD-1003 assigned to Bilal Ahmed.',
      type: 'order_new',
      roleTarget: 'delivery',
      tableNumber: '',
      orderId: 'ord_1003',
      read: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  // 7. Initial Customer Reviews (Kasur customers)
  const reviews = [
    {
      _id: 'rev_1',
      customerName: 'Hamza Chaudhary (Kasur)',
      rating: 5,
      comment: 'Best zinger burger and loaded fries in Kasur! The secret Krispier yellow sauce is unmatched. Truly Delight In Every Sauce.',
      dishName: 'Krispier Monster Zinger Burger',
      approved: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: 'rev_2',
      customerName: 'Fatima Tariq',
      rating: 5,
      comment: 'The Loaded Special Pizza has so much cheese and toppings, and their garlic herb dipping sauce makes the crust taste incredible!',
      dishName: 'Krispier Special Loaded Pizza',
      approved: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: 'rev_3',
      customerName: 'Usman Butt',
      rating: 5,
      comment: 'Super crunchy golden broast and fiery buffalo wings. Fast QR table ordering was extremely convenient when dining with family.',
      dishName: 'Golden Crunchy Broast (4 Pieces)',
      approved: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  // 8. Settings
  const settings = {
    _id: 'setting_main',
    restaurantName: 'KRISPIER',
    tagline: 'Delight In Every Sauce',
    currency: 'PKR',
    taxRate: 16,
    deliveryFee: 200,
    phone: '+92 300 4882200',
    email: 'info@krispierkasur.com',
    address: 'Main Ferozepur Road, Opposite Sports Stadium, Kasur, Pakistan',
    openingHours: 'Monday – Sunday: 1:00 PM – 2:00 AM',
    isOpen: true,
  };

  memoryStore.users = users;
  memoryStore.categories = categories;
  memoryStore.foods = foods;
  memoryStore.tables = tables;
  memoryStore.orders = orders;
  memoryStore.notifications = notifications;
  memoryStore.reviews = reviews;
  memoryStore.settings = settings;

  // Also seed MongoDB if connected
  if (isMongoConnected) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(users);
        await CategoryModel.insertMany(categories);
        await FoodModel.insertMany(foods);
        await TableModel.insertMany(tables);
        await OrderModel.insertMany(orders);
        await NotificationModel.insertMany(notifications);
        await ReviewModel.insertMany(reviews);
        await SettingModel.create(settings);
        console.log('✅ Seeded MongoDB Atlas database with all initial records!');
      }
    } catch (e: any) {
      console.error('Error seeding MongoDB collections:', e.message);
    }
  }

  console.log('✅ SmartDine initialized with demo staff, categories, 21 food items, 10 QR tables, orders, and settings.');
}
