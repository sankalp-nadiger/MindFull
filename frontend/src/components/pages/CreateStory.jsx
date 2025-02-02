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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-blue-900 to-black p-6">
  <div className="max-w-4xl w-full bg-gray-900 text-white font-sans shadow-lg rounded-lg p-6">
    <h2 className="text-2xl font-bold  mb-4 text-center text-gray-100">Create a Story</h2>
    {message && <div className="text-center mb-4 text-blue-400">{message}</div>}

    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <input
        type="text"
        placeholder="Enter content URL"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
        required
      />

      
      <button
        type="submit"
        disabled={loading}
        className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md font-semibold hover:scale-105 transition-transform hover:shadow-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "🚀 Upload Story"}
      </button>
    </form>
  </div>
</div>

  );
};

export default CreateStory;
