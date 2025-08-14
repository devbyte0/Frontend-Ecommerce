import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Badge from '../components/Badge';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductView = () => {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDiscountPrice, setSelectedDiscountPrice] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [viewers, setViewers] = useState(0);
  const socketRef = useRef(null);
 
  // Fetch product data
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products/${id}`);
      setProduct(response.data);
      console.log("Fetched product:", response.data);

      if (response.data.variants && response.data.variants.length > 0) {
        const defaultVariant = response.data.variants[0]; // Always variant 0
        setSelectedVariant(defaultVariant);

        if (
          defaultVariant.sizes &&
          defaultVariant.prices &&
          defaultVariant.discountPrices &&
          defaultVariant.sizes.length > 0 &&
          defaultVariant.prices.length > 0 &&
          defaultVariant.discountPrices.length > 0
        ) {
          setSelectedSize(defaultVariant.sizes[0]);
          setSelectedPrice(defaultVariant.prices[0]);
          setSelectedDiscountPrice(defaultVariant.discountPrices[0]);
          setSelectedColor(defaultVariant.colorName); // Assuming string like "Pink"
        }

        setMainImage(defaultVariant.images[0]);
      } else {
        console.warn("No variants available for this product.");
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/relatedproductfront/${id}`, {
        params: { excludeId: id }
      });
      if (response.status === 200) {
        const relatedProductArray = response.data[0]?.relatedProducts || [];
        setRelatedProducts(relatedProductArray);
        console.log('Related Products:', relatedProductArray);
      } else {
        console.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  useEffect(() => {
    fetchProduct();

    socketRef.current = io(`${import.meta.env.VITE_API_URI}`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.emit('joinProduct', id);

    socketRef.current.on('viewerCountUpdate', (count) => {
      setViewers(count);
      console.log(count);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    if (product && product.categories && product.categories.length > 0) {
      fetchRelatedProducts(product.categories);
    }
  }, [product]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    console.log("Selected variant:", variant);

    if (variant.sizes && variant.prices && variant.discountPrices && variant.discountPrices.length > 0 && variant.sizes.length > 0 && variant.prices.length > 0) {
      setSelectedSize(variant.sizes[0]);
      setSelectedPrice(variant.prices[0]);
      setSelectedDiscountPrice(variant.discountPrices[0]);
      setSelectedColor(variant.colorName);
    } else {
      setSelectedSize(null);
      setSelectedPrice(null);
      setSelectedDiscountPrice(null);
      setSelectedColor(null);
    }
    setMainImage(variant.images[0]);
  };

  const handleSizeChange = (size) => {
    const sizeIndex = selectedVariant.sizes.indexOf(size);
    if (sizeIndex !== -1 && selectedVariant.prices[sizeIndex] !== undefined) {
      setSelectedSize(size);
      setSelectedPrice(selectedVariant.prices[sizeIndex]);
      setSelectedDiscountPrice(selectedVariant.discountPrices[sizeIndex]);
      console.log(`Selected size: ${size}, Price: ${selectedVariant.prices[sizeIndex]}`);
    }
  };

  const getDeliveryTime = () => {
    if (selectedVariant && selectedVariant.deliveryTimes && selectedVariant.deliveryTimes.length > 0) {
      return selectedVariant.deliveryTimes.join(', ') + ' days';
    }
    return '';
  };

  const getVariantBadges = () => {
    if (selectedVariant && selectedVariant.badgeNames && selectedVariant.badgeColors) {
      const length = Math.min(selectedVariant.badgeNames.length, selectedVariant.badgeColors.length);
      const badges = [];
      for (let i = 0; i < length; i++) {
        badges.push({
          name: selectedVariant.badgeNames[i],
          color: selectedVariant.badgeColors[i],
        });
      }
      return badges;
    }
    return [];
  };

  const handleAddToCart = () => {
    console.log(selectedVariant.measureType, selectedVariant.unitName);
    const productToAdd = {
      variantId: selectedVariant._id,
      productId: id,
      name: product.name,
      mainImage,
      price: selectedDiscountPrice ? selectedDiscountPrice : product.discountPrice,
      size: selectedSize,
      measureType: selectedVariant.measureType,
      unitName: selectedVariant.unitName,
      color: selectedColor,
      quantity: 1
    };
    addToCart(productToAdd);
    toast.success('Add To Cart Successful', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <ToastContainer />
      {product && selectedVariant ? (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col items-center">
              <div className="w-full h-[420px] flex items-center justify-center bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
                {getVariantBadges().length > 0 && (
                  getVariantBadges().map((badge, index) => (
                    <Badge
                      key={index}
                      name={badge.name}
                      color={badge.color}
                      position={index % 2 === 0 ? "topRight" : "bottomLeft"}
                    />
                  ))
                )}
              </div>
              <div className="flex space-x-2 mb-4">
                {selectedVariant.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shadow-sm transition-all duration-200 ${mainImage === image ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-200'}`}
                    onClick={() => setMainImage(image)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {selectedVariant.description && (
                <div className="w-full mt-2 bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <h2 className="text-lg font-bold mb-2 text-gray-800">Product Details</h2>
                  <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: selectedVariant.description }} />
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-grow lg:w-1/2 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9s-9-4-9-9a9 9 0 0118 0z" />
              </svg>
              {viewers} {viewers === 1 ? 'person is' : 'people are'} viewing this product
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-2">
              {selectedDiscountPrice ? (
                <>
                  <span className="text-xl text-gray-400 line-through">${selectedPrice}</span>
                  <span className="text-2xl text-yellow-600 font-bold">${selectedDiscountPrice}</span>
                </>
              ) : (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.mainPrice}</span>
                  <span className="text-2xl text-yellow-600 font-bold">${product.discountPrice}</span>
                </>
              )}
              {product.mainBadgeName && product.mainBadgeColor && (
                <Badge name={product.mainBadgeName} color={product.mainBadgeColor} position="topRight" />
              )}
            </div>

            {/* Color Selector */}
            <div>
              <p className="text-base font-semibold mb-2">Color:</p>
              <div className="flex space-x-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.hexCode}
                    style={{ backgroundColor: variant.hexCode }}
                    onClick={() => handleVariantChange(variant)}
                    className={`w-9 h-9 rounded-full border-4 transition-all duration-200 ${selectedVariant.hexCode === variant.hexCode ? 'border-yellow-500 scale-110 shadow-lg' : 'border-gray-200'}`}
                    aria-label={`Select color ${variant.colorName}`}
                  >
                    <span className="sr-only">{variant.colorName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <p className="text-base font-semibold mb-2">
                {selectedVariant.measureType ? selectedVariant.measureType : "Size"}:
              </p>
              <div className="flex space-x-3">
                {selectedVariant.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-5 py-2 rounded-lg border font-semibold text-base flex items-center transition-all duration-200 ${isSelected ? 'bg-yellow-500 text-white shadow-lg border-yellow-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-yellow-50'}`}
                    >
                      <span className={`${isSelected ? 'text-white' : 'text-yellow-700'} font-bold`}>
                        {size}
                      </span>
                      {selectedVariant.unitName && (
                        <span className={`ml-1 text-xs font-semibold ${isSelected ? 'text-white' : 'text-yellow-700'}`}>
                          {selectedVariant.unitName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-base font-semibold mb-2">Estimated Delivery:</p>
              <p className="text-gray-700 font-medium">{getDeliveryTime()}</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
              >
                Add to Cart
              </button>
              <button
                className="w-full bg-white border border-yellow-500 text-yellow-600 text-lg font-bold px-6 py-3 rounded-xl shadow hover:bg-yellow-50 transition-all duration-200"
                disabled
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Related Products */}
          <div className="lg:w-[350px] w-full mt-10 lg:mt-0 bg-white shadow-2xl rounded-xl p-6 border border-gray-100 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Related Products</h2>
            <div className="flex flex-col space-y-4">
              {relatedProducts.length > 0 ? (
                relatedProducts
                  .filter((relatedProduct) => relatedProduct.productId !== product._id)
                  .map((relatedProduct) => (
                    <Link
                      to={`/products/${relatedProduct.productId}`}
                      key={relatedProduct.productId}
                      className="flex items-center gap-3 bg-gray-50 hover:bg-yellow-50 rounded-lg p-3 shadow-sm transition-all duration-200 relative"
                    >
                      <img
                        src={relatedProduct.mainImage}
                        alt={relatedProduct.name}
                        className="w-14 h-14 object-contain rounded-md border border-gray-200"
                      />
                      <div className="flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-gray-900">{relatedProduct.name}</h3>
                        <p className="text-sm text-yellow-600 font-bold">${relatedProduct.mainPrice}</p>
                      </div>
                      {relatedProduct.mainBadgeName && relatedProduct.mainBadgeColor && (
                        <Badge
                          name={relatedProduct.mainBadgeName}
                          color={relatedProduct.mainBadgeColor}
                          position="topRight"
                        />
                      )}
                    </Link>
                  ))
              ) : (
                <p className="text-sm text-gray-500">No related products available.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center h-[400px]">
          <p className="text-lg text-gray-500 animate-pulse">Loading product...</p>
        </div>
      )}
    </div>
  );
};

export default ProductView;
