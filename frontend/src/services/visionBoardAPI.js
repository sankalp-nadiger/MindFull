import axios from "axios";

const API_URL = "http://localhost:5000/api/visionBoard";

export const createVisionBoard = (data) => axios.post(`${API_URL}/add`, data);
export const getVisionBoards = (userId) => axios.get(`${API_URL}/${userId}`);
export const updateVisionBoard = (boardId, data) => axios.put(`${API_URL}/update/${boardId}`, data);
export const deleteVisionBoard = (boardId) => axios.delete(`${API_URL}/delete/${boardId}`);

export const getAIImage = async (category) => {
  const response = await axios.post("http://localhost:5000/api/ai/image", { category });
  return response.data.imageUrl;
};

export const getAIQuote = async (category) => {
  const response = await axios.post("http://localhost:5000/api/ai/quote", { category });
  return response.data.quote;
};
