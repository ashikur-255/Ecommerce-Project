import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiChevronRight,
  FiXCircle,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchMyOrders } from "../store/slices/orderSlice";
import { getImageUrl, getProductImageUrl, handleImageError } from "../utils/image";

import { orderService } from "../services/api";

import Button from "../components/ui/Button";

import type { OrderStatus, PaymentStatus } from "../types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  processing: "bg-amber-50 text-amber-600 border border-amber-100",
  shipped: "bg-blue-50 text-blue-600 border border-blue-100",
  delivered: "bg-green-50 text-green-600 border border-green-100",
  cancelled: "bg-red-50 text-red-600 border border-red-100",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-gray-100 text-gray-600 border border-gray-200",
  paid: "bg-green-50 text-green-600 border border-green-100",
  failed: "bg-red-50 text-red-600 border border-red-100",
  refunded: "bg-purple-50 text-purple-600 border border-purple-100",
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((s) => s.auth);
  const { orders, isLoading } = useAppSelector((s) => s.orders);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchMyOrders({ page: 1, limit: 20 }));
    }
  }, [dispatch, user]);

  const refreshOrders = () => {
    dispatch(fetchMyOrders({ page: 1, limit: 20 }));
  };

  const handleCancelOrder = async (
    e: React.MouseEvent,
    orderId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(orderId);

      await orderService.cancelOrder(orderId);

      await Swal.fire({
        icon: "success",
        title: "Order Cancelled",
        text: "Your order has been cancelled successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      refreshOrders();
    } catch (error: unknown) {
  let errorMessage = "Something went wrong.";

  if (error instanceof Error) {
    const axiosError = error as AxiosError<{
      message?: string;
    }>;

    errorMessage =
      axiosError.response?.data?.message ??
      error.message ??
      errorMessage;
  }

  Swal.fire({
    icon: "error",
    title: "Cancellation Failed",
    text: errorMessage,
  });
} finally {
  setActionLoading(null);
}
  };

  const handleDeleteOrder = async (
    e: React.MouseEvent,
    orderId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This order will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoading(orderId);

      await orderService.deleteMyOrder(orderId);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Order deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      refreshOrders();
    } catch (error: unknown) {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  Swal.fire({
    icon: "error",
    title: "Delete Failed",
    text:
      err.response?.data?.message ||
      "Something went wrong.",
  });
} finally {
  setActionLoading(null);
}
  };

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiPackage
            size={64}
            className="text-gray-200 mx-auto mb-4"
          />

          <h2 className="text-2xl font-black text-dark mb-2">
            Login Required
          </h2>

          <p className="text-gray-400 mb-6">
            Please login to view your orders.
          </p>

          <Link to="/login">
            <Button size="lg">Login Now</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-dark mb-8">
          My Orders
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage
              size={64}
              className="text-gray-200 mx-auto mb-4"
            />

            <h2 className="text-xl font-bold text-dark mb-2">
              No orders yet
            </h2>

            <p className="text-gray-400 mb-6">
              Once you place an order, it will show up here.
            </p>

            <Link to="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
              >
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/orders/${order.id}`)
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-dark text-lg">
                        Order #{order.id}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}

                        {" • "}

                        {order.orderItems.length} item
                        {order.orderItems.length > 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.orderStatus]}`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${PAYMENT_STYLES[order.paymentStatus]}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xl font-black text-dark">
                        ৳
                        {order.totalAmount.toFixed(2)}
                      </p>

                      <FiChevronRight className="text-gray-300" />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 flex-wrap">
                    {order.orderItems
                      .slice(0, 5)
                      .map((item, i) => (
                        <img
                        key={i}
                        src={getProductImageUrl(item.productImage, undefined, item.productName)}
                        alt={item.productName}
                        loading="lazy"
                        onError={(e) => handleImageError(e, undefined, item.productName)}
                        className="
                          w-14
                          h-14
                          rounded-xl
                          object-cover
                          bg-gray-100
                          border
                          border-gray-100
                          transition-transform
                          duration-300
                          hover:scale-105
                        "
                      />
                      ))}

                    {order.orderItems.length > 5 && (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                        +
                        {order.orderItems.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}

                {/* ACTION BUTTONS */}
<div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
  
  {/* Cancel Order */}
  {order.orderStatus === "processing" && (
    <button
      type="button"
      onClick={(e) => handleCancelOrder(e, order.id)}
      disabled={actionLoading === order.id}
      className="
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        bg-red-50
        text-red-600
        font-semibold
        transition-all duration-200
        hover:bg-red-100
        hover:shadow-sm
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      <FiXCircle className="text-lg" />

      {actionLoading === order.id
        ? "Cancelling..."
        : "Cancel Order"}
    </button>
  )}

  {/* Delete Order (Only Cancelled Orders) */}
  {order.orderStatus === "cancelled" && (
    <button
      type="button"
      onClick={(e) => handleDeleteOrder(e, order.id)}
      disabled={actionLoading === order.id}
      className="
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        bg-gray-100
        text-gray-700
        font-semibold
        transition-all duration-200
        hover:bg-red-50
        hover:text-red-600
        hover:shadow-sm
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      <FiTrash2 className="text-lg" />

      {actionLoading === order.id
        ? "Deleting..."
        : "Delete Order"}
    </button>
  )}
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}