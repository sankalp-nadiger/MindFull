import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const CreatePost = () => {
  const [content, setContent] = useState(""); // Text content for the post
  const [loading, setLoading] = useState(false); // Loading state
  const [message, setMessage] = useState(null); // Success/error message
  const [isAnonymous, setIsAnonymous] = useState(false); // State for anonymous post
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare the form data (just content for this case)
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isAnonymous", isAnonymous);

      const response = await fetch("http://localhost:8000/api/post/postsCreate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`, // Add token from sessionStorage
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create gratitude post");
      }

      setMessage("Gratitude post created successfully!");
      setContent(""); // Clear the content

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/mainPage"); // Change to your gratitude posts page URL
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
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-100">Create a Gratitude Post</h2>
        {message && <div className="text-center mb-4 text-blue-400">{message}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Text input for gratitude post */}
          <div className="w-full">
            <textarea
              placeholder="Write your gratitude post here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="p-3 bg-gray-800 text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 w-full h-32"
              required
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="w-4 h-4 bg-gray-800 text-white"
            />
            <label className="text-gray-300">Keep yourself under the sheets – Post anonymously</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md font-semibold hover:scale-105 transition-transform hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Posting..." : "🚀 Post Gratitude"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
