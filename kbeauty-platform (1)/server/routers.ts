import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Products
  products: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        skinConcernId: z.number().optional(),
        ingredientId: z.number().optional(),
        featured: z.boolean().optional(),
        bestseller: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (!input) return await db.getAllProducts();
        if (input.featured) return await db.getFeaturedProducts();
        if (input.bestseller) return await db.getBestsellerProducts();
        if (input.categoryId) return await db.getProductsByCategory(input.categoryId);
        if (input.skinConcernId) return await db.getProductsBySkinConcern(input.skinConcernId);
        if (input.ingredientId) return await db.getProductsByIngredient(input.ingredientId);
        return await db.getAllProducts();
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.query);
      }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
  }),

  // Skin concerns
  skinConcerns: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSkinConcerns();
    }),
  }),

  // Ingredients
  ingredients: router({
    list: publicProcedure.query(async () => {
      return await db.getAllIngredients();
    }),
  }),

  // Reviews
  reviews: router({
    getByProductId: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByProductId(input.productId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Shopping cart
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCartByUserId(ctx.user.id);
    }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addToCart({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItem(input.id, input.quantity);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.id);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Orders
  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          productImage: z.string(),
          price: z.number(),
          quantity: z.number(),
          subtotal: z.number(),
        })),
        subtotal: z.number(),
        shipping: z.number(),
        tax: z.number(),
        total: z.number(),
        shippingName: z.string(),
        shippingEmail: z.string(),
        shippingAddress: z.string(),
        shippingCity: z.string(),
        shippingPostalCode: z.string(),
        shippingCountry: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          subtotal: input.subtotal,
          shipping: input.shipping,
          tax: input.tax,
          total: input.total,
          shippingName: input.shippingName,
          shippingEmail: input.shippingEmail,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingPostalCode: input.shippingPostalCode,
          shippingCountry: input.shippingCountry,
          notes: input.notes,
        }, input.items.map(item => ({
          ...item,
          orderId: 0, // Will be set by createOrder
        })));
        
        // Clear cart after successful order
        await db.clearCart(ctx.user.id);
        
        return { success: true, orderId, orderNumber };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByUserId(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order || (order.userId !== ctx.user.id && ctx.user.role !== 'admin')) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
  }),

  // Skin quiz
  quiz: router({
    submit: publicProcedure
      .input(z.object({
        skinType: z.string(),
        primaryConcern: z.string(),
        secondaryConcerns: z.array(z.string()),
        age: z.string().optional(),
        currentRoutine: z.string().optional(),
        preferences: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate product recommendations based on quiz answers
        const concernMap: Record<string, number> = {
          'hydration': 1,
          'brightening': 2,
          'anti-aging': 3,
          'acne': 4,
          'sensitive': 5,
          'pore-care': 6,
          'oil-control': 7,
          'barrier-repair': 8,
        };
        
        const concernId = concernMap[input.primaryConcern.toLowerCase().replace(/\s+/g, '-')];
        let recommendedProducts = [];
        
        if (concernId) {
          recommendedProducts = await db.getProductsBySkinConcern(concernId);
        } else {
          recommendedProducts = await db.getFeaturedProducts();
        }
        
        const productIds = recommendedProducts.slice(0, 6).map(p => p.id);
        
        const quizResult: any = {
          userId: ctx.user?.id || undefined,
          sessionId: ctx.user ? undefined : `session-${Date.now()}`,
          skinType: input.skinType,
          primaryConcern: input.primaryConcern,
          secondaryConcerns: JSON.stringify(input.secondaryConcerns),
          age: input.age || undefined,
          currentRoutine: input.currentRoutine || undefined,
          preferences: JSON.stringify(input.preferences || {}),
          recommendedProducts: JSON.stringify(productIds),
        };
        
        await db.saveQuizResult(quizResult);
        
        return {
          success: true,
          recommendations: recommendedProducts.slice(0, 6),
        };
      }),
    
    getResults: protectedProcedure.query(async ({ ctx }) => {
      const results = await db.getQuizResultsByUserId(ctx.user.id);
      if (results.length === 0) return null;
      
      const result = results[0];
      const productIds = JSON.parse(result.recommendedProducts || '[]');
      const products = await Promise.all(
        productIds.map((id: number) => db.getProductById(id))
      );
      
      return {
        ...result,
        secondaryConcerns: JSON.parse(result.secondaryConcerns || '[]'),
        preferences: JSON.parse(result.preferences || '{}'),
        recommendations: products.filter(p => p !== null),
      };
    }),
  }),

  // User preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getUserPreferences(ctx.user.id);
      if (!prefs) return null;
      return {
        ...prefs,
        skinConcerns: JSON.parse(prefs.skinConcerns || '[]'),
        favoriteIngredients: JSON.parse(prefs.favoriteIngredients || '[]'),
        avoidIngredients: JSON.parse(prefs.avoidIngredients || '[]'),
      };
    }),
    
    save: protectedProcedure
      .input(z.object({
        skinType: z.string().optional(),
        skinConcerns: z.array(z.string()).optional(),
        favoriteIngredients: z.array(z.string()).optional(),
        avoidIngredients: z.array(z.string()).optional(),
        newsletterSubscribed: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.saveUserPreferences({
          userId: ctx.user.id,
          skinType: input.skinType,
          skinConcerns: JSON.stringify(input.skinConcerns || []),
          favoriteIngredients: JSON.stringify(input.favoriteIngredients || []),
          avoidIngredients: JSON.stringify(input.avoidIngredients || []),
          newsletterSubscribed: input.newsletterSubscribed,
        });
        return { success: true };
      }),
  }),

  // Newsletter
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.subscribeNewsletter({
          email: input.email,
          name: input.name,
        });
        return { success: true, discountCode: 'WELCOME10' };
      }),
    
    checkSubscription: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const subscriber = await db.getNewsletterSubscriber(input.email);
        return subscriber;
      }),
  }),

  // Blog
  blog: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBlogPosts();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getBlogPostBySlug(input.slug);
      }),
  }),

  // Pet logs
  logs: router({
    createCheckin: protectedProcedure
      .input(z.object({
        date: z.string().optional(),
        cycleDay: z.number().optional(),
        mood: z.string().optional(),
        energy: z.number().optional(),
        skinCondition: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createDailyCheckin({
          userId: ctx.user.id,
          date: input.date ? new Date(input.date) : new Date(),
          cycleDay: input.cycleDay,
          mood: input.mood,
          energy: input.energy,
          skinCondition: input.skinCondition,
        } as any);
        return { success: true };
      }),

    createFood: protectedProcedure
      .input(z.object({
        date: z.string().optional(),
        foodItem: z.string(),
        triggerLevel: z.number().min(1).max(3).default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createFoodLog({
          userId: ctx.user.id,
          date: input.date ? new Date(input.date) : new Date(),
          foodItem: input.foodItem,
          triggerLevel: input.triggerLevel,
        } as any);
        return { success: true };
      }),

    summary: protectedProcedure
      .query(async ({ ctx }) => {
        const [checkins, foods, skins] = await Promise.all([
          db.listRecentCheckins(ctx.user.id),
          db.listRecentFoodLogs(ctx.user.id),
          db.listRecentSkinLogs(ctx.user.id),
        ]);

        const moodCounts: Record<string, number> = {};
        for (const c of checkins) {
          if (!c.mood) continue;
          moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
        }

        const foodCounts: Record<string, number> = {};
        for (const f of foods) {
          foodCounts[f.foodItem] = (foodCounts[f.foodItem] || 0) + 1;
        }

        return {
          moodCounts,
          foodCounts,
          lastCheckin: checkins[0]?.date ?? null,
        } as const;
      }),
  }),

  // Chatbot
  chatbot: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string(),
        history: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are a friendly K-beauty skincare expert assistant for K-Beauty Glow, an online store specializing in authentic Korean skincare products. Your role is to:

1. Provide personalized skincare advice based on user's skin type and concerns
2. Recommend products from our catalog (toners, serums, masks, sunscreens, cleansers)
3. Explain ingredients and their benefits (hyaluronic acid, niacinamide, vitamin C, centella, snail mucin, etc.)
4. Guide users through Korean skincare routines
5. Answer questions about product usage and compatibility

Be warm, enthusiastic, and use cute emojis occasionally to match our playful K-beauty aesthetic. Keep responses concise and helpful. When recommending products, mention specific brands we carry like Round Lab, Anua, Torriden, Goodal, COSRX, Beauty of Joseon, Manyo Factory, Beplain, Biodance, and Mediheal.

Always prioritize user safety - if someone has serious skin conditions, advise them to consult a dermatologist.`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...(input.history || []),
          { role: 'user' as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I could not process your request.';

        return {
          message: assistantMessage,
        };
      }),
  }),

  // Admin routes
  admin: router({
    // Products management
    products: router({
      list: adminProcedure.query(async () => {
        return await db.getAllProducts();
      }),
      
      create: adminProcedure
        .input(z.object({
          name: z.string(),
          slug: z.string(),
          brand: z.string(),
          categoryId: z.number(),
          description: z.string(),
          price: z.number(),
          originalPrice: z.number().optional(),
          imageUrl: z.string(),
          stock: z.number(),
          featured: z.boolean().optional(),
          bestseller: z.boolean().optional(),
          size: z.string().optional(),
          usageInstructions: z.string().optional(),
          ingredientsList: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await db.createProduct(input);
          return { success: true };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            price: z.number().optional(),
            stock: z.number().optional(),
            featured: z.boolean().optional(),
            bestseller: z.boolean().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          await db.updateProduct(input.id, input.data);
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteProduct(input.id);
          return { success: true };
        }),
      
      updateStock: adminProcedure
        .input(z.object({
          id: z.number(),
          stock: z.number(),
        }))
        .mutation(async ({ input }) => {
          await db.updateProductStock(input.id, input.stock);
          return { success: true };
        }),
    }),
    
    // Orders management
    orders: router({
      list: adminProcedure.query(async () => {
        return await db.getAllOrders();
      }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        }))
        .mutation(async ({ input }) => {
          await db.updateOrderStatus(input.id, input.status);
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
