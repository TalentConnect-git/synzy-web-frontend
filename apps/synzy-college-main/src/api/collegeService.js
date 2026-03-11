// src/api/collegeService.js

import apiClient from './axios';

/**
 * Public college APIs (user-facing)
 * All routes are prefixed with /api in app.js
 */

/**
 * Get colleges by status (public endpoint)
 * Backend: GET /api/colleges/status/:status
 */
export const getPubliccollegesByStatus = (status) => {
  const safeStatus = encodeURIComponent(status);
  return apiClient.get(`/admin/colleges/status/${safeStatus}`);
};

/**
 * Get a single college by ID
 * Backend: GET /api/colleges/:id
 */
export const getcollegeById = (collegeId) => {
  return apiClient.get(`/admin/colleges/${encodeURIComponent(collegeId)}`);
};

/**
 * Search colleges
 * Backend: GET /api/colleges/search?q=...&filters... OR /api/search
 */
export const searchcolleges = async (searchQuery, filters = {}) => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('q', searchQuery);
  
  // Add any additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  
  try {
    return await apiClient.get(`/admin/search?${params.toString()}`);
  } catch (error) {
    // Handle 404 as "no results found" instead of error
    if (error.response?.status === 404) {
      return {
        data: {
          status: 'success',
          message: 'No colleges found for the given search.',
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        }
      };
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Compare colleges
 * Backend: POST /api/colleges/compare
 */
export const comparecolleges = (collegeIds) => {
  return apiClient.post('/admin/compare', { collegeIds });
};

/**
 * Filter colleges by fee range
 * Backend: GET /api/colleges/filter-feeRange?min=...&max=...
 */
export const getcollegesByFeeRange = (minFee, maxFee) => {
  const params = new URLSearchParams();
  if (minFee) params.append('min', minFee);
  if (maxFee) params.append('max', maxFee);
  return apiClient.get(`/admin/filter-feeRange?${params.toString()}`);
};

/**
 * Filter colleges by shift
 * Backend: GET /api/colleges/filter-Shift?shift=...
 */
export const getcollegesByShift = (shift) => {
  return apiClient.get(`/admin/filter-Shift?shift=${encodeURIComponent(shift)}`);
};

/**
 * Get college card data
 * Backend: GET /api/colleges/card/:id
 */
export const getCollegeCardData = (collegeId) => {
  return apiClient.get(`/admin/card/${encodeURIComponent(collegeId)}`);
};

/**
 * Get amenities by college ID
 * Backend: GET /api/colleges/amenities/:id
 */
export const getAmenitiesByCollegeId = (collegeId) =>
  apiClient.get(`/college/amenities/${collegeId}`);
/**
 * Get activities by college ID
 * Backend: GET /api/colleges/activities/:id
 */

/**
 * Get alumni by college ID
 * Backend: GET /api/colleges/alumnus/:id
 */
export const getAlumniBycollege = (collegeId) => {
  return apiClient.get(`/colleges/alumni/${encodeURIComponent(collegeId)}`);
};
export const updateAlumniBycollege = (collegeId,data) => {
  return apiClient.put(`/colleges/alumni/${encodeURIComponent(collegeId)}`,data);
};

/**
 * Get infrastructure by college ID
 * Backend: GET /api/admin/colleges/infrastructure/:id
 */


/**
 * Get other details by college ID
 * Backend: GET /api/colleges/other-details/:id
 */
export const getOtherDetailsById = (collegeId) => {
  return apiClient.get(`/admin/colleges/other-details/${encodeURIComponent(collegeId)}`);
};

/**
 * Get academics by college ID
 * Backend: GET /api/admin/colleges/academics/:id
 */

/**
 * Get fees and scholarships by college ID
 * Backend: GET /api/admin/colleges/fees-scholarships/:id
 */


/**
 * Get technology adoption by college ID
 * Backend: GET /api/colleges/technology-adoption/:id
 */
export const getTechnologyAdoptionById = (collegeId) => {
  return apiClient.get(`/admin/colleges/technology-adoption/${encodeURIComponent(collegeId)}`);
};

/**
 * Get admission details by college ID
 * Backend: GET /api/colleges/admission/:id
 */
export const getAdmissionDetails = (collegeId) => {
  return apiClient.get(`/admin/colleges/admission-timeline/${encodeURIComponent(collegeId)}`);
};

/**
 * Get college photos
 * Backend: GET /api/colleges/:id/photos
 */
export const getcollegePhotos = (collegeId) => {
  return apiClient.get(`/admin/${encodeURIComponent(collegeId)}/photos`);
};

/**
 * Get college videos
 * Backend: GET /api/colleges/:id/videos
 */
export const getcollegeVideos = (collegeId) => {
  return apiClient.get(`/admin/${encodeURIComponent(collegeId)}/videos`);
};

/**
 * Get specific college photo
 * Backend: GET /api/colleges/:id/photo/:publicId
 */
export const getcollegePhoto = (collegeId, publicId) => {
  return apiClient.get(`/admin/${encodeURIComponent(collegeId)}/photo/${encodeURIComponent(publicId)}`);
};

/**
 * Get specific college video
 * Backend: GET /api/colleges/:id/video/:publicId
 */
export const getcollegeVideo = (collegeId, publicId) => {
  return apiClient.get(`/admin/${encodeURIComponent(collegeId)}/video/${encodeURIComponent(publicId)}`);
};

/**
 * Add support/help request
 * Backend: POST /api/colleges/support (requires authentication)
 */
export const addSupport = (supportData) => {
  return apiClient.post('/admin/support', supportData);
};

/**
 * Get support requests by student ID
 * Backend: GET /api/colleges/support/:studId
 */
export const getSupportByStudent = (studentId) => {
  return apiClient.get(`/admin/support/${encodeURIComponent(studentId)}`);
};

/**
 * Get specific support request
 * Backend: GET /api/colleges/support-id/:supportId
 */
export const getSupportById = (supportId) => {
  return apiClient.get(`/admin/support-id/${encodeURIComponent(supportId)}`);
};

/**
 * Delete support request
 * Backend: DELETE /api/colleges/support/:supportId (requires authentication)
 */
export const deleteSupport = (supportId) => {
  return apiClient.delete(`/admin/support/${encodeURIComponent(supportId)}`);
};

/**
 * Predict colleges based on criteria
 * Backend: POST /api/colleges/predict-colleges OR /api/colleges/predict
 */
export const predictcolleges = (predictorData) => {
  return apiClient.post('/admin/predict-colleges', predictorData);
};

/**
 * Get all blogs
 * Backend: GET /api/colleges/blogs
 */
export const getAllBlogs = () => {
  return apiClient.get('/admin/blogs');
};

/**
 * Get blog by ID
 * Backend: GET /api/colleges/blogs/:id
 */
export const getBlogById = (blogId) => {
  return apiClient.get(`/admin/blogs/${encodeURIComponent(blogId)}`);
};

/**
 * Create a new blog
 * Backend: POST /api/colleges/blogs
 */
export const createBlog = (blogData) => {
  return apiClient.post('/admin/blogs', blogData);
};

/**
 * Get admission status by student ID
 * Backend: GET /api/colleges/admission-status/:studentId (requires authentication)
 */
export const getAdmissionStatusByStudent = (studentId) => {
  return apiClient.get(`/admin/admission-status/${encodeURIComponent(studentId)}`);
};

/**
 * Add admission status
 * Backend: POST /api/colleges/admission-status (requires authentication)
 */
export const addAdmissionStatus = (statusData) => {
  return apiClient.post('/admin/admission-status', statusData);
};

/**
 * Update admission status
 * Backend: PUT /api/colleges/admission-status/:studentId/:collegeId (requires authentication)
 */
export const updateAdmissionStatus = (studentId, collegeId, statusData) => {
  return apiClient.put(`/admin/admission-status/${encodeURIComponent(studentId)}/${encodeURIComponent(collegeId)}`, statusData);
};

/**
 * Delete admission status
 * Backend: DELETE /api/colleges/admission-status/:studentId/:collegeId (requires authentication)
 */
export const deleteAdmissionStatus = (studentId, collegeId) => {
  return apiClient.delete(`/admin/admission-status/${encodeURIComponent(studentId)}/${encodeURIComponent(collegeId)}`);
};

/**
 * Filter colleges by student preferences
 * Backend: GET /api/colleges/filter/:studentId (requires authentication)
 */
export const filtercollegesByPreferences = (studentId) => {
  return apiClient.get(`/admin/filter/${encodeURIComponent(studentId)}`);
};

/**
 * Get nearby colleges based on location
 * Backend: GET /api/admin/colleges/nearby?longitude=...&latitude=...&state=...
 */
export const getNearbycolleges = (longitude, latitude, state) => {
  const params = new URLSearchParams();
  if (longitude) params.append('longitude', longitude);
  if (latitude) params.append('latitude', latitude);
  if (state) params.append('state', state);
  return apiClient.get(`/admin/colleges/nearby?${params.toString()}`);
};

export default {
  getPubliccollegesByStatus,
  getcollegeById,
  searchcolleges,
  comparecolleges,
  getcollegesByFeeRange,
  getcollegesByShift,
  getCollegeCardData,
  getAmenitiesByCollegeId,
  
  getAlumniBycollege,
  




  
  getOtherDetailsById,
 
  getTechnologyAdoptionById,
  getAdmissionDetails,
  getcollegePhotos,
  getcollegeVideos,
  getcollegePhoto,
  getcollegeVideo,
  addSupport,
  getSupportByStudent,
  getSupportById,
  deleteSupport,
  predictcolleges,
  getAllBlogs,
  getBlogById,
  createBlog,
  getAdmissionStatusByStudent,
  addAdmissionStatus,
  updateAdmissionStatus,
  deleteAdmissionStatus,
  filtercollegesByPreferences,
  getNearbycolleges
};