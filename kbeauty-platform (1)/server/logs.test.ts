import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("logs procedures", () => {
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

  it("should create checkin and food logs and summarize", async () => {
    const ctx = createTestContext(testUser);
    const caller = appRouter.createCaller(ctx);

    const c = await caller.logs.createCheckin({ mood: "irritable", energy: 3 });
    expect(c).toEqual({ success: true });

    const f = await caller.logs.createFood({ foodItem: "Spicy", triggerLevel: 2 });
    expect(f).toEqual({ success: true });

    const s = await caller.logs.summary();
    expect(s).toBeDefined();
    expect(typeof s.moodCounts).toBe("object");
  });
});

