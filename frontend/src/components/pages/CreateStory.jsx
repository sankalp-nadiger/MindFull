import React, { useState } from "react";

const CreateStory = () => {
  const [type, setType] = useState("image"); // Story type
  const [content, setContent] = useState(""); // Story content URL
  const [loading, setLoading] = useState(false); // Loading state
  const [message, setMessage] = useState(null); // Success/error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/story/storiesCreate", {
        method: "POST",
        headers: {
         // "Authorization": `Bearer ${localStorage.getItem("token")}`, // Add token from localStorage
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create story");
      }

      setMessage("Story created successfully!");
      setContent(""); // Clear the input
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Create a Story</h2>
      {message && <div className="text-center mb-4 text-blue-500">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <input
          type="text"
          placeholder="Enter content URL"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Story"}
        </button>
      </form>
    </div>
  );
};

export default CreateStory;
