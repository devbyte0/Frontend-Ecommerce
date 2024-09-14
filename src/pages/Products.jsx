import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getProducts() {
    setLoading(true);
    try {
      const allProducts = await axios.get("http://localhost:3000/api/products");
      setProducts(allProducts.data);
      
    } catch (error) {
      console.error("Error fetching products", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="flex">
      {loading ? (
        <p>Loading products...</p>
      ) : (
        products.map((info) => (
          <ProductCard key={info._id} id={info._id} Data={info} />
        ))
      )}
    </div>
  );
}

export default Products;