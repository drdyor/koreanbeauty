import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/const";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  featured: boolean;
  bestseller: boolean;
}

interface ProductCardEnhancedProps {
  product: Product;
  onQuickView?: (productId: number) => void;
}

export function ProductCardEnhanced({ product, onQuickView }: ProductCardEnhancedProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView?.(product.id);
  };

  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  const handleCardClick = () => {
    setLocation(`/product/${product.slug}`);
  };

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden hover-lift transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-accent/20">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <Badge className="bg-red-500 hover:bg-red-600">
                Sale
              </Badge>
            )}
            {product.bestseller && (
              <Badge className="bg-amber-500 hover:bg-amber-600">
                Bestseller
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-primary">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Wishlist feature coming soon!");
            }}
          >
            <Heart className="h-5 w-5 text-gray-700" />
          </button>

          {/* Quick Actions - Visible on Hover */}
          {isHovered && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 animate-in slide-in-from-bottom-4 duration-300">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 rounded-full backdrop-blur-sm bg-white/95 hover:bg-white"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-full"
                onClick={handleQuickAdd}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {isOnSale ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
  );
}
