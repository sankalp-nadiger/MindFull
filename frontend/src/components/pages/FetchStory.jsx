import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Stories = () => {
  const [stories, setStories] = useState([]); // State to store stories
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:8000/api/story/stories", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`, // Add token from localStorage
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch stories");
        }

        setStories(data.stories || []); // Save fetched stories
      } catch (err) {
        setError(err.message); // Set error state
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Handle navigation to the CreateStory page
  const handleAddStory = () => {
    navigate("/createStory"); // Navigate to the "Create Story" page
  };

  if (loading) {
    return <div className="text-center mt-10">Loading stories...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-black via-[#0a1f44] to-black text-white">
      <div className="p-6 max-w-6xl w-full bg-[#1a1a2e] rounded-lg shadow-lg text-center relative">
        <h2 className="text-2xl font-bold mb-4">Stories</h2>
        <button
          onClick={handleAddStory}
          className="absolute top-4 right-4 bg-red-600 text-white p-2 w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-5xl flex items-center justify-center"
        >
          +
        </button>

        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {stories.map((story) => (
              <div
                key={story._id}
                className="p-4 bg-[#252a34] rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-purple-500"
              >
                {story.type === "image" ? (
                  <img src={story.content} alt="Story" className="rounded-lg w-full" />
                ) : (
                  <iframe
                    className="rounded-lg w-full"
                    src={
                      story.content.includes("youtube.com/watch")
                        ? `https://www.youtube.com/embed/${new URL(story.content).searchParams.get("v")}`
                        : story.content
                    }
                    title="Video Player"
                    width="100%"
                    height="auto"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
                <div className="flex items-center space-x-3 mb-0 pt-6">
                  {/* User Avatar */}
                  {story.user?.avatar ? (
                    <img
                      src={story.user.avatar} // Assuming the avatar URL is stored here
                      alt={`${story.user.username}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {story.user?.username?.[0].toUpperCase()}
                    </div>
                  )}
                  <div className="mt-2 text-gray-400 text-sm">By: {story.user.username}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-lg">No stories available.</div>
        )}
      </div>
    </div>
  );
};

export default Stories;
