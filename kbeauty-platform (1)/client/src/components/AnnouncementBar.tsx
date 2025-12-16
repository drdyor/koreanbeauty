import { X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-pink-magenta text-white py-2 px-4 relative">
      <div className="container">
        <p className="text-center text-sm md:text-base font-medium">
          🎉 Free shipping on orders over $40 | Same day shipping (Sun-Fri) | Free sheet mask with every order!
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
