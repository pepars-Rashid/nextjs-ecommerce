"use client";
import React, { useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { fetchWishlistItems, clearWishlistAsync } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import { useUser } from "@stackframe/stack";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const dispatch = useDispatch();
  const user = useUser();
  
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const wishlistStatus = useAppSelector((state) => state.wishlistReducer.status);
  const clearStatus = useAppSelector((state) => state.wishlistReducer.clearStatus);
  const wishlistError = useAppSelector((state) => state.wishlistReducer.error);
  
  const isLoading = wishlistStatus === 'pending';
  const hasError = wishlistStatus === 'failed';
  const isClearingWishlist = clearStatus === 'pending';
  
  // Fetch wishlist items when user is available
  useEffect(() => {
    if (user && wishlistStatus === 'idle') {
      dispatch(fetchWishlistItems() as any);
    }
  }, [user, dispatch, wishlistStatus]);
  
  const handleClearWishlist = async () => {
    try {
      await dispatch(clearWishlistAsync() as any).unwrap();
      toast.success('Wishlist cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear wishlist. Please try again.');
    }
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button 
              onClick={handleClearWishlist}
              disabled={isClearingWishlist}
              className={`flex items-center gap-2 ${
                isClearingWishlist 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue hover:text-blue-dark'
              }`}
            >
              {isClearingWishlist ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Clearing...
                </>
              ) : (
                'Clear Wishlist'
              )}
            </button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading your wishlist...</p>
                  </div>
                ) : hasError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg className="w-16 h-16 text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-600 font-medium text-xl mb-2">Network Error</p>
                    <p className="text-gray-500 mb-6">Failed to load your wishlist. Please try again.</p>
                    <button 
                      onClick={() => dispatch(fetchWishlistItems() as any)}
                      className="px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* <!-- table header --> */}
                    <div className="flex items-center py-5.5 px-10">
                      <div className="min-w-[83px]"></div>
                      <div className="min-w-[387px]">
                        <p className="text-dark">Product</p>
                      </div>

                      <div className="min-w-[205px]">
                        <p className="text-dark">Unit Price</p>
                      </div>

                      <div className="min-w-[265px]">
                        <p className="text-dark">Stock Status</p>
                      </div>

                      <div className="min-w-[150px]">
                        <p className="text-dark text-right">Action</p>
                      </div>
                    </div>

                    {/* <!-- wish item --> */}
                    {wishlistItems.length > 0 ? (
                      wishlistItems.map((item, key) => (
                        <SingleItem item={item} key={key} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 text-lg mb-4">Your wishlist is empty!</p>
                        <a
                          href="/shop-with-sidebar"
                          className="px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors"
                        >
                          Continue Shopping
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
