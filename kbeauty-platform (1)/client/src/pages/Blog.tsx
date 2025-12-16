import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 py-12">
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-4">K-Beauty Blog</h1>
            <p className="text-muted-foreground text-lg">
              Learn about Korean skincare routines, ingredients, and tips for glowing skin
            </p>
          </div>
        </div>

        <div className="container max-w-4xl py-12">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {post.imageUrl && (
                          <div className="w-48 h-32 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <span className="text-sm text-muted-foreground">by {post.author}</span>
                          </div>
                          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts available yet</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
