import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchCart } from "../store/slices/cartSlice";
import { createOrder } from "../store/slices/orderSlice";
import { paymentService } from "../services/api";
import CheckoutPaymentForm from "../components/Cart/Checkoutpaymentform";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { getImageUrl, getProductImageUrl, handleImageError } from "../utils/image";

// Stripe publishable key comes back from our backend's create-intent response,
// but we also keep a fallback from .env so Elements can mount immediately.
const stripePromises = new Map<string, ReturnType<typeof loadStripe>>();

function getStripe(publishableKey: string) {
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

type Step = "address" | "payment" | "success";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items, total, isLoading: cartLoading } = useAppSelector((s) => s.cart);
  const { order } = useAppSelector((s) => s.orders);

  const [step, setStep] = useState<Step>("address");
  const [clientSecret, setClientSecret] = useState("");
  const [publishableKey, setPublishableKey] = useState(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
  );
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name ?? "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
    phone: "",
  });

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  // Stash the current cart + shipping address so PaymentResultPage can
  // finish creating the order after the customer comes back from bKash's
  // hosted payment page — a full-page redirect wipes this component's state.
  // (SSLCommerz doesn't need this — its order is created before the redirect.)
  useEffect(() => {
    if (items.length === 0) return;

    sessionStorage.setItem(
      "pendingCheckout",
      JSON.stringify({
        orderItems: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        shippingAddress: address,
      })
    );
  }, [items, address]);

  const shipping = total > 2000 ? 0 : 100;
  const tax = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = useMemo(() => total + shipping + tax, [total, shipping, tax]);

  // The same order-items shape every payment method needs — computed once
  // and passed straight through to CheckoutPaymentForm (SSLCommerz needs it
  // directly; bKash/Stripe/COD build their own copy in their own handlers
  // below, kept as-is so nothing here risks changing their behavior).
  const orderItemsPayload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
    [items]
  );

  // ── Step 1 → Step 2: validate address, then create the Stripe PaymentIntent
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(address).some((v) => !v.trim())) {
      toast.error("Please fill in all shipping fields.");
      return;
    }

    setCreatingIntent(true);

    try {
      const res = await paymentService.createIntent({
        amount: grandTotal,
        currency: "usd",
      });

      setClientSecret(res.data.data.clientSecret);
      setPublishableKey(res.data.data.publishableKey || publishableKey);
      setStep("payment");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Could not initialize payment.");
    } finally {
      setCreatingIntent(false);
    }
  };

  // ── After Stripe confirms payment, create the order in our DB ──────────────
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPlacingOrder(true);

    try {
      await dispatch(
        createOrder({
          orderItems: orderItemsPayload,
          shippingAddress: address,
          paymentMethod: "Stripe",
          paymentIntentId,
        })
      ).unwrap();

      await dispatch(fetchCart());
      setClientSecret("");
      setStep("success");
    } catch (err: unknown) {
      let message = "Order could not be saved. Contact support with your payment ID.";

      if (typeof err === "string") {
        message = err;
      } else if (err instanceof Error) {
        message = err.message;
      } else {
        const axiosErr = err as AxiosError<{ message: string }>;
        message = axiosErr.response?.data?.message || message;
      }

      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setPlacingOrder(true);

    try {
      await dispatch(
        createOrder({
          orderItems: orderItemsPayload,
          shippingAddress: address,
          paymentMethod: "CashOnDelivery",
          paymentIntentId: null,
        })
      ).unwrap();

      await dispatch(fetchCart());
      setClientSecret("");
      toast.success("Order placed successfully!");
      setStep("success");
    } catch (err: unknown) {
      let message = "Failed to place order.";

      if (typeof err === "string") {
        message = err;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-dark mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to checkout.</p>
          <Link to="/login">
            <Button size="lg">Login Now</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (step !== "success" && !cartLoading && items.length === 0) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add items before checking out.</p>
          <Link to="/products">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </main>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <FiCheckCircle size={72} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-dark mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-2">
            Thank you, {address.fullName}. Your order has been confirmed.
          </p>
          {order && (
            <p className="text-sm text-gray-500 mb-6">
              Order #{order.id}
              <br />
              Total: ৳{order.totalAmount.toLocaleString()}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Link to="/orders">
              <Button size="lg">View My Orders</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-3 mb-10">
          {(["address", "payment"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s
                    ? "bg-primary text-white"
                    : i === 0 && step === "payment"
                    ? "bg-dark text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm font-medium capitalize ${step === s ? "text-dark" : "text-gray-400"}`}>
                {s === "address" ? "Shipping" : "Payment"}
              </span>
              {i === 0 && <div className="w-12 h-px bg-gray-200 ml-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form area */}
          <div className="lg:col-span-2">
            {step === "address" && (
              <form
                onSubmit={handleAddressSubmit}
                className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
              >
                <h2 className="font-black text-dark text-lg mb-2">Shipping Address</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark mb-1">Full Name</label>
                    <input
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-dark mb-1">Address</label>
                    <input
                      required
                      value={address.address}
                      onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))}
                      placeholder="House, Road, Area"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">City</label>
                    <input
                      required
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Postal Code</label>
                    <input
                      required
                      inputMode="numeric"
                      value={address.postalCode}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          postalCode: e.target.value,
                        }))
                      }
                      className="
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-4 py-3
                        text-sm
                        outline-none
                        focus:border-primary
                      "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Country</label>
                    <input
                      required
                      value={address.country}
                      onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 
                      text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">Phone</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      value={address.phone}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          phone: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="01XXXXXXXXX"
                      className="
                        w-full
                        border border-gray-200
                        rounded-xl
                        px-4 py-3
                        text-sm
                        outline-none
                        focus:border-primary
                      "
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full mt-4" loading={creatingIntent}>
                  Continue to Payment
                </Button>
              </form>
            )}

            {step === "payment" && clientSecret && publishableKey && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-black text-dark text-lg mb-4">Payment Details</h2>
                <Elements
                  stripe={getStripe(publishableKey)}
                  options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#fda702" } } }}
                >
                  <CheckoutPaymentForm
                    amount={grandTotal}
                    orderItems={orderItemsPayload}
                    shippingAddress={address}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCashOnDelivery={handleCashOnDelivery}
                    disabled={placingOrder}
                  />
                </Elements>
                <button
                  onClick={() => setStep("address")}
                  className="text-sm text-gray-400 hover:text-dark mt-4 transition-colors"
                >
                  ← Back to shipping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-black text-dark text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                    <img
                      src={getProductImageUrl(item.product.images?.[0], item.product.category, item.product.name)}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0"
                      onError={(e) => handleImageError(e, item.product.category, item.product.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">
                        Qty {item.quantity} {item.size && `· ${item.size}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-dark shrink-0">
                      ৳{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : `৳${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (5%)</span>
                  <span>৳{tax.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-black text-dark text-base">
                  <span>Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}