import React from 'react';

export function ChatMessage({ message, isBot }) {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-5 ${
          isBot
            ? 'bg-gray-200 text-gray-800'
            : 'bg-green-500 text-black'
        }`}
      >
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}