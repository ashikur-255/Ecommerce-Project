import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { register, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
    return () => { dispatch(clearError()); };
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Trim values first
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;
    const confirm = form.confirm;

    // Validate name
    if (!name) {
      setLocalError("Please enter your full name.");
      return;
    }

    // Validate at least one contact method
    if (!email && !phone) {
      setLocalError("Please provide either email or phone number.");
      return;
    }

    // Validate password
    if (!password) {
      setLocalError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    // Validate phone format if provided
    if (phone) {
      const phoneDigits = phone.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 10) {
        setLocalError("Please enter a valid phone number (minimum 10 digits).");
        return;
      }
    }

    try {
      await dispatch(
        register({
          name: name,
          email: email || undefined,
          phone: phone || undefined,
          password: password,
        })
      ).unwrap();

      // Clear form on success
      setForm({ name: "", email: "", phone: "", password: "", confirm: "" });
      dispatch(clearError());

      // Determine where to redirect based on what was provided
      const hasEmail = !!email;
      const hasPhone = !!phone;

      if (hasEmail) {
        navigate("/verify-email", {
          replace: true,
          state: { 
            email: email,
            message: hasPhone 
              ? "Account created! Please verify your email. A verification code has also been sent to your phone."
              : "Account created successfully. Please verify your email before logging in."
          }
        });
      } else if (hasPhone) {
        navigate("/verify-phone", {
          replace: true,
          state: { 
            phone: phone,
            message: "Account created successfully. Please verify your phone number."
          }
        });
      }
    } catch (err) {
      const message = typeof err === "string" ? err : "Registration failed. Please try again.";
      setLocalError(message);
    }
  };

  const displayError = localError || error;

  return (
    <main className="min-h-screen pt-20 bg-light flex items-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">👕</span>
            <h1 className="text-2xl font-black text-dark mt-2">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join the adidas family</p>
          </div>
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {displayError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Email <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Phone Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+8801XXXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                You must provide either email or phone number.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" loading={isLoading}>
              Create Account
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}