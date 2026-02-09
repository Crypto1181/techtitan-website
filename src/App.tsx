import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AccountSettings from "./pages/AccountSettings";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import ShippingInfo from "./pages/ShippingInfo";
import ProductCatalog from "./pages/ProductCatalog";
import AdminCatalogUpdate from "./pages/AdminCatalogUpdate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Get base path for GitHub Pages
const getBasename = () => {
  // Check if we're on GitHub Pages (production)
  if (import.meta.env.PROD && window.location.hostname.includes('github.io')) {
    return '/techtitan-website';
  }
  return '/';
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="techtitan-ui-theme">
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={getBasename()}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<AccountSettings />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<MyOrders />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/catalog" element={<ProductCatalog />} />
                
                {/* Admin Routes - Ideally should be protected */}
                <Route path="/admin/catalog-update" element={<AdminCatalogUpdate />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
