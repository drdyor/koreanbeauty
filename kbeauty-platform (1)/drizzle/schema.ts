import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories (Toners, Serums, Masks, Sunscreens, Cleansers)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Skin concerns (Hydration, Brightening, Anti-aging, Acne, Sensitive, etc.)
 */
export const skinConcerns = mysqlTable("skin_concerns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SkinConcern = typeof skinConcerns.$inferSelect;
export type InsertSkinConcern = typeof skinConcerns.$inferInsert;

/**
 * Key ingredients (Hyaluronic Acid, Niacinamide, Vitamin C, etc.)
 */
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  benefits: text("benefits"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

/**
 * Products table
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  brand: varchar("brand", { length: 100 }).notNull(),
  categoryId: int("categoryId").notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(), // Price in cents
  originalPrice: int("originalPrice"), // Original price for showing discounts
  imageUrl: text("imageUrl").notNull(),
  images: text("images"), // JSON array of additional image URLs
  stock: int("stock").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  bestseller: boolean("bestseller").default(false).notNull(),
  newArrival: boolean("newArrival").default(false).notNull(),
  rating: int("rating").default(0), // Average rating * 10 (e.g., 45 = 4.5 stars)
  reviewCount: int("reviewCount").default(0).notNull(),
  usageInstructions: text("usageInstructions"),
  ingredientsList: text("ingredientsList"), // Full ingredient list as text
  size: varchar("size", { length: 50 }), // e.g., "100ml", "30g"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product to skin concerns mapping (many-to-many)
 */
export const productSkinConcerns = mysqlTable("product_skin_concerns", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  skinConcernId: int("skinConcernId").notNull(),
});

/**
 * Product to ingredients mapping (many-to-many)
 */
export const productIngredients = mysqlTable("product_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  ingredientId: int("ingredientId").notNull(),
});

/**
 * Customer reviews
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  comment: text("comment").notNull(),
  verified: boolean("verified").default(false).notNull(), // Verified purchase
  helpful: int("helpful").default(0).notNull(), // Number of helpful votes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Shopping cart items
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(), // In cents
  shipping: int("shipping").default(0).notNull(), // In cents
  tax: int("tax").default(0).notNull(), // In cents
  total: int("total").notNull(), // In cents
  shippingName: varchar("shippingName", { length: 255 }).notNull(),
  shippingEmail: varchar("shippingEmail", { length: 320 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  shippingPostalCode: varchar("shippingPostalCode", { length: 20 }).notNull(),
  shippingCountry: varchar("shippingCountry", { length: 100 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: text("productImage").notNull(),
  price: int("price").notNull(), // Price at time of purchase (in cents)
  quantity: int("quantity").notNull(),
  subtotal: int("subtotal").notNull(), // In cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Skin quiz results
 */
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 100 }), // For anonymous users
  skinType: varchar("skinType", { length: 50 }).notNull(), // dry, oily, combination, sensitive, normal
  primaryConcern: varchar("primaryConcern", { length: 100 }).notNull(),
  secondaryConcerns: text("secondaryConcerns"), // JSON array
  age: varchar("age", { length: 20 }),
  currentRoutine: text("currentRoutine"),
  preferences: text("preferences"), // JSON object with preferences
  recommendedProducts: text("recommendedProducts"), // JSON array of product IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

/**
 * User preferences
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  skinType: varchar("skinType", { length: 50 }),
  skinConcerns: text("skinConcerns"), // JSON array
  favoriteIngredients: text("favoriteIngredients"), // JSON array
  avoidIngredients: text("avoidIngredients"), // JSON array
  newsletterSubscribed: boolean("newsletterSubscribed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Newsletter subscribers
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribed: boolean("subscribed").default(true).notNull(),
  discountClaimed: boolean("discountClaimed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * Educational content / blog posts
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  author: varchar("author", { length: 100 }).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  productSkinConcerns: many(productSkinConcerns),
  productIngredients: many(productIngredients),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

/**
 * Daily check-ins and health logs
 */
export const dailyCheckins = mysqlTable("daily_checkins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  date: timestamp("date").defaultNow().notNull(),
  cycleDay: int("cycle_day"),
  mood: varchar("mood", { length: 32 }),
  energy: int("energy"),
  skinCondition: varchar("skin_condition", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const foodLogs = mysqlTable("food_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  date: timestamp("date").defaultNow().notNull(),
  foodItem: varchar("food_item", { length: 100 }).notNull(),
  triggerLevel: int("trigger_level").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const skinLogs = mysqlTable("skin_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  date: timestamp("date").defaultNow().notNull(),
  breakouts: int("breakouts"),
  sensitivity: int("sensitivity"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyCheckinRow = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckinRow = typeof dailyCheckins.$inferInsert;
export type FoodLogRow = typeof foodLogs.$inferSelect;
export type InsertFoodLogRow = typeof foodLogs.$inferInsert;
export type SkinLogRow = typeof skinLogs.$inferSelect;
export type InsertSkinLogRow = typeof skinLogs.$inferInsert;
