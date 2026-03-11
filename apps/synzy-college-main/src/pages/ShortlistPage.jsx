import React from 'react';
import CollegeCard from '../components/CollegeCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShortlistPage = ({ shortlist, onShortlistToggle, comparisonList, onCompareToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  console.log("ShortlistPage received shortlist:", shortlist);
  console.log("Shortlist length:", shortlist?.length);
  console.log("Shortlist type:", typeof shortlist, Array.isArray(shortlist));

  const handleCardClick = (college) => {
    // Navigate to college details without removing from shortlist
    // (Remove the automatic removal based on user feedback)
    navigate(`/college/${college._id || college.id || college.collegeId}`);
  };

  const handleApplyClick = (college) => {
    const collegeId = college._id || college.id || college.collegeId;
    if (!collegeId) return;
    try { localStorage.setItem('lastAppliedcollegeId', String(collegeId)); } catch (_) {}
    navigate(`/apply/${collegeId}`);
  };

  // Filter out any null, undefined, or invalid college objects
  const validShortlist = Array.isArray(shortlist) 
    ? shortlist.filter(college => college && (college._id || college.collegeId))
    : [];

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shortlisted colleges</h1>
      {validShortlist.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {validShortlist.map((college) => (
            <CollegeCard
              key={college.collegeId || college._id}
              college={college}
              onCardClick={() => handleCardClick(college)}
              onShortlistToggle={() => onShortlistToggle(college)}
              isShortlisted={validShortlist.some(item => (item.collegeId || item._id) === (college.collegeId || college._id))}
              onCompareToggle={() => onCompareToggle(college)}
              isCompared={comparisonList?.some(item => (item.collegeId || item._id) === (college.collegeId || college._id))}
              currentUser={currentUser}
              onApply={() => handleApplyClick(college)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">You haven't shortlisted any colleges yet.</p>
        </div>
      )}
    </div>
  );
};

export default ShortlistPage;




