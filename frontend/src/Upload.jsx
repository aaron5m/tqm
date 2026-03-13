import { useState } from "react";
import "./App.css";

export default function Upload() {
  const [formData, setFormData] = useState({
    url: "",
    description: "",
    frontPhoto: null,
    backPhoto: null,
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
    data.append("url", formData.url);
    data.append("description", formData.description);
    if (formData.frontPhoto) data.append("frontPhoto", formData.frontPhoto);
    if (formData.backPhoto) data.append("backPhoto", formData.backPhoto);

    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        credentials: "include",
        body: data, // FormData automatically sets multipart/form-data
      });
      const result = await res.json();
      console.log("Created link:", result);
      alert("Link uploaded!");
      setFormData({ url: "", description: "", frontPhoto: null, backPhoto: null });
    } catch (err) {
      console.error("Error submitting link:", err);
      alert("Error submitting link.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="centrify">Link To Your Shirt</h2>
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
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div>
            <label className="centrify">Front</label>
            <input
              className="input"
              type="file"
              name="frontPhoto"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="centrify">Back</label>
            <input
              className="input"
              type="file"
              name="backPhoto"
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