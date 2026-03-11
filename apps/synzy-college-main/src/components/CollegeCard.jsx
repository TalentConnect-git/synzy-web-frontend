import React from 'react';
import { MapPin, PlusCircle, CheckCircle, Heart, Navigation } from 'lucide-react';

const CollegeCard = ({ college, onCardClick, onCompareToggle, isCompared, currentUser, onShortlistToggle, isShortlisted, onApply }) => {
  if (!college) {
    return null;
  }

  return (
    <div onClick={onCardClick} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick()} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col relative">
      {currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student') && (
        <button onClick={onShortlistToggle} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10">
          <Heart size={24} className={isShortlisted ? "fill-current text-red-500" : ""} />
        </button>
      )}
      
      <div className="p-6 cursor-pointer flex-grow">
        {/* college Logo */}
        {college.logo && (
          <div className="flex justify-center mb-4">
            <img 
              src={typeof college.logo === 'object' ? college.logo.url : college.logo} 
              alt={`${college.name} logo`} 
              className="h-16 w-16 object-contain rounded-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-2">{college.name || 'college Name Not Available'}</h3>
        
        <div className="flex items-center text-gray-600 mb-4 flex-wrap gap-x-4">
          <div className="flex items-center">
            <MapPin size={16} className="mr-2 text-blue-500" />
            <span>{college.location || `${college.city || 'N/A'}${college.state ? ', ' + college.state : ''}`}</span>
          </div>
          
          {/* Distance Display beside location */}
          {college.distance && (
            <div className="flex items-center text-gray-600">
              <Navigation size={14} className="mr-1 text-green-500" />
              <span className="text-sm font-medium">{college.distance}</span>
            </div>
          )}
        </div>

        {/* Fee Range and Score Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Fee Range</div>
            <div className="font-semibold text-gray-800">
              {college.feeRange || college.minFee && college.maxFee 
                ? `${college.feeRange || `${college.minFee}L - ${college.maxFee}L`}`
                : 'Contact college'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Score</div>
            <div className="flex items-center justify-end">
              <span className={`font-bold text-lg ${college.scoreColorClass || 'text-gray-800'}`}>
                {college.scoreDisplay || college.score || college.rating || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* college Type Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {college.board && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {college.board}
            </span>
          )}
          {college.collegeType && (
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {college.collegeType}
            </span>
          )}
          {college.genderType && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {college.genderType}
            </span>
          )}
        </div>

        {/* Facilities Tags */}
        {(college.facilities || college.amenities) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(college.facilities || college.amenities || []).slice(0, 3).map((facility, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {typeof facility === 'string' ? facility : facility.name || facility.type}
              </span>
            ))}
            {(college.facilities || college.amenities || []).length > 3 && (
              <span className="text-xs text-gray-500">
                +{(college.facilities || college.amenities || []).length - 3} more
              </span>
            )}
          </div>
        )}
        

        {/* Technology Adoption Display */}
        {college.smartClassroomsPercentage && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs text-gray-600 cursor-help" 
                title="Smart classrooms improve engagement through interactive learning"
              >
                📽️ Smart Classrooms
              </span>
              <span className="text-xs font-medium text-blue-600">
                {college.smartClassroomsPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${college.smartClassroomsPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* International Exposure Display */}
        {(college.exchangePrograms && college.exchangePrograms.length > 0) || (college.globalTieups && college.globalTieups.length > 0) || college.studentsBenefitingPercentage ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs text-gray-600 cursor-help"
                title="International exposure programs and global partnerships"
              >
                🌍 Global Programs
              </span>
              {college.studentsBenefitingPercentage && (
                <span className="text-xs font-medium text-purple-600">
                  {college.studentsBenefitingPercentage}% students
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {college.exchangePrograms && college.exchangePrograms.slice(0, 2).map((program, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  {program.type}
                </span>
              ))}
              {college.globalTieups && college.globalTieups.slice(0, 2).map((tieup, index) => (
                <span key={index} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {tieup.nature}
                </span>
              ))}
              {((college.exchangePrograms && college.exchangePrograms.length > 2) || (college.globalTieups && college.globalTieups.length > 2)) && (
                <span className="text-xs text-gray-500">
                  +{((college.exchangePrograms?.length || 0) + (college.globalTieups?.length || 0)) - 2} more
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
      
      <div className={`px-6 pt-4 pb-4 bg-gray-50 border-t border-gray-200` }>
        <div className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onApply(); }}
            className="flex-1 flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
          {onCompareToggle && (
            <button
              onClick={(e) => { e.stopPropagation(); onCompareToggle(); }}
              className={`flex-1 flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 ${
                isCompared 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isCompared ? 'Compared' : 'Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
