// src/pages/collegesPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPubliccollegesByStatus } from "../api/collegeService";
import CollegeCard from "../components/CollegeCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getCurrentLocation, addDistanceTocolleges } from "../utils/distanceUtils";
import { addScoresTocolleges } from "../utils/scoreUtils";

const collegesPage = ({
  onCompareToggle,
  comparisonList,
  shortlist,
  onShortlistToggle,
}) => {
  const [colleges, setcolleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'score', 'name'
  
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Function to request user location
  const requestUserLocation = async () => {
    try {
      setLocationError(null);
      const location = await getCurrentLocation();
      setUserLocation(location);
      setShowLocationOptions(false);
      // Show success message only for manual request
      toast.success("Location access granted! colleges are now sorted by distance.");
    } catch (error) {
      console.warn("Could not get user location:", error.message);
      setLocationError(error.message);
      // Don't show warning for manual request failure
      toast.info("Location access was denied. You can select a city manually.");
    }
  };

  // Function to set manual location
  const setManualLocation = (city) => {
    const cityCoordinates = {
      'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
      'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
      'Delhi': { latitude: 28.7041, longitude: 77.1025 },
      'Chennai': { latitude: 13.0827, longitude: 80.2707 },
      'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
      'Pune': { latitude: 18.5204, longitude: 73.8567 }
    };
    
    if (cityCoordinates[city]) {
      setUserLocation(cityCoordinates[city]);
      setLocationError(null);
      setShowLocationOptions(false);
      toast.success(`Location set to ${city}. colleges are now sorted by distance.`);
    }
  };

  // Get user location on component mount - with flag to prevent duplicate toasts
  useEffect(() => {
    const getLocation = async () => {
      try {
        setLocationError(null);
        const location = await getCurrentLocation();
        setUserLocation(location);
        // Don't show toast on initial load, only show when user manually requests
      } catch (error) {
        console.warn("Could not get user location:", error.message);
        setLocationError(error.message);
        // Don't show warning toast on initial load
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    const loadcolleges = async () => {
      try {
        setLoading(true);
        const response = await getPubliccollegesByStatus("accepted");
        // Normalize possible shapes: array, {data: [...]}, {data: {data: [...]}}
        const raw = response?.data;
        let normalized = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        
        // Add mock coordinates for testing if they don't exist
        normalized = normalized.map((college, index) => {
          if (!college.coordinates && !college.lat && !college.latitude) {
            // Add mock coordinates around Bangalore area for testing
            const baseLat = 12.9716;
            const baseLng = 77.5946;
            const randomLat = baseLat + (Math.random() - 0.5) * 0.2; // ±0.1 degree variation
            const randomLng = baseLng + (Math.random() - 0.5) * 0.2;
            
            return {
              ...college,
              coordinates: {
                latitude: randomLat,
                longitude: randomLng
              }
            };
          }
          return college;
        });

        // Add calculated scores to all colleges
        normalized = addScoresTocolleges(normalized);

        // Add distance to colleges if user location is available
        if (userLocation) {
          normalized = addDistanceTocolleges(normalized, userLocation);
        }

        // Sort colleges based on selected criteria
        normalized.sort((a, b) => {
          switch (sortBy) {
            case 'distance':
              if (a.distanceValue && b.distanceValue) {
                return a.distanceValue - b.distanceValue;
              }
              if (a.distanceValue) return -1;
              if (b.distanceValue) return 1;
              return 0;
            
            case 'score':
              const scoreA = a.score || 0;
              const scoreB = b.score || 0;
              return scoreB - scoreA; // Higher score first
            
            case 'name':
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            
            default:
              return 0;
          }
        });
        
        setcolleges(normalized);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Could not load colleges. Please try again later.";
        toast.error(errorMessage);
        setcolleges([]);
      } finally {
        setLoading(false);
      }
    };
    loadcolleges();
  }, [userLocation, sortBy]); // Re-run when user location or sort criteria changes

  

  const handleCardClick = (college) => {
    navigate(`/college/${college._id || college.id || college.collegeId}`);
  };

  const handleApplyClick = (college) => {
    const collegeId = college._id || college.id || college.collegeId;
    if (collegeId) {
      try { localStorage.setItem('lastAppliedcollegeId', String(collegeId)); } catch (_) {}
    }
    const dest = `/apply/${collegeId}`;
    if (!currentUser) {
      localStorage.setItem('redirectPath', dest);
      navigate('/login');
      return;
    }
    navigate(dest);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading colleges...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Explore colleges</h1>
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">Sort by Distance</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="relative">
            {userLocation && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                📍 Distance calculated from your location
              </div>
            )}
            {locationError && !userLocation && (
              <div className="relative">
                <button
                  onClick={() => setShowLocationOptions(!showLocationOptions)}
                  className="text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full transition-colors cursor-pointer border border-orange-200"
                >
                  📍 Enable location for distance info ▼
                </button>
                {showLocationOptions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-3">
                      <button
                        onClick={requestUserLocation}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded mb-2 text-blue-600"
                      >
                        🎯 Use my current location
                      </button>
                      <div className="text-xs text-gray-500 mb-2">Or choose a city:</div>
                      {['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'].map(city => (
                        <button
                          key={city}
                          onClick={() => setManualLocation(city)}
                          className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 rounded text-gray-700"
                        >
                          📍 {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {Array.isArray(colleges) && colleges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {colleges
              .filter((college) => college)
              .map((college) => {
                // Get the unique ID from the college object, whether it's collegeId or _id
                const collegeId = college.collegeId || college._id;
                const isCompared = comparisonList.some(item => (item.collegeId || item._id) === collegeId);
                const isShortlisted = shortlist.some(item => (item.collegeId || item._id) === collegeId);
                return (
                  <CollegeCard
                    key={collegeId}
                    college={college}
                    onCardClick={() => handleCardClick(college)}
                    onCompareToggle={() => onCompareToggle(college)}
                    isCompared={isCompared}
                    currentUser={currentUser}
                    onShortlistToggle={() => onShortlistToggle(college)}
                    isShortlisted={isShortlisted}
                    onApply={() => handleApplyClick(college)}
                  />
                );
              })}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-16">
            <p>No accepted colleges found.</p>
            <p>Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default collegesPage;
