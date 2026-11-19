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
import { getImageUrl, getProductImageUrl, handleImageError, getAvatarUrl } from "../../utils/image";
import type { CartItem } from "../../types";
// ⬇️ import যোগ করো (উপরে অন্য imports-এর সাথে)
import { resetWishlist } from "../../store/slices/wishlistSlice";
import bdfLogo from "../../assets/BDFs.png";


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
  const [searchQuery, setSearchQuery] = useState("");

  const cartRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null;

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

  // Reset search query on route change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery("");
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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

  // Home / Logo instant top redirection
  const handleHomeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setMenuOpen(false);
      setCartOpen(false);
      setUserOpen(false);

      // Instant redirection to the top section of the page
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Ensure root URL without trailing hash
      navigate("/", { replace: true });

      // Guarantee top section view across all mobile & desktop browsers
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    },
    [navigate]
  );

  // Search handler
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setMenuOpen(false);
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
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-1.5 sm:gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleHomeClick}
            className="group flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
            aria-label="BDFashions Home"
          >
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-[#FDA702]/25 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <img
                src={bdfLogo}
                alt="BDFashions Logo"
                className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain rounded-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                onError={(e) => {
                  e.currentTarget.src = "/bdf-logo.png";
                }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={l.to === "/" ? handleHomeClick : undefined}
                className="text-gray-800 font-semibold text-[15px] hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search Box - Compact Pill in Top Row (Mobile & Desktop) */}
          <div className="flex items-center flex-1 min-w-0 max-w-[170px] xs:max-w-[210px] sm:max-w-[270px] md:max-w-[320px] lg:w-80 mx-1 sm:mx-2" ref={searchRef}>
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full rounded-full bg-white border border-gray-200 shadow-sm transition-all duration-300 focus-within:border-primary focus-within:shadow-md"
            >
              <FiSearch className="absolute left-2.5 sm:left-3 text-gray-400 text-xs sm:text-base pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search products"
                className="w-full py-1.5 sm:py-2 pl-7 sm:pl-9 pr-7 sm:pr-9 bg-transparent outline-none text-xs sm:text-sm placeholder:text-gray-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-primary text-white transition-all duration-300 hover:bg-dark active:scale-95 flex-shrink-0"
              >
                <FiSearch className="text-xs sm:text-sm" />
              </button>
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 flex-shrink-0">

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
                className={`relative flex items-center justify-center text-xl transition-colors duration-300 ${itemCount > 0 ? "text-primary" : "text-dark hover:text-primary"
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
                              src={getProductImageUrl(item.product?.images?.[0], item.product?.category, item.product?.name)}
                              alt={item.product?.name || "Product"}
                              className="w-14 h-14 rounded-lg object-cover bg-white border border-gray-100 flex-shrink-0"
                              loading="lazy"
                              onError={(e) => handleImageError(e, item.product?.category, item.product?.name)}
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
                onClick={(e) => {
                  setMenuOpen(false);
                  if (l.to === "/") {
                    handleHomeClick(e);
                  }
                }}
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