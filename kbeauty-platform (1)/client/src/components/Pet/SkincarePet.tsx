import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Cat } from "lucide-react";

interface SkincarePetProps {
  onCheckIn: () => void;
  lastCheckIn?: Date;
}

export const SkincarePet = ({ onCheckIn, lastCheckIn }: SkincarePetProps) => {
  const [isHappy, setIsHappy] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [showCloud, setShowCloud] = useState(false);
  const [cloudShade, setCloudShade] = useState<"light" | "medium" | "dark">("light");
  const [isKnitting, setIsKnitting] = useState(false);

  useEffect(() => {
    const checkReminder = () => {
      if (!lastCheckIn) {
        setShowReminder(true);
        return;
      }

      const now = new Date();
      const hoursSinceCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCheckIn > 24) {
        setShowReminder(true);
        setIsHappy(false);
      } else {
        setShowReminder(false);
        setIsHappy(true);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  useEffect(() => {
    const winkInterval = setInterval(() => {
      if (isHappy && Math.random() > 0.7) {
        setIsWinking(true);
        setTimeout(() => setIsWinking(false), 300);
      }
    }, 5000);
    return () => clearInterval(winkInterval);
  }, [isHappy]);

  useEffect(() => {
    try {
      const rawLast = localStorage.getItem("pet:lastPeriod");
      const rawLen = localStorage.getItem("pet:cycleLength");
      const lastPeriod = rawLast ? new Date(JSON.parse(rawLast)) : undefined;
      const cycleLength = rawLen ? Number(JSON.parse(rawLen)) : 28;
      if (!lastPeriod) {
        setShowCloud(false);
        setIsKnitting(false);
        return;
      }
      const nextPeriod = new Date(lastPeriod);
      nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
      const now = new Date();
      const daysToPeriod = Math.ceil((nextPeriod.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setShowCloud(daysToPeriod <= 3 && daysToPeriod >= 0);
      setCloudShade(daysToPeriod === 3 ? "light" : daysToPeriod === 2 ? "medium" : "dark");
      const ovulation = new Date(lastPeriod);
      ovulation.setDate(ovulation.getDate() + Math.round(cycleLength / 2));
      const fertileStart = new Date(ovulation);
      fertileStart.setDate(ovulation.getDate() - 3);
      const fertileEnd = new Date(ovulation);
      fertileEnd.setDate(ovulation.getDate() + 2);
      setIsKnitting(now >= fertileStart && now <= fertileEnd);
    } catch {}
  }, []);

  const popCloud = () => {
    try {
      const nowIso = new Date().toISOString();
      localStorage.setItem("pet:lastPeriod", JSON.stringify(nowIso));
      setShowCloud(false);
      onCheckIn();
    } catch {}
  };

  const handleBlush = () => {
    setIsBlushing(true);
    setShowSparkles(true);
    setTimeout(() => {
      setIsBlushing(false);
      setShowSparkles(false);
      onCheckIn();
    }, 1500);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 md:right-8 md:bottom-24 md:z-40">
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100 max-w-xs"
          >
            <p className="text-sm text-purple-800 font-medium">
              {isHappy
                ? "Purr... did you do your skincare routine today?"
                : "Meow... I miss your care! Time for check-in?"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], x: [0, (Math.random() - 0.5) * 120], y: [0, (Math.random() - 0.5) * 120] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute text-yellow-400"
                  style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.div
          animate={isHappy ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 2, repeat: isHappy ? Infinity : 0, repeatType: "reverse" }}
          className="relative"
        >
          <div className="w-28 h-24 bg-gradient-to-br from-purple-300 to-rose-300 rounded-full relative shadow-lg border-4 border-white flex items-center justify-center">
            <div className="absolute -top-3 left-5 w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-purple-300"></div>
            <div className="absolute -top-3 right-5 w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-purple-300"></div>

            <div className="absolute -top-1 left-6 w-0 h-0 border-l-3 border-r-3 border-b-4 border-l-transparent border-r-transparent border-b-pink-200"></div>
            <div className="absolute -top-1 right-6 w-0 h-0 border-l-3 border-r-3 border-b-4 border-l-transparent border-r-transparent border-b-pink-200"></div>

            <div className="relative w-16 h-12">
              <div className="absolute top-0 left-0 w-5 h-6 bg-white rounded-full">
                {isWinking ? (
                  <div className="absolute top-3 w-5 h-0.5 bg-black rounded-full"></div>
                ) : (
                  <div className="absolute top-2 left-1 w-3 h-3 bg-black rounded-full">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-5 h-6 bg-white rounded-full">
                {isWinking ? (
                  <div className="absolute top-3 w-5 h-0.5 bg-black rounded-full"></div>
                ) : (
                  <div className="absolute top-2 left-1 w-3 h-3 bg-black rounded-full">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-2 h-1.5 bg-pink-400 rounded-full"></div>

              <AnimatePresence>
                {isBlushing && (
                  <>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-3 -left-3 w-5 h-2 bg-pink-300 rounded-full" />
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-3 -right-3 w-5 h-2 bg-pink-300 rounded-full" />
                  </>
                )}
              </AnimatePresence>

              <div className={`absolute top-7 left-1/2 transform -translate-x-1/2 w-4 h-1 ${isHappy ? "bg-pink-400 rounded-full" : "bg-pink-300 rounded-b-full"}`}></div>
            </div>
          </div>

          <motion.div className="absolute -bottom-4 -left-6 w-12 h-3 bg-purple-300 rounded-full origin-right" animate={isHappy ? { rotate: [0, 15, 0, -15, 0] } : {}} transition={{ duration: 1.5, repeat: isHappy ? Infinity : 0, repeatType: "reverse" }} />

          {isHappy && (
            <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -30 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Heart className="h-6 w-6 text-pink-500 fill-current" />
            </motion.div>
          )}

          <div className="absolute -top-4 -right-4 bg-rose-500 rounded-full p-1.5 border-2 border-white">
            <Cat className="h-4 w-4 text-white" />
          </div>
          {showCloud && (
            <button
              onClick={popCloud}
              className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs shadow ${
                cloudShade === "light" ? "bg-blue-100 text-blue-800" : cloudShade === "medium" ? "bg-blue-200 text-blue-900" : "bg-blue-300 text-blue-900"
              }`}
            >
              ☁️ Pop to confirm period
            </button>
          )}
          {isKnitting && (
            <div className="absolute -top-10 right-1 bg-rose-100 text-rose-900 rounded-full px-2 py-1 text-xs shadow">
              🧶 Fertile window
            </div>
          )}
        </motion.div>

        <div className="mt-6 flex justify-center">
          <Button onClick={handleBlush} className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-full px-6 py-2.5 shadow-lg font-medium">
            {isHappy ? "Pet & Blush" : "Cheer Up Cat!"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
