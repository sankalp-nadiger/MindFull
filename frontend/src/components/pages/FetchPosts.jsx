import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, BookOpen, Heart, Users, X } from 'lucide-react';

const DynamicCarousel = ({ navigate }) => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [gratitudePosts, setGratitudePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [userReaction, setUserReaction] = useState({});
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [postIndex, setPostIndex] = useState(0);

  const belowNeutralMoods = ['Sad', 'Tired', 'Angry'];
  const currentMood = typeof window !== 'undefined' ? (sessionStorage.getItem('mood') || 'Neutral') : 'Neutral';
  const isNegativeMood = belowNeutralMoods.includes(currentMood);

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
            setJournalEntries(filteredEntries.slice(0, 12));
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
        : "Create your first joyful memory today";
    }
    return journalEntries.length > 0 
      ? "More joyful moments like today"
      : "Start capturing your beautiful moments";
  };

  // Calculate layout distribution
  const getLayoutConfig = () => {
    const memoryCount = journalEntries.length;
    const postCount = gratitudePosts.length;
    
    // If both have 4+ items, use carousel
    if (memoryCount >= 4 && postCount >= 4) {
      return { type: 'carousel', memoryCols: 2, postCols: 2 };
    }
    
    // Single row distribution logic
    if (memoryCount === 0 && postCount === 0) {
      return { type: 'empty', memoryCols: 2, postCols: 2 };
    }
    
    // One section is empty - use balanced 1/2 split for better space utilization
    if (memoryCount === 0) {
      return { type: 'postsOnly', memoryCols: 2, postCols: 2 };
    }
    
    if (postCount === 0) {
      return { type: 'memoriesOnly', memoryCols: 2, postCols: 2 };
    }
    
    // Both have content - dynamic allocation based on content amount
    if (memoryCount <= 3 && postCount <= 3) {
      // For small amounts, use balanced approach to avoid empty space
      if (memoryCount === 1 && postCount >= 2) return { type: 'mixed', memoryCols: 1, postCols: 3 };
      if (postCount === 1 && memoryCount >= 2) return { type: 'mixed', memoryCols: 3, postCols: 1 };
      // Default balanced split for similar small amounts
      return { type: 'mixed', memoryCols: 2, postCols: 2 };
    }
    
    // One has significantly more content
    if (memoryCount > 3 && postCount <= 1) return { type: 'mixed', memoryCols: 3, postCols: 1 };
    if (postCount > 3 && memoryCount <= 1) return { type: 'mixed', memoryCols: 1, postCols: 3 };
    
    // Default balanced approach
    return { type: 'mixed', memoryCols: 2, postCols: 2 };
  };

  const MemoryPlaceholder = () => (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-4 rounded-xl border-2 border-dashed border-purple-500/50 hover:border-purple-400/70 transition-all duration-300 h-80 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
        <span className="text-2xl">📝</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">Start Your Memory Journey</h3>
      <p className="text-gray-300 text-xs mb-3 px-2">
        Capture your precious moments and experiences.
      </p>
      <button
        onClick={() => navigate('/journal')}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center space-x-1"
      >
        <BookOpen size={14} />
        <span>Write Memory</span>
      </button>
    </div>
  );

  const GratitudePlaceholder = () => (
    <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-sm p-4 rounded-xl border-2 border-dashed border-green-500/50 hover:border-green-400/70 transition-all duration-300 h-80 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
        <span className="text-2xl">🙏</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">Share Your Gratitude</h3>
      <p className="text-gray-300 text-xs mb-3 px-2">
        Spread positivity by sharing what you're grateful for.
      </p>
      <button
        onClick={() => navigate('/createPost')}
        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center space-x-1"
      >
        <Plus size={14} />
        <span>Add a Gratitude Post now</span>
      </button>
    </div>
  );

  const MemoryCard = ({ entry, onClick }) => (
    <div 
      className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 h-80 flex flex-col cursor-pointer group"
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
    <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 backdrop-blur-sm p-4 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 h-80 flex flex-col">
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
      className={`absolute top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full transition-all ${
        disabled 
          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
          : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
      } ${className}`}
    >
      {direction === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
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

  const layoutConfig = getLayoutConfig();
  const memoryCount = journalEntries.length;
  const postCount = gratitudePosts.length;

  // Calculate visible items for current indices
  const getVisibleMemories = () => {
    const maxVisible = layoutConfig.memoryCols;
    return journalEntries.slice(memoryIndex, memoryIndex + maxVisible);
  };

  const getVisiblePosts = () => {
    const maxVisible = layoutConfig.postCols;
    return gratitudePosts.slice(postIndex, postIndex + maxVisible);
  };

  const canNavigateMemoryNext = memoryIndex + layoutConfig.memoryCols < memoryCount;
  const canNavigateMemoryPrev = memoryIndex > 0;
  const canNavigatePostNext = postIndex + layoutConfig.postCols < postCount;
  const canNavigatePostPrev = postIndex > 0;

  const getInnerGridClass = (cols) => {
    switch(cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  return (
    <div className="w-full px-4 lg:px-0">
      {/* Centered Layout Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-4 min-h-[400px] items-start justify-center">
            
            {/* Memory Section */}
            <div className={`w-full flex justify-center ${
              memoryCount === 0 && postCount === 0 ? 'lg:w-1/2' :
              memoryCount === 0 && postCount > 0 ? 'lg:w-1/4' :
              memoryCount > 0 && postCount === 0 ? 'lg:w-3/4' :
              'lg:w-1/2'
            }`}>
              <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="mb-4 w-full">
                  <div className="relative group">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                      <Heart className="text-purple-400 flex-shrink-0" size={20} />
                      <span className="truncate text-center" title={getMotivationalTitle()}>
                        {getMotivationalTitle()}
                      </span>
                    </h3>
                  </div>
                </div>
                
                <div className="relative h-80 flex justify-center w-full">
                  {memoryCount > 0 ? (
                    <>
                      <div className={`grid gap-4 h-full justify-center items-center ${getInnerGridClass(layoutConfig.memoryCols)}`} style={{ width: 'fit-content' }}>
                        {getVisibleMemories().map((entry, index) => (
                          <MemoryCard 
                            key={entry.id || index} 
                            entry={entry} 
                            onClick={() => setSelectedEntry(entry)}
                          />
                        ))}
                      </div>
                      
                      {/* Memory Navigation */}
                      {memoryCount > layoutConfig.memoryCols && (
                        <>
                          <NavigationButton
                            direction="left"
                            onClick={() => setMemoryIndex(prev => Math.max(0, prev - layoutConfig.memoryCols))}
                            disabled={!canNavigateMemoryPrev}
                            className="-left-3"
                          />
                          <NavigationButton
                            direction="right"
                            onClick={() => setMemoryIndex(prev => prev + layoutConfig.memoryCols)}
                            disabled={!canNavigateMemoryNext}
                            className="-right-3"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <MemoryPlaceholder />
                  )}
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className={`w-full flex justify-center ${
              memoryCount === 0 && postCount === 0 ? 'lg:w-1/2' :
              postCount === 0 && memoryCount > 0 ? 'lg:w-1/4' :
              postCount > 0 && memoryCount === 0 ? 'lg:w-3/4' :
              'lg:w-1/2'
            }`}>
              <div className="w-full max-w-4xl flex flex-col items-center">
                <div className="mb-4 w-full">
                  <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Users className="text-green-400 flex-shrink-0" size={20} />
                    <span className="truncate text-center">
                      {postCount > 0 ? "Community Gratitude" : "Share Your Gratitude"}
                    </span>
                  </h3>
                </div>
                
                <div className="relative h-80 flex justify-center w-full">
                  {postCount > 0 ? (
                    <>
                      <div className={`grid gap-4 h-full justify-center items-center ${getInnerGridClass(layoutConfig.postCols)}`} style={{ width: 'fit-content' }}>
                        {getVisiblePosts().map((post, index) => (
                          <GratitudeCard key={post._id || index} post={post} />
                        ))}
                      </div>
                      
                      {/* Posts Navigation */}
                      {postCount > layoutConfig.postCols && (
                        <>
                          <NavigationButton
                            direction="left"
                            onClick={() => setPostIndex(prev => Math.max(0, prev - layoutConfig.postCols))}
                            disabled={!canNavigatePostPrev}
                            className="-left-3"
                          />
                          <NavigationButton
                            direction="right"
                            onClick={() => setPostIndex(prev => prev + layoutConfig.postCols)}
                            disabled={!canNavigatePostNext}
                            className="-right-3"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <GratitudePlaceholder />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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