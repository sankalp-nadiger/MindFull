import { useDarkMode } from '../../contexts/DarkModeContext';

const PageSkeleton = () => {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-blue-950 via-purple-900 to-black' : 'bg-gradient-to-b from-purple-500 via-purple-50 to-white'}`}>
      {/* Navbar Skeleton */}
      <div className={`w-full h-16 ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container flex items-center justify-between h-full px-4 mx-auto">
          <div className={`w-32 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse`}></div>
          <div className="flex space-x-4">
            <div className={`w-20 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse`}></div>
            <div className={`w-20 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse`}></div>
            <div className={`w-20 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse`}></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container px-4 py-8 mx-auto">
        {/* Hero Section Skeleton */}
        <div className="mb-12 text-center">
          <div className={`h-12 mx-auto mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg w-96 animate-pulse`}></div>
          <div className={`w-64 h-6 mx-auto ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg animate-pulse`}></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'} animate-pulse`}>
              <div className={`w-full h-48 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
              <div className={`w-3/4 h-6 mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
              <div className={`w-1/2 h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg`}></div>
            </div>
          ))}
        </div>

        {/* Content Blocks Skeleton */}
        <div className="mt-12 space-y-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className={`p-8 ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-100'} animate-pulse`}>
              <div className={`w-1/3 h-8 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
              <div className="space-y-3">
                <div className={`w-full h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg`}></div>
                <div className={`w-5/6 h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg`}></div>
                <div className={`w-4/5 h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Elements - Mental Health Theme */}
      <div className="fixed pointer-events-none top-1/4 right-10 opacity-10">
        <div className={`h-32 w-32 ${darkMode ? 'bg-purple-500' : 'bg-purple-400'} rounded-full blur-2xl animate-pulse`}></div>
      </div>
      <div className="fixed pointer-events-none bottom-1/4 left-10 opacity-10">
        <div className={`h-24 w-24 ${darkMode ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full blur-2xl animate-pulse`}></div>
      </div>
    </div>
  );
};

export default PageSkeleton;
