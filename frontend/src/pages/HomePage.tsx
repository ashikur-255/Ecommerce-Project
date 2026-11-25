import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Swal from "sweetalert2";
import { 
  FiShoppingCart, 
  FiArrowRight, 
  FiShoppingBag, 
  FiTruck, 
  FiShield, 
  FiRefreshCw 
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

import ScrollToTopButton from "../components/ui/ScrollToTopButton";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchNewArrivals, fetchFeatured } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import { categoryService } from "../services/api";
import StarRating from "../components/ui/StarRating";
import {
  getImageUrl,
  getProductImageUrl,
  getCategoryImageUrl,
  handleImageError,
  handleCategoryImageError,
} from "../utils/image";
import type { Category } from "../types";
import StatsSection from "../components/home/StatsSection";
import ExclusiveClubSection from "../components/home/ExclusiveClubSection";
import FlashSaleBanner from "../components/home/FlashSaleBanner";
import heroMobile from "../assets/Elegant BDFashions City Stroll.png";

const REVIEWS = [
  {
    name: "John Smith",
    avatar: "/reviews/John.jpg",
    rating: 5,
    text: "Amazing quality, premium materials, and super fast delivery. Definitely shopping here again!",
  },
  {
    name: "Sarah Johnson",
    avatar: "/reviews/Sarah.jpg",
    rating: 5,
    text: "Excellent customer support and a seamless shopping experience. Highly satisfied with my purchase.",
  },
  {
    name: "Michael Brown",
    avatar: "/reviews/Michael.jpg",
    rating: 5,
    text: "Outstanding products and great value for money. I would highly recommend this store to everyone.",
  },
];

const btnClip = {
  clipPath: "polygon(100% 0, 93% 50%, 86% 99%, 0% 100%, 7% 47%, 13% 0%)",
};

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { newArrivals = [], featured = [], isLoading, error } = useAppSelector(
    (s) => s.products ?? { newArrivals: [], featured: [], isLoading: false, error: null }
  );
  const { user } = useAppSelector((s) => s.auth ?? {});

  const featuredProducts = [...featured]
    .filter((p) => p && p.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchNewArrivals());
    dispatch(fetchFeatured());
  }, [dispatch]);

 // In HomePage.tsx - Updated category fetch that handles API response correctly

