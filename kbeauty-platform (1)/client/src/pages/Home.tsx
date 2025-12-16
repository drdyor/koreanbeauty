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

      {/* Hero Section - Soft & Clean */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-50/30 to-white py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-block rounded-full bg-pink-100/50 px-4 py-2 text-sm font-medium text-pink-700">
              ✨ Discover Your Glow
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Korean Beauty,{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Curated K-beauty products for radiant, healthy skin. Start your journey to glass skin with our expertly selected collection.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600"
                onClick={() => setLocation("/quiz")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Take Skin Quiz
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/shop")}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop All Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Routine Section - Inspired by MiiN */}
      <section className="border-y bg-white py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Your K-Beauty Routine in 3 Simple Steps
            </h2>
            <p className="text-gray-600">
              Korean skincare doesn't have to be complicated. Start with these essentials.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-pink-100 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-600">
                  1
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Double Cleanse
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

            <Card className="border-pink-100 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-600">
                  2
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Treat & Hydrate
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

            <Card className="border-pink-100 transition-shadow hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-600">
                  3
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Protect
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
        <section className="bg-gray-50 py-16">
          <div className="container">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  New Arrivals
                </h2>
                <p className="text-gray-600">
                  Fresh from Korea, just for you
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation("/shop?filter=new")}
              >
                View All
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-white py-16">
          <div className="container">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Customer Favorites
                </h2>
                <p className="text-gray-600">
                  Our most-loved products
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation("/shop?filter=bestsellers")}
              >
                View All
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why K-Beauty Glow Section */}
      <section className="border-t bg-gradient-to-b from-white to-pink-50/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              Why K-Beauty Glow?
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              We're not just another K-beauty shop. We're your trusted guide to achieving healthy, radiant skin through carefully curated Korean skincare.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                  <Sparkles className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Expertly Curated
                </h3>
                <p className="text-sm text-gray-600">
                  Every product is hand-selected for quality and effectiveness
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Skin-First Philosophy
                </h3>
                <p className="text-sm text-gray-600">
                  Gentle, effective ingredients that respect your skin barrier
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                  <Star className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Real Results
                </h3>
                <p className="text-sm text-gray-600">
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
