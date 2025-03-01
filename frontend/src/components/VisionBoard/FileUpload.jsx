import React, { useState } from "react";
import axios from "axios";
import { updateVisionBoard } from "../../services/visionBoardAPI";

const FileUpload = ({ userId, fetchVisionBoards }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/visionboard/upload`, formData);
    await updateVisionBoard(userId, { items: [{ type: "image", content: response.data.imageUrl }] });

    fetchVisionBoards();
  };

  return (
    <div className="file-upload">
      <h3>Upload Your Own Vision Board Image</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
