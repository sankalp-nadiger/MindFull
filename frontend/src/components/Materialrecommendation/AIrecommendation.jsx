import { useEffect, useState } from "react";

const Recommendations = () => {
  const [data, setData] = useState({ videos: [], books: [], blogs: [], podcasts: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/resources/create-resource", {
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
        setData(result.data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const markAsWatched = async (resource) => {
    try {
      await fetch("http://localhost:8000/api/resources/watched", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recommendationId: resource.id })
      });
    } catch (err) {
      console.error("Failed to mark resource as watched", err);
    }
  };
  

  const handleVideoPlay = (videoIndex, video) => {
    if (activeVideo !== null && activeVideo !== videoIndex) {
      const previousVideo = document.getElementById(`video-${activeVideo}`);
      previousVideo?.pause();
    }
    setActiveVideo(videoIndex);
    markAsWatched({ id: video.id, type: "video" });
  };

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
                      onClick={() => markAsWatched({ id: book.id, type: "book" })}
                    >Read More</a>
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.podcasts.length > 0 && (
            <section>
              <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Podcasts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.podcasts.map((podcast, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg h-[200px] flex flex-col">
                    <h4 className="text-lg font-medium mb-2 truncate">{podcast.title}</h4>
                    <audio controls className="w-full" onPlay={() => markAsWatched({ id: podcast.id, type: "podcast" })}>
                      <source src={podcast.url} type="audio/mp3" />
                    </audio>
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
