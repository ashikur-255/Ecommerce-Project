import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { addToCart } from "../../store/slices/cartSlice";
import { getImageUrl, handleImageError } from "../../utils/image";
import type { Product } from "../../types";
// ⬇️ import যোগ করো
// ✅ সঠিক path
import WishlistButton from "../common/WishlistButton";
interface Props {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to your cart.",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#111827",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }

      return;
    }

    try {
      await dispatch(
        addToCart({
          productId: product.id,
          quantity: 1,
          size: product.sizes?.[0] ?? "",
          color: product.colors?.[0] ?? "",
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${product.name} has been added to your cart.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add product to cart.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block h-full"
    >
      <div
        className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${
          viewMode === "list"
            ? "flex items-center gap-6 p-5"
            : "h-full"
        }`}
      >
        {/* Image Section */}
        {/* Image Section */}
<div
  className={`relative overflow-hidden rounded-xl bg-gray-100 ${
    viewMode === "list"
      ? "w-40 h-40 md:w-44 md:h-44 flex-shrink-0"
      : "aspect-square"
  }`}
>
  {/* Discount Badge */}
  {discount > 0 && (
    <span className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
      {discount}% OFF
    </span>
  )}

  {/* ⬇️ Wishlist Heart Button — নতুন */}
  <div className="absolute top-3 right-3 z-10">
    <WishlistButton productId={product.id} size={16} className="!h-8 !w-8 bg-white shadow-md border-0" />
  </div>

  {/* Product Image */}
  <img
    src={getImageUrl(product.images?.[0] ?? "")}
    alt={product.name}
    loading="lazy"
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    onError={(e) => handleImageError(e, product.category, product.name)}
  />

  {/* Add To Cart Button */}
  <button
    onClick={handleAddToCart}
    className="absolute bottom-3 right-3 bg-primary hover:bg-green-400 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300"
    title="Add to Cart"
  >
    <FiShoppingCart size={18} />
  </button>
</div>

{/* Product Info */}
<div className="flex-1 min-w-0 px-2 pt-4 pb-3">

  {/* Brand */}
  <p
    className="
      text-xs
      uppercase
      tracking-wider
      text-gray-400
      font-medium
      leading-none
      mb-1.5
    "
  >
    {product.brand}
  </p>

  {/* Product Name */}
  <h3
    className="
      text-lg
      font-bold
      text-gray-900
      leading-[1.25]
      line-clamp-2
      mb-1.5
    "
  >
    {product.name}
  </h3>

  {/* Ratings */}
  <div
    className="
      flex
      items-center
      gap-1
      leading-none
      mb-1.5
    "
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        size={14}
        className={
          i < Math.round(product.rating)
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-300"
        }
      />
    ))}

    <span className="text-sm text-gray-500 ml-1 leading-none">
      ({product.reviewCount})
    </span>
  </div>

  {/* Price */}
  <div
    className="
      flex
      items-center
      gap-3
      leading-none
    "
  >
    <span
      className="
        text-xl
        font-bold
        text-black
        leading-none
      "
    >
      ৳{product.price.toLocaleString()}
    </span>

    {product.originalPrice > product.price && (
      <span
        className="
          text-sm
          text-gray-400
          line-through
          leading-none
        "
      >
        ৳{product.originalPrice.toLocaleString()}
      </span>
    )}
  </div>

  {/* List View Button */}
  {viewMode === "list" && (
    <button
      onClick={handleAddToCart}
      className="
        mt-4
        px-6
        py-3
        bg-black
        text-white
        rounded-xl
        font-medium
        hover:bg-gray-800
        transition-all
        duration-300
      "
    >
      Add to Cart
    </button>
  )}

</div>


      </div>
    </Link>
  );
}