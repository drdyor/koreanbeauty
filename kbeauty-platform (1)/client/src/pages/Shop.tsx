import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { Footer } from "@/components/layout/Footer";
import { ProductCardEnhanced } from "@/components/product/ProductCardEnhanced";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const searchParams = new URLSearchParams(useSearch());
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedConcern, setSelectedConcern] = useState<number | undefined>();
  
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: skinConcerns } = trpc.skinConcerns.list.useQuery();
  
  const { data: products, isLoading } = trpc.products.list.useQuery(
    selectedCategory ? { categoryId: selectedCategory } :
    selectedConcern ? { skinConcernId: selectedConcern } :
    {}
  );
  
  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: !!searchQuery }
  );
  
  const displayProducts = searchQuery ? searchResults : products;
  
  // Set category from URL param
  useEffect(() => {
    if (categoryParam && categories) {
      const category = categories.find(c => c.slug === categoryParam);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [categoryParam, categories]);
  
  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setSelectedCategory(undefined);
      setSelectedConcern(undefined);
    } else {
      setSelectedCategory(Number(value));
      setSelectedConcern(undefined);
    }
  };
  
  const handleConcernChange = (value: string) => {
    if (value === "all") {
      setSelectedConcern(undefined);
      setSelectedCategory(undefined);
    } else {
      setSelectedConcern(Number(value));
      setSelectedCategory(undefined);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StickyHeader />
      <ProductQuickView
        productId={quickViewProductId}
        open={!!quickViewProductId}
        onOpenChange={(open) => !open && setQuickViewProductId(null)}
      />
      
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-12">
          <div className="container">
            <h1 className="text-4xl font-bold mb-4">Shop All Products</h1>
            <p className="text-muted-foreground">
              {searchQuery ? `Search results for "${searchQuery}"` : "Discover your perfect K-beauty routine"}
            </p>
          </div>
        </div>

        <div className="container py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Select value={selectedCategory?.toString() || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedConcern?.toString() || "all"} onValueChange={handleConcernChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Skin Concern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Concerns</SelectItem>
                {skinConcerns?.map((concern) => (
                  <SelectItem key={concern.id} value={concern.id.toString()}>
                    {concern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedCategory || selectedConcern || searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory(undefined);
                  setSelectedConcern(undefined);
                  window.history.pushState({}, "", "/shop");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : displayProducts && displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCardEnhanced
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProductId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
