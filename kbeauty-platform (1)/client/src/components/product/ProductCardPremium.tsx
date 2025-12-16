import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/const";
import { Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string;
  category: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
}

interface ProductCardPremiumProps {
  product: Product;
}

export function ProductCardPremium({ product }: ProductCardPremiumProps) {
  const [, setLocation] = useLocation();
  
  const handleCardClick = () => {
    setLocation(`/product/${product.slug}`);
  };

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Mock rating data - in real app, this would come from reviews
  const rating = 4.5 + Math.random() * 0.5; // Random rating between 4.5-5.0
  const reviewCount = Math.floor(Math.random() * 500) + 50; // Random review count 50-550

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden hover-lift transition-all duration-300 cursor-pointer border border-border"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.newArrival && (
            <Badge className="bg-black text-white hover:bg-black font-semibold">
              New
            </Badge>
          )}
          {isOnSale && (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary font-bold">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
          {product.brand}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : i < rating
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {reviewCount} reviews
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
