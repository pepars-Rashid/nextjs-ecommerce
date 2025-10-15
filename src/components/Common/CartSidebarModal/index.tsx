"use client";
import React, { useEffect, useState } from "react";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeCartItemAsync,
  selectTotalPrice,
  fetchCartItems,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";
import toast from "react-hot-toast";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const dispatch = useDispatch();

  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const cartStatus = useAppSelector((state) => state.cartReducer.status);
  const removeStatus = useAppSelector(
    (state) => state.cartReducer.removeStatus
  );
  const cartError = useAppSelector((state) => state.cartReducer.error);
  const totalPrice = useSelector(selectTotalPrice);

  const isLoading = cartStatus === "pending";
  const hasError = cartStatus === "failed" || removeStatus === "failed";
  const isRemoving = removeStatus === "pending";

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed top-0 left-0 z-99999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 ease-linear duration-300 ${
        isCartModalOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-end">
        <div className="w-full max-w-[500px] shadow-1 bg-white px-4 sm:px-7.5 lg:px-11 relative modal-content">
          <div className="sticky top-0 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-11 border-b border-gray-3 mb-7.5">
            <h2 className="font-medium text-dark text-lg sm:text-2xl">
              Cart View
            </h2>
            <button
              onClick={() => closeCartModal()}
              aria-label="button for close modal"
              className="flex items-center justify-center ease-in duration-150 bg-meta text-dark-5 hover:text-dark"
            >
              <svg
                className="fill-current"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5379 11.2121C12.1718 10.846 11.5782 10.846 11.212 11.2121C10.8459 11.5782 10.8459 12.1718 11.212 12.5379L13.6741 15L11.2121 17.4621C10.846 17.8282 10.846 18.4218 11.2121 18.7879C11.5782 19.154 12.1718 19.154 12.5379 18.7879L15 16.3258L17.462 18.7879C17.8281 19.154 18.4217 19.154 18.7878 18.7879C19.154 18.4218 19.154 17.8282 18.7878 17.462L16.3258 15L18.7879 12.5379C19.154 12.1718 19.154 11.5782 18.7879 11.2121C18.4218 10.846 17.8282 10.846 17.462 11.2121L15 13.6742L12.5379 11.2121Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15 1.5625C7.57867 1.5625 1.5625 7.57867 1.5625 15C1.5625 22.4213 7.57867 28.4375 15 28.4375C22.4213 28.4375 28.4375 22.4213 28.4375 15C28.4375 7.57867 22.4213 1.5625 15 1.5625ZM3.4375 15C3.4375 8.61421 8.61421 3.4375 15 3.4375C21.3858 3.4375 26.5625 8.61421 26.5625 15C26.5625 21.3858 21.3858 26.5625 15 26.5625C8.61421 26.5625 3.4375 21.3858 3.4375 15Z"
                  fill=""
                />
              </svg>
            </button>
          </div>

          <div className="h-[66vh] overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-6">
              {/* <!-- loading state --> */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Loading cart items...</p>
                </div>
              ) : hasError ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    className="w-12 h-12 text-red-500 mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-600 font-medium mb-2">Network Error</p>
                  <p className="text-gray-500 mb-4">Please try again later</p>
                  <button
                    onClick={() => dispatch(fetchCartItems() as any)}
                    className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark"
                  >
                    Try Again
                  </button>
                </div>
              ) : cartItems.length > 0 ? (
                cartItems.map((item, key) => (
                  <SingleItem
                    key={key}
                    item={item}
                    removeItemFromCart={removeCartItemAsync}
                  />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 mt-7.5 sticky bottom-0">
            <div className="flex items-center justify-between gap-5 mb-6">
              <p className="font-medium text-xl text-dark">Subtotal:</p>

              <p className="font-medium text-xl text-dark">${totalPrice}</p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                onClick={() => closeCartModal()}
                href="/cart"
                className="w-full flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                View Cart
              </Link>

              {/* <!-- checkout button --> */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ mode: "cart" }),
                    });
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(
                        data?.error || "Failed to start checkout"
                      );
                    window.location.href = data.url;
                  } catch (e: any) {
                    toast.error(e.message || "Checkout failed");
                  }
                }}
                className="w-full flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
