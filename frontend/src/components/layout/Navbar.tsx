import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsCart4 } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiTrash2,
  FiHeart 
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import { removeFromCart, updateCartItem, fetchCart } from "../../store/slices/cartSlice";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../../utils/image";
import type { CartItem } from "../../types";
// ⬇️ import যোগ করো (উপরে অন্য imports-এর সাথে)
import { resetWishlist } from "../../store/slices/wishlistSlice";


export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const { items, itemCount, total } = useAppSelector((s) => s.cart);
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const [cartBump, setCartBump] = useState(false);
  const prevItemCountRef = useRef(itemCount);
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5085/api";

const avatarUrl = user?.avatar
  ? `${API_BASE.replace("/api", "")}${user.avatar}`
  : null;

  // Handle scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trigger a "bump" animation only when items are ADDED (not removed)
useEffect(() => {
  if (itemCount > prevItemCountRef.current) {
    setCartBump(true);
    const timer = setTimeout(() => setCartBump(false), 500);
    prevItemCountRef.current = itemCount;
    return () => clearTimeout(timer);
  }
  prevItemCountRef.current = itemCount;
}, [itemCount]);

  // Fetch cart when user is logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  // Close search on route change - using setTimeout to avoid sync setState
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchOpen(false);
      setSearchQuery("");
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cart handlers
  const increaseQty = useCallback((item: CartItem) => {
    dispatch(
      updateCartItem({
        productId: item.productId,
        quantity: item.quantity + 1,
        size: item.size,
        color: item.color,
      })
    );
  }, [dispatch]);

  const decreaseQty = useCallback((item: CartItem) => {
    if (item.quantity <= 1) return;

    dispatch(
      updateCartItem({
        productId: item.productId,
        quantity: item.quantity - 1,
        size: item.size,
        color: item.color,
      })
    );
  }, [dispatch]);

  const handleRemoveFromCart = useCallback((item: CartItem) => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        size: item.size,
        color: item.color,
      })
    );
  }, [dispatch]);

  // Search handler
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setSearchOpen(false);
  }, [searchQuery, navigate]);

  // Logout handler — বদলাও
