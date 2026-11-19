// src/pages/WishlistPage.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";
import Button from "../components/ui/Button";
import { getImageUrl, getProductImageUrl, handleImageError } from "../utils/image";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { items, loading } = useAppSelector((s) => s.wishlist);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, user, navigate]);

  const handleRemove = async (productId: number) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to remove item.");
    }
  };

  // ✅ নতুন কোড — toast বাদ, cartSlice নিজেই handle করবে
const handleAddToCart = (productId: number) => {
  dispatch(addToCart({ productId, quantity: 1, size: "", color: "" }));
};

  if (loading && items.length === 0) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-light rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="text-primary" size={26} />
          <h1 className="text-2xl font-black text-dark">My Wishlist</h1>
          <span className="text-gray-400 text-sm">({items.length} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden group"
              >
                <Link to={`/products/${item.productId}`} className="block aspect-square bg-light overflow-hidden">
                  <img
                    src={getProductImageUrl(item.image, undefined, item.productName)}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, undefined, item.productName)}
                  />
                </Link>

                <div className="p-4">
                  <p className="text-xs text-primary font-bold uppercase mb-1">{item.brand}</p>
                  <Link to={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-dark text-sm line-clamp-1 mb-2 hover:text-primary">
                      {item.productName}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-black text-dark">৳{item.price.toLocaleString()}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(item.productId)}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-dark text-white text-xs font-semibold hover:bg-primary transition-colors"
                    >
                      <FiShoppingCart size={14} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      aria-label="Remove from wishlist"
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}