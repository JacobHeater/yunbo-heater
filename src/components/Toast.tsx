import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  index: number;
  createdAt: number;
}

export default function Toast({ message, type, onClose, index, createdAt }: ToastProps) {
  const [isDisappearing, setIsDisappearing] = useState(false);

  useEffect(() => {
    // Calculate remaining time based on when the toast was created
    const elapsed = Date.now() - createdAt;
    const remaining = Math.max(0, 5000 - elapsed);
    
    const timer = setTimeout(() => {
      setIsDisappearing(true);
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        onClose();
      }, 300); // Match the transition duration
    }, remaining);

    return () => clearTimeout(timer);
  }, [onClose, createdAt]);

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out ${
        type === 'success' 
          ? 'bg-green-100 border border-green-300 text-green-800' 
          : 'bg-red-100 border border-red-300 text-red-800'
      } ${isDisappearing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{
        transform: `translateY(-${index * 60}px)`,
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <FaCheckCircle className="mr-2 text-lg" />
          ) : (
            <FaExclamationTriangle className="mr-2 text-lg" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsDisappearing(true);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}