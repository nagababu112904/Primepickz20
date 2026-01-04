import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index, unique, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 20 }).default("customer"), // 'customer', 'admin'
  emailVerified: boolean("email_verified").default(false),
  emailVerifyToken: varchar("email_verify_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  images: jsonb("images").$type<string[]>().default([]), // Array of image URLs
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  stockCount: integer("stock_count").default(0),
  tags: text("tags").array(),
  badge: text("badge"),
  videoUrl: text("video_url"), // Product video URL (YouTube, Vimeo, etc.)
  freeShipping: boolean("free_shipping").default(false),
  hasVariants: boolean("has_variants").default(false),
  // Amazon SP-API fields
  amazonAsin: text("amazon_asin"),
  amazonSku: text("amazon_sku"),
  amazonSyncStatus: text("amazon_sync_status").default("pending"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Variants (Size + Color combinations)
export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
  colorHex: varchar("color_hex", { length: 7 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  sku: varchar("sku", { length: 100 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Reviews with photos
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  userId: varchar("user_id"),
  customerName: text("customer_name").notNull(),
  customerLocation: text("customer_location"),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 200 }),
  comment: text("comment").notNull(),
  photos: jsonb("photos").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  date: text("date").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Return Requests
export const returnRequests = pgTable("return_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  userId: varchar("user_id"),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  photos: jsonb("photos").$type<string[]>().default([]),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected, completed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Wishlist Items
export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_product_wishlist").on(table.userId, table.productId),
]);

// Addresses
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: varchar("shipping_address_id").notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url"),
});

// Amazon Sync Logs
export const amazonSyncLogs = pgTable("amazon_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id"),
  syncType: text("sync_type").notNull(), // 'product', 'inventory', 'order'
  status: text("status").notNull(), // 'success', 'failed', 'pending'
  message: text("message"),
  errorDetails: text("error_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Logs - for admin dashboard notifications
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'order_notification', 'shipping_update', 'return_request', etc.
  orderId: varchar("order_id"),
  orderNumber: text("order_number"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  subject: text("subject").notNull(),
  items: jsonb("items"), // Order items as JSON
  total: text("total"),
  status: text("status").default("unread"), // 'unread', 'read'
  metadata: jsonb("metadata"), // Additional data
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Schemas for type safety
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, lastSyncedAt: true });
export const insertProductVariantSchema = createInsertSchema(productVariants).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true }).extend({
  sessionId: z.string().optional(),
});
export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, createdAt: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertSyncLogSchema = createInsertSchema(amazonSyncLogs).omit({ id: true, createdAt: true });
export const insertReturnRequestSchema = createInsertSchema(returnRequests).omit({ id: true, createdAt: true, updatedAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type PurchaseNotification = typeof purchaseNotifications.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type AmazonSyncLog = typeof amazonSyncLogs.$inferSelect;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type ReturnRequest = typeof returnRequests.$inferSelect;
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// Additional types for frontend
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface DealWithProduct extends Deal {
  product: Product;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  shippingAddress: Address;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}
