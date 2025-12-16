import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Star } from "lucide-react";

export function HeroSectionDramatic() {
  return (
    <div className="relative bg-gradient-pink-magenta overflow-hidden">
      {/* Decorative sparkles/stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-20 left-10 w-6 h-6 text-white/30 animate-pulse" />
        <Star className="absolute top-40 right-20 w-8 h-8 text-white/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Sparkles className="absolute bottom-32 left-1/4 w-5 h-5 text-white/30 animate-pulse" style={{ animationDelay: '1s' }} />
        <Star className="absolute top-1/3 right-1/3 w-6 h-6 text-white/35 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute bottom-20 right-1/4 w-7 h-7 text-white/40 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Floating product images - positioned absolutely */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        {/* Top left product */}
        <div className="absolute top-24 left-12 w-32 h-40 animate-float" style={{ animationDelay: '0s' }}>
          <img 
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[-15deg]"
          />
        </div>
        
        {/* Top right product */}
        <div className="absolute top-32 right-16 w-36 h-44 animate-float" style={{ animationDelay: '0.5s' }}>
          <img 
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[12deg]"
          />
        </div>
        
        {/* Bottom left product */}
        <div className="absolute bottom-28 left-20 w-28 h-36 animate-float" style={{ animationDelay: '1s' }}>
          <img 
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[8deg]"
          />
        </div>
        
        {/* Bottom right product */}
        <div className="absolute bottom-24 right-24 w-32 h-40 animate-float" style={{ animationDelay: '1.5s' }}>
          <img 
            src="https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[-10deg]"
          />
        </div>
        
        {/* Center left product */}
        <div className="absolute top-1/2 left-8 w-30 h-38 animate-float" style={{ animationDelay: '0.8s' }}>
          <img 
            src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[-5deg]"
          />
        </div>
        
        {/* Center right product */}
        <div className="absolute top-1/2 right-12 w-34 h-42 animate-float" style={{ animationDelay: '1.2s' }}>
          <img 
            src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&h=250&fit=crop" 
            alt="Product" 
            className="w-full h-full object-cover rounded-lg shadow-2xl transform rotate-[15deg]"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white font-medium">Authentic Korean Beauty</span>
          </div>

          {/* Neon-style heading */}
          <div className="mb-4">
            <span className="text-neon-pink text-2xl md:text-3xl font-bold tracking-wide">
              New at
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            korean
            <br />
            <span className="text-white">skincare</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover the secret to glowing, healthy skin with our curated collection of 
            authentic K-beauty products ✨
          </p>

          {/* Badge with product count */}
          <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white/30 px-6 py-3 rounded-full mb-10">
            <span className="text-white font-bold text-lg">100+ Products</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 text-lg rounded-full"
            >
              <Link href="/shop">SHOP NOW</Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-6 text-lg rounded-full"
            >
              <Link href="/quiz">
                <Sparkles className="w-5 h-5 mr-2" />
                Take Skin Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}
