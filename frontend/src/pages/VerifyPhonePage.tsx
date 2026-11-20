import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiPhone, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiShield } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyPhonePublic, resendVerification, clearError } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function VerifyPhonePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);

  const phoneFromState = location.state?.phone as string | undefined;
  const messageFromState = location.state?.message as string | undefined;

  const [phone, setPhone] = useState<string>(phoneFromState || user?.phone || "");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Focus the first OTP input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle digit change in OTP inputs
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/[^0-9]/g, "");

    // Handle paste of full 6-digit code
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split("");
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanValue;
    setDigits(newDigits);

    // Auto-advance to next box if character entered
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorMessage("Please enter your phone number.");
      toast.error("Please enter your phone number.");
      return;
    }

    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      toast.error("Please enter all 6 digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await dispatch(
        verifyPhonePublic({
          phone: cleanPhone,
          code: code,
        })
      ).unwrap();

      setIsVerified(true);
      setSuccessNotice(res.message || "Phone verified successfully!");
      toast.success("Phone verified successfully!");
    } catch (err) {
      const msg = typeof err === "string" ? err : "Verification failed. Invalid or expired OTP.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      toast.error("Please provide a phone number.");
      return;
    }

    setIsResending(true);
    setErrorMessage("");
    setSuccessNotice(null);

    try {
      const res = await dispatch(
        resendVerification({
          phone: cleanPhone,
          type: "phone",
        })
      ).unwrap();

      setSuccessNotice(res.message || "A new 6-digit code has been sent to your phone.");
      toast.success("New code sent to your phone!");
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = typeof err === "string" ? err : "Failed to resend code. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Success view
  if (isVerified) {
    return (
      <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Phone Verified!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {successNotice || "Your phone number has been verified successfully. You can now log in to your BDFashions account."}
          </p>
          <Button
            onClick={() => navigate("/login")}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Continue to Login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-16 bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
        {/* Shield / Phone Icon */}
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-amber-50 flex items-center justify-center text-primary">
          <FiShield className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-dark mb-2">Verify Phone Number</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {messageFromState || "We've sent a 6-digit OTP verification code to your phone number."}
        </p>

        {/* Phone number input / display */}
        <div className="text-left mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiPhone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-dark outline-none focus:border-primary focus:bg-white transition"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1 pl-1">
            Example: 017XXXXXXXX or +88017XXXXXXXX
          </p>
        </div>

        {/* 6-Digit OTP Input Boxes */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="text-left">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider text-center">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex justify-between gap-2 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none ${
                    digit
                      ? "border-primary bg-amber-50/30 text-dark shadow-sm"
                      : "border-gray-200 bg-gray-50 text-dark focus:border-primary focus:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-left flex items-start gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left flex items-start gap-2.5">
              <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isVerifying}
              disabled={isVerifying || code.length !== 6 || !phone.trim()}
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0 || !phone.trim()}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend Code in ${resendCooldown}s`
                  : "Resend Code"}
              </button>

              <Link
                to="/verify-email"
                state={{ phone }}
                className="text-xs text-gray-500 hover:text-dark font-medium"
              >
                Verify via email instead?
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-dark transition"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
