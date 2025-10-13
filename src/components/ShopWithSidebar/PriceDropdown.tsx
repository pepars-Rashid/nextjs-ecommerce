import { useState, useEffect, useRef } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { fetchProducts, selectFilters, updateFilters } from "@/redux/features/product-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";

interface PriceDropdownProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (newFilters: any) => void;
}

const PriceDropdown = ({ minPrice, maxPrice, onPriceChange }: PriceDropdownProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useAppSelector(selectFilters);
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const isDragging = useRef(false);
  const currentPriceRef = useRef({ from: minPrice || 1, to: maxPrice || 1599 });

  const [selectedPrice, setSelectedPrice] = useState({
    from: minPrice || 1,
    to: maxPrice || 1599,
  });

  // Update local state when props change
  useEffect(() => {
    if (minPrice !== undefined && maxPrice !== undefined) {
      setSelectedPrice({
        from: minPrice,
        to: maxPrice,
      });
      currentPriceRef.current = { from: minPrice, to: maxPrice };
    }
  }, [minPrice, maxPrice]);

  // Handle price range input (only updates UI during dragging)
  const handlePriceInput = (values: [number, number]) => {
    const newPrice = {
      from: Math.floor(values[0]),
      to: Math.ceil(values[1]),
    };
    
    // Always update UI immediately
    setSelectedPrice(newPrice);
    
    // Store current price for drag end
    currentPriceRef.current = newPrice;
  };

  // Handle drag start
  const handleDragStart = () => {
    isDragging.current = true;
  };

  // Handle drag end - call backend with final values
  const handleDragEnd = () => {
    isDragging.current = false;
    
    const finalPrice = currentPriceRef.current;
    const newFilters = {
      ...filters,
      minPrice: finalPrice.from,
      maxPrice: finalPrice.to,
      offset: 0,
    };
    
    dispatch(updateFilters(newFilters));
    dispatch(fetchProducts({
      ...newFilters,
      append: false,
    }));
    
    // Update URL
    onPriceChange(newFilters);
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Price</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          id="price-dropdown-btn"
          aria-label="button for price dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && 'rotate-180'
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

      {/* // <!-- dropdown menu --> */}
      <div className={`p-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
        <div id="pricingOne">
          <div className="price-range">
            <RangeSlider
              id="range-slider-gradient"
              className="margin-lg"
              step={'any'}
              min={1}
              max={1599}
              value={[selectedPrice.from, selectedPrice.to]}
              onInput={handlePriceInput}
              onThumbDragStart={handleDragStart}
              onThumbDragEnd={handleDragEnd}
              onRangeDragStart={handleDragStart}
              onRangeDragEnd={handleDragEnd}
            />

            <div className="price-amount flex items-center justify-between pt-4">
              <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span id="minAmount" className="block px-3 py-1.5">
                  {selectedPrice.from}
                </span>
              </div>

              <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80">
                <span className="block border-r border-gray-3/80 px-2.5 py-1.5">
                  $
                </span>
                <span id="maxAmount" className="block px-3 py-1.5">
                  {selectedPrice.to}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
