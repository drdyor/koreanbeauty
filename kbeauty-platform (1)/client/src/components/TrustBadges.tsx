import { Package, Shield, Star, Truck } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Same-day dispatch on orders before 2PM",
    },
    {
      icon: Shield,
      title: "100% Authentic",
      description: "All products sourced directly from Korea",
    },
    {
      icon: Star,
      title: "30+ Brands",
      description: "Curated selection of top K-beauty brands",
    },
    {
      icon: Package,
      title: "Secure Packaging",
      description: "Every order carefully packed with love",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-y border-primary/10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-2">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
