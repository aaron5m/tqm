import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./_vnfm.module.css";

export default function Upload() {
  const { compeer, nodeUrl } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!compeer) {
      navigate("/signin", { state: { from: location.pathname } });
    }
  }, [compeer, navigate]);


  const [formData, setFormData] = useState({
    username: compeer,
    url: "",
    title: "",
    description: "",
    front: null,
    back: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData to send files
    const data = new FormData();
    data.append("username", formData.username);
    data.append("url", formData.url);
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.front) data.append("front", formData.front);
    if (formData.back) data.append("back", formData.back);

    try {
      const res = await fetch(`${nodeUrl}/upload`, {
        method: "POST",
        credentials: "include",
        body: data, // FormData automatically sets multipart/form-data
      });
      const result = await res.json();
      console.log(result);
      setFormData({ url: "", title:"", description: "", front: null, back: null });
      if (res.ok) navigate("/");
    } catch (err) {
      console.error("Error submitting link:", err);
      alert("Error submitting link.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="url"
            placeholder="URL"
            value={formData.url}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            className={styles.input}
            rows={3}
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div>
            <label>Front Pic ( less than 1mb, please ) </label><br></br>
            <input
              className={styles.input}
              type="file"
              name="front"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Back Pic ( less than 1mb, please ) </label><br></br>
            <input
              className={styles.input}
              type="file"
              name="back"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <button type="submit" className={styles.button}>
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}