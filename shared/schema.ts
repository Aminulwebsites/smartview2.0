import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  deliveryTime: text("delivery_time").notNull(),
  costForTwo: integer("cost_for_two").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  image: text("image").notNull(),
  description: text("description"),
});

export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  isVeg: boolean("is_veg").notNull().default(true),
  prepTime: text("prep_time").notNull().default("15-20 mins"),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("4.0"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage table for admin authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for admin functionality
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(), 
  password: varchar("password").notNull(),
  role: varchar("role").notNull().default("customer"), // customer, admin
  phone: varchar("phone"),
  profilePicture: text("profile_picture"), // URL to profile picture
  isDeleted: boolean("is_deleted").notNull().default(false), // Track deleted users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  items: text("items").notNull(), // JSON string of cart items
  total: integer("total").notNull(),
  status: text("status").notNull().default("confirmed"),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  customerName: varchar("customer_name"),
  customerPhone: varchar("customer_phone"),
  estimatedDeliveryTime: integer("estimated_delivery_time").default(35), // minutes
  actualDeliveryTime: integer("actual_delivery_time"), // minutes taken
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Keep MenuItem for backward compatibility
export type MenuItem = FoodItem;
export type InsertMenuItem = InsertFoodItem;