const handleLogout = useCallback(() => {
  dispatch(logout());
  dispatch(resetWishlist()); // ⬅️ নতুন লাইন
  navigate("/");
  setUserOpen(false);
}, [dispatch, navigate]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/#new", label: "New Arrival" },
    { to: "/products", label: "Products" },
    { to: "/#reviews", label: "Reviews" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-dark text-lg hover:opacity-80 transition-opacity"
          >
            <img 
              src="/src/assets/BDF LOGO.png" 
              alt="FashionBD Logo" 
              className="h-10 w-auto" // Adjust size as needed
            />
            <span className="hidden sm:inline">BDFashions</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-dark font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center relative" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className="relative flex items-center w-64 lg:w-80 rounded-full bg-white border border-gray-200 shadow-sm transition-all duration-300 focus-within:border-primary focus-within:shadow-md"
              >
                <FiSearch className="absolute left-3 text-gray-400 text-lg" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-12 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-1 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white transition-all duration-300 hover:bg-dark hover:scale-105 active:scale-95"
                >
                  <FiSearch className="text-base" />
                </button>
              </form>
            </div>

            {/* Search - Mobile Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-dark hover:text-primary text-xl"
              aria-label="Toggle search"
            >
              <FiSearch />
            </button>

            {/* Mobile Search Overlay */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 bg-white p-4 shadow-lg md:hidden">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full py-2 pl-10 pr-12 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm"
                    autoFocus
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white"
                  >
                    <FiSearch className="text-base" />
                  </button>
                </form>
              </div>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex items-center justify-center text-dark hover:text-primary transition-colors"
              aria-label="Wishlist"
            >
              <FiHeart size={22} className="transition-transform hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <div className="relative" ref={cartRef}>
              <motion.button
  onClick={() => { setCartOpen((p) => !p); setUserOpen(false); }}
  aria-label="Cart"
  animate={cartBump ? { scale: [1, 1.3, 0.95, 1.1, 1] } : { scale: 1 }}
  transition={{ duration: 0.5, ease: "easeInOut" }}
  className={`relative flex items-center justify-center text-xl transition-colors duration-300 ${
    itemCount > 0 ? "text-primary" : "text-dark hover:text-primary"
  }`}
>
  {/* Soft glow ring — flashes once when an item is added */}
  <AnimatePresence>
    {cartBump && (
      <motion.span
        initial={{ scale: 0.5, opacity: 0.6 }}
        animate={{ scale: 2.2, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-primary/40"
      />
    )}
  </AnimatePresence>

  <BsCart4 />

  <AnimatePresence>
    {itemCount > 0 && (
      <motion.span
        key={itemCount}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
      >
        {itemCount > 99 ? "99+" : itemCount}
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>

              {cartOpen && (
                <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white shadow-2xl rounded-xl p-4 z-50 max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-dark text-sm uppercase tracking-wide">
                      Your Cart ({itemCount})
                    </h3>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="text-gray-400 hover:text-dark transition-colors"
                    >
                      <FiX size={18} />
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🛒</div>
                      <p className="text-gray-400 text-sm">Your cart is empty</p>
                      <Link
                        to="/products"
                        onClick={() => setCartOpen(false)}
                        className="inline-block mt-3 text-primary text-sm font-medium hover:underline"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                        {items.map((item) => (
                          <div 
                            key={`${item.productId}-${item.size}-${item.color}`} 
                            className="flex gap-3 items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                          >
                            <img
                              src={getImageUrl(item.product.images?.[0])}
                              alt={item.product.name}
                              className="w-14 h-14 rounded-lg object-cover bg-white border border-gray-100 flex-shrink-0"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ৳{item.product.price.toLocaleString()}
                              </p>
                              <div className="mt-1 flex items-center border rounded-lg overflow-hidden bg-white w-fit">
                                <button
                                  onClick={() => decreaseQty(item)}
                                  disabled={item.quantity === 1}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => increaseQty(item)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">Total</span>
                          <span className="font-bold text-dark text-lg">
                            ৳{total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to="/cart"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center border border-primary text-primary px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            View Cart
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-dark transition-colors"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setUserOpen((p) => !p); setCartOpen(false); }}
                className="text-dark hover:text-primary text-xl"
                aria-label="User menu"
              >
                <FaUser />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white shadow-2xl rounded-xl p-4 z-50">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex-shrink-0">

    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt={user.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}

  </div>

  <div className="flex-1 min-w-0">
    <p className="font-semibold text-dark text-sm truncate">
      {user.name}
    </p>

    <p className="text-xs text-gray-500 truncate">
      {user.email}
    </p>
  </div>
</div>
                      <hr className="mb-3" />
                      <div className="flex flex-col gap-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setUserOpen(false)}
                          className="text-sm text-dark hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          My Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setUserOpen(false)}
                          className="text-sm text-dark hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          My Orders
                        </Link>
                        <Link 
                          to="/wishlist" 
                          onClick={() => setUserOpen(false)}
                          className="text-sm text-dark hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Wishlist
                        </Link>
                        {user.role === "admin" && (
                          <Link 
                            to="/admin" 
                            onClick={() => setUserOpen(false)}
                            className="text-sm text-primary font-medium px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button 
                          onClick={handleLogout}
                          className="text-sm text-center text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-dark font-semibold mb-3">Welcome!</p>
                      <Link 
                        to="/login" 
                        onClick={() => setUserOpen(false)}
                        className="block w-full text-center bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-dark transition-colors mb-2"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setUserOpen(false)}
                        className="block w-full text-center border border-dark text-dark py-2 rounded-lg text-sm font-medium hover:bg-dark hover:text-white transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMenuOpen((p) => !p)} 
              className="lg:hidden text-dark text-xl hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 border-t pt-4 flex flex-col gap-2 animate-fadeIn">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="text-dark font-medium hover:text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <>
                <hr className="my-2" />
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-primary font-medium text-sm px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-dark font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}