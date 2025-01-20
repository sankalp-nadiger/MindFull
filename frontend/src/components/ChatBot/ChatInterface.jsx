import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
export function ChatInterface() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, isBot: false }]);

    const userMessage = input; 
    setInput(""); 

    try {
     
      const response = await fetch("https://your-backend-url/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.reply || "Sorry, I couldn't process that.";

        // Add bot response
        setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
      } else {
        throw new Error("Failed to get a valid response from the server.");
      }
    } catch (error) {
      console.error("Error:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        { text: "Something went wrong. Please try again later.", isBot: true },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full  bg-white/50 backdrop-blur-lg rounded-lg shadow-xl">
    <div className="bg-green-600 p-4 rounded-t-lg">
      <h2 className="text-white text-lg font-semibold">Chat Assistant</h2>
    </div>

    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message.text}
          isBot={message.isBot}
        />
      ))}
    </div>

    <div className="border-t p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  </div>
  );
}