import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Card({
  title = "Default Title",
  description = "Default description text.",
  image = "https://via.placeholder.com/600x200?text=Image",
  route = "/",
  buttonText = "ddsv",
  className = ""
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div
      className={`bg-gray-800   rounded-lg shadow-lg overflow-hidden group hover:scale-105 transform transition-all w-80 max-w-sm ${className}`}
    >
      <img
        src={image}
        alt={title}
        className="w-full  object-cover group-hover:opacity-80 transition-all"
      />
      <div className="p-5">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-base text-gray-400 my-3">{description}</p>
        <button
          onClick={handleClick}
          className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition duration-300"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
