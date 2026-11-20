import { Link } from "react-router-dom";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiShieldOff, FiSearch,
  FiShoppingBag, FiClock, FiCheckCircle, FiDollarSign,
  FiUser, FiPhone, FiMapPin, FiPackage, FiChevronUp, FiChevronDown, FiTruck,
} from "react-icons/fi";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchProducts } from "../store/slices/productSlice";
import Button from "../components/ui/Button";
import { getImageUrl, getProductImageUrl, handleImageError } from "../utils/image";
import CategoryManager from "../components/Categorymanager";
import PaymentsManager from "../components/PaymentsManager";
import Pagination from "../components/common/Pagination";
import { useEffect, useState, useRef } from "react"; // ⬅️ useRef যোগ করো
import { productService, orderService, categoryService } from "../services/api"; // ⬅️ categoryService যোগ করো
import type { Product, Order, OrderStatus, Category } from "../types"; // ⬅️ Category যোগ করো

type Tab = "products" | "orders" | "categories" | "payments";
type PaymentStatus = "pending" | "paid";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  category: "",
  brand: "",
  imageFiles: [] as File[],
  existingImages: [] as string[],
  imageUrls: "",
  sizes: "",
  colors: "",
  tags: "",
  stock: 0,
  isNew: false,
  isFeatured: false,
};

const ORDER_STATUSES: OrderStatus[] = ["processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid"];

export default function AdminPage() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const { products, isLoading, total, totalPages } = useAppSelector((s) => s.products);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
const categoryFieldRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;
  const ORDERS_PER_PAGE = 20;

  // Pagination meta data for orders
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [courierBalance, setCourierBalance] = useState<number | null>(null);
  const [bookingCourierId, setBookingCourierId] = useState<number | null>(null);

  const [allBrands, setAllBrands] = useState<string[]>([]);
const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
const brandFieldRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
  if (categoryFieldRef.current && !categoryFieldRef.current.contains(e.target as Node)) {
    setCategoryDropdownOpen(false);
  }
  if (brandFieldRef.current && !brandFieldRef.current.contains(e.target as Node)) {
    setBrandDropdownOpen(false);
  }
};

  // Fetch products with pagination
  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(
        fetchProducts({
          page: productPage,
          limit: PRODUCTS_PER_PAGE,
        })
      );
    }
  }, [dispatch, user, productPage]);


  useEffect(() => {
  if (user?.role !== "admin") return;

  productService
    .getBrands()
    .then((res) => setAllBrands(res.data.data))
    .catch(() => {});
}, [user]);

  // Fetch all categories once, used for the searchable dropdown in the product form
useEffect(() => {
  if (user?.role !== "admin") return;

  categoryService
    .getAll()
    .then((res) => setAllCategories(res.data.data))
    .catch(() => {
      // Silent fail — dropdown just won't have suggestions, text input still works
    });
}, [user]);

