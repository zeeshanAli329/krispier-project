import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  memoryStore,
  isDbConnected,
  UserModel,
  CategoryModel,
  FoodModel,
  TableModel,
  OrderModel,
  NotificationModel,
  ReviewModel,
  SettingModel,
  generateTableQr,
} from './db.js';
import { generateToken, authMiddleware, requireRole, AuthenticatedRequest } from './auth.js';
import { broadcastEvent } from './socket.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & STAFF LOGIN
// ==========================================

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let user: any = null;

    if (isDbConnected()) {
      user = await UserModel.findOne({ email: email.toLowerCase() });
    } else {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      assignedTables: user.assignedTables,
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        assignedTables: user.assignedTables || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
});

apiRouter.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// ==========================================
// 2. CATEGORIES (PUBLIC & ADMIN)
// ==========================================

apiRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const categories = await CategoryModel.find({ active: true }).sort({ order: 1 });
      return res.json(categories);
    }
    const categories = memoryStore.categories.filter((c) => c.active).sort((a, b) => a.order - b.order);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.post('/categories', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, image, order } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      _id: `cat_${Date.now()}`,
      name,
      slug,
      description: description || '',
      image: image || '/src/assets/images/hero_restaurant_dining_1794471432725.jpg',
      order: Number(order) || memoryStore.categories.length + 1,
      active: true,
    };

    if (isDbConnected()) {
      const doc = await CategoryModel.create(newCat);
      return res.status(201).json(doc);
    }

    memoryStore.categories.push(newCat);
    return res.status(201).json(newCat);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.put('/categories/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const updated = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true });
      return res.json(updated);
    }

    const index = memoryStore.categories.findIndex((c) => c._id === id);
    if (index === -1) return res.status(404).json({ message: 'Category not found' });

    memoryStore.categories[index] = { ...memoryStore.categories[index], ...updateData };
    return res.json(memoryStore.categories[index]);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.delete('/categories/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await CategoryModel.findByIdAndDelete(id);
    } else {
      memoryStore.categories = memoryStore.categories.filter((c) => c._id !== id);
    }
    return res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. FOOD MENU (PUBLIC & ADMIN)
// ==========================================

