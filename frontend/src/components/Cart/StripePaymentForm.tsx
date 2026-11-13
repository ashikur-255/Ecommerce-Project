import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FiCreditCard, FiTruck } from "react-icons/fi";
import Button from "../ui/Button";
import toast from "react-hot-toast";

interface Props {
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCashOnDelivery: () => Promise<void>;
  disabled?: boolean;
}

type PaymentMethod = "stripe" | "cod";

export default function StripePaymentForm({
  onPaymentSuccess,
  onCashOnDelivery,
  disabled,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("stripe");

  const [submitting, setSubmitting] = useState(false);

  const handleStripePayment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);

    try {
      const { error, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (error) {
        toast.error(
          error.message ?? "Payment failed. Please try again."
        );
        return;
      }

      if (
        paymentIntent &&
        paymentIntent.status === "succeeded"
      ) {
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

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">
          Select Payment Method
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Stripe */}
          <button
            type="button"
            onClick={() =>
              setPaymentMethod("stripe")
            }
            className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
              paymentMethod === "stripe"
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            <FiCreditCard size={20} />

            <div className="text-left">
              <h4 className="font-medium">
                Credit / Debit Card
              </h4>
              <p className="text-sm text-gray-500">
                Secure payment with Stripe
              </p>
            </div>
          </button>

          {/* Cash on Delivery */}
          <button
            type="button"
            onClick={() =>
              setPaymentMethod("cod")
            }
            className={`border rounded-xl p-4 transition-all flex items-center gap-3 ${
              paymentMethod === "cod"
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:border-green-600"
            }`}
          >
            <FiTruck size={20} />

            <div className="text-left">
              <h4 className="font-medium">
                Cash on Delivery
              </h4>

              <p className="text-sm text-gray-500">
                Pay when your order arrives
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Stripe Payment Form */}
      {paymentMethod === "stripe" && (
        <form
          onSubmit={handleStripePayment}
          className="space-y-5"
        >
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              paymentMethodOrder: ["card"],
            }}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            disabled={
              disabled ||
              !stripe ||
              !elements
            }
          >
            Pay Now
          </Button>

          <p className="text-xs text-gray-400 text-center">
            🔒 Payments are securely processed by Stripe.
            Your card details are never stored on our
            servers.
          </p>
        </form>
      )}

      {/* Cash on Delivery */}
      {paymentMethod === "cod" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h4 className="font-semibold text-green-700">
              Cash on Delivery
            </h4>

            <p className="text-sm text-gray-600 mt-1">
              You will pay in cash when your order is
              delivered to your address.
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
    </div>
  );
}