"use client";

import { fetchProducts, selectFilters, updateFilters} from "@/redux/features/product-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

interface CategoryItemProps {
  category: any;
  isSelected: boolean;
  onCategoryChange: (categoryId: number, isSelected: boolean) => void;
}

const CategoryItem = ({ category, isSelected, onCategoryChange }: CategoryItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useAppSelector(selectFilters);
  
  // Handle category filter change
  const handleCategoryChange = (categoryId: number) => {
    const newSelected = !isSelected;
    let selectedCategories = [...(filters.categoryIds || [])];
    
    if (newSelected) {
      selectedCategories.push(categoryId);
    } else {
      selectedCategories = selectedCategories.filter(id => id !== categoryId);
    }
    
    const newFilters = {
      ...filters,
      categoryIds: selectedCategories,
      offset: 0,
    };
    
    // Optimistically update filters for immediate UI response.
    // Do NOT fetch here; URL change will trigger a single fetch in parent.
    dispatch(updateFilters(newFilters));
    
    // Call parent callback to update URL
    onCategoryChange(categoryId, newSelected);
  };
  return (
    <button
      className={`${
        isSelected && "text-blue"
      } group flex items-center justify-between ease-out duration-200 hover:text-blue `}
      onClick={() => handleCategoryChange(category.id)}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
            isSelected ? "border-blue bg-blue" : "bg-white border-gray-3"
          }`}
        >
          <svg
            className={isSelected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span>{category.name}</span>
      </div>

      <span
        className={`${
          isSelected ? "text-white bg-blue" : "bg-gray-2"
        } inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue`}
      >
        {category.productCount}
      </span>
    </button>
  );
};

interface CategoryDropdownProps {
  categories: any[];
  selectedCategoryIds: number[];
  onCategoryChange: (newFilters: any) => void;
}

const CategoryDropdown = ({ categories, selectedCategoryIds, onCategoryChange }: CategoryDropdownProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const handleCategoryChange = (categoryId: number, isSelected: boolean) => {
    // This will be called by CategoryItem, but we need to update the URL
    // The actual filter update is already handled in CategoryItem
    // We just need to trigger the URL update with the updated category IDs
    const updatedCategoryIds = isSelected 
      ? [...selectedCategoryIds, categoryId]
      : selectedCategoryIds.filter(id => id !== categoryId);
    
    setTimeout(() => {
      onCategoryChange({ categoryIds: updatedCategoryIds });
    }, 0);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Category</p>
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* dropdown && 'shadow-filter */}
      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {categories.map((category, key) => (
          <CategoryItem 
            key={key} 
            category={category} 
            isSelected={selectedCategoryIds.includes(category.id)}
            onCategoryChange={handleCategoryChange}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
