import React from "react";

function ProductCard({  Data }) {
  const { name, description, price, imageUrl } = Data;

  return (
    <div style={styles.card}>
      <img src={imageUrl} alt={name} style={styles.image} />
      <div style={styles.content}>
        <h3>{name}</h3>
        <p>{description}</p>
        <p style={styles.price}>${price.toFixed(2)}</p>
        <button style={styles.button}>Add to Cart</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "250px",
    margin: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "contain",
  },
  content: {
    padding: "15px",
  },
  price: {
    fontWeight: "bold",
    color: "#4caf50",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default ProductCard;