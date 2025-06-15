import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, BookOpen, Heart, Users, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const DynamicCarousel = () => {
  const navigate = useNavigate();
  const [journalEntries, setJournalEntries] = useState([]);
  const [gratitudePosts, setGratitudePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [userReaction, setUserReaction] = useState({});
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [postIndex, setPostIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const belowNeutralMoods = ['Sad', 'Tired', 'Angry'];
  const currentMood = typeof window !== 'undefined' ? (sessionStorage.getItem('mood') || 'Neutral') : 'Neutral';
  const isNegativeMood = belowNeutralMoods.includes(currentMood);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 0 ? 1 : 0);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Reset auto-rotation timer when user manually changes slides
  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 5000); // Resume auto-rotation after 5 seconds
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem("accessToken") : '';

        const journalResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/journal-entries`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const postsResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/posts`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (journalResponse.ok) {
          const journalData = await journalResponse.json();
          if (journalData.journals && Array.isArray(journalData.journals)) {
            let filteredEntries = journalData.journals;
            if (isNegativeMood) {
              filteredEntries = filteredEntries.filter((entry) => entry.moodScore >= 7);
            } else {
              filteredEntries = filteredEntries.filter((entry) => entry.moodScore >= 5);
            }
            setJournalEntries(filteredEntries);
          }
        }

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setGratitudePosts(postsData.posts || []);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isNegativeMood]);

  const handleToggleReaction = async (postId, type) => {
    const currentReaction = userReaction[postId];
    
    try {
      const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem("accessToken") : '';
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/reaction`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          reactionType: type,
          remove: currentReaction === type,
        }),
      });

      if (response.ok) {
        setUserReaction(prev => ({
          ...prev,
          [postId]: currentReaction === type ? null : type
        }));

        setGratitudePosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId
              ? {
                  ...post,
                  reactions: {
                    ...post.reactions,
                    [type]: currentReaction === type 
                      ? Math.max((post.reactions[type] || 1) - 1, 0)
                      : (post.reactions[type] || 0) + 1
                  }
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getMotivationalTitle = () => {
    if (isNegativeMood) {
      return journalEntries.length > 0 
        ? "Revisit some happy memories from your journey"
        : "Create Post your first joyful memory today";
    }
    return journalEntries.length > 0 
      ? "More joyful moments like today"
      : "Start capturing your beautiful moments";
  };

  // Get visible items for carousel with pagination
  const getVisibleMemories = () => {
    const itemsPerPage = 4;
    const startIndex = memoryIndex * itemsPerPage;
    return journalEntries.slice(startIndex, startIndex + itemsPerPage);
  };

  const getVisiblePosts = () => {
    const itemsPerPage = 4;
    const startIndex = postIndex * itemsPerPage;
    return gratitudePosts.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calculate total pages for each section
  const memoryPages = Math.ceil(journalEntries.length / 4);
  const postPages = Math.ceil(gratitudePosts.length / 4);

  const MemoryPlaceholder = () => (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-6 rounded-xl border-2 border-dashed border-purple-500/50 hover:border-purple-400/70 transition-all duration-300 h-96 flex flex-col items-center justify-center text-center w-full max-w-md mx-auto">
      <div className="w-16 h-16 mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
        <span className="text-3xl">📝</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-3">Start Your Memory Journey</h3>
      <p className="text-gray-300 text-sm mb-4 px-4">
        Capture your precious moments and experiences.
      </p>
      <button
        onClick={() => navigate('/journal')}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2"
      >
        <BookOpen size={16} />
        <span>Write Memory</span>
      </button>
    </div>
  );

  const GratitudePlaceholder = () => (
    <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-sm p-6 rounded-xl border-2 border-dashed border-green-500/50 hover:border-green-400/70 transition-all duration-300 h-96 flex flex-col items-center justify-center text-center w-full max-w-md mx-auto">
      <div className="w-16 h-16 mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
        <span className="text-3xl">🙏</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-3">Share Your Gratitude</h3>
      <p className="text-gray-300 text-sm mb-4 px-4">
        Spread positivity by sharing what you're grateful for.
      </p>
      <button
        onClick={() => navigate('/createPost')}
        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2"
      >
        <Plus size={16} />
        <span>Add Gratitude Post</span>
      </button>
    </div>
  );

  const MemoryCard = ({ entry, onClick }) => (
    <div 
      className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 h-80 flex flex-col cursor-pointer group w-full max-w-xs"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-purple-300 font-medium">
          {formatDate(entry.entryDate)}
        </span>
        <span className="text-xl">
          {entry.moodScore <= 3 ? '😔' : entry.moodScore <= 5 ? '😐' : entry.moodScore <= 7 ? '🙂' : entry.moodScore <= 9 ? '😊' : '🤩'}
        </span>
      </div>
      <div className="relative overflow-hidden mb-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
          {entry.topic}
        </h3>
      </div>
      <p className="text-gray-300 text-xs flex-grow mb-3 line-clamp-4">
        {entry.entryText}
      </p>
      <button className="mt-auto text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors">
        Read Full Memory
      </button>
    </div>
  );

  const GratitudeCard = ({ post }) => (
    <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 backdrop-blur-sm p-4 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 h-80 flex flex-col w-full max-w-xs">
      <div className="flex items-center space-x-2 mb-3">
        {post.user?.avatar ? (
          <img
            src={post.user.avatar}
            alt={`${post.user.username}'s avatar`}
            className="w-8 h-8 rounded-full object-cover border-2 border-green-400/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {post.user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-white">{post.user?.username}</p>
          <p className="text-xs text-green-300">Grateful heart</p>
        </div>
      </div>

      <p className="text-white text-sm font-medium mb-4 flex-grow line-clamp-6">{post.content}</p>

      <div className="flex space-x-2 mt-auto">
        {[
          { type: "like", emoji: "👍", color: "blue" },
          { type: "support", emoji: "🤝", color: "green" },
          { type: "love", emoji: "❤️", color: "red" },
        ].map(({ type, emoji, color }) => (
          <button
            key={type}
            onClick={() => handleToggleReaction(post._id, type)}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
              userReaction[post._id] === type
                ? `bg-${color}-500 text-white scale-105`
                : `bg-gray-700/50 text-gray-300 hover:bg-${color}-500/20 hover:text-${color}-400`
            }`}
          >
            <span>{emoji}</span>
            <span>{post.reactions?.[type] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const NavigationButton = ({ direction, onClick, disabled, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all ${
        disabled 
          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
          : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm hover:scale-110'
      } ${className}`}
    >
      {direction === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );

  const DotIndicator = ({ total, current, onClick, type }) => (
    <div className="flex justify-center space-x-2 mt-4">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onClick(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            current === index 
              ? type === 'memory' ? 'bg-purple-400 w-6' : 'bg-green-400 w-6'
              : 'bg-gray-500 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );

  const MemoryModal = ({ entry, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl border border-purple-500/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-md p-4 border-b border-purple-500/30 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-purple-300 font-medium">
                {formatDate(entry.entryDate)}
              </span>
              <span className="text-2xl">
                {entry.moodScore <= 3 ? '😔' : entry.moodScore <= 5 ? '😐' : entry.moodScore <= 7 ? '🙂' : entry.moodScore <= 9 ? '😊' : '🤩'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-3xl font-bold text-white mb-6">{entry.topic}</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{entry.entryText}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-white text-xl">Loading your memories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-xl mb-4">Couldn't load your content</div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/journal')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transform"
          >
            <BookOpen size={20} />
            <span>View All Journals</span>
          </button>

          <button
            onClick={() => navigate('/createPost')}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transform"
          >
            <Plus size={20} />
            <span>Share Gratitude</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-0">
      {/* Main Carousel Container */}
      <div className="relative">
        {/* Slides Container */}
        <div className="overflow-hidden rounded-2xl">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Memory Slide */}
            <div className="w-full flex-shrink-0 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-3">
                  <Heart className="text-purple-400" size={24} />
                  <span>{getMotivationalTitle()}</span>
                </h2>
              </div>
              
              <div className="relative min-h-[400px] flex items-center justify-center">
                {journalEntries.length > 0 ? (
                  <div className="w-full relative">
                    {/* Memory Arrow Navigation - Only show if more than 4 items */}
                    {journalEntries.length > 4 && (
                      <>
                        <div className="absolute top-1/2 -left-4 z-10 transform -translate-y-1/2">
                          <NavigationButton
                            direction="left"
                            onClick={() => setMemoryIndex(prev => Math.max(0, prev - 1))}
                            disabled={memoryIndex === 0}
                          />
                        </div>
                        <div className="absolute top-1/2 -right-4 z-10 transform -translate-y-1/2">
                          <NavigationButton
                            direction="right"
                            onClick={() => setMemoryIndex(prev => prev + 1)}
                            disabled={memoryIndex >= memoryPages - 1}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Memory Cards - Centered with equal spacing */}
                    <div className="flex justify-center items-center">
                      <div className={`grid gap-6 justify-items-center ${
                        getVisibleMemories().length === 1 ? 'grid-cols-1' :
                        getVisibleMemories().length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        getVisibleMemories().length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                      }`}>
                        {getVisibleMemories().map((entry, index) => (
                          <MemoryCard 
                            key={entry.id || index} 
                            entry={entry} 
                            onClick={() => setSelectedEntry(entry)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Memory Pagination Dots */}
                    {memoryPages > 1 && (
                      <div className="mt-6">
                        <DotIndicator 
                          total={memoryPages} 
                          current={memoryIndex} 
                          onClick={setMemoryIndex}
                          type="memory"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <MemoryPlaceholder />
                )}
              </div>
            </div>

            {/* Gratitude Posts Slide */}
            <div className="w-full flex-shrink-0 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-3">
                  <Users className="text-green-400" size={24} />
                  <span>{gratitudePosts.length > 0 ? "Community Gratitude" : "Share Your Gratitude"}</span>
                </h2>
              </div>
              
              <div className="relative min-h-[400px] flex items-center justify-center">
                {gratitudePosts.length > 0 ? (
                  <div className="w-full relative">
                    {/* Posts Arrow Navigation - Only show if more than 4 items */}
                    {gratitudePosts.length > 4 && (
                      <>
                        <div className="absolute top-1/2 -left-4 z-10 transform -translate-y-1/2">
                          <NavigationButton
                            direction="left"
                            onClick={() => setPostIndex(prev => Math.max(0, prev - 1))}
                            disabled={postIndex === 0}
                          />
                        </div>
                        <div className="absolute top-1/2 -right-4 z-10 transform -translate-y-1/2">
                          <NavigationButton
                            direction="right"
                            onClick={() => setPostIndex(prev => prev + 1)}
                            disabled={postIndex >= postPages - 1}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Gratitude Cards - Centered with equal spacing */}
                    <div className="flex justify-center items-center">
                      <div className={`grid gap-6 justify-items-center ${
                        getVisiblePosts().length === 1 ? 'grid-cols-1' :
                        getVisiblePosts().length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        getVisiblePosts().length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                      }`}>
                        {getVisiblePosts().map((post, index) => (
                          <GratitudeCard key={post._id || index} post={post} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Posts Pagination Dots */}
                    {postPages > 1 && (
                      <div className="mt-6">
                        <DotIndicator 
                          total={postPages} 
                          current={postIndex} 
                          onClick={setPostIndex}
                          type="post"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <GratitudePlaceholder />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Slide Dots Navigation */}
        <div className="flex justify-center space-x-3 mt-6">
          <button
            onClick={() => handleSlideChange(0)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === 0 
                ? 'bg-purple-400 w-8' 
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
          />
          <button
            onClick={() => handleSlideChange(1)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === 1 
                ? 'bg-green-400 w-8' 
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button
          onClick={() => navigate('/journals')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transform"
        >
          <BookOpen size={20} />
          <span>View All Journals</span>
        </button>
        <button
          onClick={() => navigate('/createPost')}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transform"
        >
          <Plus size={20} />
          <span>Share Gratitude</span>
        </button>
      </div>

      {/* Memory Modal */}
      {selectedEntry && (
        <MemoryModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
};

export default DynamicCarousel;