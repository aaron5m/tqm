import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import ItemCard from "./vnfm_ItemCard";
import styles from "./_vnfm.module.css";

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
      <div className={styles.centrify}>
        {items.map((item) => (
            <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Items;