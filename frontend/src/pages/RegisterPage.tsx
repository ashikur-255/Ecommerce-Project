import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { register, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import toast from "react-hot-toast";

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
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;
    const confirm = form.confirm;

    if (!name) {
      setLocalError("Please enter your full name.");
      return;
    }

    if (!email && !phone) {
      setLocalError("Please provide either email or phone number.");
      return;
    }

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

      setForm({ name: "", email: "", phone: "", password: "", confirm: "" });
      dispatch(clearError());
      toast.success("Account created successfully! Welcome to BDFashions.");
      navigate("/", { replace: true });
    } catch (err) {
      const message = typeof err === "string" ? err : "Registration failed. Please try again.";
      setLocalError(message);
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
              ✨
            </div>
            <h1 className="text-2xl font-black text-dark tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join the BDFashions community</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠</span> {displayError}
            </div>
          )}

          {/* Google Sign In */}
          <div className="mb-5">
            <GoogleSignInButton text="Sign up with Google" />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
                Or register with details
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiUser size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-gray-400 text-[11px] font-normal lowercase">(optional if phone provided)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMail size={15} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Phone Number <span className="text-gray-400 text-[11px] font-normal lowercase">(optional if email provided)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiPhone size={15} />
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={15} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters"
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={15} />
                </div>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 font-semibold shadow-md hover:shadow-lg transition-all"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer link to Login */}
          <p className="text-center text-sm text-gray-500 mt-6 pt-5 border-t border-gray-100">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
export default RegisterPage;
