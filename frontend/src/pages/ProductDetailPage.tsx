// src/pages/ProductDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiShare2 } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchProductById } from "../store/slices/productSlice";
import { addToCart } from "../store/slices/cartSlice";
import { fetchWishlist } from "../store/slices/wishlistSlice";
import StarRating from "../components/ui/StarRating";
import Button from "../components/ui/Button";
import { reviewService } from "../services/api";
import type { Review } from "../types";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getImageUrl, getProductImageUrl, handleImageError } from "../utils/image";
import WishlistButton from "../components/common/WishlistButton";
import { productService } from "../services/api";
import ProductCard from "../components/product/ProductCard"; // path তোমার structure অনুযায়ী ঠিক করো
import type { Product } from "../types";


export default function ProductDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam ? parseInt(idParam, 10) : NaN;
  const dispatch = useAppDispatch();
  const { product, isLoading } = useAppSelector((s) => s.products);
  const { user } = useAppSelector((s) => s.auth);
  const { isLoading: cartLoading } = useAppSelector((s) => s.cart);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
const [relatedLoading, setRelatedLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState<"details" | "reviews">("details");

  const navigate = useNavigate();

  // Check if product is in wishlist

  // Fetch product and wishlist on mount
  useEffect(() => {
    if (!isNaN(id)) {
      dispatch(fetchProductById(id));
      reviewService.getByProduct(id).then((res) => setReviews(res.data.data.reviews ?? []));
      
      // Fetch wishlist if user is logged in
      if (user) {
        dispatch(fetchWishlist());
      }
    }
  }, [id, dispatch, user]);

  // Fetch related products from the same category once the product loads
useEffect(() => {
  if (!product) return;

  let cancelled = false;

  const loadRelated = async () => {
    setRelatedLoading(true);
    try {
      const res = await productService.getAll({
        category: product.category,
        limit: 8,
      });
      if (!cancelled) {
        // Exclude the currently viewed product from the list
        const filtered = res.data.data.products.filter((p) => p.id !== product.id);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error("Failed to load related products:", err);
    } finally {
      if (!cancelled) setRelatedLoading(false);
    }
  };

  loadRelated();

  return () => {
    cancelled = true;
  };
}, [product]);

  

  useEffect(() => {
    if (!product) return;

    const sizes = product.sizes ?? [];
    const colors = product.colors ?? [];

    setSelectedImage(0);

    if (sizes.length > 0) {
      setSelectedSize((prev) => prev || sizes[0]);
    }

    if (colors.length > 0) {
      setSelectedColor((prev) => prev || colors[0]);
    }
  }, [product]);

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "Product URL copied to clipboard.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (_error) {
      console.error("Share failed:", _error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add products to your cart.",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }
      return;
    }

    if (product?.sizes.length && !selectedSize) {
      Swal.fire({
        icon: "warning",
        title: "Select a Size",
        text: "Please select a size.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    dispatch(
      addToCart({
        productId: product!.id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    );

    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      text: "Product added successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to leave a review.");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    if (!product) return;

    setSubmittingReview(true);

    try {
      const res = await reviewService.create({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });

      setReviews((prev) => [res.data.data, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted!");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message ?? "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading || !product) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-light rounded-2xl animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-light rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-light mb-4">
              <img
                src={getProductImageUrl(product.images?.[selectedImage], product.category, product.name, selectedImage)}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => handleImageError(e, product.category, product.name, selectedImage)}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-primary" : "border-transparent"
                    }`}>
                    <img
                      src={getProductImageUrl(img, product.category, product.name, i)}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => handleImageError(e, product.category, product.name, i)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-primary uppercase">{product.brand}</span>
              {product.isNew && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
              )}
            </div>
            <h1 className="text-3xl font-black text-dark mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-dark">৳{product.price.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                  <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded">{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-dark mb-2">Color: <span className="text-primary">{selectedColor}</span></p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 rounded-lg text-sm border-2 transition-all ${
                        selectedColor === color
                          ? "border-dark bg-dark text-white"
                          : "border-gray-200 text-dark hover:border-dark"
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-dark mb-2">Size: <span className="text-primary">{selectedSize}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedSize === size
                          ? "border-dark bg-dark text-white"
                          : "border-gray-200 text-dark hover:border-dark"
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold text-dark">Quantity:</p>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-dark hover:bg-light transition-colors text-xl font-medium">
                  –
                </button>
                <span className="w-12 text-center font-semibold text-dark">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-dark hover:bg-light transition-colors text-xl font-medium">
                  +
                </button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} in stock</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="flex-1 inline-flex items-center justify-center gap-2"
                loading={cartLoading}
                onClick={handleAddToCart}
              >
                <span>🛒 Add to Cart</span>
              </Button>

              <WishlistButton
                productId={product.id}
                size={24}
                className="!h-12 !w-12"
              />

              <button
                type="button"
                aria-label="Share Product"
                onClick={handleShare}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-200 text-dark transition-colors hover:border-primary hover:text-primary"
              >
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="bg-light text-dark text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 mb-8">
            {(["details", "reviews"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-dark"
                }`}>
                {t} {t === "reviews" && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="prose max-w-none text-gray-600">
              <p>{product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {[
                  ["Brand", product.brand],
                  ["Category", product.category],
                  ["Stock", `${product.stock} units`],
                  ["Sizes", product.sizes.join(", ") || "One Size"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-light rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="font-semibold text-dark text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div>
              {user && (
                <form onSubmit={handleReviewSubmit} className="bg-light rounded-2xl p-6 mb-8">
                  <h3 className="font-bold text-dark mb-4">Write a Review</h3>
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full mt-3 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none"
                  />
                  <Button type="submit" loading={submittingReview} className="mt-3">
                    Submit Review
                  </Button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-dark text-sm">{r.userName}</p>
                          <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto">
                          <StarRating rating={r.rating} size={14} />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              
            </div>
          )}
          
        </div>
         {/* You May Also Like */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-dark mb-6">You May Also Like</h2>

            {relatedLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-light rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}