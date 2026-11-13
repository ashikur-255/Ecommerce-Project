import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { FiCreditCard, FiTruck, FiSmartphone, FiGlobe } from "react-icons/fi";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { paymentService, sslcommerzService } from "../../services/api";

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
  amount: number; // order total — needed by bKash/Nagad/Rocket
  orderItems: OrderItemInput[]; // needed by SSLCommerz, which creates the order up front
  shippingAddress: ShippingAddressInput; // same
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCashOnDelivery: () => Promise<void>;
  disabled?: boolean;
}

type PaymentMethod = "stripe" | "cod" | "bkash" | "sslcommerz"; // add "nagad" | "rocket" here later

// ── Wallet-based (redirect) providers whose create call only needs `amount` ──
// bKash today; Nagad/Rocket slot in the same way later — one array entry,
// one WALLET_CREATE_FN entry, one backend controller. Nothing else changes.
const WALLET_PROVIDERS: {
  id: "bkash";
  label: string;
  description: string;
  activeClasses: string;
  idleClasses: string;
}[] = [
  {
    id: "bkash",
    label: "bKash",
    description: "Pay instantly with your bKash account",
    activeClasses: "border-pink-600 bg-pink-50",
    idleClasses: "border-gray-300 hover:border-pink-600",
  },
  // { id: "nagad", label: "Nagad", description: "Pay with Nagad", activeClasses: "...", idleClasses: "..." },
  // { id: "rocket", label: "Rocket", description: "Pay with Rocket", activeClasses: "...", idleClasses: "..." },
];

const WALLET_CREATE_FN: Record<string, (amount: number) => Promise<{ data: { data: { redirectUrl: string } } }>> = {
  bkash: (amount) => paymentService.createBkashPayment({ amount }),
  // nagad: (amount) => paymentService.createNagadPayment({ amount }),
  // rocket: (amount) => paymentService.createRocketPayment({ amount }),
};

export default function CheckoutPaymentForm({
  amount,
  orderItems,
  shippingAddress,
  onPaymentSuccess,
  onCashOnDelivery,
  disabled,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
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
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Shared error-surfacing for both redirect-based flows below — shows the
  // real backend message instead of a generic one, and logs full detail.
  const showBackendError = (err: unknown, fallback: string, logLabel: string) => {
    const error = err as AxiosError<{ message: string }>;
    const backendMessage = error.response?.data?.message;

    if (backendMessage) toast.error(backendMessage);
    else if (error.response?.status === 401) toast.error("Please log in again before paying.");
    else if (!error.response) toast.error("Can't reach the server. Is the API running?");
    else toast.error(fallback);

    console.error(logLabel, error.response?.data ?? error.message);
  };

  // bKash today, Nagad/Rocket later — amount-only create call. The order
  // itself gets created client-side on PaymentResultPage after the redirect
  // back, which is why we stash cart/address in sessionStorage first: the
  // full-page redirect to bKash's site wipes this component's state.
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
      showBackendError(err, "Failed to start payment. Please try again.", "bKash create-payment failed:");
      setSubmitting(false);
    }
  };

  // SSLCommerz — a different flow entirely: the backend creates the Order
  // right now (before the redirect), since SSLCommerz's success/fail/cancel
  // callbacks land on the API directly, never on this SPA. Nothing to stash
  // in sessionStorage, and nothing for PaymentResultPage to create afterward.
  const handleSslCommerzPayment = async () => {
    setSubmitting(true);
    try {
      const res = await sslcommerzService.createPayment({ orderItems, shippingAddress });
      window.location.assign(res.data.data.gatewayPageUrl);
    } catch (err) {
      showBackendError(err, "Failed to start payment. Please try again.", "SSLCommerz create-payment failed:");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Select Payment Method</h3>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Stripe */}
          <button
            type="button"
            onClick={() => setPaymentMethod("stripe")}
            className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
              paymentMethod === "stripe"
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            <FiCreditCard size={20} />
            <div className="text-left">
              <h4 className="font-medium">Credit / Debit Card</h4>
              <p className="text-sm text-gray-500">Secure payment with Stripe</p>
            </div>
          </button>

          {/* Cash on Delivery */}
          <button
            type="button"
            onClick={() => setPaymentMethod("cod")}
            className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
              paymentMethod === "cod"
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:border-green-600"
            }`}
          >
            <FiTruck size={20} />
            <div className="text-left">
              <h4 className="font-medium">Cash on Delivery</h4>
              <p className="text-sm text-gray-500">Pay when your order arrives</p>
            </div>
          </button>

          {/* Wallet providers — bKash today, Nagad/Rocket slot in automatically */}
          {WALLET_PROVIDERS.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              onClick={() => setPaymentMethod(wallet.id)}
              className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
                paymentMethod === wallet.id ? wallet.activeClasses : wallet.idleClasses
              }`}
            >
              <FiSmartphone size={20} />
              <div className="text-left">
                <h4 className="font-medium">{wallet.label}</h4>
                <p className="text-sm text-gray-500">{wallet.description}</p>
              </div>
            </button>
          ))}

          {/* SSLCommerz */}
          <button
            type="button"
            onClick={() => setPaymentMethod("sslcommerz")}
            className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
              paymentMethod === "sslcommerz"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:border-blue-600"
            }`}
          >
            <FiGlobe size={20} />
            <div className="text-left">
              <h4 className="font-medium">Card / Mobile Banking</h4>
              <p className="text-sm text-gray-500">Visa, Mastercard, bKash, Nagad & more via SSLCommerz</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stripe Payment Form */}
      {paymentMethod === "stripe" && (
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
            Pay Now
          </Button>

          <p className="text-xs text-gray-400 text-center">
            🔒 Payments are securely processed by Stripe. Your card details are never
            stored on our servers.
          </p>
        </form>
      )}

      {/* Cash on Delivery */}
      {paymentMethod === "cod" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h4 className="font-semibold text-green-700">Cash on Delivery</h4>
            <p className="text-sm text-gray-600 mt-1">
              You will pay in cash when your order is delivered to your address.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            loading={submitting}
            disabled={disabled}
            onClick={handleCOD}
          >
            Place Order (Cash on Delivery)
          </Button>
        </div>
      )}

      {/* Wallet providers — same panel shape for bKash/Nagad/Rocket */}
      {WALLET_PROVIDERS.filter((w) => w.id === paymentMethod).map((wallet) => (
        <div key={wallet.id} className="space-y-4">
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
            <h4 className="font-semibold text-pink-700">{wallet.label}</h4>
            <p className="text-sm text-gray-600 mt-1">
              You'll be redirected to {wallet.label} to confirm and complete this
              payment of ৳{amount.toLocaleString()}, then brought back here
              automatically.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-pink-600 hover:bg-pink-700"
            loading={submitting}
            disabled={disabled}
            onClick={() => handleWalletPayment(wallet.id)}
          >
            Pay with {wallet.label}
          </Button>
        </div>
      ))}

      {/* SSLCommerz */}
      {paymentMethod === "sslcommerz" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-700">SSLCommerz</h4>
            <p className="text-sm text-gray-600 mt-1">
              Your order will be placed now, then you'll be redirected to SSLCommerz's
              secure page to pay ৳{amount.toLocaleString()} by card, bKash, Nagad, Rocket,
              or internet banking. You'll be brought back here once you're done.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
            loading={submitting}
            disabled={disabled}
            onClick={handleSslCommerzPayment}
          >
            Pay with SSLCommerz
          </Button>
        </div>
      )}
    </div>
  );
}