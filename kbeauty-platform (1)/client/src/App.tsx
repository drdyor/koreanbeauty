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
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatBot />
          <NewsletterPopup />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
