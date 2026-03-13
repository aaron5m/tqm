import { useEffect, useState } from "react";
import ItemCard from "./ItemCard";

function Items() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/items")
      .then(res => res.json())
      .then(data => setItems(data.items));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Items;