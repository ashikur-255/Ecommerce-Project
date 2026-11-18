import React, { Component, ReactNode } from "react";
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ScrollToHash from "./components/ScrollToHash";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import VerifyPhonePage from "./pages/VerifyPhonePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage ";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaymentResultPage from "./pages/Paymentresultpage";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { fetchMe } from "./store/slices/authSlice";
import { fetchWishlist, fetchWishlistCount } from "./store/slices/wishlistSlice";
import WishlistPage from "./pages/WishlistPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import ShippingInfoPage from "./pages/ShippingInfoPage";
import FAQPage from "./pages/FAQPage";



// ─── Custom Error Boundary ────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-light p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-dark mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── ScrollToTop ────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}


// ─── App ────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
  if (!token) return;

  const loadUserData = async () => {
    if (!user) {
      await dispatch(fetchMe());
    }

    dispatch(fetchWishlist());
    dispatch(fetchWishlistCount());
  };

  loadUserData();

}, [token, user, dispatch]);

  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <ScrollToHash />
        <Navbar />
        <div className="flex-1 page-fade">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-phone" element={<VerifyPhonePage />} />
            <Route path="/cart" element={<CartPage />} />

            <Route element={<ProtectedRoute requireVerified={false} />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute requireVerified={false} />}>
                <Route path="/wishlist" element={<WishlistPage />} />
                
            </Route>
            
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/returns" element={<ReturnPolicyPage />} />
            <Route path="/shipping" element={<ShippingInfoPage />} />
            <Route path="/faq" element={<FAQPage />} />

            <Route element={<ProtectedRoute adminOnly requireVerified />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route path="/checkout/payment-result" element={<PaymentResultPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}