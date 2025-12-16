import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function QuizResults() {
  const { data: results, isLoading } = trpc.quiz.getResults.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading your results...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No quiz results found</p>
            <Button className="rounded-full" onClick={() => window.location.href = '/quiz'}>
              Take the Quiz
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
          <div className="container max-w-4xl text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Your Personalized Recommendations</h1>
            <p className="text-muted-foreground">
              Based on your {results.skinType} skin and {results.primaryConcern} concerns
            </p>
          </div>
        </div>

        <div className="container max-w-4xl py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Skin Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Skin Type</p>
                  <p className="font-semibold capitalize">{results.skinType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Concern</p>
                  <p className="font-semibold capitalize">{results.primaryConcern.replace(/-/g, ' ')}</p>
                </div>
              </div>
              
              {results.secondaryConcerns && results.secondaryConcerns.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Secondary Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {results.secondaryConcerns.map((concern: string) => (
                      <span key={concern} className="px-3 py-1 bg-accent rounded-full text-sm capitalize">
                        {concern.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.location.href = '/quiz'}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>
          
          {results.recommendations && results.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.recommendations.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recommendations available</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" className="rounded-full" onClick={() => window.location.href = '/shop'}>
              Explore All Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
