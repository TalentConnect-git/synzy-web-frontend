import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPubliccollegesByStatus } from '../api/collegeService';

const CompareSelectPage = () => {
  const navigate = useNavigate();
  const [colleges, setcolleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPubliccollegesByStatus('accepted');
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setcolleges(list);
      } catch (_) {
        setcolleges([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addToCompare = (college) => {
    try {
      const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
      const id = college._id || college.collegeId;
      const exists = saved.some((s) => (s.collegeId || s._id) === id);
      const normalized = { ...college, collegeId: id };
      const next = exists ? saved : [...saved, normalized];
      localStorage.setItem('comparisonList', JSON.stringify(next));
      // dispatch an event so Header can update the compare count immediately
      window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: next }));
      navigate('/compare');
    } catch (_) {
      try {
        const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: saved }));
      } catch (_) {}
      navigate('/compare');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Compare college</h1>
      <p className="text-gray-600 mb-6">Select a college to compare with your current selection.</p>
      <div className="bg-white rounded-lg shadow divide-y">
        {colleges.map((s) => (
          <div key={s._id || s.collegeId} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{s.name || s.collegeName}</div>
              <div className="text-sm text-gray-600 truncate">{[s.city, s.state, s.board, s.feeRange].filter(Boolean).join(' • ')}</div>
            </div>
            <button
              onClick={() => addToCompare(s)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Compare
            </button>
          </div>
        ))}
        {(!colleges || colleges.length === 0) && (
          <div className="p-8 text-center text-gray-500">No colleges to show.</div>
        )}
      </div>
    </div>
  );
};

export default CompareSelectPage;


