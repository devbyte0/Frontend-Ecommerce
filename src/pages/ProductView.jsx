import React, { useRef,useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io-client
import Badge from '../components/Badge';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductView = () => {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams(); // Get product id from URL
  const [product, setProduct] = useState(null); // Product state
  const [selectedVariant, setSelectedVariant] = useState(null); // Selected color variant
  const [selectedSize, setSelectedSize] = useState(null); // Selected size
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedDiscountPrice, setSelectedDiscountPrice] = useState(null); // Selected price
  const [mainImage, setMainImage] = useState(''); // Main image for preview
  const [relatedProducts, setRelatedProducts] = useState([]); // Related products state
  const [viewers, setViewers] = useState(0); // Real-time viewer count
  const socketRef = useRef(null);

  // Initialize socket connection
  

  // Fetch product data
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/products/${id}`);
      setProduct(response.data);
      console.log("Fetched product:", response.data); // Debugging

      // Set default variant (first one in the list)
      if (response.data.variants && response.data.variants.length > 0) {
        const defaultVariant = response.data.variants[0];
        setSelectedVariant(defaultVariant);
        // Initialize size and price based on the first size
        setSelectedSize(defaultVariant.sizes[0]);
        setSelectedPrice(defaultVariant.prices[0]);
        setMainImage(defaultVariant.images[0]); // Set the default main image
      } else {
        console.warn("No variants available for this product.");
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  // Fetch related products based on categories
  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/relatedproductfront/${id}`, {
        params: { excludeId: id }
      });
  
      if (response.status === 200) {
        const relatedProductArray = response.data[0]?.relatedProducts || []; // Extract related products array
        setRelatedProducts(relatedProductArray); // Set state to the array directly
        console.log('Related Products:', relatedProductArray); // For debugging
      } else {
        console.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };
  

  // On component mount, fetch product data
  useEffect(() => {
    fetchProduct();
    
      // Initialize socket connection
      socketRef.current = io(`${import.meta.env.VITE_API_URI}`,{
        transports: ['websocket', 'polling'],
      }); // Set the socket reference

      // Join the product room
      socketRef.current.emit('joinProduct', id);
  
      // Listen for viewer count updates
      socketRef.current.on('viewerCountUpdate', (count) => {
        setViewers(count);
        console.log(count)
      });
  
      // Cleanup the socket connection when the component unmounts
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
  }, [id]);

  // Fetch related products when product data is loaded
  useEffect(() => {
    if (product && product.categories && product.categories.length > 0) {
      fetchRelatedProducts(product.categories);
    }
  }, [product]);

  // Handler for selecting variant (color)
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    console.log("Selected variant:", variant); // Debugging

    // Automatically select the first size and corresponding price
    if (variant.sizes && variant.prices && variant.discountPrices && variant.discountPrices.length > 0 && variant.sizes.length > 0 && variant.prices.length > 0) {
      setSelectedSize(variant.sizes[0]);
      setSelectedPrice(variant.prices[0]);
      setSelectedDiscountPrice(variant.discountPrices[0]);
    } else {
      setSelectedSize(null);
      setSelectedPrice(null);
      setSelectedDiscountPrice(null);
    }
    // Update main image
    setMainImage(variant.images[0]);
  };

  // Handler for selecting size
  const handleSizeChange = (size) => {
    const sizeIndex = selectedVariant.sizes.indexOf(size);
    if (sizeIndex !== -1 && selectedVariant.prices[sizeIndex] !== undefined) {
      setSelectedSize(size);
      setSelectedPrice(selectedVariant.prices[sizeIndex]);
      setSelectedDiscountPrice(selectedVariant.discountPrices[sizeIndex]);
      console.log(`Selected size: ${size}, Price: ${selectedVariant.prices[sizeIndex]}`); // Debugging
    }
  };

  // Calculate delivery time based on the selected variant
  const getDeliveryTime = () => {
    if (selectedVariant && selectedVariant.deliveryTimes && selectedVariant.deliveryTimes.length > 0) {
      return selectedVariant.deliveryTimes.join(', ') + ' days';
    }
    return '';
  };

  // Combine badgeNames and badgeColors into a single array of badge objects
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

    const productToAdd = {
      variantId: selectedVariant._id,
      productId: id,
      name: product.name,
      mainImage,
      price: selectedDiscountPrice? selectedDiscountPrice:product.discountPrice,
      size: selectedSize,
      colorName: selectedVariant.colorName,
      quantity: 1
    };
    addToCart(productToAdd);
    toast.success('Add To Cart Successfull', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
   });
  };

  // Render the product view
  return (
    <div className="relative container mx-auto p-6 flex mb-[50px] flex-col md:flex-row">
      <ToastContainer />
      {product && selectedVariant ? (
        <>
          {/* Product Image and Thumbnails */}
          <div className="w-full md:w-1/2">
            <div className="w-full h-96 relative overflow-hidden rounded-lg shadow-lg">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer"
              />
              {/* Variant Badges on Image */}
              {getVariantBadges().length > 0 && (
                getVariantBadges().map((badge, index) => (
                  <Badge
                    key={index}
                    name={badge.name}
                    color={badge.color}
                    position={index % 2 === 0 ? "topRight" : "bottomLeft"} // Example positioning
                  />
                ))
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              {selectedVariant.images.map((image, index) => (
                <div key={index} className="w-20 h-20 relative">
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-full object-contain rounded-md shadow-sm cursor-pointer border-2 ${
                      mainImage === image ? 'border-blue-500' : 'border-transparent'
                    } transition border duration-200`}
                    onClick={() => setMainImage(image)} // Update main image on click
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-grow md:w-1/2 md:ml-8 mt-6 md:mt-0">
            {/* Real-time Viewer Count */}
            <div className="text-sm text-gray-500 mb-2">
              {viewers} {viewers === 1 ? 'person is' : 'people are'} viewing this product
            </div>
            
            {/* Product Name */}
            <h1 className="text-3xl font-bold mb-3 lg:w-64   whitespace-normal break-words">{product.name}</h1>

            {/* Product Price */}
            {selectedDiscountPrice ? (
              <div>
                <p className="text-gray-800 mb-2 line-through">${selectedPrice}</p>
                <p className="text-green-600">${selectedDiscountPrice}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 mb-2 line-through">${product.mainPrice}</p>
                <p className="text-green-600">${product.discountPrice}</p>
              </div>
            )}

            {/* Product Description */}
            <p className="text-sm text-gray-600 mb-6">{selectedVariant.description}</p>

            {/* Color Selector */}
            <div className="mb-6">
              <p className="text-lg font-semibold mb-2">Color:</p>
              <div className="flex space-x-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.hexCode}
                    style={{ backgroundColor: variant.hexCode }}
                    onClick={() => handleVariantChange(variant)}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedVariant.hexCode === variant.hexCode ? 'border-black' : 'border-gray-200'
                    } transition border duration-200`}
                    aria-label={`Select color ${variant.colorName}`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <p className="text-lg font-semibold mb-2">Size:</p>
              <div className="flex space-x-3">
                {selectedVariant.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-5 py-2 rounded-md border ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Time */}
            <div className="mb-6">
              <p className="text-lg font-semibold mb-2">Estimated Delivery:</p>
              <p className="text-gray-600">{getDeliveryTime()}</p>
            </div>

            {/* Add to Cart Button */}
            <div>
              <button onClick={handleAddToCart} className="bg-orange-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-600 transition-colors duration-200">
                Add to Cart
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>Loading product...</p>
      )}

      {/* Related Products Section at the Top Right */}
      <div className="relative 2xl:absolute xl:absolute lg:absolute md:absolute  md:-bottom-[40%] md:left-0 w-full lg:w-[400px] h-auto overflow-y-scroll mt-[1.5rem] md:mt-0 bg-white shadow-md rounded-md p-4 z-10">
  <h2 className="text-lg font-semibold mb-4">Related Products</h2>
  <div className="flex flex-col space-y-4">
  {relatedProducts.length > 0 ? (
      relatedProducts
        .filter((relatedProduct) => relatedProduct.productId !== product._id) // Exclude current product
        .map((relatedProduct) => (
          <Link to={`/products/${relatedProduct.productId}`} key={relatedProduct.productId} className="hover:bg-gray-100 p-2 rounded-md relative">
            <div className="flex items-start">
              <img
                src={relatedProduct.mainImage}
                alt={relatedProduct.name}
                className="w-16 h-16 object-contain rounded-md mr-2"
              />
              <div>
                <h3 className="text-sm font-semibold break-words w-[150px]">{relatedProduct.name}</h3>
                <p className="text-sm text-gray-700">${relatedProduct.mainPrice}</p>
              </div>
            </div>
            {/* Main Badge for Related Product */}
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
  );
};

export default ProductView;
