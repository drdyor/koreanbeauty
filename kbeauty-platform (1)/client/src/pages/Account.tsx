import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/const";
import { Package, User, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Account() {
  const { user, isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Sign in to view your account</h2>
            <Button className="rounded-full" onClick={() => window.location.href = getLoginUrl()}>
              Sign In
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
              <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = '/account'}>
                <Package className="mr-2 h-4 w-4" />
                Orders
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
