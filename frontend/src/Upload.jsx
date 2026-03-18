import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";

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
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error("Error submitting link:", err);
      alert("Error submitting link.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="url"
            placeholder="URL"
            value={formData.url}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            className="input"
            rows={3}
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div>
            <label>Front </label>
            <input
              className="input"
              type="file"
              name="front"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Back </label>
            <input
              className="input"
              type="file"
              name="back"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="button">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}