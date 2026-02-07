import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/const";
import { Package, User, LogOut, Cat } from "lucide-react";
import { getLoginUrl } from "@/const";
import { SkincarePet } from "@/components/Pet/SkincarePet";
import { PetSettings } from "@/components/Pet/PetSettings";
import { useState } from "react";

export default function Account() {
  const { user, isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const [activeTab, setActiveTab] = useState<"orders" | "pet">("orders");
  const [lastCheckIn, setLastCheckIn] = useState<Date | undefined>(() => {
    try {
      const saved = localStorage.getItem("pet:lastCheckIn");
      return saved ? new Date(JSON.parse(saved)) : undefined;
    } catch {
      return undefined;
    }
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleCheckIn = () => {
    const now = new Date();
    setLastCheckIn(now);
    try {
      localStorage.setItem("pet:lastCheckIn", JSON.stringify(now.toISOString()));
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <User className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Sign in to view your account</h2>
            <p className="text-muted-foreground">
              Access your orders, skincare pet, and personalized recommendations
            </p>
            <div className="space-y-3">
              <Button
                className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.location.href = "/api/auth/demo-login"}
              >
                🧪 Demo Login (Testing)
              </Button>
              <Button
                className="w-full rounded-full"
                variant="outline"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign In with OAuth
              </Button>
            </div>
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
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-12">
          <div className="container">
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-2">
              <Button
                variant={activeTab === "orders" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button
                variant={activeTab === "pet" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("pet")}
              >
                <Cat className="mr-2 h-4 w-4" />
                My Skincare Pet 💖
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/quiz/results'}>
                Skin Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => logout.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "orders" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link key={order.id} href={`/account/orders/${order.id}`}>
                          <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">{order.orderNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">
                                Total: <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                              </p>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button className="rounded-full" onClick={() => window.location.href = '/shop'}>
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              ) : (
                <Card className="overflow-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cat className="h-6 w-6 text-pink-600" />
                      My Skincare Pet
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Your cute companion to track your skincare routine! Check in daily to keep your pet happy. 💖
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[500px] flex items-center justify-center relative">
                      <SkincarePet onCheckIn={handleCheckIn} lastCheckIn={lastCheckIn} />
                    </div>
                    <div className="mt-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        ✨ How It Works
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">•</span>
                          <span><strong>Check in daily</strong> by petting your cat to track your skincare routine</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">•</span>
                          <span><strong>Keep your pet happy</strong> - it gets sad if you skip too many days!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">•</span>
                          <span><strong>Track your cycle</strong> (optional) - the pet shows period reminders & fertile windows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">•</span>
                          <span><strong>Privacy-first</strong> - All data is stored locally on your device only</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <PetSettings />
      <Footer />
    </div>
  );
}
