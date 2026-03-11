// src/utils/distanceUtils.js

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} Km`;
  } else {
    return `${Math.round(distance)} Km`;
  }
};

/**
 * Get user's current location
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Extract coordinates from college data
 * @param {Object} college - college object
 * @returns {Object|null} Coordinates object or null if not found
 */
export const extractcollegeCoordinates = (college) => {
  // Try different possible coordinate field names
  if (college.coordinates) {
    return {
      latitude: college.coordinates.latitude || college.coordinates.lat,
      longitude: college.coordinates.longitude || college.coordinates.lng || college.coordinates.lon
    };
  }
  
  if (college.location && typeof college.location === 'object') {
    return {
      latitude: college.location.latitude || college.location.lat,
      longitude: college.location.longitude || college.location.lng || college.location.lon
    };
  }
  
  if (college.lat && college.lng) {
    return {
      latitude: college.lat,
      longitude: college.lng
    };
  }
  
  if (college.latitude && college.longitude) {
    return {
      latitude: college.latitude,
      longitude: college.longitude
    };
  }
  
  return null;
};

/**
 * Calculate and add distance to colleges array
 * @param {Array} colleges - Array of college objects
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @returns {Array} colleges array with distance added
 */
export const addDistanceTocolleges = (colleges, userLocation) => {
  if (!userLocation || !Array.isArray(colleges)) {
    return colleges;
  }

  return colleges.map(college => {
    const collegeCoords = extractcollegeCoordinates(college);
    
    if (collegeCoords && collegeCoords.latitude && collegeCoords.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        collegeCoords.latitude,
        collegeCoords.longitude
      );
      
      return {
        ...college,
        distance: formatDistance(distance),
        distanceValue: distance // Keep numeric value for sorting
      };
    }
    
    return college;
  });
};

export default {
  calculateDistance,
  formatDistance,
  getCurrentLocation,
  extractcollegeCoordinates,
  addDistanceTocolleges
};
