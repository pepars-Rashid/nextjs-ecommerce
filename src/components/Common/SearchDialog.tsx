"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ListedProduct } from "@/types/product";

type SearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const highlightMatches = (text: string, query: string) => {
  if (!query) return text;
  try {
    const words = query
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (words.length === 0) return text;
    const pattern = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(pattern);
    return parts.map((part, idx) =>
      pattern.test(part) ? (
        <mark key={idx} className="bg-yellow-200 text-dark px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  } catch {
    return text;
  }
};

const productMatches = (product: ListedProduct, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    (product.title || "").toLowerCase().includes(q) ||
    (product.description || "").toLowerCase().includes(q)
  );
};

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Debounced fetch to /api/search
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=20`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        const data = await res.json();
        setResults((data?.products ?? []) as ListedProduct[]);
        setLoading(false);
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError((e as Error).message);
        setLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
          {/* input */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-3">
            <div className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                className="text-dark-3"
              >
                <path
                  d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
                  fill="currentColor"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-3 py-2.5 px-3 outline-none ease-out duration-200 placeholder:text-dark-5 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <button
                aria-label="Close"
                onClick={onClose}
                className="text-dark-3 hover:text-dark"
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path
                    d="M14.348 5.652a.833.833 0 0 0-1.18 0L10 8.82 6.832 5.652a.833.833 0 1 0-1.18 1.18L8.82 10l-3.168 3.168a.833.833 0 1 0 1.18 1.18L10 11.18l3.168 3.168a.833.833 0 1 0 1.18-1.18L11.18 10l3.168-3.168a.833.833 0 0 0 0-1.18Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="px-4 sm:px-6 py-6 text-red-600">{error}</div>
            )}
            {loading && !error && (
              <div className="px-4 sm:px-6 py-6 text-dark-4">Searching...</div>
            )}
            {!loading &&
              !error &&
              results.length === 0 &&
              query.trim().length > 0 && (
                <div className="px-4 sm:px-6 py-6 text-dark-4">
                  No products match your search.
                </div>
              )}
            {!loading && !error && results.length > 0 && (
              <ul className="divide-y divide-gray-2">
                {results.map((p) => {
                  const imgUrl =
                    (p.imagesArray && p.imagesArray[0]?.url) ||
                    "/images/blanck.png";
                  return (
                    <li
                      key={p.id}
                      className="px-4 sm:px-6 py-4 hover:bg-gray-1 ease-out duration-150"
                    >
                      <Link
                        href={`/product/${p.productSlug || p.id}`}
                        onClick={onClose}
                        className="flex items-start gap-4"
                      >
                        <div className="flex-shrink-0 w-14 h-14 relative rounded-md overflow-hidden bg-gray-2">
                          <Image
                            src={imgUrl}
                            alt={p.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-dark line-clamp-2">
                            {highlightMatches(p.title, query)}
                          </div>
                          <div className="text-sm text-dark-4 mt-1 line-clamp-2">
                            {highlightMatches(p.description || "", query)}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
