import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportChat } from "@/components/SupportChat";
import Home from "@/pages/Home";
import Checkout from "@/pages/Checkout";
import CategoryPage from "@/pages/CategoryPage";
import SearchResults from "@/pages/SearchResults";
import Search from "@/pages/Search";
import Account from "@/pages/Account";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import Wishlist from "@/pages/Wishlist";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Returns from "@/pages/Returns";
import Shipping from "@/pages/Shipping";
import SizeGuide from "@/pages/SizeGuide";
import TrackOrder from "@/pages/TrackOrder";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/search" component={Search} />
      <Route path="/search-results" component={SearchResults} />
      <Route path="/account" component={Account} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/returns" component={Returns} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/size-guide" component={SizeGuide} />
      <Route path="/track-order" component={TrackOrder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <SupportChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
