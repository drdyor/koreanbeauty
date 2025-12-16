import { Gift, Package, Sticker, Sparkles, ShoppingBag } from "lucide-react";

export function RewardsTierSection() {
  const tiers = [
    {
      amount: "$40",
      icon: Gift,
      title: "Sheet Mask",
      description: "Free sheet mask"
    },
    {
      amount: "$80",
      icon: Package,
      title: "Deluxe Sample",
      description: "Premium sample"
    },
    {
      amount: "$100",
      icon: Sticker,
      title: "KS Stickers",
      description: "Cute sticker set"
    },
    {
      amount: "$140",
      icon: Sparkles,
      title: "Face Towel",
      description: "Soft face towel"
    },
    {
      amount: "$160",
      icon: ShoppingBag,
      title: "Full-Size Product",
      description: "Free full product"
    }
  ];

  return (
    <div className="bg-gradient-pink-magenta py-16 my-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            FREE GIFTS ABOVE
          </h2>
          <p className="text-white/90 text-lg">
            The more you shop, the more you get! 🎁
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {tier.amount}
                </div>
                <div className="text-white font-semibold mb-1">
                  {tier.title}
                </div>
                <div className="text-white/80 text-sm">
                  {tier.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