apiRouter.get('/foods', async (req: Request, res: Response) => {
  try {
    const { category, search, availableOnly } = req.query;

    let foods: any[] = [];
    if (isDbConnected()) {
      const query: any = {};
      if (category && category !== 'All') query.category = category;
      if (availableOnly === 'true') query.isAvailable = true;
      if (search) {
        query.name = { $regex: search as string, $options: 'i' };
      }
      foods = await FoodModel.find(query);
    } else {
      foods = [...memoryStore.foods];
      if (category && category !== 'All') {
        foods = foods.filter((f) => f.category === category);
      }
      if (availableOnly === 'true') {
        foods = foods.filter((f) => f.isAvailable);
      }
      if (search) {
        const s = (search as string).toLowerCase();
        foods = foods.filter((f) => f.name.toLowerCase().includes(s) || f.description.toLowerCase().includes(s));
      }
    }

    return res.json(foods);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.post('/foods', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price, category, image, isAvailable, preparationTime, spicyLevel, isVegetarian, isChefSpecial, tags } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, price (PKR), and category are required' });
    }

    const newFood = {
      _id: `food_${Date.now()}`,
      name,
      description: description || '',
      price: Number(price),
      category,
      image: image || '/src/assets/images/food_grilled_steak_1794471432639.jpg',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      preparationTime: Number(preparationTime) || 20,
      spicyLevel: Number(spicyLevel) || 0,
      isVegetarian: Boolean(isVegetarian),
      isChefSpecial: Boolean(isChefSpecial),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
    };

    if (isDbConnected()) {
      const doc = await FoodModel.create(newFood);
      return res.status(201).json(doc);
    }

    memoryStore.foods.unshift(newFood);
    broadcastEvent('menu:updated', { action: 'created', item: newFood });
    return res.status(201).json(newFood);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.put('/foods/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const updated = await FoodModel.findByIdAndUpdate(id, updateData, { new: true });
      broadcastEvent('menu:updated', { action: 'updated', item: updated });
      return res.json(updated);
    }

    const index = memoryStore.foods.findIndex((f) => f._id === id);
    if (index === -1) return res.status(404).json({ message: 'Food item not found' });

    memoryStore.foods[index] = { ...memoryStore.foods[index], ...updateData };
    broadcastEvent('menu:updated', { action: 'updated', item: memoryStore.foods[index] });
    return res.json(memoryStore.foods[index]);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.patch('/foods/:id/toggle', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const item = await FoodModel.findById(id);
      if (!item) return res.status(404).json({ message: 'Item not found' });
      item.isAvailable = !item.isAvailable;
      await item.save();
      broadcastEvent('menu:updated', { action: 'toggled', item });
      return res.json(item);
    }

    const index = memoryStore.foods.findIndex((f) => f._id === id);
    if (index === -1) return res.status(404).json({ message: 'Food item not found' });

    memoryStore.foods[index].isAvailable = !memoryStore.foods[index].isAvailable;
    broadcastEvent('menu:updated', { action: 'toggled', item: memoryStore.foods[index] });
    return res.json(memoryStore.foods[index]);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.delete('/foods/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await FoodModel.findByIdAndDelete(id);
    } else {
      memoryStore.foods = memoryStore.foods.filter((f) => f._id !== id);
    }

    broadcastEvent('menu:updated', { action: 'deleted', id });
    return res.json({ message: 'Food item deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. RESTAURANT TABLES & QR CODES
// ==========================================

apiRouter.get('/tables', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const tables = await TableModel.find().sort({ tableNumber: 1 });
      return res.json(tables);
    }
    return res.json(memoryStore.tables);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.get('/tables/:tableNumber', async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    let table = null;

    if (isDbConnected()) {
      table = await TableModel.findOne({ tableNumber: tableNumber.toUpperCase() });
    } else {
      table = memoryStore.tables.find((t) => t.tableNumber.toUpperCase() === tableNumber.toUpperCase());
    }

    if (!table) {
      return res.status(404).json({ message: `Table ${tableNumber} not found` });
    }
    return res.json(table);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.post('/tables', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tableNumber, name, capacity, location } = req.body;
    if (!tableNumber || !name) {
      return res.status(400).json({ message: 'Table number and name are required' });
    }

    const formattedNum = tableNumber.toUpperCase().trim();
    const qrCode = await generateTableQr(formattedNum);

    const newTable = {
      _id: `tbl_${formattedNum}_${Date.now()}`,
      tableNumber: formattedNum,
      name,
      capacity: Number(capacity) || 4,
      status: 'available',
      currentOrderId: null,
      qrCodeUrl: qrCode,
      location: location || 'Main Dining Hall',
    };

    if (isDbConnected()) {
      const doc = await TableModel.create(newTable);
      broadcastEvent('tables:updated', { action: 'created', table: doc });
      return res.status(201).json(doc);
    }

    memoryStore.tables.push(newTable);
    broadcastEvent('tables:updated', { action: 'created', table: newTable });
    return res.status(201).json(newTable);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.put('/tables/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, status, location } = req.body;

    if (isDbConnected()) {
      const updated = await TableModel.findByIdAndUpdate(id, { name, capacity, status, location }, { new: true });
      broadcastEvent('tables:updated', { action: 'updated', table: updated });
      return res.json(updated);
    }

    const index = memoryStore.tables.findIndex((t) => t._id === id || t.tableNumber === id);
    if (index === -1) return res.status(404).json({ message: 'Table not found' });

    memoryStore.tables[index] = { ...memoryStore.tables[index], name, capacity, status, location };
    broadcastEvent('tables:updated', { action: 'updated', table: memoryStore.tables[index] });
    return res.json(memoryStore.tables[index]);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.delete('/tables/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await TableModel.findByIdAndDelete(id);
    } else {
      memoryStore.tables = memoryStore.tables.filter((t) => t._id !== id && t.tableNumber !== id);
    }

    broadcastEvent('tables:updated', { action: 'deleted', id });
    return res.json({ message: 'Table deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. CUSTOMER ORDERS & STATUS WORKFLOW
// ==========================================

apiRouter.get('/orders', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, tableNumber } = req.query;
    const user = req.user!;

    let orders: any[] = [];
    if (isDbConnected()) {
      const query: any = {};
      if (status && status !== 'all') query.status = status;
      if (type) query.orderType = type;
      if (tableNumber) query.tableNumber = tableNumber;

      // Filter by role if needed
      if (user.role === 'waiter' && user.assignedTables && user.assignedTables.length > 0) {
        query.$or = [{ tableNumber: { $in: user.assignedTables } }, { waiterId: user.id }];
      } else if (user.role === 'delivery') {
        query.orderType = 'delivery';
      }

      orders = await OrderModel.find(query).sort({ createdAt: -1 });
    } else {
      orders = [...memoryStore.orders];
      if (status && status !== 'all') orders = orders.filter((o) => o.status === status);
      if (type) orders = orders.filter((o) => o.orderType === type);
      if (tableNumber) orders = orders.filter((o) => o.tableNumber === tableNumber);

      if (user.role === 'waiter' && user.assignedTables && user.assignedTables.length > 0) {
        orders = orders.filter((o) => user.assignedTables!.includes(o.tableNumber) || o.waiterId === user.id);
      } else if (user.role === 'delivery') {
        orders = orders.filter((o) => o.orderType === 'delivery');
      }

      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let order = null;

    if (isDbConnected()) {
      order = await OrderModel.findOne({ $or: [{ _id: id }, { orderNumber: id }] });
    } else {
      order = memoryStore.orders.find((o) => o._id === id || o.orderNumber === id);
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Create Order (Open to customers from public website or QR Table menu)
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { orderType, tableNumber, items, customerName, customerPhone, deliveryAddress, specialNotes, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Backend price calculation to avoid client tampering
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      // Find food in store
      const food = memoryStore.foods.find((f) => f._id === item.foodId || f.name === item.name);
      const price = food ? food.price : Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += price * qty;
      return {
        foodId: item.foodId || (food ? food._id : 'custom'),
        name: food ? food.name : item.name,
        price,
        quantity: qty,
        specialInstructions: item.specialInstructions || '',
        image: food ? food.image : item.image || '',
      };
    });

    const taxRate = memoryStore.settings.taxRate || 16;
    const tax = Math.round((subtotal * taxRate) / 100);
    const deliveryFee = orderType === 'delivery' ? (memoryStore.settings.deliveryFee || 250) : 0;
    const grandTotal = subtotal + tax + deliveryFee;

    // Unique Order Number
    const orderCount = memoryStore.orders.length + 1001;
    const orderNumber = `ORD-${orderCount}`;

    // Auto-assign waiter if table has assigned waiter
    let assignedWaiter: any = null;
    if (orderType === 'dine_in' && tableNumber) {
      assignedWaiter = memoryStore.users.find(
        (u) => u.role === 'waiter' && u.active && u.assignedTables && u.assignedTables.includes(tableNumber)
      );
    }

    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber,
      orderType: orderType || (tableNumber ? 'dine_in' : 'takeaway'),
      tableNumber: tableNumber || '',
      items: validatedItems,
      subtotal,
      tax,
      deliveryFee,
      grandTotal,
      status: 'new',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'cash',
      paidAt: null,
      confirmedBy: '',
      customerName: customerName || (tableNumber ? `Guest (${tableNumber})` : 'Online Guest'),
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || '',
      specialNotes: specialNotes || '',
      waiterId: assignedWaiter ? assignedWaiter._id : null,
      waiterName: assignedWaiter ? assignedWaiter.name : null,
      cookId: null,
      deliveryBoyId: null,
      deliveryBoyName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update table status if dine_in
    if (tableNumber) {
      const tblIndex = memoryStore.tables.findIndex((t) => t.tableNumber.toUpperCase() === tableNumber.toUpperCase());
      if (tblIndex !== -1) {
        memoryStore.tables[tblIndex].status = 'occupied';
        memoryStore.tables[tblIndex].currentOrderId = orderNumber;
      }
    }

    // Create Notification
    const notif = {
      _id: `notif_${Date.now()}`,
      title: orderType === 'dine_in' ? `New Table Order: ${tableNumber}` : `New ${orderType.toUpperCase()} Order`,
      message: `${orderNumber} placed for PKR ${grandTotal.toLocaleString()} (${validatedItems.length} items)`,
      type: 'order_new',
      roleTarget: 'all',
      tableNumber: tableNumber || '',
      orderId: newOrder._id,
      read: false,
      createdAt: new Date(),
    };

    memoryStore.notifications.unshift(notif);

    if (isDbConnected()) {
      const doc = await OrderModel.create(newOrder);
      await NotificationModel.create(notif);
      if (tableNumber) {
        await TableModel.findOneAndUpdate({ tableNumber }, { status: 'occupied', currentOrderId: orderNumber });
      }
      broadcastEvent('order:new', doc);
      broadcastEvent('notification:new', notif);
      return res.status(201).json(doc);
    }

    memoryStore.orders.unshift(newOrder);
    broadcastEvent('order:new', newOrder);
    broadcastEvent('notification:new', notif);
    return res.status(201).json(newOrder);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Update Order Status (Cook accepts/starts/ready, Waiter serves, Delivery delivers)
apiRouter.patch('/orders/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cookId, deliveryBoyId } = req.body;
    const user = req.user!;

    const allowedStatuses = ['new', 'accepted', 'preparing', 'ready', 'served', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    let orderIndex = memoryStore.orders.findIndex((o) => o._id === id || o.orderNumber === id);
    if (orderIndex === -1) return res.status(404).json({ message: 'Order not found' });

    const order = memoryStore.orders[orderIndex];
    order.status = status;
    order.updatedAt = new Date();

    if (user.role === 'cook' && !order.cookId) {
      order.cookId = user.id;
    }
    if (user.role === 'delivery' && !order.deliveryBoyId) {
      order.deliveryBoyId = user.id;
      order.deliveryBoyName = user.name;
    }
    if (deliveryBoyId) {
      const delBoy = memoryStore.users.find((u) => u._id === deliveryBoyId);
      if (delBoy) {
        order.deliveryBoyId = delBoy._id;
        order.deliveryBoyName = delBoy.name;
      }
    }

    // If served and paid or complete, free table if needed
    if (status === 'served' && order.tableNumber) {
      // Create notification for Waiter/Admin
      const notif = {
        _id: `notif_${Date.now()}`,
        title: `Order Served: ${order.orderNumber}`,
        message: `Food served to Table ${order.tableNumber} by ${user.name}.`,
        type: 'order_status',
        roleTarget: 'all',
        tableNumber: order.tableNumber,
        orderId: order._id,
        read: false,
        createdAt: new Date(),
      };
      memoryStore.notifications.unshift(notif);
      broadcastEvent('notification:new', notif);
    }

    if (status === 'ready') {
      const notif = {
        _id: `notif_${Date.now()}`,
        title: `Order READY: ${order.orderNumber}`,
        message: `Kitchen has finished preparing ${order.orderNumber} (Table ${order.tableNumber || 'Delivery'}).`,
        type: 'order_status',
        roleTarget: order.orderType === 'delivery' ? 'delivery' : 'waiter',
        tableNumber: order.tableNumber,
        orderId: order._id,
        read: false,
        createdAt: new Date(),
      };
      memoryStore.notifications.unshift(notif);
      broadcastEvent('notification:new', notif);
    }

    if (isDbConnected()) {
      const updated = await OrderModel.findByIdAndUpdate(order._id, order, { new: true });
      broadcastEvent('order:updated', updated);
      return res.json(updated);
    }

    broadcastEvent('order:updated', order);
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Customer calls waiter from table QR menu
apiRouter.post('/orders/call-waiter', async (req: Request, res: Response) => {
  try {
    const { tableNumber, reason } = req.body;
    if (!tableNumber) return res.status(400).json({ message: 'Table number is required' });

    const notif = {
      _id: `notif_${Date.now()}`,
      title: `🔔 Waiter Call: Table ${tableNumber}`,
      message: reason || `Customer at Table ${tableNumber} has requested assistance.`,
      type: 'waiter_call',
      roleTarget: 'waiter',
      tableNumber,
      orderId: '',
      read: false,
      createdAt: new Date(),
    };

    memoryStore.notifications.unshift(notif);
    broadcastEvent('notification:new', notif);
    broadcastEvent('waiter:called', { tableNumber, reason });

    return res.json({ message: `Waiter has been notified for Table ${tableNumber}.` });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// Customer requests bill from table QR menu
apiRouter.post('/orders/request-bill', async (req: Request, res: Response) => {
  try {
    const { tableNumber, paymentMethod } = req.body;
    if (!tableNumber) return res.status(400).json({ message: 'Table number is required' });

    const notif = {
      _id: `notif_${Date.now()}`,
      title: `🧾 Bill Requested: Table ${tableNumber}`,
      message: `Customer at Table ${tableNumber} is ready to pay via ${paymentMethod || 'Cash'}.`,
      type: 'bill_request',
      roleTarget: 'waiter',
      tableNumber,
      orderId: '',
      read: false,
      createdAt: new Date(),
    };

    memoryStore.notifications.unshift(notif);
    broadcastEvent('notification:new', notif);
    broadcastEvent('bill:requested', { tableNumber, paymentMethod });

    return res.json({ message: `Bill request received for Table ${tableNumber}. Your waiter will arrive shortly.` });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. STAFF MANAGEMENT (ADMIN ONLY)
// ==========================================

apiRouter.get('/staff', authMiddleware, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const staff = await UserModel.find({ role: { $ne: 'admin' } }).select('-password');
      return res.json(staff);
    }
    const staff = memoryStore.users
      .filter((u) => u.role !== 'admin')
      .map(({ password, ...rest }) => rest);
    return res.json(staff);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.post('/staff', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, phone, assignedTables } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check duplicate
    const exists = memoryStore.users.some((u) => u.email.toLowerCase() === emailLower);
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = {
      _id: `usr_${role}_${Date.now()}`,
      name,
      email: emailLower,
      password: hashedPassword,
      role,
      phone: phone || '',
      active: true,
      assignedTables: Array.isArray(assignedTables) ? assignedTables : [],
      createdAt: new Date(),
    };

    if (isDbConnected()) {
      const doc = await UserModel.create(newStaff);
      const { password: _, ...safeUser } = doc.toObject();
      return res.status(201).json(safeUser);
    }

    memoryStore.users.push(newStaff);
    const { password: _, ...safeStaff } = newStaff;
    return res.status(201).json(safeStaff);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.put('/staff/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, assignedTables, active, password } = req.body;

    const index = memoryStore.users.findIndex((u) => u._id === id);
    if (index === -1) return res.status(404).json({ message: 'Staff member not found' });

    if (name) memoryStore.users[index].name = name;
    if (phone !== undefined) memoryStore.users[index].phone = phone;
    if (assignedTables !== undefined) memoryStore.users[index].assignedTables = assignedTables;
    if (active !== undefined) memoryStore.users[index].active = Boolean(active);
    if (password) {
      memoryStore.users[index].password = await bcrypt.hash(password, 10);
    }

    if (isDbConnected()) {
      const updated = await UserModel.findByIdAndUpdate(id, memoryStore.users[index], { new: true }).select('-password');
      return res.json(updated);
    }

    const { password: _, ...safe } = memoryStore.users[index];
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.patch('/staff/:id/toggle', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = memoryStore.users.findIndex((u) => u._id === id);
    if (index === -1) return res.status(404).json({ message: 'Staff member not found' });

    memoryStore.users[index].active = !memoryStore.users[index].active;

    if (isDbConnected()) {
      await UserModel.findByIdAndUpdate(id, { active: memoryStore.users[index].active });
    }

    const { password: _, ...safe } = memoryStore.users[index];
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.delete('/staff/:id', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    memoryStore.users = memoryStore.users.filter((u) => u._id !== id);
    if (isDbConnected()) {
      await UserModel.findByIdAndDelete(id);
    }
    return res.json({ message: 'Staff account removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. BILLING & PAYMENTS
// ==========================================

// Confirm payment (Cash or Card, performed by Admin or Waiter)
apiRouter.post('/billing/confirm', authMiddleware, requireRole(['admin', 'waiter']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const user = req.user!;

    const orderIndex = memoryStore.orders.findIndex((o) => o._id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) return res.status(404).json({ message: 'Order not found' });

    const order = memoryStore.orders[orderIndex];
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod || 'cash';
    order.paidAt = new Date();
    order.confirmedBy = `${user.name} (${user.role.toUpperCase()})`;
    order.updatedAt = new Date();

    // If table was occupied, check if table can be released
    if (order.tableNumber) {
      const tblIndex = memoryStore.tables.findIndex((t) => t.tableNumber.toUpperCase() === order.tableNumber.toUpperCase());
      if (tblIndex !== -1) {
        memoryStore.tables[tblIndex].status = 'available';
        memoryStore.tables[tblIndex].currentOrderId = null;
        broadcastEvent('tables:updated', { action: 'updated', table: memoryStore.tables[tblIndex] });
      }
    }

    const notif = {
      _id: `notif_${Date.now()}`,
      title: `💰 Payment Collected: ${order.orderNumber}`,
      message: `PKR ${order.grandTotal.toLocaleString()} confirmed via ${order.paymentMethod} by ${user.name}.`,
      type: 'order_status',
      roleTarget: 'admin',
      tableNumber: order.tableNumber,
      orderId: order._id,
      read: false,
      createdAt: new Date(),
    };
    memoryStore.notifications.unshift(notif);

    if (isDbConnected()) {
      const updated = await OrderModel.findByIdAndUpdate(order._id, order, { new: true });
      broadcastEvent('order:updated', updated);
      broadcastEvent('notification:new', notif);
      return res.json(updated);
    }

    broadcastEvent('order:updated', order);
    broadcastEvent('notification:new', notif);
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.get('/billing/history', authMiddleware, requireRole(['admin', 'waiter']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const paidOrders = memoryStore.orders
      .filter((o) => o.paymentStatus === 'paid')
      .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());
    return res.json(paidOrders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. REPORTS & ANALYTICS
// ==========================================

apiRouter.get('/reports/dashboard', authMiddleware, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = memoryStore.orders;
    const totalOrders = orders.length;
    const newOrders = orders.filter((o) => o.status === 'new').length;
    const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'accepted').length;
    const readyOrders = orders.filter((o) => o.status === 'ready').length;
    const servedOrders = orders.filter((o) => o.status === 'served' || o.status === 'delivered').length;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const activeTables = memoryStore.tables.filter((t) => t.status === 'occupied').length;
    const availableTables = memoryStore.tables.filter((t) => t.status === 'available').length;

    // Top selling items
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items || []) {
        const existing = itemMap.get(item.name) || { name: item.name, count: 0, revenue: 0 };
        existing.count += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemMap.set(item.name, existing);
      }
    }
    const topDishes = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      totalOrders,
      newOrders,
      preparingOrders,
      readyOrders,
      servedOrders,
      totalRevenue,
      activeTables,
      availableTables,
      topDishes,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. REVIEWS & CUSTOMER FEEDBACK
// ==========================================

apiRouter.get('/reviews', async (_req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const reviews = await ReviewModel.find({ approved: true }).sort({ createdAt: -1 });
      return res.json(reviews);
    }
    const reviews = memoryStore.reviews.filter((r) => r.approved);
    return res.json(reviews);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

apiRouter.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { customerName, rating, comment, dishName } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ message: 'Name, rating, and comment are required' });
    }

    const newReview = {
      _id: `rev_${Date.now()}`,
      customerName,
      rating: Number(rating),
      comment,
      dishName: dishName || '',
      approved: true,
      createdAt: new Date(),
    };

    if (isDbConnected()) {
      const doc = await ReviewModel.create(newReview);
      return res.status(201).json(doc);
    }

    memoryStore.reviews.unshift(newReview);
    return res.status(201).json(newReview);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 10. RESTAURANT SETTINGS
// ==========================================

apiRouter.get('/settings', async (_req: Request, res: Response) => {
  return res.json(memoryStore.settings);
});

apiRouter.put('/settings', authMiddleware, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updateData = req.body;
    memoryStore.settings = { ...memoryStore.settings, ...updateData };

    if (isDbConnected()) {
      await SettingModel.findOneAndUpdate({}, memoryStore.settings, { upsert: true });
    }

    broadcastEvent('settings:updated', memoryStore.settings);
    return res.json(memoryStore.settings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 11. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifs = memoryStore.notifications
    .filter((n) => n.roleTarget === 'all' || n.roleTarget === user.role || user.role === 'admin')
    .slice(0, 30);
  return res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const notif = memoryStore.notifications.find((n) => n._id === id);
  if (notif) notif.read = true;
  return res.json({ success: true });
});
