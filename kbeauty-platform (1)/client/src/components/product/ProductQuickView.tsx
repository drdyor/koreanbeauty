import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/const";
import { ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface ProductQuickViewProps {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ productId, open, onOpenChange }: ProductQuickViewProps) {
  const { isAuthenticated } = useAuth();
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId && open }
  );

  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      utils.cart.get.invalidate();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (product) {
      addToCart.mutate({ productId: product.id, quantity: 1 });
    }
  };

  if (!productId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge className="absolute top-4 left-4 z-10 bg-red-500">
                  Sale
                </Badge>
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>

              <div className="flex items-center gap-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                )}
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 rounded-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  asChild
                >
                  <a href={`/product/${product.slug}`}>View Full Details</a>
                </Button>
              </div>

              {product.stock > 0 && product.stock < 10 && (
                <p className="text-sm text-orange-600">
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
