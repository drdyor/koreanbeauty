import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Demo login for local testing (bypasses OAuth and database)
  app.get("/api/auth/demo-login", async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== "development") {
      res.status(403).json({ error: "Demo login only available in development" });
      return;
    }

    try {
      const demoOpenId = "demo-user-local-test";
      const demoName = "Demo User";
      const demoEmail = "demo@kbeauty.local";

      // Try to create user in database if available, but don't fail if database is down
      try {
        await db.upsertUser({
          openId: demoOpenId,
          name: demoName,
          email: demoEmail,
          loginMethod: "demo",
          lastSignedIn: new Date(),
        });
      } catch (dbError) {
        console.warn("[Demo Login] Database unavailable, continuing without persistence");
      }

      // Create session token (works without database)
      const sessionToken = await sdk.createSessionToken(demoOpenId, {
        name: demoName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/account");
    } catch (error) {
      console.error("[Demo Login] Failed", error);
      res.status(500).json({ error: "Demo login failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
