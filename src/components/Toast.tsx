import { useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' 
        ? 'bg-green-100 border border-green-300 text-green-800' 
        : 'bg-red-100 border border-red-300 text-red-800'
    }`}>
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
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}