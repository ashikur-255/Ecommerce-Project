import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchCart, updateCartItem, removeFromCart, clearCart } from "../store/slices/cartSlice";
import Button from "../components/ui/Button";
import { getImageUrl, handleImageError } from "../utils/image";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, itemCount, total, isLoading } = useAppSelector((s) => s.cart);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  const shipping = total > 2000 ? 0 : 100;
  const tax = Math.round(total * 0.05 * 100) / 100;
  const grandTotal = total + shipping + tax;

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-dark mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to view your cart.</p>
          <Link to="/login"><Button size="lg">Login Now</Button></Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some products to get started.</p>
          <Link to="/products"><Button size="lg">Shop Now</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-dark">Shopping Cart ({itemCount})</h1>
          <button
            disabled={isLoading}
            onClick={() => dispatch(clearCart())}
            className="
              text-sm
              text-gray-400
              hover:text-red-500
              transition-colors
              flex items-center gap-1
              disabled:opacity-50
            "
          >

            <FiTrash2 size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-center">
                <img
                  src={getImageUrl(item.product.images?.[0])}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-xl bg-gray-100 shrink-0"
                  onError={(e) => handleImageError(e, item.product.category, item.product.name)}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {item.size && `Size: ${item.size}`}
                    {item.color && ` | Color: ${item.color}`}
                  </p>
                  <p className="font-bold text-primary mt-1">৳{item.product.price.toLocaleString()}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        dispatch(
                          updateCartItem({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                            size: item.size,
                            color: item.color,
                          })
                        );
                      }
                    }}
                    
                    className="w-9 h-9 flex items-center justify-center hover:bg-light text-dark font-medium transition-colors">
                    –
                    
                  </button>
                  <span className="w-10 text-center font-semibold text-sm text-dark">{item.quantity}</span>
                  <button
                    onClick={() => {
                      if (item.quantity < item.product.stock) {
                        dispatch(
                          updateCartItem({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                            size: item.size,
                            color: item.color,
                          })
                        );
                      }
                    }}
                    className="w-9 h-9 flex items-center justify-center hover:bg-light text-dark font-medium transition-colors">
                    +
                  </button>
                </div>
                

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <p className="font-black text-dark">৳{(item.product.price * item.quantity).toLocaleString()}</p>
                  <button
                    onClick={() => dispatch(removeFromCart({ productId: item.productId, size: item.size, color: item.color }))}
                    className="text-gray-300 hover:text-red-500 transition-colors mt-1">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-black text-dark text-lg mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : `৳${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (5%)</span>
                  <span>৳{tax.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-black text-dark text-base">
                  <span>Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Add ৳{(2000 - total).toFixed(0)} more for free shipping!
                </p>
              )}

              <Link to="/checkout">
                <Button size="lg" className="w-full mt-6">Proceed to Checkout</Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost" size="sm" className="w-full mt-2 text-gray-400">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}