import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyEmail, resendVerification, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

type VerificationStatus = "pending" | "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((s) => s.auth);

  const token = searchParams.get("token");
  const emailFromState = location.state?.email as string | undefined;
  const messageFromState = location.state?.message as string | undefined;

  // If token is present, we start in 'verifying' mode. Otherwise, it's 'pending' verification.
  const [status, setStatus] = useState<VerificationStatus>(() => (token ? "verifying" : "pending"));
  const [email, setEmail] = useState<string>(emailFromState || user?.email || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [instantVerifyUrl, setInstantVerifyUrl] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle automatic token verification when token is present
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const runVerification = async () => {
      try {
        const result = await dispatch(verifyEmail({ token })).unwrap();
        if (isMounted) {
          setStatus("success");
          setSuccessNotice(result.message || "Email verified successfully!");
          toast.success("Email verified successfully!");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          const msg = typeof err === "string" ? err : "Verification link is invalid or has expired.";
          setErrorMessage(msg);
          toast.error(msg);
        }
      }
    };

    runVerification();
    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

  const handleResend = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsResending(true);
    setSuccessNotice(null);
    setErrorMessage("");

    try {
      const res = await dispatch(resendVerification({ email: targetEmail, type: "email" })).unwrap();
      const msg = res.message || "Verification email sent! Please check your inbox and spam folder.";
      setSuccessNotice(msg);
      if (res.verifyUrl) {
        setInstantVerifyUrl(res.verifyUrl);
      }
      toast.success("Verification link generated!");
      setResendCooldown(60); // 60s cooldown
      setIsEditingEmail(false);
    } catch (err) {
      const msg = typeof err === "string" ? err : "Failed to send verification email. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  // 1. Verifying State (when token is in URL)
  if (status === "verifying") {
    return (
      <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 flex items-center justify-center text-primary">
            <FiRefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Verifying Your Email</h2>
          <p className="text-gray-500 text-sm">Please hold on while we confirm your email verification link...</p>
        </div>
      </main>
    );
  }

  // 2. Success State
  if (status === "success") {
    return (
      <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Email Verified!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {successNotice || "Your email address has been successfully verified. You can now sign in to your BDFashions account."}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-primary text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Continue to Login
          </Link>
        </div>
      </main>
    );
  }

  // 3. Error State (When a token was submitted but invalid/expired)
  if (status === "error") {
    return (
      <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <FiAlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Verification Failed</h2>
          <p className="text-gray-500 text-sm mb-6">
            {errorMessage || "The verification link is invalid, expired, or has already been used."}
          </p>

          <div className="text-left mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Enter your email to request a new link:
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {successNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              {successNotice}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="primary"
              size="lg"
              className="w-full"
              loading={isResending}
              disabled={isResending || resendCooldown > 0 || !email.trim()}
            >
              {resendCooldown > 0 ? `Resend Link in ${resendCooldown}s` : "Send New Verification Link"}
            </Button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-dark font-medium transition"
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 4. Pending Verification State (Redirected from Register/Login without token)
  return (
    <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
        {/* Top Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-primary">
            <FiMail className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold ring-4 ring-white">
            1
          </span>
        </div>

        <h1 className="text-2xl font-black text-dark mb-2">Check Your Email</h1>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          {messageFromState || "We've sent a verification link to your email address. Please click the link to activate your account."}
        </p>

        {/* Email display pill with edit option */}
        <div className="mb-6 p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl">
          {isEditingEmail ? (
            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Update Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-left truncate">
                <FiMail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-dark truncate">
                  {email || "No email specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
              >
                <FiEdit3 className="w-3.5 h-3.5" /> Change
              </button>
            </div>
          )}
        </div>

        {/* Success / Error Alerts */}
        {successNotice && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-left flex items-start gap-2.5">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {instantVerifyUrl && (
          <div className="mb-5 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-2.5 animate-fade-in shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <span>⚡</span> Direct Verification Link Ready:
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If your email is delayed by firewall or spam filters, you can verify your account instantly by clicking below:
            </p>
            <a
              href={instantVerifyUrl}
              className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow hover:shadow-md"
            >
              Verify My Account Now
            </a>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Helpful Tips Card */}
        <div className="mb-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-left text-xs text-gray-600 space-y-1.5">
          <p className="font-semibold text-dark flex items-center gap-1.5">
            💡 Quick Tips:
          </p>
          <p>• The verification link is valid for 24 hours.</p>
          <p>• Cannot find the email? Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            variant="primary"
            size="lg"
            className="w-full"
            loading={isResending}
            disabled={isResending || resendCooldown > 0 || !email.trim()}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend Available in ${resendCooldown}s`
              : "Resend Verification Email"}
          </Button>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-dark transition"
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>

            <Link
              to="/verify-phone"
              className="text-xs text-primary font-medium hover:underline pt-1"
            >
              Have a phone number to verify instead?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
export default VerifyEmailPage;
