import { useRoute } from "wouter";
import { StickyHeader } from "@/components/layout/StickyHeader";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/const";
import { ShoppingCart, Star, Package, Leaf } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: product, isLoading } = trpc.products.getBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );
  const { data: summary } = trpc.logs.summary.useQuery(undefined, { enabled: isAuthenticated });
  
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      utils.cart.get.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = product.rating ? product.rating / 10 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <StickyHeader />
      
      <main className="flex-1 pt-20">
        <div className="container py-8">
          <Breadcrumb
            items={[
              { label: "Shop", href: "/shop" },
              { label: product.name },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-accent/20">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <span className="text-8xl">🧴</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {product.bestseller && <Badge>Bestseller</Badge>}
                    {product.featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.size && (
                    <span className="text-sm text-muted-foreground">• {product.size}</span>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full rounded-full"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error("Please sign in to add items to cart");
                      return;
                    }
                    addToCart.mutate({ productId: product.id, quantity: 1 });
                  }}
                  disabled={product.stock === 0 || addToCart.isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                </div>
              </div>

              {isAuthenticated && summary && (
                <>
                  <Separator />
                  <Card className="bg-accent/20">
                    <CardContent className="py-4">
                      <div className="text-sm text-muted-foreground mb-2">Based on your recent logs</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(summary.foodCounts).length === 0 && Object.keys(summary.moodCounts).length === 0 ? (
                          <span className="text-muted-foreground">Log mood or foods to personalize tips</span>
                        ) : (
                          <>
                            {summary.foodCounts["Spicy"] && (
                              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs">Try tea tree tonight</span>
                            )}
                            {summary.foodCounts["Milk"] && (
                              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs">Add barrier-repair</span>
                            )}
                            {summary.moodCounts["irritable"] && (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs">Centella calming recommended</span>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {product.usageInstructions && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-secondary" />
                      How to Use
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.usageInstructions}
                    </p>
                  </div>
                </>
              )}

              {product.ingredientsList && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.ingredientsList}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
