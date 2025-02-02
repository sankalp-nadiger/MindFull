import { useEffect, useState } from "react";

const Recommendations = () => {
  const [data, setData] = useState({ videos: [], books: [], blogs: [], podcasts: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/create-resource/fetchRecommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-900 to-black p-6">
    <div className="max-w-4xl w-full bg-gray-900 text-white font-sans shadow-lg rounded-lg p-6">
      <h2 className="text-3xl font-bold font-sans text-amber-300">Recommended Content</h2>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-8">
        {/* Videos Section */}
        {data.videos.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Videos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.videos.map((video, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg">
                  <h4 className="text-lg font-medium mb-2">{video.title}</h4>
                  <video controls className="w-full rounded">
                    <source src={video.content} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Books Section */}
        {data.books.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Books</h3>
            <ul className="list-disc pl-6">
              {data.books.map((book, index) => (
                <li key={index} className="mb-2">{book.title}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Blogs Section */}
        {data.blogs.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Blogs</h3>
            <ul className="list-disc pl-6">
              {data.blogs.map((blog, index) => (
                <li key={index} className="mb-2">{blog.title}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Podcasts Section */}
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

        {/* Events Section */}
        {data.events.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-sans text-amber-600 mb-4">Events</h3>
            <ul className="list-disc pl-6">
              {data.events.map((event, index) => (
                <li key={index} className="mb-2">{event.title}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
</div>
  );
};

export default Recommendations;
