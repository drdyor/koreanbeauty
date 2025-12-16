import { Home, Shield, Star } from "lucide-react";
import { Button } from "../ui/button";

export const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 z-10">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Home className="h-5 w-5 text-purple-600" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Shield className="h-5 w-5 text-gray-400" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Star className="h-5 w-5 text-gray-400" />
      </Button>
    </div>
  );
};