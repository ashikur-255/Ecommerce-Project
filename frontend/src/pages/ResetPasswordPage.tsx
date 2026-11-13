import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { resetPassword, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";

// Password strength calculation - moved outside component for better performance
const calculatePasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: "Weak", color: "red" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const strengthMap = [
    { score: 0, label: "Weak", color: "red" },
    { score: 1, label: "Weak", color: "red" },
    { score: 2, label: "Fair", color: "orange" },
    { score: 3, label: "Good", color: "yellow" },
    { score: 4, label: "Strong", color: "green" },
    { score: 5, label: "Very Strong", color: "green" },
  ];

  return strengthMap[Math.min(score, 5)];
};

export function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const token = searchParams.get("token");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  // Use useMemo instead of useEffect for password strength
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(form.newPassword),
    [form.newPassword]
  );

  // Check for token - using useCallback to prevent unnecessary re-renders
  const checkToken = useCallback(() => {
    if (!token) {
      navigate("/forgot-password", {
        state: {
          message: "Invalid or missing reset token. Please request a new password reset.",
        },
      });
    }
  }, [token, navigate]);

  // Run token check on mount
  useEffect(() => {
    checkToken();
  }, [checkToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate password
    if (form.newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (!token) {
      setLocalError("No reset token found. Please request a new password reset.");
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token: token,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        })
      ).unwrap();

      setSuccess(true);

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      // Error is handled by the slice
      console.error("Reset password error:", err);
    }
  };

  // Success state
  if (success) {
    return (
      <main className="min-h-screen pt-20 bg-light flex items-center">
        <div className="max-w-md w-full mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">
              Password Reset Successful! 🎉
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been reset successfully. You can now login with your new
              password.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-xs text-gray-400">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const displayError = localError || error;
  const isPasswordValid = form.newPassword.length >= 6;
  const doPasswordsMatch = form.newPassword === form.confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && !!form.confirmPassword;

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
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-black text-dark mt-2">Set New Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your new password below</p>
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  {!isPasswordValid && (
                    <p className="text-xs text-red-500 mt-1">
                      Minimum 6 characters required
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm your new password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors pr-10 ${
                    form.confirmPassword && !doPasswordsMatch
                      ? "border-red-500 focus:border-red-500"
                      : form.confirmPassword && doPasswordsMatch
                      ? "border-green-500 focus:border-green-500"
                      : "border-gray-200 focus:border-primary"
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && doPasswordsMatch && isPasswordValid && (
                <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}