import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";

import {
  fetchWishlist,
  fetchWishlistCount,
  addToWishlist,
  removeFromWishlist,
} from "../store/slices/wishlistSlice";

export const useWishlist = () => {
  const dispatch = useAppDispatch();

  const { items, count, loading, error } = useAppSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    dispatch(fetchWishlistCount()).unwrap();
  }, [dispatch]);

  const loadWishlist = async () => {
    await dispatch(fetchWishlist()).unwrap();
  };

  const add = async (productId: number) => {
    await dispatch(addToWishlist(productId)).unwrap();
  };

  const remove = async (productId: number) => {
    await dispatch(removeFromWishlist(productId)).unwrap();
  };

  const isInWishlist = (productId: number) => {
    return items.some((x) => x.productId === productId);
  };

  return {
    items,
    count,
    loading,
    error,
    loadWishlist,
    add,
    remove,
    isInWishlist,
  };
};