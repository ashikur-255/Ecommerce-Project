import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchOrderById } from "../store/slices/orderSlice";
import type { OrderStatus, PaymentStatus } from "../types";
import { getImageUrl } from "../utils/image";

const STATUS_STYLES: Record<OrderStatus, string> = {
  processing: "bg-amber-50 text-amber-600",
  shipped:    "bg-blue-50 text-blue-600",
  delivered:  "bg-green-50 text-green-600",
  cancelled:  "bg-red-50 text-red-600",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending:  "bg-gray-100 text-gray-500",
  paid:     "bg-green-50 text-green-600",
  failed:   "bg-red-50 text-red-600",
  refunded: "bg-purple-50 text-purple-600",
};

const STEPS: OrderStatus[] = ["processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { order, isLoading } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(parseInt(id, 10)));
  }, [id, dispatch]);

  if (isLoading || !order) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-light rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.orderStatus as OrderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-dark mb-6 transition-colors">
          <FiArrowLeft /> Back to Orders
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-black text-dark">Order #{order.id}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.orderStatus as OrderStatus]}`}>
              {order.orderStatus}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${PAYMENT_STYLES[order.paymentStatus as PaymentStatus]}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center">
              {STEPS.map((stepName, i) => (
                <div key={stepName} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      i <= currentStepIndex ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs mt-2 capitalize font-medium ${
                      i <= currentStepIndex ? "text-dark" : "text-gray-400"
                    }`}>
                      {stepName}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIndex ? "bg-primary" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-dark mb-4">
              Items ({order.orderItems.length})
            </h2>

            <div className="space-y-4">
              {order.orderItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={getImageUrl(item.productImage)}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-xl bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">
                      {item.productName}
                    </p>

                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && " • "}
                        {item.color && `Color: ${item.color}`}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold text-dark">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Address + Tracking */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-dark mb-4">Payment Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>৳{order.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? "FREE" : `৳${order.shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span>৳{order.tax.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-black text-dark">
                  <span>Total</span><span>৳{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-dark mb-4">Shipping Address</h2>
              <p className="text-sm text-dark font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.address}</p>
              <p className="text-sm text-gray-500">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm text-gray-500">{order.shippingAddress.country}</p>
              <p className="text-sm text-gray-500 mt-1">📞 {order.shippingAddress.phone}</p>
            </div>

            {/* Courier Tracking */}
            {order.trackingCode && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-dark mb-4">Track Your Delivery</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Tracking Code</p>
                    <p className="font-mono font-bold text-dark text-lg">{order.trackingCode}</p>
                  </div>
                  {order.deliveryStatus && (
                    <div>
                      <p className="text-xs text-gray-400">Courier Status</p>
                      <span className="inline-block mt-1 px-3 py-1.5 rounded-full text-xs font-semibold capitalize bg-blue-50 text-blue-600">
                        {order.deliveryStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  <a
                    href={`https://steadfast.com.bd/t/${order.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center mt-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Track Package on Steadfast
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}