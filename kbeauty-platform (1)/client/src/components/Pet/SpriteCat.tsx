import { motion } from "framer-motion";

interface SpriteCatProps {
  state: "idle" | "walk" | "wake";
  overlay?: "cloud" | "knit" | null;
}

export function SpriteCat({ state, overlay }: SpriteCatProps) {
  const walk = state === "walk";
  const wake = state === "wake";

  return (
    <div className="relative">
      <motion.div
        className="w-28 h-24 rounded-full bg-gradient-to-br from-purple-300 to-rose-300 border-4 border-white shadow-lg"
        animate={
          walk ? { x: [0, 4, 0, -4, 0] } : wake ? { scale: [1, 1.05, 1] } : { y: [0, -6, 0] }
        }
        transition={{ duration: 2, repeat: Infinity }}
      />
      {overlay === "cloud" && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full shadow">☁️</div>
      )}
      {overlay === "knit" && (
        <div className="absolute -top-8 right-0 text-xs bg-rose-100 text-rose-900 px-2 py-1 rounded-full shadow">🧶</div>
      )}
    </div>
  );
}

