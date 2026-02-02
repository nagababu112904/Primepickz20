import { pgTable, varchar, text, timestamp, integer, json, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Meta Product Catalog Sync Tables
 * Tracks synchronization between PrimePickz products and Meta Commerce Manager
 */

// Maps PrimePickz product IDs to Meta Catalog product IDs
export const metaCatalogSync = pgTable("meta_catalog_sync", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull().unique(),
  metaProductId: varchar("meta_product_id", { length: 255 }),
  retailerId: varchar("retailer_id", { length: 255 }).notNull().unique(), // SKU for Meta
  syncStatus: varchar("sync_status", { length: 50 }).notNull().default("pending"),
  // Status: pending, synced, failed, deleted
  lastSyncedAt: timestamp("last_synced_at"),
  lastError: text("last_error"),
  retryCount: integer("retry_count").notNull().default(0),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit log for all sync operations
export const metaSyncLogs = pgTable("meta_sync_logs", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 255 }),
  retailerId: varchar("retailer_id", { length: 255 }),
  operation: varchar("operation", { length: 20 }).notNull(), // CREATE, UPDATE, DELETE, RECONCILE
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, FAILED, PENDING, QUEUED
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dead letter queue for failed sync operations
export const metaSyncDeadLetter = pgTable("meta_sync_dead_letter", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull(),
  retailerId: varchar("retailer_id", { length: 255 }),
  operation: varchar("operation", { length: 20 }).notNull(),
  payload: json("payload").notNull(),
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(5),
  lastAttemptAt: timestamp("last_attempt_at"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertMetaCatalogSyncSchema = createInsertSchema(metaCatalogSync).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertMetaSyncLogSchema = createInsertSchema(metaSyncLogs).omit({ 
  id: true, 
  createdAt: true 
});

export const insertMetaSyncDeadLetterSchema = createInsertSchema(metaSyncDeadLetter).omit({ 
  id: true, 
  createdAt: true 
});

// TypeScript types
export type MetaCatalogSync = typeof metaCatalogSync.$inferSelect;
export type InsertMetaCatalogSync = z.infer<typeof insertMetaCatalogSyncSchema>;
export type MetaSyncLog = typeof metaSyncLogs.$inferSelect;
export type InsertMetaSyncLog = z.infer<typeof insertMetaSyncLogSchema>;
export type MetaSyncDeadLetter = typeof metaSyncDeadLetter.$inferSelect;
export type InsertMetaSyncDeadLetter = z.infer<typeof insertMetaSyncDeadLetterSchema>;

// Meta Catalog Product Schema (matches Meta Graph API format)
export interface MetaCatalogProduct {
  retailer_id: string;           // Unique SKU, use product.id
  name: string;                  // Max 150 chars
  description: string;           // Max 5000 chars
  price: number;                 // Price in cents (USD)
  currency: "USD";
  availability: "in stock" | "out of stock" | "preorder";
  image_url: string;             // Primary image, must be HTTPS
  additional_image_urls?: string[]; // Up to 10 additional images
  url: string;                   // Product page URL
  brand?: string;
  category?: string;             // Google product category
  condition?: "new" | "refurbished" | "used";
  sale_price?: number;           // Sale price in cents
  custom_label_0?: string;       // Up to 5 custom labels
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
}

// Sync event types for webhook emission
export type CatalogSyncEvent = {
  type: "product.created" | "product.updated" | "product.deleted";
  productId: string;
  retailerId: string;
  timestamp: string;
  data?: MetaCatalogProduct;
};
