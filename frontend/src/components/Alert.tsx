import React, { useState, useEffect } from "react";

interface AlertProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const icon = type === "success" ? "check-circle" : "alert-circle";

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}
      >
        <div className={`icon-${icon} text-xl`} />
        <p className="font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4"
        >
          <div className="icon-x text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Alert;
