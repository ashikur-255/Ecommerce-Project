import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { login, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

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

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
    return () => {
      dispatch(clearError());
      setLocalError("");
    };
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

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

    const credentials =
      loginMethod === "email"
        ? { email: form.email.trim(), password: form.password }
        : { phone: form.phone.trim(), password: form.password };

    try {
      await dispatch(login(credentials)).unwrap();
      // On success, useEffect automatically redirects to "/"
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const displayError = localError || error;

  return (
    <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-9 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shadow-sm">
              👕
            </div>
            <h1 className="text-2xl font-black text-dark tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your BDFashions account</p>
          </div>

          {/* Success notice */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>✓</span> {successMessage}
            </div>
          )}

          {/* Error notice */}
          {displayError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠</span> {displayError}
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-5">
            <GoogleSignInButton text="Continue with Google" />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Method Switcher */}
          <div className="flex rounded-xl bg-gray-100/90 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("email");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                loginMethod === "email"
                  ? "bg-white shadow-sm text-dark"
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiMail size={14} /> Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("phone");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                loginMethod === "phone"
                  ? "bg-white shadow-sm text-dark"
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiPhone size={14} /> Phone
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiPhone size={15} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 pl-1">
                  e.g., 017XXXXXXXX or +88017XXXXXXXX
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition"
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 font-semibold shadow-md hover:shadow-lg transition-all"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer link to Register */}
          <p className="text-center text-sm text-gray-500 mt-6 pt-5 border-t border-gray-100">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
export default LoginPage;
