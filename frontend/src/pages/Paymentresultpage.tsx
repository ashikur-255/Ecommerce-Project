import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { orderService } from "../services/api";
import Button from "../components/ui/Button";

// Shape you save to sessionStorage right before redirecting to a wallet
// provider (bKash/Nagad/Rocket) — see CheckoutPaymentForm's handleWalletPayment,
// which checks for this key before allowing the redirect at all. NOT used for
// SSLCommerz, whose order already exists by the time we land here.
interface PendingCheckout {
  orderItems: { productId: number; quantity: number; size: string; color: string }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

type ResultState = "processing" | "success" | "failed" | "cancelled";

// Maps the ?provider= query param to the exact string your API expects.
// Add "nagad" / "rocket" here once those controllers exist — nothing else
// in this file needs to change.
const PROVIDER_MAP: Record<string, "Bkash" | "Nagad" | "Rocket"> = {
  bkash: "Bkash",
  nagad: "Nagad",
  rocket: "Rocket",
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const [state, setState] = useState<ResultState>("processing");
  const [message, setMessage] = useState("Finalizing your payment...");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (hasRun.current) return; // guard against React StrictMode double-invoke
    hasRun.current = true;

    const providerParam = (searchParams.get("provider") ?? "bkash").toLowerCase();
    const status = searchParams.get("status");
    const trxId = searchParams.get("trxId");
    const orderIdParam = searchParams.get("orderId");

    const finish = async () => {
      // ── SSLCommerz: the order already exists (SslCommerzController.
      // CreatePayment creates it before ever redirecting to SSLCommerz's
      // page). There's nothing to create here — just reflect whatever
      // status the backend already settled on after validating the payment.
      if (providerParam === "sslcommerz") {
        if (orderIdParam) setOrderId(Number(orderIdParam));

        if (status === "success") {
          setState("success");
          setMessage("Payment successful! Your order has been confirmed.");
        } else if (status === "cancelled") {
          setState("cancelled");
          setMessage("You cancelled the payment. Your order is still saved as pending.");
        } else {
          setState("failed");
          setMessage("The payment could not be completed. Please try again or contact support.");
        }
        return;
      }

      // ── Wallet providers (bKash, Nagad, Rocket): the order gets created
      // right here, now that we're back and know the payment succeeded.
      const paymentMethod = PROVIDER_MAP[providerParam] ?? "Bkash";

      if (status === "cancelled") {
        setState("cancelled");
        setMessage("You cancelled the payment. Your cart is still saved.");
        return;
      }

      if (status !== "success" || !trxId) {
        setState("failed");
        setMessage("The payment could not be completed. Please try again.");
        return;
      }

      const raw = sessionStorage.getItem("pendingCheckout");
      if (!raw) {
        setState("failed");
        setMessage(
          "Payment succeeded but your checkout details were lost. Please contact support with this transaction ID: " +
            trxId
        );
        return;
      }

      try {
        const pending: PendingCheckout = JSON.parse(raw);

        const res = await orderService.create({
          orderItems: pending.orderItems,
          shippingAddress: pending.shippingAddress,
          paymentIntentId: trxId,
          paymentMethod,
        });

        setOrderId(res.data.data.id);
        sessionStorage.removeItem("pendingCheckout");
        setState("success");
        setMessage("Payment successful! Your order has been placed.");
      } catch {
        setState("failed");
        setMessage(
          "Payment succeeded but we couldn't create your order automatically. Please contact support with this transaction ID: " +
            trxId
        );
      }
    };

    finish();
  }, [searchParams]);

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center bg-light px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md w-full">
        {state === "processing" && (
          <>
            <FiLoader size={56} className="text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-black text-dark">Processing...</h1>
          </>
        )}

        {state === "success" && (
          <>
            <FiCheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-black text-dark">Order Placed!</h1>
            {orderId && <p className="text-sm text-gray-400 mt-1">Order #{orderId}</p>}
          </>
        )}

        {(state === "failed" || state === "cancelled") && (
          <>
            <FiXCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-black text-dark">
              {state === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
            </h1>
          </>
        )}

        <p className="text-gray-400 mt-2 text-sm">{message}</p>

        <div className="flex gap-3 justify-center mt-6">
          {state === "success" ? (
            <Button onClick={() => navigate("/orders")}>View My Orders</Button>
          ) : (
            <Link to="/checkout">
              <Button variant="outline">Back to Checkout</Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}