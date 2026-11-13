// src/components/common/WishlistButton.tsx
import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice";

interface WishlistButtonProps {
  productId: number;
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "icon" | "button";
}

export default function WishlistButton({
  productId,
  size = 24,
  className = "",
  showText = false,
  variant = "icon",
}: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);

  // ✅ Single source of truth — productIds array, populated once at App.tsx level
  const isInWishlist = useAppSelector((state) => state.wishlist.productIds.includes(productId));
  const initialized = useAppSelector((state) => state.wishlist.initialized);

  const [busy, setBusy] = useState(false);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    // ডেটা এখনো load হয়নি (page just refreshed) — click ignore করো, ভুল state-এ action যাবে না
    if (!initialized) return;
    if (busy) return;

    setBusy(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        toast.success("Added to wishlist ❤️");
      }
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to update wishlist";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const getVariantStyles = () => {
    if (variant === "button") {
      return `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isInWishlist
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-primary"
      }`;
    }
    return `relative flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
      isInWishlist
        ? "border-red-500 bg-red-50 text-red-500 shadow-md hover:bg-red-100"
        : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary hover:bg-gray-50"
    }`;
  };

  // Not logged in
  if (!user || !token) {
    return (
      <motion.button
        type="button"
        aria-label="Login to add to wishlist"
        onClick={() => {
          toast.error("Please login to add items to wishlist");
          navigate("/login");
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.85 }}
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 transition-all duration-300 hover:border-primary hover:text-primary hover:bg-gray-50 ${className}`}
      >
        <FiHeart size={size} />
        {showText && <span className="ml-2">Login to Wishlist</span>}
      </motion.button>
    );
  }

  // Logged in but wishlist not yet loaded (right after refresh) — show a quiet loading state
  if (!initialized) {
    return (
      <button
        className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-400 ${className}`}
        disabled
        aria-label="Loading wishlist"
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={handleToggleWishlist}
      disabled={busy}
      whileHover={{ scale: variant === "icon" ? 1.08 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${getVariantStyles()} ${busy ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {busy ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isInWishlist ? (
        <FaHeart size={size} className="transition-transform duration-300" />
      ) : (
        <FiHeart size={size} className="transition-transform duration-300" />
      )}
      {showText && !busy && <span className="ml-1">{isInWishlist ? "Remove" : "Add to Wishlist"}</span>}
    </motion.button>
  );
}