import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/const";
type Product = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  categoryId: number;
  description: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  images: string | null;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  rating: number | null;
  reviewCount: number;
  usageInstructions: string | null;
  ingredientsList: string | null;
  size: string | null;
  createdAt: Date;
  updatedAt: Date;
};
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      utils.cart.get.invalidate();
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const rating = product.rating ? product.rating / 10 : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group hover-lift overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-accent/20">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-4xl">🧴</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.bestseller && (
              <Badge variant="default" className="bg-primary">
                Bestseller
              </Badge>
            )}
            {product.featured && (
              <Badge variant="secondary">
                Featured
              </Badge>
            )}
            {product.newArrival && (
              <Badge variant="outline" className="bg-white">
                New
              </Badge>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge variant="destructive">
                Sale
              </Badge>
            )}
          </div>
          
          {/* Stock indicator */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground font-medium mb-1">{product.brand}</p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold text-lg text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full rounded-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCart.isPending}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
