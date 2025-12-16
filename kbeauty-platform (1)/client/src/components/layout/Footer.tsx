import { Link } from "wouter";
import { Heart, Sparkles } from "lucide-react";
import { APP_NAME } from "@/const";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-white to-accent/20 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your destination for authentic Korean beauty products. Discover the secret to glowing skin! ✨
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop?category=toners">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Toners</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=serums">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Serums</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=masks">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Masks</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sunscreens">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Sunscreens</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cleansers">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Cleansers</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-semibold mb-4">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quiz">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Skin Quiz</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors">About Us</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account">
                  <a className="text-muted-foreground hover:text-primary transition-colors">My Account</a>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Shopping Cart</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for K-beauty lovers
          </p>
          <p className="mt-2">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
