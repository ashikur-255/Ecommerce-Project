// src/components/ui/WishlistBadge.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { fetchWishlist } from '../../store/slices/wishlistSlice'; // ⬅️ fetchWishlistCount থেকে fetchWishlist এ পরিবর্তন

export default function WishlistBadge() {
  const dispatch = useAppDispatch();
  const { count } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist()); // ⬅️ এটাই count আর productIds দুটোই populate করবে
    }
  }, [dispatch, user]);

  if (!user) return null;

  return (
    <Link to="/wishlist" className="relative inline-flex items-center">
      <div className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
        <FiHeart size={20} className="text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </Link>
  );
}