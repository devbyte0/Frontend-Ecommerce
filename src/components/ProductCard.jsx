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
    gender
  } = Data;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
      {/* Product Image */}
      <img
        src={mainImage}
        alt={name}
        className="w-full h-48 object-contain"
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

      {/* Product Details */}
      <div className="p-4">
        {/* Product Name */}
        <h2 className="text-lg font-semibold mb-2">{name}</h2>

        {/* Gender */}
        {gender && (
          <p className="text-sm text-gray-600 mb-2">For: {gender}</p>
        )}

        {/* Product Price */}
        <div className="flex items-center mb-4">
          {discountPrice ? (
            <>
              <p className="text-gray-800 text-lg line-through mr-2">${mainPrice}</p>
              <p className="text-green-600 text-lg">${discountPrice}</p>
            </>
          ) : (
            <p className="text-gray-800 text-lg">${mainPrice}</p>
          )}
        </div>

        {/* View Details Button */}
        <Link to={`/products/${_id}`}>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
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
