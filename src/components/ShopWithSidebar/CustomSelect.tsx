import React, { useState, useEffect, useRef } from "react";

interface CustomSelectProps {
  options: { label: string; value: string }[];
  onSelectionChange?: (value: string) => void;
  value?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, onSelectionChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState( options[0]);
  const selectRef = useRef(null);

  // Function to close the dropdown when a click occurs outside the component
  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Update selectedOption when value prop changes
  useEffect(() => {
    if (value) {
      const newOption = options.find(opt => opt.value === value);
      if (newOption) {
        setSelectedOption(newOption);
      }
    }
  }, [value, options]);

  useEffect(() => {
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelectionChange) {
      onSelectionChange(option.value);
    }
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items p-1 flex flex-col gap-1 ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled ={option.value === selectedOption.value}
            className={`select-item w-full ${
              selectedOption === option ? "cursor-not-allowed same-as-selected" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
