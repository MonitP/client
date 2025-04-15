import React, { useState, useEffect } from 'react';
import { COLORS } from '../consts/colors';

interface ToastProps {
  message: { text: string; id: number } | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message?.id]);

  if (!visible || !message) return null;

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded shadow-lg z-50"
      style={{ backgroundColor: COLORS.main }}
    >
      {message.text}
    </div>
  );
};

export default Toast;
