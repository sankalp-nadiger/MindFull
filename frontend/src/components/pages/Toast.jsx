import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`custom-toast custom-toast-${type}`}>{message}</div>
  );
};

export default Toast;
