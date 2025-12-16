import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Droplets, Leaf, Shield, Zap, Heart } from "lucide-react";

// Trending K-beauty ingredients with SEO-optimized content
const INGREDIENTS = [
  {
    id: 1,
    name: "Snail Mucin",
    slug: "snail-mucin",
    icon: Droplets,
    tagline: "The Miracle in a Bottle",
    description: "Snail secretion filtrate is K-beauty's most viral ingredient, beloved for its ability to repair, hydrate, and transform skin. This powerhouse ingredient contains proteins, glycolic acid, and elastin that work together to heal damaged skin and boost radiance.",
    benefits: [
      "Repairs and strengthens skin barrier",
      "Deeply hydrates and plumps skin",
      "Fades acne scars and hyperpigmentation",
      "Soothes irritation and redness",
      "Promotes skin regeneration"
    ],
    bestFor: ["All skin types", "Acne scars", "Dehydrated skin", "Dull complexion"],
    concentration: "Look for 92-96% snail mucin",
    trending: true,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    id: 2,
    name: "Centella Asiatica (Cica)",
    slug: "centella-asiatica",
    icon: Leaf,
    tagline: "The Soothing Superstar",
    description: "Also known as Cica or Tiger Grass, Centella Asiatica is a legendary healing herb in Korean skincare. This gentle yet powerful ingredient calms inflammation, accelerates wound healing, and strengthens your skin's natural defenses.",
    benefits: [
      "Calms irritation and sensitivity instantly",
      "Heals acne and reduces inflammation",
      "Strengthens compromised skin barrier",
      "Reduces redness and promotes even tone",
      "Boosts collagen production"
    ],
    bestFor: ["Sensitive skin", "Acne-prone skin", "Rosacea", "Irritated skin"],
    concentration: "Effective at 1-10%",
    trending: true,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600"
  },
  {
    id: 3,
    name: "Niacinamide",
    slug: "niacinamide",
    icon: Sparkles,
    tagline: "The Brightening Powerhouse",
    description: "Vitamin B3 (Niacinamide) is a multitasking miracle worker that addresses nearly every skin concern. This water-soluble vitamin brightens, refines pores, controls oil, and strengthens your skin barrier—all without irritation.",
    benefits: [
      "Brightens and evens skin tone",
      "Minimizes appearance of pores",
      "Controls excess oil production",
      "Reduces fine lines and wrinkles",
      "Strengthens skin barrier function"
    ],
    bestFor: ["Dull skin", "Large pores", "Oily skin", "Hyperpigmentation"],
    concentration: "Sweet spot: 5-10%",
    trending: true,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  {
    id: 4,
    name: "Hyaluronic Acid",
    slug: "hyaluronic-acid",
    icon: Droplets,
    tagline: "The Ultimate Hydrator",
    description: "This moisture-binding molecule can hold up to 1000x its weight in water, making it the gold standard for hydration. Korean formulations often use multiple molecular weights for deep, lasting moisture at every skin layer.",
    benefits: [
      "Provides intense, long-lasting hydration",
      "Plumps fine lines and wrinkles",
      "Improves skin elasticity",
      "Creates dewy, glass-skin glow",
      "Suitable for all skin types"
    ],
    bestFor: ["Dry skin", "Dehydrated skin", "Fine lines", "All skin types"],
    concentration: "Effective at 0.5-2%",
    trending: false,
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600"
  },
  {
    id: 5,
    name: "Propolis",
    slug: "propolis",
    icon: Heart,
    tagline: "Nature's Healing Honey",
    description: "Propolis is a resinous mixture that bees create, packed with antioxidants, vitamins, and healing enzymes. This golden ingredient soothes, nourishes, and protects skin while fighting acne-causing bacteria.",
    benefits: [
      "Antibacterial and anti-inflammatory",
      "Accelerates wound healing",
      "Rich in antioxidants",
      "Soothes and calms irritation",
      "Brightens and evens skin tone"
    ],
    bestFor: ["Acne-prone skin", "Damaged skin", "Dull complexion", "Sensitive skin"],
    concentration: "Look for 10-80% propolis",
    trending: false,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600"
  },
  {
    id: 6,
    name: "Fermented Ingredients",
    slug: "fermented-ingredients",
    icon: Zap,
    tagline: "The Anti-Aging Secret",
    description: "Fermentation breaks down ingredients into smaller molecules that penetrate deeper and work faster. Galactomyces and Bifida ferments are K-beauty staples that brighten, refine texture, and deliver visible anti-aging results.",
    benefits: [
      "Brightens and evens skin tone",
      "Improves skin texture and smoothness",
      "Boosts absorption of other products",
      "Provides anti-aging benefits",
      "Strengthens skin's microbiome"
    ],
    bestFor: ["Aging skin", "Dull complexion", "Uneven texture", "Fine lines"],
    concentration: "Higher percentages = better results",
    trending: false,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600"
  },
  {
    id: 7,
    name: "Ceramides",
    slug: "ceramides",
    icon: Shield,
    tagline: "The Barrier Guardian",
    description: "Ceramides are lipid molecules that make up 50% of your skin's barrier. Korean skincare uses ceramides to repair damage, lock in moisture, and protect against environmental stressors for healthy, resilient skin.",
    benefits: [
      "Repairs and strengthens skin barrier",
      "Locks in moisture and prevents water loss",
      "Protects against environmental damage",
      "Reduces sensitivity and irritation",
      "Improves overall skin health"
    ],
    bestFor: ["Dry skin", "Sensitive skin", "Compromised barrier", "Eczema-prone"],
    concentration: "Effective at 1-5%",
    trending: false,
    color: "bg-rose-50 border-rose-200",
    iconColor: "text-rose-600"
  },
  {
    id: 8,
    name: "Green Tea",
    slug: "green-tea",
    icon: Leaf,
    tagline: "The Antioxidant Powerhouse",
    description: "Green tea extract is loaded with polyphenols and EGCG, powerful antioxidants that protect skin from damage, control oil, and calm inflammation. It's a staple in Korean skincare for its gentle yet effective benefits.",
    benefits: [
      "Powerful antioxidant protection",
      "Controls excess oil and sebum",
      "Soothes inflammation and redness",
      "Protects against environmental damage",
      "Anti-aging and pore-refining"
    ],
    bestFor: ["Oily skin", "Acne-prone skin", "Aging skin", "Sensitive skin"],
    concentration: "Look for high percentages",
    trending: false,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600"
  }
];

export default function Ingredients() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIngredients = INGREDIENTS.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingIngredients = INGREDIENTS.filter(ing => ing.trending);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-pink-50/30 to-white py-16">
        <div className="container max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-pink-100/50 px-4 py-2 text-sm font-medium text-pink-700">
            ✨ Ingredient Encyclopedia
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
            Korean Skincare Ingredients{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Decoded
            </span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Discover the science behind K-beauty's most powerful ingredients. Learn what they do, who they're for, and how to use them for your best skin ever.
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search ingredients..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Ingredients */}
      {!searchTerm && (
        <section className="border-b bg-white py-12">
          <div className="container">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                🔥 Trending Now
              </h2>
              <p className="text-gray-600">
                The most viral and searched K-beauty ingredients
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {trendingIngredients.map((ingredient) => {
                const Icon = ingredient.icon;
                return (
                  <Card
                    key={ingredient.id}
                    className={`cursor-pointer border-2 transition-all hover:shadow-lg ${ingredient.color}`}
                    onClick={() => {
                      const element = document.getElementById(`ingredient-${ingredient.id}`);
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white`}>
                        <Icon className={`h-8 w-8 ${ingredient.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl">{ingredient.name}</CardTitle>
                      <CardDescription className="font-medium">
                        {ingredient.tagline}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Ingredients */}
      <section className="bg-gray-50 py-16">
        <div className="container max-w-5xl">
          <div className="space-y-8">
            {filteredIngredients.map((ingredient) => {
              const Icon = ingredient.icon;
              return (
                <Card
                  key={ingredient.id}
                  id={`ingredient-${ingredient.id}`}
                  className="overflow-hidden border-2"
                >
                  <CardHeader className={`${ingredient.color}`}>
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white">
                        <Icon className={`h-7 w-7 ${ingredient.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle className="text-2xl">{ingredient.name}</CardTitle>
                          {ingredient.trending && (
                            <Badge variant="destructive" className="bg-pink-500">
                              Trending
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base font-semibold text-gray-700">
                          {ingredient.tagline}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-6 text-gray-700 leading-relaxed">
                      {ingredient.description}
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">
                          ✨ Key Benefits
                        </h4>
                        <ul className="space-y-2">
                          {ingredient.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">
                          💡 Best For
                        </h4>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {ingredient.bestFor.map((type, idx) => (
                            <Badge key={idx} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                        </div>

                        <h4 className="mb-2 font-semibold text-gray-900">
                          📊 Concentration
                        </h4>
                        <p className="mb-4 text-sm text-gray-600">
                          {ingredient.concentration}
                        </p>

                        <Button
                          className="w-full"
                          onClick={() => setLocation(`/shop?ingredient=${ingredient.slug}`)}
                        >
                          Shop {ingredient.name} Products
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredIngredients.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No ingredients found matching "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-white py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Ready to Find Your Perfect Products?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Take our personalized skin quiz to get product recommendations tailored to your unique skin needs and concerns.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600"
              onClick={() => setLocation("/quiz")}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Take Skin Quiz
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/shop")}
            >
              Browse All Products
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
