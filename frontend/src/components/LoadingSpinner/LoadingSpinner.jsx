const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-900 to-black">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <img 
            src="/plant.png" 
            alt="MindFull" 
            className="w-24 h-24 mx-auto animate-bounce"
          />
        </div>
        
        {/* Loading Animation */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-300 rounded-full border-t-purple-600 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent rounded-full border-t-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Text */}
        <h2 className="mb-2 text-2xl font-bold text-white">MindFull</h2>
        <p className="text-purple-300 animate-pulse">Loading your wellness journey...</p>
        
        {/* Progress Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
