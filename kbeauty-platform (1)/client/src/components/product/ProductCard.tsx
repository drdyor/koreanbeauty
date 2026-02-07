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
      <Card className="group overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(255,111,174,0.15)] border-gray-100">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100/50 to-purple-100/50">
              <span className="text-4xl">🧴</span>
            </div>
          )}
          
          {/* Badges - Modern with backdrop blur */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.bestseller && (
              <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 backdrop-blur-sm">
                ⭐ Bestseller
              </Badge>
            )}
            {product.featured && (
              <Badge variant="secondary" className="bg-purple-100/90 text-purple-700 backdrop-blur-sm shadow-md">
                ✨ Featured
              </Badge>
            )}
            {product.newArrival && (
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-md border-pink-200">
                🆕 New
              </Badge>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge variant="destructive" className="bg-rose-500 shadow-lg shadow-rose-500/30 backdrop-blur-sm">
                🔥 Sale
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

        <CardContent className="p-5 flex-1 flex flex-col">
          <p className="text-xs text-pink-600 font-semibold uppercase tracking-wider mb-2">{product.brand}</p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-3 group-hover:text-pink-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating - More prominent */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold text-xl text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-300 group/button"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCart.isPending}
          >
            <ShoppingCart className="h-4 w-4 mr-2 group-hover/button:scale-110 transition-transform" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
