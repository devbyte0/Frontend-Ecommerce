// src/components/ProductCard.jsx

import React from "react";
import Badge from "./Badge";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

const ProductCard = ({ Data }) => {
  const {
    _id,
    mainBadgeName,
    mainBadgeColor,
    mainImage,
    name,
    mainPrice,
    discountPrice,
    gender,
    categories
  } = Data;

  // Parse categories if needed
  let parsedCategories = [];
  if (Array.isArray(categories)) {
    categories.forEach(cat => {
      try {
        const arr = JSON.parse(cat);
        if (Array.isArray(arr)) {
          parsedCategories = parsedCategories.concat(arr);
        }
      } catch {
        parsedCategories.push(cat);
      }
    });
  }

  return (
    <div className="bg-white border border-yellow-300 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 relative flex flex-col">
      {/* Product Image */}
      <div className="relative flex items-center justify-center bg-white p-4 h-56">
        <img
          src={mainImage}
          alt={name}
          className="max-h-44 object-contain mx-auto"
          loading="lazy"
        />
        {/* Main Badge Overlay */}
        {mainBadgeName && mainBadgeColor && (
          <Badge
            name={mainBadgeName}
            color={mainBadgeColor}
            position="topLeft"
          />
        )}
      </div>

      {/* Product Details */}
      <div className="px-4 pb-4 flex-1 flex flex-col">
        {/* Product Name */}
        <h2 className="text-base font-bold mb-1 text-gray-900 line-clamp-2">{name}</h2>

        {/* Categories */}
        {parsedCategories.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {parsedCategories.map((cat, idx) => (
              <span key={idx} className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Gender */}
        {gender && (
          <p className="text-xs text-gray-500 mb-1">For: {gender}</p>
        )}

        {/* Product Price */}
        <div className="flex items-end gap-2 mb-2">
          {discountPrice ? (
            <>
              <span className="text-sm text-gray-400 line-through">${mainPrice}</span>
              <span className="text-lg text-yellow-700 font-bold">${discountPrice}</span>
            </>
          ) : (
            <span className="text-lg text-yellow-700 font-bold">${mainPrice}</span>
          )}
        </div>

        {/* View Details Button */}
        <Link to={`/products/${_id}`}>
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg shadow transition-all duration-200 mt-auto">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  Data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    mainBadgeName: PropTypes.string,
    mainBadgeColor: PropTypes.string,
    mainImage: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    mainPrice: PropTypes.number.isRequired,
    discountPrice: PropTypes.number,
    gender: PropTypes.string,
  }).isRequired,
};

export default ProductCard;
