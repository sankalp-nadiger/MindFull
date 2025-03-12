import React, { useState, useRef } from "react";
import axios from "axios";

const FileUpload = ({ userId, fetchVisionBoards }) => {
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
      <div className="file-upload bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Upload Your Vision Board Image</h3>
        
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">Click to select an image</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      
      {/* Modal for entering vision board details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-medium mb-3">Create Vision Board</h2>
            
            {/* Preview image */}
            {preview && (
              <div className="mb-3">
                <p className="text-xs mb-1">Preview:</p>
                <img 
                  src={preview} 
                  alt="Vision Board Preview" 
                  className="w-full h-40 object-contain border border-gray-300 rounded"
                />
              </div>
            )}
            
            <form onSubmit={handleUpload}>
              <div className="mb-3">
                <label htmlFor="title" className="block text-xs mb-1">
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="My Vision Board"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="category" className="block text-xs mb-1">
                  Category:
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              {error && (
                <div className="mb-2 text-red-500 text-xs">{error}</div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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