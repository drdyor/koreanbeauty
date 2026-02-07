import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, ShoppingBag, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch products
  const { data: products, isLoading } = trpc.products.list.useQuery({});

  const newArrivals = products?.filter((p) => p.newArrival).slice(0, 5) || [];
  const bestsellers = products?.filter((p) => p.bestseller).slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <NewsletterPopup />

      {/* Hero Section - Cute & Engaging with Floating Elements */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50/30 to-white py-24 md:py-32">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float-soft">✨</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float-soft" style={{animationDelay: '1s'}}>💖</div>
        <div className="absolute bottom-20 left-1/4 text-4xl opacity-20 animate-float-soft" style={{animationDelay: '2s'}}>🌸</div>
        <div className="absolute bottom-40 right-1/3 text-5xl opacity-20 animate-float-soft" style={{animationDelay: '1.5s'}}>✨</div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-2.5 text-sm font-semibold text-pink-700 shadow-md animate-bounce-cute">
              ✨ Discover Your Glow ✨
            </div>
            <h1 className="mb-8 text-6xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl animate-fade-in-up">
              Korean Beauty,{" "}
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent animate-sparkle inline-block">
                Simplified
              </span>
              <span className="inline-block ml-2 text-5xl md:text-6xl animate-bounce-cute" style={{animationDelay: '0.5s'}}>💕</span>
            </h1>
            <p className="mb-10 text-xl text-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Curated K-beauty products for radiant, healthy skin. Start your journey to glass skin with our expertly selected collection. 🌟
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                onClick={() => setLocation("/quiz")}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Take Skin Quiz ✨
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400 transition-all duration-300 hover:-translate-y-1 group"
                onClick={() => setLocation("/shop")}
              >
                <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Shop All Products 🛍️
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                <span className="font-medium">Free Shipping $50+</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <span className="font-medium">Free Samples</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-medium">1000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Routine Section - Cute & Interactive */}
      <section className="border-y bg-white py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-block">
              <span className="text-4xl animate-bounce-cute">🌸</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Your K-Beauty Routine in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              Korean skincare doesn't have to be complicated. Start with these essentials! 💖
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-[0_8px_30px_rgba(255,111,174,0.15)] hover:-translate-y-2 group">
              <CardContent className="p-8 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-3xl font-bold text-pink-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  🧼 Double Cleanse
                </h3>
                <p className="mb-4 text-gray-600">
                  Start with an oil cleanser, follow with a water-based cleanser. This removes makeup, sunscreen, and impurities without stripping your skin.
                </p>
                <Button
                  variant="link"
                  className="text-pink-600"
                  onClick={() => setLocation("/shop?category=cleansers")}
                >
                  Shop Cleansers →
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-[0_8px_30px_rgba(255,111,174,0.15)] hover:-translate-y-2 group">
              <CardContent className="p-8 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-3xl font-bold text-purple-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  💧 Treat & Hydrate
                </h3>
                <p className="mb-4 text-gray-600">
                  Apply toner, essence, or serum to address your specific skin concerns. Layer lightweight hydration for that dewy glow.
                </p>
                <Button
                  variant="link"
                  className="text-pink-600"
                  onClick={() => setLocation("/shop?category=serums")}
                >
                  Shop Serums →
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-100 transition-all duration-300 hover:border-pink-300 hover:shadow-[0_8px_30px_rgba(255,111,174,0.15)] hover:-translate-y-2 group">
              <CardContent className="p-8 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-3xl font-bold text-rose-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  ☀️ Protect
                </h3>
                <p className="mb-4 text-gray-600">
                  Seal in moisture with cream and always apply SPF in the morning. Sun protection is the #1 anti-aging secret.
                </p>
                <Button
                  variant="link"
                  className="text-pink-600"
                  onClick={() => setLocation("/shop?category=sunscreen")}
                >
                  Shop Sunscreen →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-gradient-to-b from-pink-50/30 to-purple-50/20 py-20">
          <div className="container">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-3xl animate-sparkle">✨</span>
                  <h2 className="text-4xl font-bold text-gray-900">
                    New Arrivals
                  </h2>
                </div>
                <p className="text-lg text-gray-600">
                  Fresh from Korea, just for you 🇰🇷
                </p>
              </div>
              <Button
                variant="outline"
                className="border-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400 transition-all group"
                onClick={() => setLocation("/shop?filter=new")}
              >
                View All
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {newArrivals.map((product, idx) => (
                <div key={product.id} className="animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-white py-20">
          <div className="container">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-3xl animate-sparkle" style={{animationDelay: '0.5s'}}>⭐</span>
                  <h2 className="text-4xl font-bold text-gray-900">
                    Customer Favorites
                  </h2>
                </div>
                <p className="text-lg text-gray-600">
                  Our most-loved products 💖
                </p>
              </div>
              <Button
                variant="outline"
                className="border-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400 transition-all group"
                onClick={() => setLocation("/shop?filter=bestsellers")}
              >
                View All
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.map((product, idx) => (
                <div key={product.id} className="animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why K-Beauty Glow Section */}
      <section className="border-t bg-gradient-to-b from-white via-pink-50/20 to-purple-50/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-block">
              <span className="text-5xl animate-bounce-cute">💖</span>
            </div>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Why K-Beauty Glow?
            </h2>
            <p className="mb-16 text-xl text-gray-600">
              We're not just another K-beauty shop. We're your trusted guide to achieving healthy, radiant skin through carefully curated Korean skincare. ✨
            </p>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center group">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="h-10 w-10 text-pink-600 group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  ✨ Expertly Curated
                </h3>
                <p className="text-gray-600">
                  Every product is hand-selected for quality and effectiveness
                </p>
              </div>
              <div className="text-center group">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Heart className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  💕 Skin-First Philosophy
                </h3>
                <p className="text-gray-600">
                  Gentle, effective ingredients that respect your skin barrier
                </p>
              </div>
              <div className="text-center group">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Star className="h-10 w-10 text-rose-600 group-hover:rotate-12 transition-transform" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                  ⭐ Real Results
                </h3>
                <p className="text-gray-600">
                  Thousands of happy customers achieving their skin goals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Clean, minimal product card component
function ProductCard({ product }: { product: any }) {
  const [, setLocation] = useLocation();
  const addToCart = trpc.cart.add.useMutation();

  const displayPrice = product.price / 100;
  const displayOriginalPrice = product.originalPrice
    ? product.originalPrice / 100
    : null;
  const discount = displayOriginalPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : null;

  return (
    <Card className="group overflow-hidden border-gray-200 transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.newArrival && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white">
            New
          </div>
        )}
        {discount && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white">
            -{discount}%
          </div>
        )}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={() => setLocation(`/product/${product.slug}`)}
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-pink-600">
          {product.brand}
        </div>
        <h3
          className="mb-2 line-clamp-2 font-medium text-gray-900 cursor-pointer hover:text-pink-600"
          onClick={() => setLocation(`/product/${product.slug}`)}
        >
          {product.name}
        </h3>
        {product.rating > 0 && (
          <div className="mb-2 flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{(product.rating / 10).toFixed(1)}</span>
            <span className="text-gray-500">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${displayPrice.toFixed(2)}
          </span>
          {displayOriginalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${displayOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
