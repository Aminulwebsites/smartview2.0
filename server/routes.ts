import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertFoodItemSchema, insertUserSchema, insertRestaurantSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for monitoring
  app.get('/api/health', async (req, res) => {
    try {
      // Test database connection by fetching one food item
      const foods = await storage.getFoodItems();
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        foodItems: foods.length,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        if (existingUser.isDeleted) {
          return res.status(403).json({ message: 'This email is associated with a deactivated account. Please contact support.' });
        }
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'customer',
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Create session
      const sessionId = Math.random().toString(36);
      userSessions.set(sessionId, userWithoutPassword);
      
      res.setHeader('X-Session-Id', sessionId);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user has been deleted by admin
      if (user.isDeleted) {
        return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      }

      // Check password (in production, use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Create session
      const sessionId = Math.random().toString(36);
      userSessions.set(sessionId, userWithoutPassword);
      
      res.setHeader('X-Session-Id', sessionId);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  });

  // User profile management
  app.patch("/api/auth/profile", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const currentUser = userSessions.get(sessionId);
      const { firstName, lastName, phone, profilePicture } = req.body;
      
      const updatedUser = await storage.updateUser(currentUser.id, {
        firstName,
        lastName,
        phone,
        profilePicture,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      // Update session
      userSessions.set(sessionId, userWithoutPassword);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });



  // Simple session storage (in memory for demo - use Redis/database in production)
  const userSessions = new Map<string, any>();

  // Get user info (auth endpoint)  
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId && userSessions.has(sessionId)) {
        const user = userSessions.get(sessionId);
        
        // Check if user has been deleted, if so, invalidate session
        const currentUser = await storage.getUser(user.id);
        if (!currentUser || currentUser.isDeleted) {
          userSessions.delete(sessionId);
          return res.json(null);
        }
        
        res.json(user);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Get all food items
  app.get("/api/foods", async (_req, res) => {
    try {
      const foodItems = await storage.getFoodItems();
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get single food item
  app.get("/api/foods/:id", async (req, res) => {
    try {
      const foodItem = await storage.getFoodItem(req.params.id);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(foodItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  // Admin food item management routes
  app.post("/api/admin/foods", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(validatedData);
      res.status(201).json(foodItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid food item data" });
    }
  });

  app.patch("/api/admin/foods/:id", async (req, res) => {
    try {
      const foodItem = await storage.updateFoodItem(req.params.id, req.body);
      res.json(foodItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update food item" });
    }
  });

  app.delete("/api/admin/foods/:id", async (req, res) => {
    try {
      await storage.deleteFoodItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = userSessions.get(sessionId);
      const orderData = {
        ...req.body,
        userId: user.id,
        status: 'confirmed',
        estimatedDeliveryTime: 35 // default 35 minutes
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });



  // Admin Routes
  // Get all orders (admin)
  app.get("/api/admin/orders", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status (admin)
  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Update order delivery time (admin)
  app.patch("/api/admin/orders/:id/delivery-time", async (req, res) => {
    try {
      const { estimatedDeliveryTime } = req.body;
      const order = await storage.updateOrderDeliveryTime(req.params.id, estimatedDeliveryTime);
      res.json(order);
    } catch (error) {
      console.error('Update delivery time error:', error);
      res.status(500).json({ message: "Failed to update delivery time" });
    }
  });

  // Delete order (admin)
  app.delete("/api/admin/orders/:id", async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Reset all orders (admin)
  app.delete("/api/admin/orders", async (req, res) => {
    try {
      await storage.deleteAllOrders();
      res.status(204).send();
    } catch (error) {
      console.error('Reset orders error:', error);
      res.status(500).json({ message: "Failed to reset orders" });
    }
  });

  // Get customer orders
  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = userSessions.get(sessionId);
      console.log('Getting orders for user ID:', user.id);
      const orders = await storage.getUserOrders(user.id);
      console.log('Found orders:', orders.length, 'for user', user.id);
      res.json(orders);
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get specific order details for tracking
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = userSessions.get(sessionId);
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      // Ensure user can only see their own orders
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(order);
    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  // User management routes (admin)
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id/reset-password", async (req, res) => {
    try {
      // Generate a temporary password (in production, use crypto.randomBytes)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      await storage.updateUser(req.params.id, { 
        password: tempPassword 
      });
      
      // In production, you would send an email with the new password
      // For now, we'll just return success
      res.json({ 
        message: "Password reset successfully", 
        // In production, don't return the password in the response
        tempPassword: tempPassword 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin Statistics endpoint
  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const users = await storage.getUsers();
      const foods = await storage.getFoodItems();
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate statistics
      const todaysOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        return orderDate >= today;
      });
      
      const weeklyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        return orderDate >= thisWeek;
      });
      
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || '');
        return orderDate >= thisMonth;
      });
      
      const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
      const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.total, 0);
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      // Order status breakdown
      const ordersByStatus = {
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        onTheWay: orders.filter(o => o.status === 'onTheWay').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
      };
      
      // Recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 10);
      
      // Popular items (top 5)
      const itemCounts = new Map();
      orders.forEach(order => {
        try {
          const items = JSON.parse(order.items);
          items.forEach((item: any) => {
            const current = itemCounts.get(item.name) || 0;
            itemCounts.set(item.name, current + item.quantity);
          });
        } catch (e) {
          // Skip invalid order items
        }
      });
      
      const popularItems = Array.from(itemCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      // New users today
      const newUsersToday = users.filter(user => {
        const userDate = new Date(user.createdAt || '');
        return userDate >= today;
      }).length;
      
      const stats = {
        orders: {
          total: orders.length,
          today: todaysOrders.length,
          weekly: weeklyOrders.length,
          monthly: monthlyOrders.length,
          byStatus: ordersByStatus,
          recent: recentOrders
        },
        revenue: {
          total: totalRevenue,
          today: todaysRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue
        },
        users: {
          total: users.length,
          newToday: newUsersToday
        },
        foods: {
          total: foods.length,
          available: foods.filter(f => f.available).length
        },
        popularItems,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Restaurant management routes (admin) - TODO: Implement when needed

  // Food item management routes (admin)
  app.post("/api/admin/menu-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(validatedData);
      res.status(201).json(foodItem);
    } catch (error) {
      console.error('Create food item error:', error);
      res.status(400).json({ message: "Invalid food item data" });
    }
  });

  app.patch("/api/admin/menu-items/:id", async (req, res) => {
    try {
      const foodItem = await storage.updateFoodItem(req.params.id, req.body);
      res.json(foodItem);
    } catch (error) {
      console.error('Update food item error:', error);
      res.status(400).json({ message: "Failed to update food item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", async (req, res) => {
    try {
      await storage.deleteFoodItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete food item error:', error);
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
