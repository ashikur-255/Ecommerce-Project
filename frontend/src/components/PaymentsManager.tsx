import { useEffect, useRef, useState } from "react";
import { FiSearch, FiDollarSign, FiCreditCard, FiSmartphone, FiTruck } from "react-icons/fi";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { adminPaymentService } from "../services/api";
import type { Payment } from "../types";

const PROVIDER_STYLES: Record<Payment["provider"], { label: string; classes: string; icon: React.ReactNode }> = {
  Stripe: { label: "Stripe", classes: "bg-indigo-100 text-indigo-700", icon: <FiCreditCard size={14} /> },
  Bkash: { label: "bKash", classes: "bg-pink-100 text-pink-700", icon: <FiSmartphone size={14} /> },
  Nagad: { label: "Nagad", classes: "bg-orange-100 text-orange-700", icon: <FiSmartphone size={14} /> },
  Rocket: { label: "Rocket", classes: "bg-purple-100 text-purple-700", icon: <FiSmartphone size={14} /> },
  CashOnDelivery: { label: "Cash on Delivery", classes: "bg-green-100 text-green-700", icon: <FiTruck size={14} /> },
};

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<"all" | Payment["provider"]>("all");

  // Prevents React StrictMode's dev-only double-invoke of effects from
  // firing the request (and the error toast) twice.
  const hasLoaded = useRef(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadPayments = async () => {
      setLoading(true);
      try {
        const res = await adminPaymentService.getAll({
  status: "Completed",
  page,
  limit: 20,
});
        setPayments(res.data.data.payments as Payment[]);
      } catch (err) {
        // ✅ show the REAL reason instead of a generic message
        const error = err as AxiosError<{ message: string }>;
        const backendMessage = error.response?.data?.message;

        if (error.response?.status === 404) {
          toast.error("Payments endpoint not found (404). Is PaymentsController.cs added to the project?");
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Not authorized — please log in again as admin.");
        } else if (backendMessage) {
          toast.error(backendMessage);
        } else if (!error.response) {
          toast.error("Can't reach the server. Is the API running?");
        } else {
          toast.error(`Failed to load payments (${error.response.status}).`);
        }

        console.error("GET /api/payments failed:", error.response?.status, error.response?.data ?? error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const matchesProvider = providerFilter === "all" || p.provider === providerFilter;
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      String(p.id).includes(term) ||
      String(p.orderId ?? "").includes(term) ||
      (p.providerReference ?? "").toLowerCase().includes(term) ||
      (p.providerTransactionId ?? "").toLowerCase().includes(term);
    return matchesProvider && matchesSearch;
  });

  const totalConfirmed = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-green-50 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed Payments</p>
              <h2 className="text-2xl font-black text-dark mt-1">{filtered.length}</h2>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-green-100 text-green-600">
              <FiDollarSign />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Confirmed Amount</p>
              <h2 className="text-2xl font-black text-dark mt-1">৳{totalConfirmed.toLocaleString()}</h2>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-blue-100 text-blue-600">
              <FiDollarSign />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="relative max-w-md w-full">
          <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by payment #, order #, or reference..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value as typeof providerFilter)}
          className="h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="all">All Methods</option>
          <option value="Stripe">Stripe</option>
          <option value="Bkash">bKash</option>
          <option value="Nagad">Nagad</option>
          <option value="Rocket">Rocket</option>
          <option value="SslCommerz">SslCommerz</option>
          <option value="CashOnDelivery">Cash on Delivery</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-light text-left text-gray-500 font-semibold">
              <tr>
                <th className="px-4 py-3">Payment #</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Loading payments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No confirmed payments yet.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const style =
  PROVIDER_STYLES[p.provider as keyof typeof PROVIDER_STYLES] ?? {
    label: p.provider?.toString() ?? "Unknown",
    classes: "bg-gray-100 text-gray-700",
    icon: <FiDollarSign size={14} />,
  };
                  return (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-semibold text-dark">#{p.id}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.classes}`}>
                          {style.icon}
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-dark">
                        {p.currency} {p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {p.orderId ? `#${p.orderId}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs font-mono max-w-[200px] truncate">
                        {p.providerTransactionId ?? p.providerReference ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}