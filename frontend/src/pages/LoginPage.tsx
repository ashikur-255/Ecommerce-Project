import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiPhone } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { login, clearError, resendVerification } from "../store/slices/authSlice";
import Button from "../components/ui/Button";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message as string | undefined;
  const { isLoading, error, user } = useAppSelector((s) => s.auth);

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Check if error is about verification
  const needsVerification = error ? error.toLowerCase().includes("verify") : false;

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
    return () => { 
      dispatch(clearError());
      setLocalError("");
    };
  }, [user, navigate, dispatch]);

  const handleResendVerification = async () => {
    const isEmail = error?.toLowerCase().includes("email") || loginMethod === "email";

    if (isEmail && !form.email.trim()) {
      setLocalError("Please enter your email address first.");
      return;
    }
    
    if (!isEmail && !form.phone.trim()) {
      setLocalError("Please enter your phone number first.");
      return;
    }

    setIsResending(true);
    setLocalError("");

    try {
      const payload = isEmail 
        ? { email: form.email.trim(), type: "email" as const }
        : { phone: form.phone.trim(), type: "phone" as const };

      await dispatch(resendVerification(payload)).unwrap();
      
      const message = isEmail 
        ? "Verification email sent! Please check your inbox and spam folder."
        : "Verification code sent! Please check your phone for the 6-digit OTP.";
      
      setLocalError(message);
    } catch (err) {
      const msg = typeof err === "string" ? err : "Failed to resend verification.";
      setLocalError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleRedirectToVerification = () => {
    const isEmail = error?.toLowerCase().includes("email") || loginMethod === "email";
    if (isEmail) {
      navigate("/verify-email", {
        state: { 
          email: form.email.trim() || "",
          message: error || "Please verify your email before logging in."
        }
      });
    } else {
      navigate("/verify-phone", {
        state: { 
          phone: form.phone.trim() || "",
          message: error || "Please verify your phone number before logging in."
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate based on login method
    if (loginMethod === "email" && !form.email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
    if (loginMethod === "phone" && !form.phone.trim()) {
      setLocalError("Please enter your phone number.");
      return;
    }
    if (!form.password) {
      setLocalError("Please enter your password.");
      return;
    }

    const credentials = loginMethod === "email"
      ? { email: form.email.trim(), password: form.password }
      : { phone: form.phone.trim(), password: form.password };

    try {
      await dispatch(login(credentials)).unwrap();
      // Login successful - redirect handled by useEffect
    } catch (err) {
      // Error is handled by the slice
      console.error("Login error:", err);
    }
  };

  const displayError = localError || error;

  return (
    <main className="min-h-screen pt-20 bg-light flex items-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">👕</span>
            <h1 className="text-2xl font-black text-dark mt-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1">Login to your BDFashions account</p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">
              {successMessage}
            </div>
          )}

          {displayError && (
            <div className={`text-sm rounded-xl px-4 py-3 mb-6 ${
              needsVerification 
                ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {displayError}
            </div>
          )}

          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("email");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "email" 
                  ? "bg-white shadow-sm text-dark" 
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiMail size={16} /> Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("phone");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "phone" 
                  ? "bg-white shadow-sm text-dark" 
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiPhone size={16} /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter phone with or without country code (e.g., 017XXXXXXXX or 88017XXXXXXXX)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {needsVerification && (
            <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
              <p className="text-xs text-amber-900 font-medium">
                Your account requires verification before accessing all features.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRedirectToVerification}
                  className="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition shadow-sm text-sm"
                >
                  Go to Verification
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full py-2 text-primary font-semibold hover:underline transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Sending..." : "Resend Verification Code"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}