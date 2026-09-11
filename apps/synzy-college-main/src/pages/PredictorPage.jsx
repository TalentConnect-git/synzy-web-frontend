import React, { useState } from 'react';
import { Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { predictcolleges } from '../api/predictorService';
import CollegeCard from '../components/CollegeCard';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import { addDistanceTocolleges } from '../utils/distanceUtils';

const PredictorPage = ({
  onCompareToggle,
  comparisonList = [],
  shortlist = [],
  onShortlistToggle,
  currentUser
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stream: '',
    customStream: '',
    examType: '',
    examRank: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stream) {
      newErrors.stream = 'Please select your stream';
    }

    if (!formData.examType) {
      newErrors.examType = 'Please select exam type';
    }

    if (!formData.examRank) {
      newErrors.examRank = 'Please enter your exam rank';
    } else if (isNaN(formData.examRank) || formData.examRank <= 0) {
      newErrors.examRank = 'Please enter a valid rank';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      const detectedCity = data.city || data.locality || '';
      const detectedState = data.principalSubdivision || '';
      const displayName = detectedCity && detectedState
        ? `${detectedCity}, ${detectedState}`
        : (detectedCity || detectedState || 'Location Detected');
      return { city: detectedCity, state: detectedState, displayName };
    } catch (_) {
      return { city: '', state: '', displayName: 'Location Detected' };
    }
  };

  const applyLocationUpdate = (locObj) => {
    setUserLocation(locObj);
    toast.success(`Location set: ${locObj.displayName}! Colleges will be sorted by distance.`);

    // If results already on screen, re-rank by proximity immediately
    setSearchResults(prev => {
      if (!prev || prev.length === 0) return prev;
      const updated = addDistanceTocolleges(prev, locObj);
      return [...updated].sort((a, b) => {
        if (a.distanceValue && b.distanceValue) return a.distanceValue - b.distanceValue;
        if (a.distanceValue) return -1;
        if (b.distanceValue) return 1;
        return 0;
      });
    });
  };

  const handleGoogleLocation = () => {
    setIsFetchingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const geoInfo = await reverseGeocode(latitude, longitude);
            const locObj = {
              latitude,
              longitude,
              city: geoInfo.city,
              state: geoInfo.state,
              displayName: geoInfo.displayName
            };
            applyLocationUpdate(locObj);
          } catch (error) {
            console.error('Error fetching location:', error);
            toast.error('Failed to fetch location. Please try again.');
          } finally {
            setIsFetchingLocation(false);
          }
        },
        async (error) => {
          console.warn('Browser geolocation error, attempting IP fallback:', error.message);
          // Graceful fallback to IP geolocation if browser permission is blocked or unavailable
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              const locObj = {
                latitude: ipData.latitude,
                longitude: ipData.longitude,
                city: ipData.city || '',
                state: ipData.region || '',
                displayName: ipData.city && ipData.region ? `${ipData.city}, ${ipData.region}` : (ipData.city || 'India')
              };
              applyLocationUpdate(locObj);
              setIsFetchingLocation(false);
              return;
            }
          } catch (_) {}

          if (error.code === 1) toast.info('GPS permission denied. Using standard ranking.');
          else toast.error('Unable to retrieve location.');
          setIsFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Direct IP fallback if browser doesn't support geolocation
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(ipData => {
          if (ipData && ipData.latitude && ipData.longitude) {
            const locObj = {
              latitude: ipData.latitude,
              longitude: ipData.longitude,
              city: ipData.city || '',
              state: ipData.region || '',
              displayName: ipData.city && ipData.region ? `${ipData.city}, ${ipData.region}` : (ipData.city || 'India')
            };
            applyLocationUpdate(locObj);
          } else {
            toast.error('Location service unavailable.');
          }
        })
        .catch(() => toast.error('Location service unavailable.'))
        .finally(() => setIsFetchingLocation(false));
    }
  };

  // Helper function to extract location from college name (fallback)
  const extractLocation = (collegeName) => {
    const match = collegeName.match(/,\s*(.+)$/);
    if (match) return match[1];

    const parenMatch = collegeName.match(/\(([^)]+)\)/);
    if (parenMatch) return parenMatch[1];

    return "India";
  };

  // Helper function to generate a fallback ID if needed
  const generateId = (name, index) => {
    return `pred-${Date.now()}-${index}-${String(name).slice(0, 10).replace(/\s+/g, '-')}`;
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const payload = {
        stream: formData.stream === 'Other' ? formData.customStream : formData.stream,
        examType: formData.examType,
        examRank: parseInt(formData.examRank, 10),
        ...(userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        } : {})
      };

      console.log('🔍 Predicting colleges with payload:', payload);

      const resp = await predictcolleges(payload);
      console.log('✅ Response:', resp);

      const rawColleges = resp?.data || resp?.colleges || [];
      console.log('✅ Found', rawColleges.length, 'colleges');

      // Map colleges, preserving real database attributes
      const formattedColleges = rawColleges.map((item, index) => {
        if (typeof item === 'string') {
          return {
            _id: generateId(item, index),
            id: generateId(item, index),
            collegeId: generateId(item, index),
            name: item,
            collegeName: item,
            location: extractLocation(item),
            city: extractLocation(item),
            state: extractLocation(item),
            type: formData.stream,
            stream: formData.stream,
            examType: formData.examType,
            rank: "Top Tier",
            feeRange: "Contact college",
            fee: "Contact college",
            fees: "Contact college",
            score: "N/A",
            rating: "N/A",
            ratings: 0,
            image: null,
            images: [],
            established: "N/A",
            accreditation: "NAAC A+",
            affiliatedTo: "Recognized by UGC",
            website: "#",
            email: "info@college.edu",
            phone: "Contact college",
            description: `${item} is a premier institution for ${formData.stream} education.`,
            courses: [formData.stream],
            facilities: ["Library", "Laboratory", "Sports Complex"],
            placementRate: "90%+",
            highestPackage: "Contact college",
            averagePackage: "Contact college"
          };
        }

        const collegeId = item._id || item.id || item.collegeId;
        return {
          ...item,
          _id: collegeId,
          id: collegeId,
          collegeId: collegeId,
          name: item.name || item.collegeName || 'College',
          collegeName: item.name || item.collegeName || 'College',
          location: item.location || (item.city && item.state ? `${item.city}, ${item.state}` : (item.city || item.state || 'India')),
          type: item.stream || (item.streamsOffered?.[0]) || formData.stream,
          stream: item.stream || (item.streamsOffered?.[0]) || formData.stream,
          examType: formData.examType,
          feeRange: item.feeRange || 'Contact college',
          score: item.scoreDisplay || (item.score ? `${item.score}/100` : (item.ratings ? `${item.ratings}/5` : 'N/A')),
          rating: item.ratings || item.rating || 'N/A',
          ratings: item.ratings || 0,
          description: item.collegeInfo || item.description || `${item.name} is a premier institution for higher education.`,
          facilities: item.facilities || item.amenities || []
        };
      });

      const withDistance = userLocation ? addDistanceTocolleges(formattedColleges, userLocation) : formattedColleges;
      console.log('✅ Formatted colleges:', withDistance);
      setSearchResults(withDistance);

      if (withDistance.length === 0) {
        toast.info('No colleges found matching your criteria. Try different preferences.');
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        toast.error(error.response.data?.message || 'Prediction failed');
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Failed to fetch college predictions. Please try again.');
      }
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setFormData({
      stream: '',
      customStream: '',
      examType: '',
      examRank: ''
    });
    setErrors({});
    setSearchResults([]);
    setHasSearched(false);
    setUserLocation(null);
    setIsFetchingLocation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Find Your Perfect college
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Fill in your preferences to discover colleges that match your needs.
            </p>
          </div>

          <form onSubmit={handlePredict}>
            {/* Three Fields */}
            <div className="space-y-6 mb-6">
              {/* Stream Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select your stream
                </label>
                <label className="block text-xs text-gray-500 mb-1">Stream</label>
                <div className="relative">
                  <select
                    value={formData.stream}
                    onChange={(e) => handleInputChange('stream', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border ${errors.stream ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none`}
                  >
                    <option value="">Select Stream</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management">Management</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Law">Law</option>
                    <option value="Medical">Medical</option>
                    <option value="Design">Design</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.stream && (
                  <p className="text-red-500 text-sm mt-1">{errors.stream}</p>
                )}
                {formData.stream === 'Other' && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Specify Custom Stream</label>
                    <input
                      type="text"
                      value={formData.customStream}
                      onChange={(e) => handleInputChange('customStream', e.target.value)}
                      placeholder="e.g. Aviation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Exam Type Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select exam type
                </label>
                <label className="block text-xs text-gray-500 mb-1">Exam Type</label>
                <div className="relative">
                  <select
                    value={formData.examType}
                    onChange={(e) => handleInputChange('examType', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border ${errors.examType ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none`}
                  >
                    <option value="">Select Exam Type</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="EAMCET (TS)">EAMCET (TS)</option>
                    <option value="EAMCET (AP)">EAMCET (AP)</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="BITSAT">BITSAT</option>
                    <option value="NEET">NEET</option>
                    <option value="AIIMS">AIIMS</option>
                    <option value="State CET">State CET</option>
                    <option value="COMEDK">COMEDK</option>
                    <option value="WBJEE">WBJEE</option>
                    <option value="MHT-CET">MHT-CET</option>
                    <option value="KCET">KCET</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.examType && (
                  <p className="text-red-500 text-sm mt-1">{errors.examType}</p>
                )}
              </div>

              {/* Exam Rank Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter your exam rank
                </label>
                <label className="block text-xs text-gray-500 mb-1">Exam Rank</label>
                <input
                  type="number"
                  value={formData.examRank}
                  onChange={(e) => handleInputChange('examRank', e.target.value)}
                  placeholder="Enter your rank"
                  className={`w-full px-4 py-3 border ${errors.examRank ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  min="1"
                />
                {errors.examRank && (
                  <p className="text-red-500 text-sm mt-1">{errors.examRank}</p>
                )}
              </div>
            </div>

            {/* Google Location Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleGoogleLocation}
                disabled={isFetchingLocation}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-75 disabled:cursor-not-allowed ${
                  userLocation
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white focus:ring-emerald-500'
                    : 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500'
                }`}
              >
                {isFetchingLocation ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Fetching Location...</span>
                  </div>
                ) : userLocation ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
                    <div className="flex items-center">
                      <Navigation className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-300" />
                      <span>Location Set: <strong>{userLocation.displayName || `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`}</strong></span>
                    </div>
                    <span className="text-xs text-emerald-200 opacity-90 sm:ml-2">(Colleges prioritized by proximity • Click to update)</span>
                  </div>
                ) : (
                  <>
                    <Navigation className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="block sm:inline">Fetch from Google Location</span>
                    <br className="hidden sm:block" />
                    <span className="text-xs sm:text-sm opacity-90 block sm:inline">(to see colleges near you)</span>
                  </>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isLoading ? 'Finding colleges...' : 'Submit'}
              </button>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Want to save your preferences?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Predicted colleges ({searchResults.length} colleges found)
            </h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-500">Analyzing your preferences...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((college, index) => {
                  const collegeId = college._id || college.id || college.collegeId;
                  const isCompared = Array.isArray(comparisonList) && comparisonList.some(item => (item.collegeId || item._id || item.id) === collegeId);
                  const isShortlisted = Array.isArray(shortlist) && shortlist.some(item => (item.collegeId || item._id || item.id) === collegeId);

                  return (
                    <CollegeCard
                      key={collegeId || `college-${index}`}
                      college={college}
                      onCardClick={() => navigate(`/college/${collegeId}`)}
                      onCompareToggle={() => onCompareToggle && onCompareToggle(college)}
                      isCompared={isCompared}
                      currentUser={currentUser}
                      onShortlistToggle={() => onShortlistToggle && onShortlistToggle(college)}
                      isShortlisted={isShortlisted}
                      onApply={() => {
                        if (collegeId) {
                          try { localStorage.setItem('lastAppliedcollegeId', String(collegeId)); } catch (_) { }
                        }
                        const dest = `/apply/${collegeId}`;
                        if (!currentUser) {
                          localStorage.setItem('redirectPath', dest);
                          navigate('/login');
                          return;
                        }
                        navigate(dest);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No colleges found matching your preferences.</div>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try different preferences
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictorPage;