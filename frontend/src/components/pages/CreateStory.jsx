import React, { useState } from "react";

const CreateStory = () => {
  const [type, setType] = useState("image"); // Story type (image/video)
  const [content, setContent] = useState(""); // Story content URL (image/video)
  const [file, setFile] = useState(null); // File content (image/video)
  const [loading, setLoading] = useState(false); // Loading state
  const [message, setMessage] = useState(null); // Success/error message
  const [method, setMethod] = useState("url"); // URL or File method selection

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append("type", type);
  
      if (type === "video" && method === "file" && file) {
        formData.append("content", file);
      } else if (type === "image" && method === "file" && file) {
        formData.append("content", file);
      } else if (type === "video" && method === "url" && content) {
        formData.append("content", content);
      } else if (type === "image" && method === "url" && content) {
        formData.append("content", content);
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/story/storiesCreate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to create story");
      }
  
      setMessage("Story created successfully!");
      setContent(""); // Clear content URL
      setFile(null); // Clear file
  
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/mainPage"; // Change to your main page URL if needed
      }, 3000);
  
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-blue-900 to-black p-6">
      <div className="max-w-4xl w-full bg-gray-900 text-white font-sans shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-100">Create a Story</h2>
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

          <div className="flex gap-4">
  {/* URL or File method selection */}
  <div className="w-1/2">
    <label className="text-gray-300 mr-2">URL</label>
    <input
      type="radio"
      name="method"
      value="url"
      checked={method === "url"}
      onChange={() => setMethod("url")}
      className="mr-2"
    />
  </div>
  <div className="w-1/2">
    <label className="text-gray-300 mr-2">File</label>
    <input
      type="radio"
      name="method"
      value="file"
      checked={method === "file"}
      onChange={() => setMethod("file")}
      className="mr-2"
    />
  </div>
</div>


          {/* Display content input based on type and selected method */}
          {type === "image" && method === "url" && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter Image URL"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
            </div>
          )}

          {type === "image" && method === "file" && (
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
            </div>
          )}

          {type === "video" && method === "url" && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter Video URL"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
            </div>
          )}

          {type === "video" && method === "file" && (
            <div className="w-full">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full"
                required
              />
            </div>
          )}

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
