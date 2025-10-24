import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discount: integer("discount").default(0),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  stockCount: integer("stock_count"),
  tags: text("tags").array(),
  badge: text("badge"),
  freeShipping: boolean("free_shipping").default(false),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
});

// Deals
export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  title: text("title").notNull(),
  endsAt: text("ends_at").notNull(),
  viewCount: integer("view_count").default(0),
  isActive: boolean("is_active").default(true),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerLocation: text("customer_location"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  imageUrl: text("image_url"),
  date: text("date").notNull(),
  verified: boolean("verified").default(false),
});

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  sessionId: text("session_id").notNull(),
});

// Purchase Notifications
export const purchaseNotifications = pgTable("purchase_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  location: text("location").notNull(),
  productName: text("product_name").notNull(),
  timestamp: text("timestamp").notNull(),
});

// Schemas for type safety
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type PurchaseNotification = typeof purchaseNotifications.$inferSelect;

// Additional types for frontend
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface DealWithProduct extends Deal {
  product: Product;
}
