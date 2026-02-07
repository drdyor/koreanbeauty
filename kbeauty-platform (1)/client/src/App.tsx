import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Ingredients from "./pages/Ingredients";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Blog from "./pages/Blog";
import AdminDashboard from "./pages/admin/Dashboard";
import { ChatBot } from "./components/chatbot/ChatBot";
import { NewsletterPopup } from "./components/NewsletterPopup";
import { SkincarePet } from "./components/Pet/SkincarePet";
import { PetMood } from "./components/Pet/PetMood";
import { TriggerFood } from "./components/Pet/TriggerFood";
import { addMoodLog, addFoodLog } from "./lib/checkinsStore";
import { getMicroTip } from "./lib/rules";
import { toast } from "sonner";
import { PetSettings } from "./components/Pet/PetSettings";
import { SpriteCat } from "./components/Pet/SpriteCat";
import { trpc } from "./lib/trpc";
import { useAuth } from "./_core/hooks/useAuth";
import { getStreak } from "./lib/checkinsStore";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/ingredients" component={Ingredients} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/quiz/results" component={QuizResults} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      <Route path="/blog" component={Blog} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [lastCheckIn, setLastCheckIn] = useState<Date | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pet:lastCheckIn");
      if (raw) setLastCheckIn(new Date(JSON.parse(raw)));
    } catch {}
  }, []);

  const handlePetCheckIn = () => {
    const now = new Date();
    setLastCheckIn(now);
    try {
      localStorage.setItem("pet:lastCheckIn", JSON.stringify(now.toISOString()));
    } catch {}
  };
  const { isAuthenticated } = useAuth();
  const createCheckin = trpc.logs.createCheckin.useMutation();
  const createFood = trpc.logs.createFood.useMutation();
  const consent = (() => {
    try { return !!JSON.parse(localStorage.getItem("pet:consent") || "false"); } catch { return false; }
  })();
  const useSprites = (() => {
    try { return !!JSON.parse(localStorage.getItem("pet:useSprites") || "false"); } catch { return false; }
  })();
  const streak = getStreak();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatBot />
          <NewsletterPopup />
          <div className="md:hidden">
            {useSprites ? (
              <div className="fixed bottom-24 right-6 z-50">
                <SpriteCat state={"idle"} overlay={null} />
              </div>
            ) : (
              <SkincarePet onCheckIn={handlePetCheckIn} lastCheckIn={lastCheckIn} />
            )}
          </div>
          <div className="md:hidden fixed bottom-40 right-6 z-50">
            {consent && (
              <PetMood
                compact
                onMoodChange={(m) => {
                  addMoodLog(m as any);
                  handlePetCheckIn();
                  const tip = getMicroTip({ mood: m as any });
                  toast(tip.message + (streak ? ` • streak ${streak}` : ""));
                  if (isAuthenticated) {
                    createCheckin.mutate({ mood: m });
                  }
                }}
              />
            )}
          </div>
          <div className="md:hidden">
            {consent && (
              <TriggerFood
                onTriggerLog={(food, intensity) => {
                  addFoodLog(food, intensity);
                  handlePetCheckIn();
                  const tip = getMicroTip({ food });
                  toast(tip.message);
                  if (isAuthenticated) {
                    createFood.mutate({ foodItem: food, triggerLevel: intensity });
                  }
                }}
              />
            )}
          </div>
          <PetSettings />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
