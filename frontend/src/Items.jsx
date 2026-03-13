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
      <h2>Items</h2>
      <div>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Items;