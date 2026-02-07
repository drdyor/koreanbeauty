import { eq, and, or, like, inArray, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, products, categories, skinConcerns, ingredients,
  productSkinConcerns, productIngredients, reviews, cartItems, orders,
  orderItems, quizResults, userPreferences, newsletterSubscribers, blogPosts,
  InsertProduct, InsertReview, InsertCartItem, InsertOrder, InsertOrderItem,
  InsertQuizResult, InsertUserPreference, InsertNewsletterSubscriber,
  dailyCheckins, foodLogs, skinLogs,
  InsertDailyCheckinRow, InsertFoodLogRow, InsertSkinLogRow
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.featured, true)).limit(8);
}

export async function getBestsellerProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.bestseller, true)).limit(8);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] || null;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  const searchPattern = `%${query}%`;
  return await db.select().from(products)
    .where(or(
      like(products.name, searchPattern),
      like(products.brand, searchPattern),
      like(products.description, searchPattern)
    ))
    .limit(20);
}

export async function getProductsBySkinConcern(concernId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const productIds = await db.select({ productId: productSkinConcerns.productId })
    .from(productSkinConcerns)
    .where(eq(productSkinConcerns.skinConcernId, concernId));
  
  if (productIds.length === 0) return [];
  
  return await db.select().from(products)
    .where(inArray(products.id, productIds.map(p => p.productId)));
}

export async function getProductsByIngredient(ingredientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const productIds = await db.select({ productId: productIngredients.productId })
    .from(productIngredients)
    .where(eq(productIngredients.ingredientId, ingredientId));
  
  if (productIds.length === 0) return [];
  
  return await db.select().from(products)
    .where(inArray(products.id, productIds.map(p => p.productId)));
}

// Category queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0] || null;
}

// Skin concern queries
export async function getAllSkinConcerns() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skinConcerns);
}

// Ingredient queries
export async function getAllIngredients() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ingredients);
}

// Review queries
export async function getReviewsByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: reviews.id,
    productId: reviews.productId,
    userId: reviews.userId,
    rating: reviews.rating,
    title: reviews.title,
    comment: reviews.comment,
    verified: reviews.verified,
    helpful: reviews.helpful,
    createdAt: reviews.createdAt,
    userName: users.name,
  })
  .from(reviews)
  .leftJoin(users, eq(reviews.userId, users.id))
  .where(eq(reviews.productId, productId))
  .orderBy(desc(reviews.createdAt));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(review);
}

// Cart queries
export async function getCartByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: cartItems.id,
    userId: cartItems.userId,
    productId: cartItems.productId,
    quantity: cartItems.quantity,
    product: products,
  })
  .from(cartItems)
  .leftJoin(products, eq(cartItems.productId, products.id))
  .where(eq(cartItems.userId, userId));
}

export async function addToCart(item: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db.select().from(cartItems)
    .where(and(
      eq(cartItems.userId, item.userId),
      eq(cartItems.productId, item.productId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + (item.quantity || 1) })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    // Insert new item
    await db.insert(cartItems).values(item);
  }
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// Order queries
export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(order);
  const orderId = Number(result[0].insertId);
  
  const itemsWithOrderId = items.map(item => ({ ...item, orderId }));
  await db.insert(orderItems).values(itemsWithOrderId);
  
  return orderId;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] || null;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// Quiz queries
export async function saveQuizResult(result: InsertQuizResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quizResults).values(result);
}

export async function getQuizResultsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.createdAt))
    .limit(1);
}

// User preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function saveUserPreferences(prefs: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserPreferences(prefs.userId);
  if (existing) {
    await db.update(userPreferences)
      .set(prefs)
      .where(eq(userPreferences.userId, prefs.userId));
  } else {
    await db.insert(userPreferences).values(prefs);
  }
}

// Newsletter
export async function subscribeNewsletter(subscriber: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(newsletterSubscribers).values(subscriber)
    .onDuplicateKeyUpdate({
      set: { subscribed: true, name: subscriber.name }
    });
}

export async function getNewsletterSubscriber(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);
  return result[0] || null;
}

export async function markDiscountClaimed(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(newsletterSubscribers)
    .set({ discountClaimed: true })
    .where(eq(newsletterSubscribers.email, email));
}

// Blog queries
export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);
  return result[0] || null;
}

// Admin queries
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(product);
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function updateProductStock(id: number, stock: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ stock }).where(eq(products.id, id));
}

// Pet logs
export async function createDailyCheckin(row: InsertDailyCheckinRow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyCheckins).values(row);
}

export async function createFoodLog(row: InsertFoodLogRow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(foodLogs).values(row);
}

export async function createSkinLog(row: InsertSkinLogRow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skinLogs).values(row);
}

export async function listRecentCheckins(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dailyCheckins)
    .where(eq(dailyCheckins.userId, userId))
    .orderBy(desc(dailyCheckins.date))
    .limit(limit);
}

export async function listRecentFoodLogs(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(foodLogs)
    .where(eq(foodLogs.userId, userId))
    .orderBy(desc(foodLogs.date))
    .limit(limit);
}

export async function listRecentSkinLogs(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skinLogs)
    .where(eq(skinLogs.userId, userId))
    .orderBy(desc(skinLogs.date))
    .limit(limit);
}
