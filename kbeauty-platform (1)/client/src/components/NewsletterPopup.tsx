import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome! Use code ${data.discountCode} for 10% off your first order!`);
      localStorage.setItem("newsletter-popup-seen", "true");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to subscribe. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, name });
  };

  const handleClose = () => {
    localStorage.setItem("newsletter-popup-seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Get 10% Off Your First Order!
          </DialogTitle>
          <DialogDescription className="text-center">
            Join our K-beauty community and receive exclusive offers, skincare tips, and early access to new products.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="popup-name">Name (Optional)</Label>
            <Input
              id="popup-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="popup-email">Email *</Label>
            <Input
              id="popup-email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full rounded-full"
            size="lg"
            disabled={subscribe.isPending}
          >
            {subscribe.isPending ? "Subscribing..." : "Get My Discount"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
