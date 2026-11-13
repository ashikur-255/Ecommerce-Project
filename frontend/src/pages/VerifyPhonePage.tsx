// pages/WishlistPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice'; // ← Now clearWishlist exists
import { addToCart } from '../store/slices/cartSlice';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { getImageUrl } from '../utils/image';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { WishlistItem } from '../services/api';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items, count, loading, error } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleRemoveItem = async (productId: number, productName: string) => {
    const result = await Swal.fire({
      title: 'Remove from wishlist?',
      text: `Are you sure you want to remove "${productName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      dispatch(removeFromWishlist(productId));
    }
  };

  const handleAddToCart = (product: WishlistItem) => {
    dispatch(
      addToCart({
        productId: product.productId,
        quantity: 1,
        size: "",
        color: "",
      })
    );

    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      text: "Product added successfully!",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleClearWishlist = async () => {
    const result = await Swal.fire({
      title: 'Clear wishlist?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      dispatch(clearWishlist()); // ← Now this works
    }
  };

  // Show error if any
  if (error) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-dark mb-2">Error Loading Wishlist</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => dispatch(fetchWishlist())}>
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <FiHeart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
          <Link to="/login">
            <Button>Login Now</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-light rounded-2xl animate-pulse h-80" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <FiHeart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6">Start adding products you love!</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-dark">My Wishlist</h1>
            <p className="text-gray-500 mt-1">
              {count} items
            </p>
          </div>
          <Button variant="outline" onClick={handleClearWishlist}>
            <FiTrash2 className="mr-2" />
            Clear All
          </Button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((product, index) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Link to={`/product/${product.productId}`}>
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.productName}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                  </Link>
                  
                  <button
                    onClick={() =>
                      handleRemoveItem(product.productId, product.productName)
                    }
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <Link to={`/product/${product.productId}`}>
                    <h3 className="font-semibold text-dark hover:text-primary transition-colors line-clamp-2">
                      {product.productName}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-dark">
                      ৳{product.price.toLocaleString()}
                    </span>

                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FiShoppingBag className="mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}