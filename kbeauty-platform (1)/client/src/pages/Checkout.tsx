import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/const";
import { toast } from "sonner";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart } = trpc.cart.get.useQuery();
  
  const [formData, setFormData] = useState({
    shippingName: "",
    shippingEmail: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "Malta",
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      setLocation(`/account/orders/${data.orderId}`);
    },
    onError: () => {
      toast.error("Failed to place order");
    },
  });

  const subtotal = cart?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;
  
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderItems = cart.map(item => ({
      productId: item.product!.id,
      productName: item.product!.name,
      productImage: item.product!.imageUrl,
      price: item.product!.price,
      quantity: item.quantity,
      subtotal: item.product!.price * item.quantity,
    }));

    createOrder.mutate({
      ...formData,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
    });
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
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
        <div className="container py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.shippingName}
                          onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.shippingEmail}
                          onChange={(e) => setFormData({ ...formData, shippingEmail: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        required
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          value={formData.shippingCity}
                          onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="postal">Postal Code *</Label>
                        <Input
                          id="postal"
                          required
                          value={formData.shippingPostalCode}
                          onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          required
                          value={formData.shippingCountry}
                          onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product?.name} × {item.quantity}
                          </span>
                          <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      size="lg"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