// Close the category suggestion dropdown when clicking outside it
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (categoryFieldRef.current && !categoryFieldRef.current.contains(e.target as Node)) {
      setCategoryDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getAll({
        page: orderPage,
        limit: ORDERS_PER_PAGE,
      });
      setOrders(res.data.data.orders as unknown as Order[]);
      setOrdersTotal(res.data.data.total || 0);
      setOrdersTotalPages(res.data.data.totalPages || 1);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCourierBalance = async () => {
    try {
      const res = await orderService.getCourierBalance();
      if (res.data?.data?.configured) {
        setCourierBalance(res.data.data.balance);
      }
    } catch {
      // ignore
    }
  };

  // Fetch orders with pagination
  useEffect(() => {
    if (tab !== "orders" || user?.role !== "admin") return;
    fetchOrders();
    fetchCourierBalance();
  }, [tab, user, orderPage]);

  // Filter products (client-side filtering)
  const filteredProducts = products.filter((p) => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term)
    );
  });

  // Filter orders (client-side filtering)
  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.shippingAddress.fullName.toLowerCase().includes(term) ||
      o.shippingAddress.phone.toLowerCase().includes(term) ||
      String(o.id).includes(term);
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats calculations (using all orders, not just filtered)
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const processingCount = orders.filter((o) => o.orderStatus === "processing").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      brand: p.brand,
      imageFiles: [],
      existingImages: p.images || [],
      imageUrls: "",
      sizes: p.sizes.join("|"),
      colors: p.colors.join("|"),
      tags: p.tags.join("|"),
      stock: p.stock,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const removeExistingImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const clearAllExistingImages = () => {
    setForm((prev) => ({
      ...prev,
      existingImages: [],
    }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Name and category are required.");
      return;
    }

    setSaving(true);

    const parsedImageUrls = form.imageUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    // Combine preserved existing images + newly provided URLs
    const finalImageUrls = [...form.existingImages, ...parsedImageUrls];

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      category: form.category.trim(),
      brand: form.brand.trim() || "adidas",
      imageFiles: form.imageFiles,
      imageUrls: finalImageUrls,
      sizes: form.sizes.split("|").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split("|").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split("|").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      isNew: form.isNew,
      isFeatured: form.isFeatured,
    };

    try {
      if (editingId) {
        await productService.update(editingId, payload);
        toast.success("Product updated.");
      } else {
        await productService.create(payload);
        toast.success("Product created.");
      }
      setShowForm(false);
      dispatch(fetchProducts({ page: productPage, limit: PRODUCTS_PER_PAGE }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete this product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      await productService.delete(id);
      toast.success("Product deleted.");
      dispatch(fetchProducts({ page: productPage, limit: PRODUCTS_PER_PAGE }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to delete product.");
    }
  };

  const toggleOrder = (id: number) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const handleOrderStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const res = await orderService.updateStatus(orderId, status);
      const updated = res.data?.data as unknown;

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            orderStatus: status,
            paymentStatus: status === "delivered" ? "paid" : o.paymentStatus,
            updatedAt: new Date().toISOString(),
            // Merge in tracking info if the backend returned it
            // (e.g. Steadfast consignment created on "shipped").
            ...(typeof updated === "object" && updated !== null ? (updated as Partial<Order>) : {}),
          };
        })
      );

      const statusMessages: Record<OrderStatus, string> = {
        processing: "Order is now being processed.",
        shipped: "Order marked as shipped & booked with Steadfast! 🚚",
        delivered: "Order delivered and payment marked as paid ✅",
        cancelled: "Order has been cancelled.",
      };

      toast.success(statusMessages[status] || `Order status updated to ${status}.`);
      fetchOrders();
      fetchCourierBalance();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to update order status.");
    }
  };

  const handleBookCourier = async (orderId: number) => {
    setBookingCourierId(orderId);
    try {
      const res = await orderService.bookCourier(orderId);
      const data = res.data?.data;
      if (data) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  consignmentId: data.consignmentId,
                  trackingCode: data.trackingCode,
                  deliveryStatus: data.deliveryStatus,
                  orderStatus: "shipped",
                }
              : o
          )
        );
      }
      toast.success("Order booked successfully with Steadfast Courier! 🚚");
      fetchOrders();
      fetchCourierBalance();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to book courier on Steadfast.");
    } finally {
      setBookingCourierId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: number, paymentStatus: PaymentStatus) => {
    const previous = orders.find((o) => o.id === orderId)?.paymentStatus;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o
      )
    );

    try {
      await orderService.updatePaymentStatus(orderId, paymentStatus);
      toast.success(`Payment status updated to ${paymentStatus}.`);
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: previous ?? o.paymentStatus } : o))
      );
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to update payment status.");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await orderService.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted.");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to delete order.");
    }
  };

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <FiShieldOff size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-dark mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login as an administrator.</p>
          <Link to="/login"><Button size="lg">Login Now</Button></Link>
        </div>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center bg-light">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-sm">
          <FiShieldOff size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-black text-dark">Access Denied</h1>
          <p className="text-gray-400 mt-2 text-sm">Only administrators can access this page.</p>
          <Link to="/"><Button variant="outline" className="mt-6">Back to Home</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-dark mb-1 sm:mb-2">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">Manage products, orders, categories, and payments</p>

        <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-white rounded-2xl p-1.5 w-full sm:w-fit border border-gray-100 overflow-x-auto scrollbar-none shadow-xs">
          {(["products", "orders", "categories", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 sm:flex-initial text-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all ${
                tab === t ? "bg-primary text-white shadow-xs" : "text-gray-400 hover:text-dark hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ═══════════════════════ PRODUCTS ═══════════════════════ */}
        {tab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <FiSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setProductPage(1);
                  }}
                  placeholder="Search product, category or brand..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
              <Button onClick={openCreateForm} className="w-full sm:w-auto justify-center">
                <FiPlus className="mr-2" /> Add Product
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-light text-left text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading products...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products found.</td></tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getProductImageUrl(p.images?.[0], p.category, p.name)}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                onError={(e) => handleImageError(e, p.category, p.name)}
                              />
                              <div>
                                <h3 className="font-semibold text-dark">{p.name}</h3>
                                <p className="text-xs text-gray-400">{p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{p.category}</td>
                          <td className="px-4 py-4 font-bold text-dark">৳{p.price.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              p.stock > 10 ? "bg-green-100 text-green-700"
                              : p.stock > 0 ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}>
                              {p.stock} in stock
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {p.isNew && <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">New</span>}
                              {p.isFeatured && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Featured</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <button onClick={() => openEditForm(p)} className="p-2 text-gray-400 hover:text-primary transition" title="Edit">
                              <FiEdit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition" title="Delete">
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {total > PRODUCTS_PER_PAGE && (
                <Pagination
                  page={productPage}
                  totalPages={totalPages}
                  total={total}
                  limit={PRODUCTS_PER_PAGE}
                  onPageChange={setProductPage}
                  className="border-t"
                />
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════ ORDERS ═══════════════════════ */}
        {tab === "orders" && (
          <div>
            {courierBalance !== null && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200/70 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FiTruck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Steadfast Courier Connected</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">Active</span>
                    </div>
                    <p className="text-xs text-emerald-700">Automatic parcel booking enabled on shipped orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-600 font-medium">Steadfast Balance</p>
                    <p className="text-base sm:text-lg font-black text-emerald-900">৳{courierBalance.toLocaleString()}</p>
                  </div>
                  <a
                    href="https://steadfast.com.bd/user/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Portal ↗
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
              <StatCard label="Total Orders" value={ordersTotal || orders.length} icon={<FiShoppingBag />} color="blue" />
              <StatCard label="Processing" value={processingCount} icon={<FiClock />} color="yellow" />
              <StatCard label="Delivered" value={deliveredCount} icon={<FiCheckCircle />} color="green" />
              <StatCard label="Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon={<FiDollarSign />} color="purple" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 mb-6 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FiSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={orderSearch}
                    onChange={(e) => {
                      setOrderSearch(e.target.value);
                      setOrderPage(1);
                    }}
                    placeholder="Search customer, phone or order #..."
                    className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                  className="h-11 sm:h-12 rounded-xl border border-gray-200 px-3.5 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none capitalize w-full sm:w-48 shrink-0 font-medium"
                >
                  <option value="all">All Orders</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">No orders found.</div>
              ) : (
                filteredOrders.map((o) => {
                  const totalQty = o.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                  const isExpanded = expandedOrder === o.id;

                  return (
                    <div key={o.id} className="rounded-2xl border border-gray-100 bg-white shadow-xs hover:shadow-md transition-all overflow-hidden">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <h2 className="text-lg sm:text-xl font-black text-dark">Order #{o.id}</h2>
                              <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold capitalize ${
                                o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {o.paymentStatus}
                              </span>
                              {o.trackingCode && (
                                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-purple-50 text-purple-600">
                                  Steadfast
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 sm:mt-2.5 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center gap-1.5"><FiUser size={13} className="shrink-0" /> <span className="truncate">{o.shippingAddress.fullName}</span></span>
                              <span className="flex items-center gap-1.5"><FiPhone size={13} className="shrink-0" /> {o.shippingAddress.phone}</span>
                              <span className="flex items-center gap-1.5"><FiMapPin size={13} className="shrink-0" /> {o.shippingAddress.city}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col justify-between items-baseline sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                            <div className="text-xl sm:text-2xl font-black text-primary">৳{o.totalAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {o.orderItems?.length ?? 0} product{(o.orderItems?.length ?? 0) !== 1 ? "s" : ""} · {totalQty} qty
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 sm:gap-3 mt-4 pt-3.5 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 w-full sm:w-auto">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                              disabled={o.orderStatus === "cancelled"}
                              className="w-full sm:w-auto border border-gray-200 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm capitalize outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 font-medium"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                            </select>

                            <select
                              value={o.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(o.id, e.target.value as PaymentStatus)}
                              disabled={o.orderStatus === "delivered" || o.orderStatus === "cancelled"}
                              className="w-full sm:w-auto border border-gray-200 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm capitalize outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 font-medium"
                            >
                              {PAYMENT_STATUSES.map((s) => (
                                <option key={s} value={s} className="capitalize">{s}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {o.orderStatus === "cancelled" && (
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                                title="Delete order"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => toggleOrder(o.id)}
                              className="flex-1 sm:flex-initial justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-white flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold hover:bg-primary-dark transition-colors shadow-xs"
                            >
                              <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 p-3.5 sm:p-6 bg-light/40">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            <div className="lg:col-span-2">
                              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <FiPackage className="text-primary" />
                                <h3 className="text-sm sm:text-base font-bold text-dark">
                                  Ordered Products ({o.orderItems?.length ?? 0})
                                </h3>
                              </div>

                              <div className="space-y-2.5 sm:space-y-3">
                                {(o.orderItems ?? []).map((item, index) => (
                                  <div key={index}
                                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/30 transition-all">
                                    <img
                                      src={getImageUrl(item.productImage)}
                                      alt={item.productName}
                                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0"
                                      onError={(e) => handleImageError(e, undefined, item.productName)}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                          <h4 className="font-semibold text-dark text-xs sm:text-sm line-clamp-2">{item.productName}</h4>
                                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.size && (
                                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-700">Size: {item.size}</span>
                                            )}
                                            {item.color && (
                                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px]">Color: {item.color}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <p className="text-[11px] sm:text-xs text-gray-400">Unit Price</p>
                                          <p className="font-bold text-dark text-xs sm:text-sm">৳{item.price.toLocaleString()}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs">
                                        <span className="text-gray-400">Qty: <strong className="text-dark">{item.quantity}</strong></span>
                                        <span className="text-gray-400">
                                          Subtotal: <strong className="text-dark">৳{(item.quantity * item.price).toLocaleString()}</strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4 sm:space-y-5">
                              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                                <h3 className="font-bold text-dark mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider text-gray-400">Payment Summary</h3>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  <Row label="Subtotal" value={`৳${o.subTotal.toLocaleString()}`} />
                                  <Row label="Shipping" value={o.shippingCost === 0 ? "FREE" : `৳${o.shippingCost}`} />
                                  <Row label="Tax" value={`৳${o.tax.toFixed(2)}`} />
                                  <hr className="my-1 border-gray-100" />
                                  <div className="flex justify-between font-black text-dark text-sm sm:text-base">
                                    <span>Total</span>
                                    <span className="text-primary">৳{o.totalAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                                <h3 className="font-bold text-dark mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider text-gray-400">Delivery Information</h3>
                                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                                  <div>
                                    <p className="text-gray-400 text-[11px]">Customer</p>
                                    <p className="font-medium text-dark">{o.shippingAddress.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-[11px]">Phone</p>
                                    <p className="font-medium text-dark">{o.shippingAddress.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-[11px]">Address</p>
                                    <p className="text-dark leading-relaxed">
                                      {o.shippingAddress.address}<br />
                                      {o.shippingAddress.city}, {o.shippingAddress.postalCode}<br />
                                      {o.shippingAddress.country}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Courier / Steadfast tracking */}
                              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                  <h3 className="font-bold text-dark text-xs sm:text-sm uppercase tracking-wider text-gray-400">Steadfast Courier</h3>
                                  <FiTruck className="text-primary" size={16} />
                                </div>
                                {o.trackingCode ? (
                                  <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                                    <div>
                                      <p className="text-gray-400 text-[11px]">Tracking Code</p>
                                      <p className="font-mono font-bold text-dark text-sm sm:text-base break-all select-all">{o.trackingCode}</p>
                                    </div>
                                    {o.consignmentId && (
                                      <div>
                                        <p className="text-gray-400 text-[11px]">Consignment ID</p>
                                        <p className="font-mono text-xs text-gray-600">#{o.consignmentId}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-gray-400 text-[11px]">Courier Status</p>
                                      <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize bg-blue-50 text-blue-600">
                                        {(o.deliveryStatus ?? "pending").replace(/_/g, " ")}
                                      </span>
                                    </div>
                                    <a
                                      href={`https://steadfast.com.bd/t/${o.trackingCode}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition"
                                    >
                                      <span>Track Live on Steadfast</span>
                                      <span>↗</span>
                                    </a>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                      {o.orderStatus === "processing"
                                        ? "Consignment is automatically created when order is marked as Shipped."
                                        : "No courier consignment linked to this order yet."}
                                    </p>
                                    {o.orderStatus !== "cancelled" && (
                                      <button
                                        type="button"
                                        onClick={() => handleBookCourier(o.id)}
                                        disabled={bookingCourierId === o.id}
                                        className="w-full py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                                      >
                                        <FiTruck size={15} />
                                        <span>{bookingCourierId === o.id ? "Booking with Steadfast..." : "Book with Steadfast Now"}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {ordersTotal > ORDERS_PER_PAGE && (
              <div className="mt-6">
                <Pagination
                  page={orderPage}
                  totalPages={ordersTotalPages}
                  total={ordersTotal}
                  limit={ORDERS_PER_PAGE}
                  onPageChange={setOrderPage}
                  className="bg-white rounded-2xl border border-gray-100"
                />
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
        {tab === "categories" && <CategoryManager />}

        {/* ═══════════════════════ PAYMENTS ═══════════════════════ */}
        {tab === "payments" && <PaymentsManager />}
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="font-black text-dark text-base sm:text-lg">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-dark p-1">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Price (৳) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                {/* ✅ নতুন — searchable autocomplete dropdown */}
<div ref={categoryFieldRef} className="relative">
  <label className="block text-sm font-medium text-dark mb-1">Category *</label>
  <input
    required
    value={form.category}
    onChange={(e) => {
      setForm((f) => ({ ...f, category: e.target.value }));
      setCategoryDropdownOpen(true);
    }}
    onFocus={() => setCategoryDropdownOpen(true)}
    placeholder="Type to search or add new category..."
    autoComplete="off"
    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
  />

  {categoryDropdownOpen && (
    () => {
      const term = form.category.toLowerCase().trim();
      const matches = allCategories.filter((c) => c.name.toLowerCase().includes(term));
      const exactMatch = allCategories.some((c) => c.name.toLowerCase() === term);

      return (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {matches.length > 0 ? (
            matches.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, category: c.name }));
                  setCategoryDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-light transition-colors flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-xs text-gray-400">{c.productCount} products</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">No matching category.</div>
          )}

          {term && !exactMatch && (
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 border-t border-gray-100 transition-colors"
            >
              + Use "{form.category}" as new category
            </button>
          )}
        </div>
      );
    }
  )()}
</div>

<div ref={brandFieldRef} className="relative">
  <label className="block text-sm font-medium text-dark mb-1">Brand *</label>
  <input
    required
    value={form.brand}
    onChange={(e) => {
      setForm((f) => ({ ...f, brand: e.target.value }));
      setBrandDropdownOpen(true);
    }}
    onFocus={() => setBrandDropdownOpen(true)}
    placeholder="Type to search or add new brand..."
    autoComplete="off"
    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
  />

  {brandDropdownOpen && (
    () => {
      const term = form.brand.toLowerCase().trim();
      const matches = allBrands.filter((b) => b.toLowerCase().includes(term));
      const exactMatch = allBrands.some((b) => b.toLowerCase() === term);

      return (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {matches.length > 0 ? (
            matches.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, brand: b }));
                  setBrandDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-dark hover:bg-light transition-colors"
              >
                {b}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">No matching brand.</div>
          )}

          {term && !exactMatch && (
            <button
              type="button"
              onClick={() => setBrandDropdownOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 border-t border-gray-100 transition-colors"
            >
              + Use "{form.brand}" as new brand
            </button>
          )}
        </div>
      );
    }
  )()}
</div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Stock *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2 space-y-4">
                  {/* Existing images list (when editing a product) */}
                  {form.existingImages.length > 0 && (
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Current Product Images ({form.existingImages.length})
                        </label>
                        <button
                          type="button"
                          onClick={clearAllExistingImages}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold underline"
                        >
                          Clear All Existing
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {form.existingImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-xs">
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={`Existing image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, form.category, form.name, idx)}
                            />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] text-center py-0.5 truncate px-1">
                              {idx === 0 ? "★ Primary" : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              title="Delete this image"
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition transform hover:scale-110"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">
                        Click × to remove an old image. Uploading new images below will add them to this product.
                      </p>
                    </div>
                  )}

                  {/* Upload new images from device */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Upload Images from Device (Multiple Allowed)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setForm((prev) => ({
                            ...prev,
                            imageFiles: [...prev.imageFiles, ...files],
                          }));
                        }
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Hold Ctrl/Cmd to select multiple images. Each uploaded image is uniquely stored.
                    </p>

                    {form.imageFiles.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                        <p className="w-full text-xs font-semibold text-blue-700 mb-1">
                          New files selected to upload ({form.imageFiles.length}):
                        </p>
                        {form.imageFiles.map((file, index) => (
                          <div key={index} className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-sm">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New file ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[9px] text-center py-0.5 truncate px-1">
                              New #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              title="Remove file"
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition transform hover:scale-110"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* External direct image URLs */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Or Direct Image URLs (Permanent CDN e.g. Unsplash, Cloudinary, ImgBB)
                    </label>
                    <textarea
                      rows={2}
                      value={form.imageUrls}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrls: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-xxx (separate multiple URLs by new line or comma)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Direct URLs are permanent and load instantly across all devices without depending on server disk.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Sizes (pipe-separated)</label>
                  <input
                    value={form.sizes}
                    onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                    placeholder="S|M|L|XL"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Colors (pipe-separated)</label>
                  <input
                    value={form.colors}
                    onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                    placeholder="Black|White|Red"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark mb-1">Tags (pipe-separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="running|sport|cotton"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isNew}
                      onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                      className="accent-primary w-4 h-4"
                    />
                    Mark as New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      className="accent-primary w-4 h-4"
                    />
                    Mark as Featured
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving} className="flex-1">
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "purple";
}) {
  const bg = { blue: "bg-blue-50", yellow: "bg-yellow-50", green: "bg-green-50", purple: "bg-purple-50" }[color];
  const iconBg = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  }[color];

  return (
    <div className={`${bg} rounded-2xl p-3 sm:p-5 border border-black/5`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{label}</p>
          <h2 className="text-lg sm:text-2xl font-black text-dark mt-0.5 sm:mt-1 truncate">{value}</h2>
        </div>
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}