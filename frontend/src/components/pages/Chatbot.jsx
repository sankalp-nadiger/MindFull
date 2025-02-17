import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_API_URL}/chat`, {
        message: userMessage,
      });

      // The response now contains a botResponse property
      const botResponse = response.data.botResponse;
      
      if (botResponse) {
        setMessages([...newMessages, { role: "assistant", content: botResponse }]);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details ||
                          "Not able to process. Please try again.";

      setMessages([...newMessages, { 
        role: "assistant", 
        content: `⚠️ ${errorMessage}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed top-1/2 transform  -translate-y-1/2 w-[500px] bg-white shadow-lg border rounded-lg">
      {/* Header */}
      <div className="p-4 bg-[#14072d] text-white flex justify-between rounded-t-lg">
        <span className="font-bold">Your Peace Assistant</span>
        <button 
          onClick={onClose}
          className="hover:bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center"
        >
          X
        </button>
      </div>

      {/* Messages Display */}
      <div className="h-96 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              msg.role === "user" 
                ? "bg-green-400 text-white text-right ml-auto" 
                : "bg-gray-300 text-black"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-bounce">●</div>
            <div className="animate-bounce [animation-delay:0.2s]">●</div>
            <div className="animate-bounce [animation-delay:0.4s]">●</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-2 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg text-black"
          placeholder="Shoot away..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-[#14072d] hover:bg-green-800 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;