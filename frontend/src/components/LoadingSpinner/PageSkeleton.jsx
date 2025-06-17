const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-black">
      {/* Navbar Skeleton */}
      <div className="w-full h-16 bg-gray-800">
        <div className="container flex items-center justify-between h-full px-4 mx-auto">
          <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container px-4 py-8 mx-auto">
        {/* Hero Section Skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 mx-auto mb-4 bg-gray-700 rounded w-96 animate-pulse"></div>
          <div className="w-64 h-6 mx-auto bg-gray-600 rounded animate-pulse"></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-lg animate-pulse">
              <div className="w-full h-48 mb-4 bg-gray-700 rounded"></div>
              <div className="w-3/4 h-6 mb-2 bg-gray-700 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Blocks Skeleton */}
        <div className="mt-12 space-y-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-8 bg-gray-800 rounded-lg animate-pulse">
              <div className="w-1/3 h-8 mb-4 bg-gray-700 rounded"></div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-gray-600 rounded"></div>
                <div className="w-5/6 h-4 bg-gray-600 rounded"></div>
                <div className="w-4/5 h-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
