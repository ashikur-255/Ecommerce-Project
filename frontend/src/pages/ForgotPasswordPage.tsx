import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { forgotPassword, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess(false);

    // Validate based on method
    if (method === "email" && !email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
    if (method === "phone" && !phone.trim()) {
      setLocalError("Please enter your phone number.");
      return;
    }

    try {
      const payload = method === "email" 
        ? { email: email.trim() }
        : { phone: phone.trim() };

      await dispatch(forgotPassword(payload)).unwrap();
      
      setSuccess(true);
      toast.success(method === "email" 
        ? "Password reset link sent to your email!" 
        : "Password reset code sent to your phone!"
      );

      // Clear form
      setEmail("");
      setPhone("");
    } catch (err) {
      const msg = typeof err === "string" ? err : "Failed to send reset request.";
      setLocalError(msg);
      toast.error(msg);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <main className="min-h-screen pt-20 bg-light flex items-center">
        <div className="max-w-md w-full mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-dark mb-2">Check Your {method === "email" ? "Email" : "Phone"}</h2>
            <p className="text-gray-500 text-sm mb-6">
              {method === "email" 
                ? "We've sent a password reset link to your email address. Please check your inbox."
                : "We've sent a password reset code to your phone number. Please check your SMS."
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setMethod(method === "email" ? "phone" : "email");
                }}
                className="text-primary font-semibold hover:underline text-sm"
              >
                {method === "email" ? "Send via Phone instead" : "Send via Email instead"}
              </button>
              <Link
                to="/login"
                className="block w-full bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-light flex items-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-dark mb-6 text-sm transition-colors"
          >
            <FiArrowLeft size={16} /> Back to Login
          </Link>

          <div className="text-center mb-8">
            <span className="text-4xl">🔐</span>
            <h1 className="text-2xl font-black text-dark mt-2">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">
              Enter your {method === "email" ? "email address" : "phone number"} to reset your password
            </p>
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {displayError}
            </div>
          )}

          {/* Method Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                method === "email"
                  ? "bg-white shadow-sm text-dark"
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiMail size={16} /> Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("phone");
                setLocalError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                method === "phone"
                  ? "bg-white shadow-sm text-dark"
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              <FiPhone size={16} /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "email" ? (
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}