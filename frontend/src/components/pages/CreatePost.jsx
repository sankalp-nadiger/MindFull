import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Send, Eye, EyeOff, Sparkles } from "lucide-react";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // success or error
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const navigate = useNavigate();

  const maxChars = 500;

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxChars) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("content", content);
      formData.append("isAnonymous", isAnonymous);

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/post/postsCreate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create gratitude post");
      }

      setMessage("Your gratitude has been shared with the world! ✨");
      setMessageType("success");
      setContent("");
      setCharCount(0);

      setTimeout(() => {
        navigate("/mainPage");
      }, 2500);

    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">

          {/* Main card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </div>
            {/* Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Heart className="w-8 h-8 text-pink-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Share Your Gratitude
                </h1>
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-white/70 text-lg">
                What fills your heart with joy today?
              </p>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`text-center mb-6 p-4 rounded-2xl border transition-all duration-300 ${
                messageType === "success" 
                  ? "bg-green-500/20 border-green-400/30 text-green-300" 
                  : "bg-red-500/20 border-red-400/30 text-red-300"
              }`}>
                <p className="font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Area */}
              <div className="relative">
                <textarea
                  placeholder="Express your gratitude... What made you smile today? Who are you thankful for? What moment brought you peace?"
                  value={content}
                  onChange={handleContentChange}
                  className="w-full h-40 p-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 resize-none backdrop-blur-sm"
                  required
                />
                <div className="absolute bottom-4 right-4 text-sm text-white/50">
                  <span className={charCount > maxChars * 0.9 ? "text-yellow-400" : ""}>
                    {charCount}
                  </span>
                  <span className="text-white/30">/{maxChars}</span>
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  {isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <label className="text-white font-medium cursor-pointer">
                      Anonymous Post
                    </label>
                    <p className="text-white/60 text-sm">
                      {isAnonymous ? "Your identity will be hidden" : "Your name will be visible"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    isAnonymous 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "bg-white/20"
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                    isAnonymous ? "left-7" : "left-1"
                  }`}></div>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sharing your gratitude...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Share Gratitude</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Inspirational Quote */}
            <div className="mt-8 text-center">
              <p className="text-white/60 italic text-sm">
                "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow." 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