// In HomePage.tsx - Updated category fetch
useEffect(() => {
  let cancelled = false;
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await categoryService.getAll();
      
      // 🔍 Debug - Log the full response
      console.log("📦 Categories API Full Response:", res);
      console.log("📦 Categories API Data:", res.data);
      console.log("📦 Categories API Data.data:", res.data?.data);
      
      if (!cancelled) {
        let cats: Category[] = [];
        
        // The API returns: { success: true, message: "Success", data: [...] }
        // So we need to access res.data.data
        if (res?.data?.data && Array.isArray(res.data.data)) {
          cats = res.data.data;
          console.log("✅ Categories found in res.data.data:", cats.length);
        } 
        // Fallback: if res.data is an array directly
        else if (Array.isArray(res.data)) {
          cats = res.data;
          console.log("✅ Categories found in res.data:", cats.length);
        }
        // Fallback: if res is an array
        else if (Array.isArray(res)) {
          cats = res;
          console.log("✅ Categories found in res:", cats.length);
        }
        else {
          console.error("❌ Unexpected categories response format:", res);
          setCategoriesError("Invalid data format from server.");
          cats = [];
        }
        
        setCategories(cats);
      }
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
      if (!cancelled) {
        setCategoriesError("Failed to load categories.");
        setCategories([]);
      }
    } finally {
      if (!cancelled) setCategoriesLoading(false);
    }
  };
  
  fetchCategories();
  return () => { cancelled = true; };
}, []);

  const handleQuickAddToCart = async (productId: number) => {
    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to your cart.",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      });
      if (result.isConfirmed) navigate("/login");
      return;
    }
    try {
      await dispatch(
        addToCart({
          productId,
          quantity: 1,
          size: "",
          color: "",
        })
      ).unwrap();
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product added successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to add product to cart.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <main>
      <ScrollToTopButton />
      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-[100dvh] md:min-h-screen bg-black text-white overflow-hidden pt-16 lg:pt-20 flex items-center"
      >
        {/* ── Background layer ── */}
        <div className="absolute inset-0">
          {/* Mobile background */}
          <img
            src={heroMobile}
            alt="BDF Hero Mobile"
            fetchPriority="high"
            className="w-full h-full object-cover object-top opacity-80 md:hidden"
            onError={(e) => { e.currentTarget.src = "/hero-mobile.png"; }}
          />
          {/* Desktop background */}
          <img
            src="/Logo of BDF.png"
            alt="BDF Hero Desktop"
            fetchPriority="high"
            className="hidden md:block w-full h-full object-cover object-center opacity-60"
            onError={(e) => { e.currentTarget.src = "/Logo of BDF.png"; }}
          />

          {/* ── Mobile overlay: multi-stop gradient for luxe depth ── */}
          <div className="absolute inset-0 md:hidden">
            {/* Top vignette to protect header area */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent" />
            {/* Bottom content gradient – strong enough to read white text */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
            {/* Cinematic horizontal warm tint (subtle left orange) */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-transparent" />
          </div>

          {/* Desktop cinematic horizontal gradient */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        </div>

        {/* ════════════════════════════════
            MOBILE CONTENT LAYOUT
            ════════════════════════════════ */}
        <div className="md:hidden relative w-full flex flex-col justify-end min-h-[100dvh] pb-10 pt-24 px-5">

          {/* ── Exclusive badge ── */}
          <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-amber-400/40 shadow-lg shadow-black/30 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-black tracking-[0.22em] uppercase text-amber-300 leading-none">
              Exclusive 2026 Collection
            </span>
          </div>

          {/* ── Headline ── */}
          <h1 className="font-black leading-[1.0] tracking-tight drop-shadow-xl mb-6" style={{ fontSize: "clamp(2.6rem, 11vw, 3.4rem)" }}>
            <span className="block text-white">IMPOSSIBLE</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(90deg, #FBBF24 0%, #FDE68A 45%, #F59E0B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              IS NOTHING
            </span>
          </h1>

          {/* ── CTA buttons – stacked full-width on mobile ── */}
          <div className="flex flex-col gap-3 w-full mb-7">
            {/* Primary */}
            <Link
              to="/products"
              className="group w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-primary to-amber-500 text-gray-900 font-black text-sm tracking-widest uppercase rounded-2xl py-4 shadow-xl shadow-amber-500/30 active:scale-[0.97] transition-all duration-200"
            >
              <FiShoppingBag size={17} className="flex-shrink-0" />
              <span>Shop Collection</span>
              <FiArrowRight size={16} className="flex-shrink-0 group-active:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary */}
            <Link
              to="/products?new=true"
              onClick={(e) => {
                const el = document.getElementById("new");
                if (el && window.location.pathname === "/") {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group w-full inline-flex items-center justify-center gap-2.5 bg-white/[0.08] backdrop-blur-xl border border-white/25 text-white font-bold text-sm tracking-widest uppercase rounded-2xl py-4 shadow-lg active:scale-[0.97] transition-all duration-200"
            >
              <HiSparkles size={17} className="text-amber-300 flex-shrink-0" />
              <span>New Arrivals</span>
            </Link>
          </div>

          {/* ── Trust badges – 2×2 grid (nicer on mobile) ── */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: FiTruck, label: "Express Delivery" },
              { icon: FiShield, label: "100% Authentic" },
              { icon: FiRefreshCw, label: "7-Day Exchange" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2.5"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-amber-400" />
                </span>
                <span className="text-[11px] font-semibold text-gray-200 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════
            DESKTOP CONTENT LAYOUT (unchanged)
            ════════════════════════════════ */}
        <div className="hidden md:block relative w-full max-w-7xl mx-auto px-6 py-24 lg:py-32">
          {/* Premium Capsule Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-300">
              Exclusive 2026 Collection
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-black mt-4 leading-[1.06] tracking-tight text-white drop-shadow-md">
            IMPOSSIBLE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-primary">
              IS NOTHING
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-gray-300 mt-6 text-lg leading-relaxed">
            Discover iconic styles, luxury footwear, and timeless apparel curated by{" "}
            <span className="text-white font-semibold underline decoration-primary decoration-2 underline-offset-4">
              BDFashions
            </span>{" "}
            for trendsetters and everyday champions.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-5 mt-9">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary via-amber-400 to-amber-500 text-dark font-extrabold px-9 py-4 rounded-full text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <FiShoppingBag className="text-dark group-hover:scale-110 transition-transform" />
              <span>Shop Collection</span>
              <FiArrowRight className="text-dark group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products?new=true"
              onClick={(e) => {
                const el = document.getElementById("new");
                if (el && window.location.pathname === "/") {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white text-white font-bold px-8 py-4 rounded-full text-sm tracking-wider uppercase shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <HiSparkles className="text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>New Arrivals</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-10 flex items-center gap-6 text-sm text-gray-300 font-medium">
            {[
              { icon: FiTruck, label: "Express Delivery" },
              { icon: FiShield, label: "100% Authentic Quality" },
              { icon: FiRefreshCw, label: "Easy 7-Day Exchange" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-primary">
                  <Icon size={14} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS & SOCIAL PROOF */}
      <StatsSection />

      {/* CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="heading text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark">
              Shop By{" "}
              <span style={btnClip} className="inline-block bg-primary text-white uppercase px-4 py-1">
                Category
              </span>
            </h1>
          </div>
          <br />
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[450px] rounded-3xl bg-light animate-pulse" />
              ))}
            </div>
          ) : categoriesError ? (
            <p className="text-center text-red-500">⚠️ {categoriesError}</p>
          ) : !Array.isArray(categories) ? (
            <p className="text-center text-red-500">⚠️ Invalid categories data.</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-400">No categories to show yet.</p>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              loop={categories.length > 3}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              spaceBetween={24}
              breakpoints={{
                320: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {categories.map((category) => (
                <SwiperSlide key={category.id}>
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="relative block overflow-hidden rounded-3xl group shadow-lg"
                  >
                    <img
                      src={getCategoryImageUrl(category.image, category.name)}
                      alt={category.name}
                      className="h-[450px] w-full object-cover transition duration-700 group-hover:scale-110 bg-light"
                      onError={(e) => handleCategoryImageError(e, category.name)}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-4xl font-black tracking-wide">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new" className="px-6 sm:px-10 lg:px-20 py-12">
        <div className="heading text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">
            New{" "}
            <span style={btnClip} className="inline-block bg-primary text-white uppercase px-4 py-1">
              Arrival
            </span>
          </h1>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-light animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-8">⚠️ {error}</p>
        ) : newArrivals.length > 0 ? (
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            loop
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              0: { slidesPerView: 1 },
              568: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1020: { slidesPerView: 4 },
            }}
            className="mt-8"
          >
            {newArrivals.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="relative overflow-hidden bg-light group">
                  <img
                    src={getProductImageUrl(product.images?.[0], product.category, product.name)}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                    onError={(e) => handleImageError(e, product.category, product.name)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex items-center gap-2 bg-white hover:bg-primary text-dark font-extrabold uppercase px-6 py-2.5 rounded-full text-xs tracking-wider transition-all duration-300 hover:scale-105 shadow-xl"
                    >
                      <span>Quick View</span>
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-400 mt-8">No new arrivals at the moment.</p>
        )}
      </section>

{/* FEATURED / OUR PRODUCTS */}
<section
  id="product"
  className="px-4 sm:px-6 lg:px-10 xl:px-16 py-16 sm:py-20 bg-gray-50"
>
  <div className="max-w-7xl mx-auto">

    {/* Section Heading */}
    <div className="text-center mb-10 sm:mb-12">
      <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-primary mb-3">
        Discover Our Collection
      </p>

      <h1 className="text-3xl sm:text-4xl font-black text-dark leading-tight">
        {" "}
        <span
          style={btnClip}
          className="inline-block bg-primary text-white uppercase px-5 py-1.5"
        >
          Products
        </span>
      </h1>
    </div>

    {/* Products */}
    {isLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          >
            <div className="aspect-square bg-light animate-pulse" />

            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-light rounded animate-pulse" />
              <div className="h-5 w-full bg-light rounded animate-pulse" />
              <div className="h-4 w-28 bg-light rounded animate-pulse" />
              <div className="h-5 w-20 bg-light rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

    ) : error ? (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm sm:text-base">
          ⚠️ {error}
        </p>
      </div>

    ) : featuredProducts.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-400">
          No featured products available.
        </p>
      </div>

    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9">

    {featuredProducts.map((product) => (
      <div
        key={product.id}
        className="
          relative
          bg-white
          rounded-2xl
          overflow-hidden
          border border-gray-100
          shadow-sm
          hover:shadow-lg
          transition-all
          duration-300
          group
        "
      >

        {/* Product Image */}
        <Link
          to={`/products/${product.id}`}
          className="block"
        >
          <div className="relative overflow-hidden bg-gray-100 aspect-square">

            {/* Product Image */}
            <img
              src={getProductImageUrl(product.images?.[0], product.category, product.name)}
              alt={product.name}
              loading="lazy"
              className="
                w-full
                h-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
              onError={(e) => handleImageError(e, product.category, product.name)}
            />

            {/* Discount Badge */}
            {product.originalPrice > product.price && (
              <span
                className="
                  absolute
                  top-3
                  left-3
                  bg-red-500
                  text-white
                  text-[10px]
                  sm:text-xs
                  font-bold
                  px-2.5
                  py-1
                  rounded-full
                  shadow-md
                  z-10
                "
              >
                -
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                %
              </span>
            )}
          </div>
        </Link>

        {/* Product Information */}
        <div className="px-3.5 sm:px-4 pt-3 pb-3">

          {/* Brand */}
          {product.brand && (
            <p
              className="
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-[0.15em]
                text-gray-400
                font-semibold
                leading-none
                mb-1.5
              "
            >
              {product.brand}
            </p>
          )}

    {/* Product Name */}
    <Link to={`/products/${product.id}`}>
      <h2
        className="
          text-sm
          sm:text-base
          font-semibold
          text-gray-900
          leading-[1.25]
          line-clamp-2
          min-h-[35px]
          sm:min-h-[40px]
          hover:text-primary
          transition-colors
          duration-200
        "
      >
        {product.name}
      </h2>
    </Link>

    {/* Rating */}
    <div
      className="
        flex
        items-center
        gap-1.5
        mt-1
        leading-none
      "
    >
      <StarRating
        rating={product.rating || 0}
        size={13}
      />

      <span className="text-[11px] sm:text-xs text-gray-400 leading-none">
        ({product.reviewCount ?? 0})
      </span>
    </div>

    {/* Price */}
    <div
      className="
        flex
        items-center
        gap-2
        mt-1
        leading-none
      "
    >
      <span
        className="
          text-base
          sm:text-lg
          font-bold
          text-gray-900
          leading-none
        "
      >
        ৳{product.price.toLocaleString()}
      </span>

      {product.originalPrice > product.price && (
        <span
          className="
            text-[11px]
            sm:text-xs
            text-gray-400
            line-through
            leading-none
          "
        >
          ৳{product.originalPrice.toLocaleString()}
        </span>
      )}
    </div>

        </div>

        {/* Existing Cart Button — KEEPING YOUR PREVIOUS DESIGN */}
        <button
          onClick={() => handleQuickAddToCart(product.id)}
          className="
            absolute bottom-2 right-2
            sm:bottom-3 sm:right-3
            flex items-center gap-2
            bg-primary text-white
            px-3 py-2
            rounded-full
            shadow-lg
            hover:bg-primary/90
            hover:scale-105
            active:scale-95
            transition-all duration-300
            text-xs sm:text-sm
            z-10
          "
        >
          <FiShoppingCart className="text-base" />

          <span className="hidden md:inline">
            Cart
          </span>
        </button>

      </div>
    ))}

      </div>
    )}

    {/* View All Products */}
    <div className="flex justify-center mt-12 sm:mt-14">
      <Link
        to="/products"
        className="
          group
          inline-flex items-center justify-center gap-3
          px-8 sm:px-10
          py-3.5 sm:py-4
          rounded-full
          bg-dark
          text-white
          text-sm sm:text-base
          font-bold
          shadow-xl
          hover:bg-primary
          hover:text-dark
          hover:shadow-2xl
          hover:shadow-primary/30
          hover:-translate-y-0.5
          transition-all duration-300
        "
      >
        <span>Explore Full Catalog</span>
        <FiArrowRight className="text-base transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>

  </div>
</section>
      {/* SALE BANNER */}
      <FlashSaleBanner />

      {/* TRUST HIGHLIGHTS & EXCLUSIVE CLUB NEWSLETTER */}
      <ExclusiveClubSection />

      {/* REVIEWS */}
      <section id="reviews" className="px-6 sm:px-10 lg:px-20 py-12">
        <div className="heading text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">
            Our{" "}
            <span style={btnClip} className="inline-block bg-primary text-white uppercase px-4 py-1">
              Customer's
            </span>
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  onError={(e) => (e.currentTarget.src = "/placeholder-avatar.jpg")}
                />
                <div>
                  <h3 className="font-semibold text-lg">{r.name}</h3>
                  <StarRating rating={r.rating} size={16} />
                </div>
              </div>
              <p className="mt-4 text-gray-600">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}