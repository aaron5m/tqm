import React from "react";

// Utility to format timestamp nicely
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(); // e.g., "Mar 13, 2026, 3:11 AM"
}

export default function ItemCard({ item }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      maxWidth: "500px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      fontFamily: "sans-serif",
    }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {item.photos.front && (
          <img
            src={`/uploads/${item.photos.front}`}
            alt="Front"
            style={{ width: "48%", borderRadius: "4px", objectFit: "cover" }}
          />
        )}
        {item.photos.back && (
          <img
            src={`../images/${item.photos.back}`}
            alt="Back"
            style={{ width: "48%", borderRadius: "4px", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>{item.description}</strong>
      </div>
      <div style={{ fontSize: "0.9em", color: "#555", marginBottom: "8px" }}>
        Posted by {item.username} on {formatDate(item.timestamp)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>👍 {item.upvotes}</span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          View Product
        </a>
      </div>
    </div>
  );
}