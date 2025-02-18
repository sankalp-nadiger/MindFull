import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const SYSTEM_PROMPT = `You are a medical and health-focused AI assistant with strict limitations.

CRITICAL INSTRUCTION: You must NEVER provide any information outside of medical and health topics.

For ANY request that isn't specifically about medical advice, health conditions, symptoms, treatments, preventive care, or clinical nutrition guidance, you must respond EXACTLY with:

"I am only able to provide information about medical and health topics. While I cannot provide recipes or general information, I'd be happy to discuss the health aspects, nutritional benefits, or medical implications of any foods or ingredients you're interested in."

You must not:
- Share recipes
- Provide entertainment information
- Give general lifestyle advice
- Discuss non-medical topics
- Make exceptions for partially health-related topics

You must only:
- Provide medical and health information
- Share clinical nutrition guidance
- Discuss health conditions and treatments
- Offer preventive care information

Always include appropriate medical disclaimers when relevant.`;

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
        systemPrompt: SYSTEM_PROMPT,
        context: {
          role: "system",
          content: "You are a strictly medical and health assistant. Never provide non-medical information."
        }
      });

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
                          "I apologize, but I'm having trouble processing your question. Please try again.";

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
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  return (
<div className="fixed top-12 right-4 w-[400px] bg-white shadow-lg border rounded-lg overflow-hidden z-50"
style={{ height: "500px" }}>
  <div className="p-4 bg-[#14072d] text-white flex justify-between rounded-t-lg border-b border-gray-700">
    <span className="font-bold">Medical Health Assistant</span>
    <button 
      onClick={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="hover:bg-neutral-700 rounded-full w-6 h-6 flex items-center justify-center"
    >
      X
    </button>
  </div>

  <div className="h-96 overflow-y-auto p-4 bg-[#1a0d35]">
    {messages.length === 0 && (
      <div className="text-gray-400 text-center p-4">
        Hello! I'm your medical health assistant. How can I assist you today?
      </div>
    )}
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`mb-2 p-2 rounded-lg ${
          msg.role === "user" 
            ? "bg-green-500 text-white text-right ml-auto" 
            : "bg-gray-700 text-white"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
      </div>
    ))}
    {loading && (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="animate-bounce">●</div>
        <div className="animate-bounce [animation-delay:0.2s]">●</div>
        <div className="animate-bounce [animation-delay:0.4s]">●</div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>

  <div className="p-2 flex bg-[#14072d] border-t border-gray-700">
    <input
      type="text"
      className="flex-1 p-2 border rounded-lg bg-[#1a0d35] text-white border-gray-700 placeholder-gray-400"
      placeholder="Ask about medical conditions or health..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={handleKeyPress}
      onFocus={(e) => e.preventDefault()}  // Prevent auto-scroll on input focus
      disabled={loading}
    />
    <button
      onClick={(e) => {
        e.preventDefault();  // Prevent page shift on button click
        sendMessage();
      }}
      className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
      disabled={loading || !input.trim()}
    >
      Send
    </button>
  </div>
</div>

);

};

export default ChatBox;