import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";
import { FiShoppingCart } from "react-icons/fi";

import ScrollToTopButton from "../components/ui/ScrollToTopButton";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchNewArrivals, fetchFeatured } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import { categoryService, newsletterService } from "../services/api";
import StarRating from "../components/ui/StarRating";
import { getImageUrl } from "../utils/image";
import type { Category } from "../types";

const REVIEWS = [
  {
    name: "John Smith",
    avatar: "/src/assets/reviews/John.jpg",
    rating: 5,
    text: "Amazing quality, premium materials, and super fast delivery. Definitely shopping here again!",
  },
  {
    name: "Sarah Johnson",
    avatar: "/src/assets/reviews/Sarah.jpg",
    rating: 5,
    text: "Excellent customer support and a seamless shopping experience. Highly satisfied with my purchase.",
  },
  {
    name: "Michael Brown",
    avatar: "/src/assets/reviews/Michael.jpg",
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




  const emailRef = useRef<HTMLInputElement>(null);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    const email = emailRef.current?.value.trim() ?? "";
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    setSubscribing(true);
    try {
      await newsletterService.subscribe(email);
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: "Thank you for subscribing to our newsletter.",
        confirmButtonColor: "#2563eb",
      });
      if (emailRef.current) emailRef.current.value = "";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      if (error.response?.status === 409) {
        Swal.fire({
          icon: "info",
          title: "Already subscribed",
          text: "Email exists",
          confirmButtonColor: "#2563eb",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Something went wrong",
          text: error.response?.data?.message ?? "Please try again later.",
          confirmButtonColor: "#2563eb",
        });
      }
    } finally {
      setSubscribing(false);
    }
  };

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
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/src/assets/Logo of BDF.png"
            alt="Adidas Hero"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <span className="uppercase tracking-widest text-primary font-bold">
            New Collection 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-4 leading-tight">
            IMPOSSIBLE
            <br />
            IS NOTHING
          </h1>
          <p className="max-w-xl text-gray-300 mt-6 text-lg">
            Discover premium Adidas footwear, apparel and accessories designed for
            athletes and everyday champions.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/products" className="bg-white text-black px-8 py-4 font-bold uppercase">
              Shop Now
            </Link>
            <Link to="/#new" className="border border-white px-8 py-4 font-bold uppercase">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><h3 className="text-4xl font-black">10K+</h3><p>Happy Customers</p></div>
          <div><h3 className="text-4xl font-black">500+</h3><p>Products</p></div>
          <div><h3 className="text-4xl font-black">50+</h3><p>Brands</p></div>
          <div><h3 className="text-4xl font-black">24/7</h3><p>Support</p></div>
        </div>
      </section>

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
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      className="h-[450px] w-full object-cover transition duration-700 group-hover:scale-110 bg-light"
                      onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
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
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <div className="absolute top-full right-0 w-full h-full flex items-center justify-center bg-white/50 group-hover:top-0 transition-all">
                    <Link
                      to={`/products/${product.id}`}
                      style={btnClip}
                      className="bg-primary text-white uppercase px-6 py-2 transition-all duration-300 hover:bg-green-600 hover:text-white hover:scale-105 hover:shadow-lg"
                    >
                      Buy Now
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
              src={getImageUrl(product.images?.[0] ?? "")}
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
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
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
          inline-flex items-center justify-center
          px-7 sm:px-9
          py-3 sm:py-3.5
          rounded-xl
          bg-primary
          text-white
          text-sm sm:text-base
          font-bold
          shadow-md
          hover:shadow-lg
          hover:-translate-y-0.5
          hover:opacity-95
          transition-all duration-300
        "
      >
        View All Products
      </Link>
    </div>

  </div>
</section>
      {/* SALE BANNER */}
      <section className="relative overflow-hidden py-28 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🔥</div>
          <div className="absolute bottom-10 right-10 text-8xl">🛍️</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-widest">
            Limited Time Offer
          </span>
          <h2 className="mt-6 text-5xl md:text-7xl font-black leading-tight">UP TO 50% OFF</h2>
          <p className="mt-5 text-lg md:text-xl text-red-100 max-w-2xl mx-auto">
            Discover premium products at unbeatable prices. Grab your favorites before they're gone.
          </p>
          <Link
            to="/products?sale=true"
            className="inline-flex items-center gap-3 mt-10 px-10 py-4 rounded-2xl bg-white text-red-600 font-bold text-lg shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            🔥 Shop Sale
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white">Join Our Newsletter</h2>
          <p className="text-white/90 mt-4">Get updates about new arrivals and exclusive offers.</p>
          <div className="flex mt-8">
            <input
              ref={emailRef}
              type="email"
              placeholder="Enter your email"
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              className="flex-1 px-5 py-4 rounded-l-xl outline-none"
            />
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="
                bg-black
                text-white
                px-8
                rounded-r-xl
                font-semibold
                transition-all
                duration-300
                hover:bg-blue-600
                hover:-translate-y-0.5
                hover:shadow-lg
                active:translate-y-0
                disabled:opacity-60
                disabled:cursor-not-allowed
                disabled:hover:translate-y-0
                disabled:hover:shadow-none
              "
            >
              {subscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </div>
      </section>

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