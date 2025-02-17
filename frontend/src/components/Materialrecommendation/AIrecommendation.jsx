import { useEffect, useState } from "react";

const Recommendations = () => {
  const [data, setData] = useState({ videos: [], books: [], blogs: [], podcasts: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [players, setPlayers] = useState({});
  const token = sessionStorage.getItem("accessToken");
  console.log(token)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/resources/create-resource`, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const result = await response.json();
        setData({
          videos: result.data.filter(item => item.type === "video") || [],
          books: result.data.filter(item => item.type === "book") || [],
          blogs: result.data.filter(item => item.type === "blog") || [],
          podcasts: result.data.filter(item => item.type === "podcast") || [],
          events: result.data.filter(item => item.type === "event") || [],
        });
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const markAsWatched = async (resourceTitle) => {
    console.log(resourceTitle); // Check the title
    try {
      await fetch(`${import.meta.env.VITE_BASE_API_URL}/resources/watched`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recommendationTitle: resourceTitle })  // Send title
      });
    } catch (err) {
      console.error("Failed to mark resource as watched", err);
    }
  };
  // Function to handle YouTube video play and pause previous video
  // Handle video play and mark as watched
const handleVideoPlay = (videoIndex, video) => {
  // Check if there's a previously active video
  if (activeVideo !== null && activeVideo !== videoIndex) {
    // Pause the previously active video
    if (players[activeVideo]) {
      players[activeVideo].pauseVideo();
    }
  }

  // Set the current active video index to the new one
  setActiveVideo(videoIndex);

  // Play the new video
  if (players[videoIndex]) {
    players[videoIndex].playVideo();
  }

  // Mark the video as watched
  markAsWatched(video.title);
};


  // Function to initialize YouTube Player API
  const onYouTubeIframeAPIReady = (videoIndex) => {
    // Create a new player for the video using the YouTube Player API
    const player = new YT.Player(`video-${videoIndex}`, {
      events: {
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            // Call handleVideoPlay when the video starts playing
            handleVideoPlay(videoIndex, data.videos[videoIndex]);
          }
        },
      },
    });
  
    // Save the player instance in the players state
    setPlayers((prev) => ({
      ...prev,
      [videoIndex]: player,
    }));
  };
  
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-900 to-black p-6">
      <div className="max-w-4xl w-full bg-gray-900 text-white font-sans shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold font-sans text-amber-300">Recommended Content</h2>
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="space-y-8">
          {data.videos.length > 0 && (
            <section>
              <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Videos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.videos.map((video, index) => {
                  let embedUrl = video.url.includes("youtube.com/watch")
                    ? `https://www.youtube.com/embed/${new URLSearchParams(new URL(video.url).search).get('v')}`
                    : video.url;
                  return (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg h-[300px] flex flex-col">
                      <h4 className="text-lg font-medium mb-2 truncate">{video.title}</h4>
                      <iframe
                        className="w-full h-full rounded"
                        id={`video-${index}`}
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                        onLoad={() => onYouTubeIframeAPIReady(index)}
                        onClick={() => handleVideoPlay(index, video)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {data.books.length > 0 && (
            <section>
              <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.books.map((book, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg h-[200px] flex flex-col">
                    <h4 className="text-lg font-medium mb-2 truncate">{book.title}</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">{book.description}</p>
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2"
                      onClick={() => markAsWatched(book.title)}
                    >Read More</a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
