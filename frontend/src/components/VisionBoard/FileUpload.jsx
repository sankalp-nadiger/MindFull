import React, { useState, useRef } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";

const FileUpload = ({ userId, fetchVisionBoards, darkMode }) => {
  // Define theme classes locally based on darkMode
  const themeClasses = {
    card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    text: darkMode ? 'text-slate-200' : 'text-gray-800',
    textSecondary: darkMode ? 'text-slate-400' : 'text-gray-600',
    brandText: darkMode ? 'text-indigo-400' : 'text-blue-600',
    button: darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
  };
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal Growth");

  const categories = [
    "Health", 
    "Career", 
    "Education", 
    "Relationships", 
    "Finance", 
    "Personal Growth"
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      
      // Open modal after selecting file
      setIsModalOpen(true);
      
      // Clear any previous errors
      setError("");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an image to upload");
      return;
    }
    
    if (!title.trim()) {
      setError("Please enter a title for your vision board");
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Create FormData to send the file
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", userId);
      formData.append("title", title);
      formData.append("category", category);
      
      const type= "image"
      // Append items as JSON string
      formData.append("type", type);

      // Send the request with FormData
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/visionBoard/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log("Upload successful:", response.data);
      
      // Refresh the vision boards list
      fetchVisionBoards();
      
      // Reset the form
      setFile(null);
      setPreview(null);
      setTitle("");
      setCategory("Personal Growth");
      closeModal();
      
      // Clean up the preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload vision board. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

return (
    <>
      <div className={`file-upload rounded-xl shadow-lg mb-8 w-full max-w-4xl mx-auto overflow-hidden ${darkMode ? 'bg-indigo-400/50' : 'bg-white'} `}>
        {/* Header */}
        <div className={`px-6 py-2 rounded-xl ${darkMode ? 'bg-indigo-600' : 'bg-blue-600'}`}>
          <h3 className="text-xl font-semibold flex items-center ">
            <Sparkles className="mr-2 w-5 h-5" />
            Upload Your Vision Board Image
          </h3>
        </div>
      
      {/* Content area */}
      <div className="p-6">
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange} 
        />
        
        {/* Custom upload button */}
        <div 
  onClick={openFileDialog}
  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
    darkMode 
      ? 'border-indigo-400/50 hover:border-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/50' 
      : 'border-blue-400/50 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-100/50'
  } hover:shadow-md`}
>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-3 transition-colors ${themeClasses.brandText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
</svg>
<p className={`text-sm font-medium ${themeClasses.text}`}>Click to select an image</p>
<p className={`text-xs ${themeClasses.textSecondary} mt-1`}>PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
    </div>
    
    {/* Modal for entering vision board details */}
    {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto border ${themeClasses.card}`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Create Vision Board</h2>
          
          {/* Preview image */}
          {preview && (
            <div className="mb-4">
              <p className={`text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>Preview:</p>
              <div className={`rounded-lg overflow-hidden border ${
                darkMode ? 'border-slate-600' : 'border-gray-300'
              }`}>
                <img 
                  src={preview} 
                  alt="Vision Board Preview" 
                  className={`w-full h-40 object-contain ${
                    darkMode ? 'bg-slate-700' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          )}
          
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label htmlFor="title" className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  darkMode 
                    ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="My Vision Board"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                Category:
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  darkMode 
                    ? 'border-slate-600 bg-slate-700 text-slate-200 focus:ring-indigo-500 focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className={darkMode ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-900'}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            {error && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                darkMode 
                  ? 'bg-red-900/30 text-red-400 border border-red-800' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:ring-offset-white'
                }`}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
  type="submit"
  className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${themeClasses.button} disabled:opacity-50`}
  disabled={uploading}
>
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : "Save Board"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </>
);
};

export default FileUpload;