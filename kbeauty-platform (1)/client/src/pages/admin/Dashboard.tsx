import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { formatPrice } from "@/const";

export default function AdminDashboard() {
  const { data: products } = trpc.admin.products.list.useQuery();
  const { data: orders } = trpc.admin.orders.list.useQuery();

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const lowStockProducts = products?.filter(p => p.stock < 10).length || 0;

  const stats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-secondary",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Users,
      color: "text-orange-500",
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your K-Beauty store</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {lowStockProducts > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-800">
                {lowStockProducts} product{lowStockProducts > 1 ? 's' : ''} running low on stock (less than 10 units)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.shippingName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
