import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import ItemCard from "./ItemCard";

function Items() {
  const { fastapiUrl } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${fastapiUrl}/items`, {
      method: "GET",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setItems(data.items));
  }, []);

  return (
    <div>
      <div style={{ textAlign: "center", margin: "2vh" }}>
        {items.map((item) => (
            <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Items;