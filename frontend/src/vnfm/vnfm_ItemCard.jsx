import stylesItemCard from "./vnfm_ItemCard.module.css";

// Utility to format timestamp nicely
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

export default function ItemCard({ item }) {
  return (
    <div className={stylesItemCard.cardWrapper}>
      <div className={stylesItemCard.card}>
        <div className={stylesItemCard.imageRow}>
          {item.photos.front && (
            <img
              src={`./images/${item.photos.front}`}
              alt="Front"
              className={stylesItemCard.image}
            />
          )}
          {item.photos.back && (
            <img
              src={`./images/${item.photos.back}`}
              alt="Back"
              className={stylesItemCard.image}
            />
          )}
        </div>
        <div className={stylesItemCard.title}>{item.title}</div>
        <div className={stylesItemCard.description}>{item.description}</div>
        <div className={stylesItemCard.meta}>
          posted by {item.username} on {formatDate(item.timestamp)}
        </div>
        <div className={stylesItemCard.bottomRow}>
          <span className={stylesItemCard.upvote}>👍 {item.upvotes}</span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={stylesItemCard.link}
          >
            View Page
          </a>
        </div>
      </div>
    </div>
  );
}