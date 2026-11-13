import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyEmail, resendVerification, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

type VerificationStatus = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isLoading, user } = useAppSelector((s) => s.auth);
  
  // Get email from URL or state
  const token = searchParams.get("token");
  const emailFromState = location.state?.email as string | undefined;
  const messageFromState = location.state?.message as string | undefined;

  const [status, setStatus] = useState<VerificationStatus>(() => token ? "verifying" : "error");
  const [message, setMessage] = useState(() => {
    if (token) return "";
    if (messageFromState) return messageFromState;
    return "No verification token found.";
  });
  const [hasAttempted, setHasAttempted] = useState(false);
  const [email, setEmail] = useState<string>(emailFromState || user?.email || "");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  useEffect(() => {
    if (!token || hasAttempted) return;

    const verify = async () => {
      try {
        const result = await dispatch(verifyEmail({ token })).unwrap();
        setStatus("success");
        setMessage(result.message || "Email verified successfully!");
        toast.success("Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(typeof err === "string" ? err : "Invalid or expired verification token.");
        toast.error("Verification failed.");
      } finally {
        setHasAttempted(true);
      }
    };
    verify();
  }, [token, dispatch, hasAttempted]);

  const handleResend = async () => {
    const emailToUse = email || user?.email;
    
    if (!emailToUse) {
      const msg = "No email address found. Please enter your email.";
      setMessage(msg);
      toast.error(msg);
      return;
    }
    
    setIsResending(true);
    try {
      await dispatch(resendVerification({ email: emailToUse, type: "email" })).unwrap();
      setMessage("Verification email resent successfully! Please check your inbox.");
      toast.success("Verification email sent!");
      setStatus("verifying");
      setHasAttempted(false);
    } catch (err) {
      const msg = typeof err === "string" ? err : "Failed to resend verification email.";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  if (status === "verifying") {
    return (
      <main className="min-h-screen pt-20 bg-light flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <h2 className="text-xl font-bold text-dark">Verifying your email...</h2>
            <p className="text-gray-400 text-sm mt-2">Please wait while we verify your email address.</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen pt-20 bg-light flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link 
              to="/login" 
              className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Error state - show resend option with email input
  return (
    <main className="min-h-screen pt-20 bg-light flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
          <p className="text-gray-500 text-sm mb-6">{message}</p>
          
          {/* Show email input if no email is available */}
          {!email && (
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-dark mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          
          <div className="space-y-3">
            {(email || user?.email) && (
              <Button 
                onClick={handleResend} 
                variant="outline" 
                size="lg" 
                className="w-full" 
                loading={isResending || isLoading}
              >
                Resend Verification Email
              </Button>
            )}
            <Link 
              to="/login" 
              className="inline-block text-primary font-semibold hover:underline text-sm"
            >
              Back to Login
            </Link>
            {!email && !user?.email && (
              <p className="text-xs text-gray-400 mt-4">
                Please enter your email address above to resend the verification link.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}