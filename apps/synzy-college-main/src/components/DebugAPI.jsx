import React, { useState } from 'react';
import { getcollegesByStatus } from '../api/adminService';
import { getAllBlogs } from '../api/blogService';

const DebugAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPendingcolleges = async () => {
    setLoading(true);
    try {
      const response = await getcollegesByStatus('pending');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${error.response?.data || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const testBlogs = async () => {
    setLoading(true);
    try {
      const response = await getAllBlogs();
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${error.response?.data || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">API Debug</h3>
      <div className="space-x-2 mb-4">
        <button
          onClick={testPendingcolleges}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test Pending colleges
        </button>
        <button
          onClick={testBlogs}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test Blogs
        </button>
      </div>
      <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
        {result || 'Click a button to test API calls...'}
      </pre>
    </div>
  );
};

export default DebugAPI;


