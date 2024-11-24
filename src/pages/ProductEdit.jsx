// frontend/src/components/ProductCreate.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const ProductEdit = () => {
  // State variables for dropdown options
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [badges, setBadges] = useState([]);

  const {id} = useParams();
  
  // State for product information
  const [product, setProduct] = useState({
    name: '',
    categories: [],
    mainPrice: '',
    discountPrice: '',
    mainBadgeName: '',
    mainBadgeColor: '',
    gender: '',
    variants: [],
    mainImage: null,
  });

  // State for current variant being added
  const [variant, setVariant] = useState({
    selectedColor: '',
    selectedColorHex: '', // Stores the hex code of the selected color
    sizes: [],
    prices: [],
    discountPrices: [],
    deliveryTimes: '',
    badgeNames: [],
    badgeColors: [], // Stores colors corresponding to selected badges
    stock: '',
    description: '',
    images: [],
  });



  // Additional state variables
  const [successMessage, setSuccessMessage] = useState('');
  const [isVariantVisible, setIsVariantVisible] = useState(false); // Controls visibility of variant form
  const [variantCount, setVariantCount] = useState(0); // Tracks number of variants added

  const navigate = useNavigate();

  // Fetch dropdown options on component mount
  useEffect(() => {
    fetchOptions();
  }, []);

  // Function to fetch dropdown options from the backend
  const fetchOptions = async () => {
    try {
      const [categoriesRes, colorsRes, sizesRes, gendersRes, badgesRes,products] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URI}/api/categories`),
        axios.get(`${import.meta.env.VITE_API_URI}/api/colors`),
        axios.get(`${import.meta.env.VITE_API_URI}/api/sizes`),
        axios.get(`${import.meta.env.VITE_API_URI}/api/genders`),
        axios.get(`${import.meta.env.VITE_API_URI}/api/badges`),
        axios.get(`${import.meta.env.VITE_API_URI}/api/products/${id}`)
      ]);

      setCategories(categoriesRes.data);
      setColors(colorsRes.data);
      setSizes(sizesRes.data);
      setGenders(gendersRes.data);
      setBadges(badgesRes.data);
      setProduct(products.data);
      setVariant(products.data.variants)

      console.log(products.data.variants)
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };


  // Handle changes in the main product form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mainBadgeName') {
      // When mainBadgeName changes, also set mainBadgeColor based on selected badge
      const selectedBadge = badges.find(badge => badge.name === value);
      const mainBadgeColor = selectedBadge ? selectedBadge.color : '';
      setProduct(prevProduct => ({
        ...prevProduct,
        mainBadgeName: value,
        mainBadgeColor: mainBadgeColor,
      }));
    } else if (name === 'categories') {
      // Handle multiple category selection
      setProduct(prevProduct => ({
        ...prevProduct,
        categories: Array.from(e.target.selectedOptions, (option) => option.value),
      }));
    } else {
      // Handle other input changes
      setProduct(prevProduct => ({ ...prevProduct, [name]: value }));
    }
  };

  // Handle changes in the variant form inputs
  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'selectedColor') {
      // When selectedColor changes, also set selectedColorHex based on selected color
      const selectedColorObj = colors.find(color => color.name === value);
      const selectedColorHex = selectedColorObj ? selectedColorObj.hexCode : '';
      setVariant(prevVariant => ({
        ...prevVariant,
        selectedColor: value,
        selectedColorHex: selectedColorHex,
      }));
    } else if (name === 'badgeNames') {
      // When badgeNames change, also set badgeColors based on selected badges
      const selectedBadgeNames = Array.from(e.target.selectedOptions, option => option.value);
      const selectedBadgeColors = selectedBadgeNames.map(name => {
        const badge = badges.find(b => b.name === name);
        return badge ? badge.color : '';
      });
      setVariant(prevVariant => ({
        ...prevVariant,
        badgeNames: selectedBadgeNames,
        badgeColors: selectedBadgeColors,
      }));
    } else {
      // Handle other variant input changes
      setVariant(prevVariant => ({ ...prevVariant, [name]: value }));
    }
  };
  // Handle image uploads for variants
  const handleVariantImageChange = (e) => {
    setVariant((prevVariant) => ({ ...prevVariant, images: Array.from(e.target.files) }));
  };

  // Add a new size-price-discountPrice row in the variant form
  const addSizePrice = () => {
    setVariant((prevVariant) => ({
      ...prevVariant,
      sizes: [...prevVariant.sizes, ''],
      prices: [...prevVariant.prices, ''],
      discountPrices: [...prevVariant.discountPrices, ''],
    }));
  };

  // Handle changes in sizes, prices, and discountPrices arrays
  const handleSizePriceChange = (index, value, type) => {
    setVariant((prevVariant) => {
      const updatedArray = [...prevVariant[type]];
      updatedArray[index] = value;
      return { ...prevVariant, [type]: updatedArray };
    });
  };

  // Function to add a variant to the product
  const addVariant = () => {
    if (variant.selectedColor && variant.sizes.length > 0 && variant.stock) {
      if (variantCount >= 4) {
        alert('You can only add up to 4 variants.');
        return;
      }

      setProduct((prevProduct) => ({
        ...prevProduct,
        variants: [...prevProduct.variants, { ...variant }],
      }));

      setVariantCount((prevCount) => prevCount + 1);

      // Reset variant state
      setVariant({
        selectedColor: '',
        selectedColorHex: '',
        sizes: [],
        prices: [],
        discountPrices: [],
        deliveryTimes: '',
        badgeNames: [],
        badgeColors: [],
        stock: '',
        description: '',
        images: [],
      });

      // Hide the variant section after adding
      setIsVariantVisible(false);
    } else {
      alert('Please fill in all required fields for the variant.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all variants have images
    for (let i = 0; i < product.variants.length; i++) {
      if (product.variants[i].images.length === 0) {
        alert(`Please upload images for variant ${i + 1}.`);
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('categories', JSON.stringify(product.categories));
    formData.append('mainPrice', product.mainPrice);
    formData.append('discountPrice', product.discountPrice);
    formData.append('mainBadgeName', product.mainBadgeName);
    formData.append('mainBadgeColor', product.mainBadgeColor);
    formData.append('gender', product.gender);
    formData.append('mainImage', product.mainImage);

    // Append variants as JSON string excluding images

    
    const variantsWithoutImages = product.variants.map((variant) => ({
      colorName: variant.selectedColor,
      hexCode: variant.selectedColorHex,
      sizes: variant.sizes,
      prices: variant.prices,
      discountPrices: variant.discountPrices,
      deliveryTimes: variant.deliveryTimes,
      badgeNames: variant.badgeNames,
      badgeColors: variant.badgeColors,
      stock: variant.stock,
      description: variant.description,
    }));
    formData.append('variants', JSON.stringify(variantsWithoutImages));

    // Append images with field names 'images-0' to 'images-3'
    product.variants.forEach((variant, index) => {
      variant.images.forEach((image) => {
        formData.append(`images-${index}`, image);
      });
    });

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product created:', response.data);
      setSuccessMessage('Product created successfully!');
      
      // Reset the form after successful submission
      setProduct({
        name: '',
        categories: [],
        mainPrice: '',
        discountPrice: '',
        mainBadgeName: '',
        mainBadgeColor: '',
        gender: '',
        variants: [],
        mainImage: null,
      });
      setVariant({
        selectedColor: '',
        selectedColorHex: '',
        sizes: [],
        prices: [],
        discountPrices: [],
        deliveryTimes: '',
        badgeNames: [],
        badgeColors: [],
        stock: '',
        description: '',
        images: [],
      });
      setVariantCount(0);
      setIsVariantVisible(false); // Ensure variant form is hidden
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4 md:pl-[400px]  sm:p-10 md:p-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Product</h1>
      {successMessage && (
        <div className="bg-green-100 text-green-700 border border-green-300 p-4 mb-4 rounded">
          {successMessage}
        </div>
      )}
      <div className="p-6 border-2 border-gray-300 border-dashed rounded-lg shadow-lg bg-white w-full max-w-5xl">
        {/* Product Information */}
        <div className="mb-6">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={product.name}
            onChange={handleInputChange}
            className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="categories"
            value={product.categories}
            onChange={(e) =>
              setProduct({
                ...product,
                categories: Array.from(e.target.selectedOptions, (option) => option.value),
              })
            }
            multiple
            className="border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
              Select Categories
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="mainPrice"
            placeholder="Main Price"
            value={product.mainPrice}
            onChange={handleInputChange}
            className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="discountPrice"
            placeholder="Discount Price"
            value={product.discountPrice}
            onChange={handleInputChange}
            className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="mainBadgeName"
            value={product.mainBadgeName}
            onChange={handleInputChange}
            className="border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select Main Badge
            </option>
            {badges.map((badge) => (
              <option key={badge._id} value={badge.name}>
                {badge.name} ({badge.color})
              </option>
            ))}
          </select>
          <select
            name="gender"
            value={product.gender}
            onChange={handleInputChange}
            className="border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
            {genders.map((gender) => (
              <option key={gender._id} value={gender.type}>
                {gender.type}
              </option>
            ))}
          </select>
          <input
            type="file"
            name="mainImage"
            onChange={(e) => setProduct({ ...product, mainImage: e.target.files[0] })}
            className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Variant Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Variant Information</h2>
          {isVariantVisible && (
            <>
              {/* Variant Color and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <select
                  name="selectedColor"
                  value={variant.Color}
                  onChange={handleVariantChange}
                  className="border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Color
                  </option>
                  {colors.map((color) => (
                    <option key={color._id} value={color.name}>
                      {color.name} ({color.hexCode})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock Quantity"
                  value={variant.stock}
                  onChange={handleVariantChange}
                  className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Variant Description and Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <textarea
                  name="description"
                  placeholder="Variant Description"
                  value={variant.description}
                  onChange={handleVariantChange}
                  className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
                <input
                  type="file"
                  name="images"
                  onChange={handleVariantImageChange}
                  className="px-4 py-3 border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  multiple
                  required
                />
              </div>

              {/* Sizes and Prices */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Sizes and Prices</h3>
                {variant.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={size}
                      onChange={(e) => handleSizePriceChange(index, e.target.value, 'sizes')}
                      className="border border-gray-300 bg-white rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled>
                        Select Size
                      </option>
                      {sizes.map((sizeOption) => (
                        <option key={sizeOption._id} value={sizeOption.name}>
                          {sizeOption.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.prices[index]}
                      onChange={(e) => handleSizePriceChange(index, e.target.value, 'prices')}
                      className="px-4 py-3 border border-gray-300 bg-white rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Discount Price"
                      value={variant.discountPrices[index]}
                      onChange={(e) => handleSizePriceChange(index, e.target.value, 'discountPrices')}
                      className="px-4 py-3 border border-gray-300 bg-white rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSizePrice}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  <FaPlus className="mr-2" /> Add Size & Price
                </button>
              </div>

              {/* Badge Names and Colors */}
              <select
                name="badgeNames"
                value={variant.badgeNames}
                onChange={handleVariantChange}
                className="border border-gray-300 bg-white rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                multiple
              >
                <option value="" disabled>
                  Select Variant Badges
                </option>
                {badges.map((badge) => (
                  <option key={badge._id} value={badge.name}>
                    {badge.name} ({badge.color})
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Add/Cancel Variant Button */}
          <div className="mb-4">
            
            {isVariantVisible && variantCount < 5 && (
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mt-2"
              >
                <FaPlus className="mr-2" /> Save Variant
              </button>
            )}
          </div>
        </div>

        {/* Display Added Variants */}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Product Variants</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-gray-600">Color</th>
                <th className="py-2 px-4 border-b text-gray-600">Sizes</th>
                <th className="py-2 px-4 border-b text-gray-600">Stock</th>
                <th className="py-2 px-4 border-b text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No variants added.
                  </td>
                </tr>
              ) : (
                product.variants.map((v, index) => (
                  <tr key={index} className="text-center">
                    <td className="py-2 px-4 border-b flex items-center justify-center">
                      {/* Display color swatch */}
                      <span
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: v.hexCode }}
                      ></span>
                      {v.colorName} ({v.hexCode})
                    </td>
                    <td className="py-2 px-4 border-b">{v.sizes.join(', ')}</td>
                    <td className="py-2 px-4 border-b">{v.stock}</td>
                    <td className="py-2 px-4 border-b flex justify-center space-x-2">
                    <button
              type="button"
              onClick={() => setIsVariantVisible(!isVariantVisible)} // Toggle variant form visibility
              className={`flex items-center px-4 py-2 rounded transition ${
                isVariantVisible ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              disabled={ !isVariantVisible} // Disable if max variants reached
            >
              Edit
            </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        onClick={() => {
                          const updatedVariants = product.variants.filter((_, i) => i !== index);
                          setProduct({ ...product, variants: updatedVariants });
                          setVariantCount((prevCount) => prevCount - 1);
                          axios.delete(`/products/varients/${v._id}`)
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full"
          >
            Edit Product
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductEdit;
