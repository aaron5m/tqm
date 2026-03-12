import { useEffect, useState } from "react";

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
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;