import { type FoodItem, type InsertFoodItem, type Order, type InsertOrder, type User, type InsertUser, foodItems, orders, users } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Food Items
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, foodItem: Partial<InsertFoodItem>): Promise<FoodItem>;
  deleteFoodItem(id: string): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  updateOrderDeliveryTime(id: string, estimatedDeliveryTime: number): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  deleteAllOrders(): Promise<void>;
  
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingFoodItems = await db.select().from(foodItems).limit(1);
      if (existingFoodItems.length > 0) return;

      // Seed food items
      const foodData: InsertFoodItem[] = [
        {
          name: "Margherita Pizza",
          description: "Wood-fired pizza with fresh mozzarella, tomato sauce and basil",
          price: 380,
          category: "Pizza",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "20-25 mins",
          rating: "4.5"
        },
        {
          name: "Chicken Biryani",
          description: "Fragrant basmati rice with tender chicken and aromatic spices",
          price: 320,
          category: "Rice",
          image: "https://images.unsplash.com/photo-1563379091339-03246963d271?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: false,
          prepTime: "30-35 mins",
          rating: "4.7"
        },
        {
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with parmesan cheese and croutons",
          price: 180,
          category: "Salads",
          image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "10-15 mins",
          rating: "4.2"
        },
        {
          name: "Grilled Chicken",
          description: "Herb-crusted chicken breast with seasonal vegetables",
          price: 450,
          category: "Main Course",
          image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: false,
          prepTime: "25-30 mins",
          rating: "4.6"
        },
        {
          name: "Pad Thai",
          description: "Traditional Thai stir-fried noodles with tamarind and peanuts",
          price: 280,
          category: "Noodles",
          image: "https://images.unsplash.com/photo-1559314809-0f31657def5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "20-25 mins",
          rating: "4.4"
        },
        {
          name: "Chocolate Lava Cake",
          description: "Warm chocolate cake with molten center and vanilla ice cream",
          price: 220,
          category: "Desserts",
          image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "15-20 mins",
          rating: "4.8"
        },
        {
          name: "Cappuccino",
          description: "Rich espresso with steamed milk and foam",
          price: 120,
          category: "Beverages",
          image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "5-10 mins",
          rating: "4.3"
        },
        {
          name: "Fish Tacos",
          description: "Grilled fish with avocado salsa in soft tortillas",
          price: 350,
          category: "Mexican",
          image: "https://images.unsplash.com/photo-1565299585323-38174c8d0a5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: false,
          prepTime: "18-22 mins",
          rating: "4.5"
        },
        {
          name: "Veggie Burger",
          description: "Plant-based patty with fresh vegetables and special sauce",
          price: 240,
          category: "Burgers",
          image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: true,
          prepTime: "15-20 mins",
          rating: "4.1"
        },
        {
          name: "Sushi Platter",
          description: "Assorted fresh sushi rolls with wasabi and ginger",
          price: 580,
          category: "Japanese",
          image: "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          isVeg: false,
          prepTime: "25-30 mins",
          rating: "4.9"
        }
      ];

      await db.insert(foodItems).values(foodData);

      // Create admin user
      await db.insert(users).values({
        email: "admin@smartview2.0",
        firstName: "Admin",
        lastName: "User",
        password: "admin123",
        role: "admin",
        phone: "+91 98765 43210"
      });

    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }

  // Food item methods
  async getFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(foodItems).where(eq(foodItems.available, true));
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item;
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const [newFoodItem] = await db.insert(foodItems).values(foodItem).returning();
    return newFoodItem;
  }

  async updateFoodItem(id: string, foodItem: Partial<InsertFoodItem>): Promise<FoodItem> {
    const [updatedFoodItem] = await db
      .update(foodItems)
      .set({ ...foodItem, updatedAt: new Date() })
      .where(eq(foodItems.id, id))
      .returning();
    return updatedFoodItem;
  }

  async deleteFoodItem(id: string): Promise<void> {
    await db.delete(foodItems).where(eq(foodItems.id, id));
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      console.log('Storage: Getting orders for userId:', userId);
      const result = await db.select().from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      console.log('Storage: Found orders:', result.length, 'results');
      if (result.length > 0) {
        console.log('First order:', result[0]);
      }
      return result;
    } catch (error) {
      console.error('Storage: Error in getUserOrders:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderDeliveryTime(id: string, estimatedDeliveryTime: number): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ estimatedDeliveryTime, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async deleteAllOrders(): Promise<void> {
    await db.delete(orders);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isDeleted, false)).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    // Soft delete - mark user as deleted instead of physically removing
    await db
      .update(users)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();