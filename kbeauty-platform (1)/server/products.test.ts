import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("products procedures", () => {
  it("should list all products", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("should get featured products", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list({ featured: true });

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    if (products.length > 0) {
      expect(products.every(p => p.featured)).toBe(true);
    }
  });

  it("should search products", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.search({ query: "toner" });

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("cart procedures", () => {
  const testUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  it("should get empty cart for new user", async () => {
    const ctx = createTestContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const cart = await caller.cart.get();

    expect(cart).toBeDefined();
    expect(Array.isArray(cart)).toBe(true);
  });

  it("should require authentication to add to cart", async () => {
    const ctx = createTestContext(); // No user
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.cart.add({ productId: 1, quantity: 1 })
    ).rejects.toThrow();
  });

  it("should add item to cart when authenticated", async () => {
    const ctx = createTestContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.add({ productId: 1, quantity: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("quiz procedures", () => {
  it("should submit quiz and return recommendations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      skinType: "combination",
      primaryConcern: "hydration",
      secondaryConcerns: ["brightening"],
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
