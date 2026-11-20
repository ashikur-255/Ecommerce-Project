import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { FiCreditCard, FiTruck, FiSmartphone, FiGlobe, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { paymentService, sslcommerzService } from "../../services/api";

const stripePromises = new Map<string, ReturnType<typeof loadStripe>>();

export function getStripe(publishableKey: string) {
  if (!stripePromises.has(publishableKey)) {
    stripePromises.set(
      publishableKey,
      loadStripe(publishableKey, {
        developerTools: {
          assistant: {
            enabled: false,
          },
        },
      })
    );
  }

  return stripePromises.get(publishableKey)!;
}

interface OrderItemInput {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

interface ShippingAddressInput {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Props {
  amount: number;
  orderItems: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCashOnDelivery: () => Promise<void>;
  disabled?: boolean;
}

type PaymentMethod = "cod" | "sslcommerz" | "bkash" | "stripe";

const WALLET_PROVIDERS: {
  id: "bkash";
  label: string;
  description: string;
  activeClasses: string;
  idleClasses: string;
}[] = [
  {
    id: "bkash",
    label: "bKash Direct",
    description: "Pay instantly with your bKash account",
    activeClasses: "border-pink-600 bg-pink-50 ring-2 ring-pink-500/20",
    idleClasses: "border-gray-200 hover:border-pink-500 bg-white",
  },
];

const WALLET_CREATE_FN: Record<string, (amount: number) => Promise<{ data: { data: { redirectUrl: string } } }>> = {
  bkash: (amount) => paymentService.createBkashPayment({ amount }),
};

// ── Inner Stripe Form mounted only when Stripe Elements is active ──
function StripeCardInnerForm({
  onPaymentSuccess,
  disabled,
}: {
  onPaymentSuccess: (paymentIntentId: string) => void;
  disabled?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleStripePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message ?? "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onPaymentSuccess(paymentIntent.id);
      } else {
        toast.error("Payment was not completed.");
      }
    } catch {
      toast.error("Something went wrong during card processing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleStripePayment} className="space-y-5">
      <PaymentElement
        options={{
          layout: { type: "tabs", defaultCollapsed: false },
          paymentMethodOrder: ["card"],
        }}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={disabled || !stripe || !elements}
      >
        Pay With Card Now
      </Button>

      <p className="text-xs text-gray-400 text-center">
        🔒 Payments are securely processed by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  );
}

export default function CheckoutPaymentForm({
  amount,
  orderItems,
  shippingAddress,
  onPaymentSuccess,
  onCashOnDelivery,
  disabled,
}: Props) {
  // Default to Cash on Delivery for frictionless checkout
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);

  // Stripe state
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
  );
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const initStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
    try {
      const res = await paymentService.createIntent({
        amount,
        currency: "usd",
      });
      setStripeClientSecret(res.data.data.clientSecret);
      if (res.data.data.publishableKey) {
        setStripePublishableKey(res.data.data.publishableKey);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message ||
        "Stripe payment gateway is not configured on this server yet.";
      setStripeError(msg);
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "stripe" && !stripeClientSecret && !stripeLoading && !stripeError) {
      initStripe();
    }
  }, [paymentMethod, stripeClientSecret, stripeLoading, stripeError]);

  const handleCOD = async () => {
    setSubmitting(true);
    try {
      await onCashOnDelivery();
    } catch {
      toast.error("Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const showBackendError = (err: unknown, fallback: string, logLabel: string) => {
    const error = err as AxiosError<{ message: string }>;
    const backendMessage = error.response?.data?.message;

    if (backendMessage) toast.error(backendMessage);
    else if (error.response?.status === 401) toast.error("Please log in again before paying.");
    else if (!error.response) toast.error("Can't reach the server. Is the API running?");
    else toast.error(fallback);

    console.error(logLabel, error.response?.data ?? error.message);
  };

  const handleWalletPayment = async (providerId: string) => {
    const pendingCheckout = sessionStorage.getItem("pendingCheckout");
    if (!pendingCheckout) {
      toast.error("Missing checkout details. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      const createFn = WALLET_CREATE_FN[providerId];
      const res = await createFn(amount);
      window.location.assign(res.data.data.redirectUrl);
    } catch (err) {
      showBackendError(err, "Failed to start bKash payment. Please try again.", "bKash create-payment failed:");
      setSubmitting(false);
    }
  };

  const handleSslCommerzPayment = async () => {
    setSubmitting(true);
    try {
      const res = await sslcommerzService.createPayment({ orderItems, shippingAddress });
      if (res.data?.data?.gatewayPageUrl) {
        window.location.assign(res.data.data.gatewayPageUrl);
      } else {
        toast.error("SSLCommerz did not return a valid gateway URL.");
        setSubmitting(false);
      }
    } catch (err) {
      showBackendError(err, "SSLCommerz payment is currently being configured. Please use Cash on Delivery.", "SSLCommerz create-payment failed:");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-dark">Select Payment Method</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Cash on Delivery (COD) */}
          <button
            type="button"
            onClick={() => setPaymentMethod("cod")}
            className={`border rounded-2xl p-4 transition-all flex items-center gap-3 text-left ${
              paymentMethod === "cod"
                ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                : "border-gray-200 hover:border-emerald-400 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FiTruck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-dark text-sm">Cash on Delivery</h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Pay in cash when parcel arrives at your door</p>
            </div>
          </button>

          {/* SSLCommerz (Cards, bKash, Nagad, Internet Banking) */}
          <button
            type="button"
            onClick={() => setPaymentMethod("sslcommerz")}
            className={`border rounded-2xl p-4 transition-all flex items-center gap-3 text-left ${
              paymentMethod === "sslcommerz"
                ? "border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20"
                : "border-gray-200 hover:border-blue-400 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FiGlobe size={20} />
            </div>
            <div>
              <h4 className="font-bold text-dark text-sm">Card / Mobile Banking</h4>
              <p className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, bKash, Nagad via SSLCommerz</p>
            </div>
          </button>

          {/* bKash Direct */}
          {WALLET_PROVIDERS.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              onClick={() => setPaymentMethod(wallet.id)}
              className={`border rounded-2xl p-4 transition-all flex items-center gap-3 text-left ${
                paymentMethod === wallet.id ? wallet.activeClasses : wallet.idleClasses
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <FiSmartphone size={20} />
              </div>
              <div>
                <h4 className="font-bold text-dark text-sm">{wallet.label}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{wallet.description}</p>
              </div>
            </button>
          ))}

          {/* Stripe International Card */}
          <button
            type="button"
            onClick={() => setPaymentMethod("stripe")}
            className={`border rounded-2xl p-4 transition-all flex items-center gap-3 text-left ${
              paymentMethod === "stripe"
                ? "border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20"
                : "border-gray-200 hover:border-amber-400 bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FiCreditCard size={20} />
            </div>
            <div>
              <h4 className="font-bold text-dark text-sm">International Cards</h4>
              <p className="text-xs text-gray-500 mt-0.5">Secure payment with Stripe</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Cash on Delivery Panel ── */}
      {paymentMethod === "cod" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={18} />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Cash on Delivery Selected</h4>
                <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                  You can inspect the product parcel upon arrival and pay cash directly to the delivery rider. No online payment required!
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 shadow-md shadow-emerald-600/20"
            loading={submitting}
            disabled={disabled}
            onClick={handleCOD}
          >
            Place Order (Cash on Delivery) — ৳{amount.toLocaleString()}
          </Button>
        </div>
      )}

      {/* ── SSLCommerz Panel ── */}
      {paymentMethod === "sslcommerz" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5">
            <h4 className="font-bold text-blue-900 text-sm">Pay via SSLCommerz Gateway</h4>
            <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
              You will be redirected to SSLCommerz&apos;s 100% secure payment portal to complete payment of ৳{amount.toLocaleString()} using any Bangladeshi Bank Card (Visa/Mastercard), bKash, Nagad, Rocket, or Net Banking.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 shadow-md shadow-blue-600/20"
            loading={submitting}
            disabled={disabled}
            onClick={handleSslCommerzPayment}
          >
            Pay with SSLCommerz — ৳{amount.toLocaleString()}
          </Button>
        </div>
      )}

      {/* ── bKash Direct Panel ── */}
      {paymentMethod === "bkash" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-pink-200 bg-pink-50/80 p-5">
            <h4 className="font-bold text-pink-900 text-sm">Direct bKash Payment</h4>
            <p className="text-xs text-pink-800/80 mt-1 leading-relaxed">
              You will be redirected to bKash to authenticate and pay ৳{amount.toLocaleString()}, then returned here automatically to complete your order.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 shadow-md shadow-pink-600/20"
            loading={submitting}
            disabled={disabled}
            onClick={() => handleWalletPayment("bkash")}
          >
            Pay with bKash — ৳{amount.toLocaleString()}
          </Button>
        </div>
      )}

      {/* ── Stripe Panel ── */}
      {paymentMethod === "stripe" && (
        <div className="space-y-4 animate-fade-in">
          {stripeLoading && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Initializing secure Stripe card form...</p>
            </div>
          )}

          {stripeError && !stripeLoading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Stripe Gateway Not Configured</h4>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    {stripeError}
                  </p>
                  <p className="text-xs text-amber-900 font-semibold mt-2">
                    💡 Tip: Please select <strong>Cash on Delivery</strong> or <strong>Card / Mobile Banking (SSLCommerz)</strong> above to complete your order right now.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                onClick={() => setPaymentMethod("cod")}
              >
                Switch to Cash on Delivery
              </Button>
            </div>
          )}

          {stripeClientSecret && stripePublishableKey && !stripeLoading && (
            <Elements
              stripe={getStripe(stripePublishableKey)}
              options={{
                clientSecret: stripeClientSecret,
                appearance: { theme: "stripe", variables: { colorPrimary: "#fda702" } },
              }}
            >
              <StripeCardInnerForm onPaymentSuccess={onPaymentSuccess} disabled={disabled} />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
}
