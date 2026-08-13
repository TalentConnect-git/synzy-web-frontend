import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-lg transition-colors mb-4 w-fit"
      title="Go back"
    >
      <ArrowLeft size={18} />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

export default BackButton;
