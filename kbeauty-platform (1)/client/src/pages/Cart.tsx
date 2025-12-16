import { Link, useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/const";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: cart, isLoading } = trpc.cart.get.useQuery();
  
  const updateCart = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });
  
  const removeFromCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("Item removed from cart");
      utils.cart.get.invalidate();
    },
  });

  const subtotal = cart?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground">Start shopping to add items to your cart</p>
            <Button className="rounded-full" onClick={() => window.location.href = '/shop'}>
              Shop Now
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">🧴</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${product.slug}`}>
                            <a className="font-semibold hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </a>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                          <p className="font-semibold text-primary mt-2">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart.mutate({ id: item.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateCart.mutate({ id: item.id, quantity: item.quantity - 1 });
                                }
                              }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                updateCart.mutate({ id: item.id, quantity: item.quantity + 1 });
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Order Summary</h2>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    {subtotal < FREE_SHIPPING_THRESHOLD && (
                      <p className="text-xs text-muted-foreground">
                        Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  
                  <Button
                    className="w-full rounded-full"
                    size="lg"
                    onClick={() => setLocation("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    asChild
                  >
                    <Link href="/shop">
                      <a>Continue Shopping</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
