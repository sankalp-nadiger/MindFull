import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Posts = () => {
  const [gratitudePosts, setGratitudePosts] = useState([]); // State to store gratitude posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Hook for navigation
  const [userReaction, setUserReaction] = useState(null);

  const handleToggleReaction = (postId, type) => {
    if (userReaction === type) {
      // If the user clicks the same reaction again, remove it (dislike)
      setUserReaction(null);
      handleRemoveReaction(postId, type);
    } else {
      // Otherwise, add the new reaction
      setUserReaction(type);
      handleAddReaction(postId, type);
    }
  };

  useEffect(() => {
    const fetchGratitudePosts = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/posts`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`, // Add token from sessionStorage
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch gratitude posts");
        }

        setGratitudePosts(data.posts || []); // Save fetched gratitude posts
      } catch (err) {
        setError(err.message); // Set error state
      } finally {
        setLoading(false);
      }
    };

    fetchGratitudePosts();
  }, []);

  // Handle navigation to the Create Gratitude Post page
  const handleAddGratitudePost = () => {
    navigate("/createPost"); // Navigate to the "Create Gratitude Post" page
  };
  const handleRemoveReaction = async (postId, reactionType) => {
    try {
      console.log(postId);
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/reaction`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          reactionType,
          remove: true,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove reaction.");
      }
  
      // Update the reactions for the post after success
      setGratitudePosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                reactions: {
                  ...post.reactions,
                  [reactionType]: Math.max((post.reactions[reactionType] || 1) - 1, 0), // Ensure it doesn't go below 0
                },
              }
            : post
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Handle adding reactions
  const handleAddReaction = async (postId, reactionType) => {
    try {
      console.log(postId)
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/reaction`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          reactionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update reaction.");
      }

      // Update the reactions for the post after success
      setGratitudePosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, reactions: { ...post.reactions, [reactionType]: (post.reactions[reactionType] || 0) + 1 } }
            : post
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading gratitude posts...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
  
      <div className="p-6 max-w-6xl w-full bg-[#1a1a2e] rounded-lg shadow-lg text-center relative">
        {/* Fixed "Thank Someone" Text */}
        <h2 className="text-3xl font-bold mb-4">Thank Someone Today!</h2>

        {/* "+" Button to Add Gratitude Post */}
        <button
          onClick={handleAddGratitudePost}
          className="absolute top-4 right-4 bg-red-600 text-white p-3 w-12 h-12 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-3xl flex items-center justify-center"
        >
          +
        </button>

        {/* Display Gratitude Posts */}
        {gratitudePosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {gratitudePosts.map((post, index) => (
              <div
                key={index}
                className="p-4 bg-[#252a34] rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-purple-500"
              >
                <div className="flex items-center space-x-3 mb-4">
                  {/* User Avatar */}
                  {post.user?.avatar ? (
                    <img
                      src={post.user.avatar} // Assuming the avatar URL is stored here
                      alt={`${post.user.username}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {post.user?.username?.[0].toUpperCase()}
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <p className="text-sm font-semibold text-white">{post.user?.username}</p>
                  </div>
                </div>

                <p className="text-lg font-semibold text-white">{post.content}</p>

               {/* Reactions Buttons */}
<div className="mt-4 flex justify-between items-center">
  {/* Reactions Buttons */}
  <div className="flex space-x-4">
      {/* Reaction Buttons */}
      {[
        { type: "like", emoji: "👍" },
        { type: "support", emoji: "🤝" },
        { type: "love", emoji: "❤️" },
      ].map(({ type, emoji }) => (
        <button
          key={type}
          onClick={() => handleToggleReaction(post._id, type)}
          className={`px-4 py-2 rounded-md text-white flex items-center space-x-2 ${
            userReaction === type ? "bg-green-500" : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          <span>{emoji}</span>
          <span>{post.reactions[type] || 0}</span>
        </button>
      ))}
    </div>

</div>
</div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-lg">No gratitude posts available.</div>
        )}
      </div>
  );
};

export default Posts;
