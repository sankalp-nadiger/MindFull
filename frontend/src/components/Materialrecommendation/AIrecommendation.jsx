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
          "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        console.log(response)
        const result = await response.json();
        console.log(result)
        setData(result.data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);
  const handleVideoPlay = (videoIndex) => {
    if (activeVideo !== null && activeVideo !== videoIndex) {
      // If a video is already playing, pause it
      const previousVideo = document.getElementById(`video-${activeVideo}`);
      previousVideo?.pause();
    }

    // Set the active video to the one being played
    setActiveVideo(videoIndex);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-900 to-black p-6">
    <div className="max-w-4xl w-full bg-gray-900 text-white font-sans shadow-lg rounded-lg p-6">
      <h2 className="text-3xl font-bold font-sans text-amber-300">Recommended Content</h2>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-8">
  {/* Resources Section */}
  {data && Array.isArray(data) && data.length > 0 ? (
    <section>
      <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Resources</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((resource, index) => {
          let embedUrl = resource.url;

          // Convert YouTube URL to embeddable format if it's a video
          if (resource.type === "video" && resource.url.includes("youtube.com/watch")) {
            const videoId = new URLSearchParams(new URL(resource.url).search).get('v');
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }

          return (
            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg h-[300px] flex flex-col">
              <h4 className="text-lg font-medium mb-2 truncate">{resource.title}</h4>

              {/* Conditionally render based on type */}
              {resource.type === "book" && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-300 line-clamp-3">{resource.description}</p>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2">Read More</a>
                </div>
              )}

{resource.type === "video" && (
                    <div className="flex-1">
                      {/* Embed video with iframe and handle play */}
                      <iframe
                        className="w-full h-full rounded"
                        id={`video-${index}`}  // Assign a unique ID to each video
                        src={embedUrl}  // Use the modified embeddable URL
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={resource.title}
                        onClick={() => handleVideoPlay(index)} // Trigger play control on click
                      />
                    </div>
                  )}

              {resource.type === "audio" && (
                <div className="flex-1">
                  <audio controls className="w-full h-full object-cover rounded">
                    <source src={resource.url} type="audio/mp3" />
                  </audio>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  ) : (
    <p>No resources available at the moment.</p>
  )}




        {/* Blogs Section */}
        {/* {data.blogs.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Blogs</h3>
            <ul className="list-disc pl-6">
              {data.blogs.map((blog, index) => (
                <li key={index} className="mb-2">{blog.title}</li>
              ))}
            </ul>
          </section>
        )}

       
        {data.podcasts.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Podcasts</h3>
            <ul className="list-disc pl-6">
              {data.podcasts.map((podcast, index) => (
                <li key={index} className="mb-2">{podcast.title}</li>
              ))}
            </ul>
          </section>
        )}

        
        {data.events.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Events</h3>
            <ul className="list-disc pl-6">
              {data.events.map((event, index) => (
                <li key={index} className="mb-2">{event.title}</li>
              ))}
            </ul>
          </section> )}*/}
        
      </div>
    </div>
</div>
  );
};

export default Recommendations;
