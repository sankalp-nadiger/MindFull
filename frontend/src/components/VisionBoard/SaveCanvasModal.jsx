import React, { useState, useEffect, useRef } from "react";

// SaveCanvasModal component
const SaveCanvasModal = ({ isOpen, onClose, onSave, imageUri }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal Growth");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef();

  const categories = [
    "Health", 
    "Career", 
    "Education", 
    "Relationships", 
    "Finance", 
    "Personal Growth"
  ];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Function to convert data URI to Blob
  const dataURItoBlob = (dataURI) => {
    // Convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1]);
    
    // Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    // Write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    // Create a blob with the ArrayBuffer and mime type
    return new Blob([ab], { type: mimeString });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!content.trim()) {
      setError("Description is required");
      return;
    }
    
    if (!imageUri) {
      setError("Image is required");
      return;
    }
    
    setIsSaving(true);
    setError("");
    const userId = JSON.parse(sessionStorage.getItem("user"))?._id;
    
    if (!userId) {
      setError("User not logged in");
      setIsSaving(false);
      return;
    }
  
    try {
      // Convert the image URI to a Blob
      const imageBlob = dataURItoBlob(imageUri);
      
      // Create a File object from the Blob
      const imageFile = new File([imageBlob], "vision-board.png", { type: "image/png" });
      
      // Create FormData and append all necessary fields
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("userId", userId);
      formData.append("title", title);
      formData.append("category", category);
      
      // Add description as part of items
      const items = [{ 
        type: "image",
        description: content,
        position: { x: 0, y: 0 } 
      }];
      
      formData.append("items", JSON.stringify(items));

      // Send the request with FormData
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/visionBoard/add`, {
        method: "POST",
        body: formData
        // Don't set Content-Type header - browser sets it automatically with boundary for multipart/form-data
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error saving canvas: ${errorText}`);
      }
  
      console.log("Vision board saved successfully!");
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }

      // Reset form
      setTitle("");
      setContent("");
      setCategory("Personal Growth");
      onClose();
    } catch (err) {
      setError("Failed to save vision board. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };    

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-auto"
      >
        <h2 className="text-lg mb-3">Save Your Vision Board</h2>
        
        {/* Preview image */}
        {imageUri && (
          <div className="mb-3">
            <p className="text-xs mb-1">Preview:</p>
            <img 
              src={imageUri} 
              alt="Vision Board Preview" 
              className="w-full h-32 object-contain border border-gray-300 rounded"
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="content" className="block text-xs mb-1">
              Description:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              rows="2"
              placeholder="What this vision board represents to you..."
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
              onClick={onClose}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isSaving}
            >
              {isSaving ? (
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
  );
};

export default SaveCanvasModal;