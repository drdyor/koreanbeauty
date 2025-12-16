import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, User, Menu, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: cart } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartItemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className={`transition-all ${isScrolled ? "text-base" : "text-xl"}`}>
              K-Beauty Glow
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile when scrolled */}
          <form
            onSubmit={handleSearch}
            className={`flex-1 max-w-md transition-all ${
              isScrolled ? "hidden md:block" : "hidden sm:block"
            }`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size={isScrolled ? "sm" : "default"}
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/shop">Shop</Link>
            </Button>
            
            <Button
              variant="ghost"
              size={isScrolled ? "sm" : "default"}
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/quiz">Skin Quiz</Link>
            </Button>

            <Button
              variant="ghost"
              size={isScrolled ? "sm" : "default"}
              asChild
              className="hidden md:inline-flex"
            >
              <Link href="/blog">Blog</Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size={isScrolled ? "sm" : "default"}
              asChild
              className="relative"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Account */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size={isScrolled ? "sm" : "default"}
                asChild
              >
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size={isScrolled ? "sm" : "default"}
                asChild
              >
                <a href={getLoginUrl()}>
                  <User className="h-5 w-5" />
                </a>
              </Button>
            )}

            {/* Admin Link */}
            {user?.role === "admin" && (
              <Button
                variant="outline"
                size={isScrolled ? "sm" : "default"}
                asChild
                className="hidden lg:inline-flex"
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
