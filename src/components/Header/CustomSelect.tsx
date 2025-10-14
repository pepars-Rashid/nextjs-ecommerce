"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { CategoryWithCount } from "@/types/category";

type Props = {
  categories: CategoryWithCount[];
};

const CustomSelect: React.FC<Props> = ({ categories }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(() => {
    // First item: All items
    const base = [{ label: "All items", slug: "" }];
    const cats = (categories || []).map((c) => ({ label: c.name, slug: c.slug }));
    return [...base, ...cats];
  }, [categories]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Try to infer selection based on current pathname
    // /category            => index 0 (All items)
    // /category/[slug]     => match slug
    if (pathname?.startsWith("/category/")) {
      const slug = pathname.split("/category/")[1]?.split("/")[0] || "";
      const idx = items.findIndex((i) => i.slug === slug);
      setSelectedIndex(idx >= 0 ? idx : 0);
    } else if (pathname === "/category") {
      setSelectedIndex(0);
    }
  }, [pathname, items]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(false);
    const target = items[index];
    if (!target.slug) {
      router.push("/category");
    } else {
      router.push(`/category/${target.slug}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative w-[200px]">
      <div
        className={`select-selected whitespace-nowrap ${isOpen ? "select-arrow-active" : ""}`}
        onClick={toggleDropdown}
      >
        {items[selectedIndex]?.label || "All items"}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {items.map((option, index) => (
          <Link
            key={`${option.slug}-${index}`}
            href={option.slug ? `/category/${option.slug}` : "/category"}
            onClick={() => handleOptionClick(index)}
            className={`block w-full px-3 py-2 rounded text-dark hover:bg-gray-1 ease-out duration-150 ${
              selectedIndex === index ? "bg-gray-100 font-medium text-blue" : ""
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;