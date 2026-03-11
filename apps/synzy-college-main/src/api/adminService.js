import apiClient from './axios';

/**
 * ============================
 * Admin Authentication
 * ============================
 */

// Register admin
export const registerAdmin = async (adminData) => {
  // Use regular auth register with college userType (since admin is registered as college)
  return await apiClient.post('/auth/register', { ...adminData, userType: 'college' });
};

// Login admin
export const loginAdmin = async (credentials) => {
  // Use the special admin login endpoint that checks against .env variables
  return await apiClient.post('/admin/admin-login', credentials);
};

/**
 * ============================
 * Dashboard & User Management
 * ============================
 */

export const getAdminStats = () => apiClient.get('/admin/stats');
export const getAllUsers = () => apiClient.get('/admin/users');

/**
 * ============================
 * APPLICATION FLOW FUNCTIONS
 * ============================
 */

// Check if application exists for student
export const checkApplicationExists = (studId) => apiClient.get(`/applications/${studId}`);

// Create new application
export const createApplication = (data) => apiClient.post('/applications/', data);

// Get application by student ID
export const getApplicationByStudentId = (studId) => apiClient.get(`/applications/${studId}`);

// Update application
export const updateApplication = (studId, data) => apiClient.put(`/applications/${studId}`, data);

// Delete application
export const deleteApplication = (studId) => apiClient.delete(`/applications/${studId}`);

// Submit form to college
export const submitFormTocollege = (collegeId, studId, formId) => 
  apiClient.post(`/form/${collegeId}/${studId}/${formId}`);

// Get forms by student
export const getFormsByStudent = (studId) => apiClient.get(`/form/student/${studId}`);

// Get forms by college
export const getFormsBycollege = (collegeId) => apiClient.get(`/form/college/${collegeId}`);

// Track form
export const trackForm = (formId) => apiClient.get(`/form/track/${formId}`);

// Update form status
export const updateFormStatus = (formId, status) => 
  apiClient.put(`/form/${formId}?status=${status}`);

/**
 * ============================
 * ENHANCED APPLICATION FLOW
 * ============================
 */

// Handle complete application flow with scenarios
export const handleApplicationFlow = (studId, collegeId, applicationData = null) => {
  return apiClient.post('/api/application-flow', {
    studId,
    collegeId,
    applicationData
  });
  
};

// Update existing application (Scenario C)
export const updateExistingApplication = (studId, updateData) => {
  return apiClient.put(`/applications/${studId}`, updateData);
};

/**
 * ============================
 * college CRUD Operations
 * ============================
 */

// ✅ FIXED: Updated to match router.post('/college/by-auth/:authId')
export const addcollege = (data) => {
  return apiClient.post('/colleges/add', data);
};


export const addAmenities = (data) =>
  apiClient.post('/colleges/amenities/add', data);


export const addAlumni = (data) =>
  apiClient.post('/colleges/alumni/add', data);


export const addOtherDetails = (data) =>
  apiClient.post('/colleges/other-details/add', data);
export const addFeesAndScholarships = (data) =>
  apiClient.post('/colleges/fees-scholarships/add', data);
export const addAcademics = (data) =>
  apiClient.post('/colleges/academics/add', data);  
export const addFaculty = (data) => apiClient.post('/colleges/faculty/add', data);


export const addTechnologyAdoption = (data) =>
  apiClient.post('/colleges/technology-adoption/add', data);
export const getAcademicsById = (collegeId) =>
  apiClient.get(`/colleges/academics/${encodeURIComponent(collegeId)}`);
export const getOtherDetailsById = (collegeId) =>
  apiClient.get(`/colleges/other-details/${encodeURIComponent(collegeId)}`);
export const getTechnologyAdoptionById = (collegeId) =>
  apiClient.get(`/colleges/technology-adoption/${encodeURIComponent(collegeId)}`);
export const getSafetyAndSecurityById = (collegeId) =>
  apiClient.get(`/colleges/safety/${encodeURIComponent(collegeId)}`);
export const getInternationalExposureById = (collegeId) =>
  apiClient.get(`/colleges/international/${encodeURIComponent(collegeId)}`);



/**
 * ============================
 * Get / Update college Info
 * ============================
 */

export const getcollegeById = (collegeId) =>
  apiClient.get(`/colleges/${encodeURIComponent(collegeId)}`);

export const getcollegeById1 = (collegeId, config) =>
  apiClient.get(`/admin/colleges/${encodeURIComponent(collegeId)}`, config);

export const updateCollegeByAuthId = (collegeId, data) =>
  apiClient.put(`/colleges/${encodeURIComponent(collegeId)}`, data);

export const updatecollegetatus = (collegeId, newStatus) =>
  apiClient.put(`/colleges/${encodeURIComponent(collegeId)}`, { status: newStatus });
export const getcollegesByStatus = (status) => getcollegeByStatus(status);

export const getcollegeByStatus = async (status) => {
  try {
    return await apiClient.get(`colleges/status/${encodeURIComponent(status)}`);
  } catch (error) {
    const message = error?.response?.data?.message || '';
    if (error?.response?.status === 500 && message.includes('No college found with status')) {
      return {
        data: {
          data: [],
          message,
          status: 'success'
        }
      };
    }
    throw error;
  }
};

export const getAllcollege = () => apiClient.get('/admin/colleges/status/all');
export const getPendingcollege = async () => {
  const candidates = [
    '/admin/colleges/admin/pending',
    '/admin/colleges/pending',
    '/admin/colleges/status/pending',
  ];
  let lastErr;
  for (const path of candidates) {
    try {
      const res = await apiClient.get(path, { headers: { 'X-Silent-Request': '1' } });
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to fetch pending college');
};

/**
 * ============================
 * Faculty, Admission, and Tech
 * ============================
 */

// ADD faculty


// GET faculty by collegeId
export const getFacultyById = (collegeId) =>
  apiClient.get(`/colleges/faculty/${encodeURIComponent(collegeId)}`);

// UPDATE faculty
export const updateFaculty = (collegeId, data) =>
  apiClient.put(`/colleges/faculty/${encodeURIComponent(collegeId)}`, data);

// DELETE faculty (optional)
export const deleteFaculty = (collegeId) =>
  apiClient.delete(`/colleges/faculty/${encodeURIComponent(collegeId)}`);


export const getAdmissionTimelineById = async (collegeId) => {
  try {
    return await apiClient.get(
      `/colleges/admission/${encodeURIComponent(collegeId)}`,
      {
        headers: { 'X-Silent-Request': '1' }
      }
    );
  } catch (e) {
    if (e?.response?.status === 404) return { data: null };
    throw e;
  }
};


/**
 * ============================
 * Media (Photos & Videos)
 * ============================
 */

export const getcollegePhotos = (collegeId) =>
  apiClient.get(`/admin/${encodeURIComponent(collegeId)}/photos`);
export const getcollegeVideos = (collegeId) =>
  apiClient.get(`/admin/${encodeURIComponent(collegeId)}/videos`);

export const uploadcollegePhotos = (collegeId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('files', f));
  return apiClient.post(`/admin/${encodeURIComponent(collegeId)}/upload/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadcollegeVideo = (collegeId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/admin/${encodeURIComponent(collegeId)}/upload/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletecollegePhoto = (collegeId, publicId) =>
  apiClient.delete(`/admin/${encodeURIComponent(collegeId)}/photo/${encodeURIComponent(publicId)}`);
export const deletecollegeVideo = (collegeId, publicId) =>
  apiClient.delete(`/admin/${encodeURIComponent(collegeId)}/video/${encodeURIComponent(publicId)}`);

/**
 * ============================
 * Admin Profile & Password
 * ============================
 */

export const getAdminProfile = () => apiClient.get('/admin/profile');
export const updateAdminProfile = (profileData) =>
  apiClient.patch('/admin/profile', profileData);
export const changeAdminPassword = (passwordData) =>
  apiClient.patch('/admin/change-password', passwordData);

/**
 * ============================
 * Delete & Validation
 * ============================
 */

export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);
export const deletecollege = (collegeId) => apiClient.delete(`/admin/college/${collegeId}`);

// More resilient existence check that won't crash the UI if the id isn't a college id
export const getcollegeByAuthId = async (authId) => {
  if (!authId) return { data: null };
  try {
    
    console.log(`🔍 Finding college by authId: ${authId}`);
    // ✅ FIXED: Matches router.get('/college/by-auth/:authId')
    const res = await apiClient.get(`/colleges/${encodeURIComponent(authId)}`, {
      headers: { 'X-Silent-Request': '1' }
    });
    console.log(`✅ Found college by authId:`, res?.data);
    return res;
  } catch (error) {
    const status = error?.response?.status;
    console.warn(`⚠️ college not found for authId ${authId}, status: ${status}`);
    if (status === 404 || status === 400 || status === 500) {
      return { data: null };
    }
    throw error;
  }
};

export const checkcollegeProfileExists = async (authId) => {
  if (!authId) return { data: null };
  try {
    const res = await getcollegeById(authId, { headers: { 'X-Silent-Request': '1' } });
    return res;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 400 || status === 500) {
      // Treat as non-existent rather than throwing to callers
      return { data: null };
    }
    throw error;
  }
};

/**
 * ============================
 * college Sub-Data Retrieval
 * ============================
 */
export const addHostel = (data) =>
  apiClient.post('/colleges/hostel/add', data);

export const getHostelsByCollege = (collegeId) =>
  apiClient.get(`/colleges/hostel/${encodeURIComponent(collegeId)}`);

export const updateHostel = (hostelId, data) =>
  apiClient.put(`/colleges/hostel/${encodeURIComponent(hostelId)}`, data);

export const deleteHostel = (hostelId) =>
  apiClient.delete(`/colleges/hostel/${encodeURIComponent(hostelId)}`);
export const addExam = (data) =>
  apiClient.post('/colleges/exam', data);

export const getCollegeExams = (id) =>
  apiClient.get(`/colleges/exam/${encodeURIComponent(id)}`);
export const upsertCourseFee = (data) =>
  apiClient.post('/colleges/course-fee', data);

export const getCourseFeesByCollege = (collegeId) =>
  apiClient.get(`/colleges/course-fee/college/${encodeURIComponent(collegeId)}`);
export const addCourse = (data) =>
  apiClient.post('/colleges/course/add', data);

export const getCoursesByCollege = (collegeId) =>
  apiClient.get(`/colleges/courses/college/${encodeURIComponent(collegeId)}`);

export const updateCourse = (courseId, data) =>
  apiClient.put(`/colleges/course/${encodeURIComponent(courseId)}`, data);
export const addPlacement = (data) =>
  apiClient.post('/colleges/placement/add', data);

export const getPlacementsByCourse = (courseId) =>
  apiClient.get(`/colleges/placement/${encodeURIComponent(courseId)}`);

export const getPlacementsByCollege = (collegeId) =>
  apiClient.get(`/colleges/placement/college/${encodeURIComponent(collegeId)}`);

export const updatePlacement = (placementId, data) =>
  apiClient.put(`/colleges/placement/${encodeURIComponent(placementId)}`, data);
export const addScholarship = (data) =>
  apiClient.post('/colleges/scholarship/add', data);
export const getFeesAndScholarshipsById = (collegeId) => {
  return apiClient.get(`colleges/fees-scholarships/${encodeURIComponent(collegeId)}`);
};
export const getInfrastructureById = (collegeId) => {
  return apiClient.get(`/colleges/infrastructure/${encodeURIComponent(collegeId)}`);
};
export const getScholarshipsByCollege = (collegeId) =>
  apiClient.get(`/colleges/scholarship/${encodeURIComponent(collegeId)}`);
export const addActivities = (data) =>
  apiClient.post('/colleges/activities/add', data);
export const getActivitiesByCollegeId = (collegeId) =>
  apiClient.get(`/colleges/activities/${collegeId}`);

export const getActivitiesByCollege = (collegeId) =>
  apiClient.get(`/colleges/activities/${encodeURIComponent(collegeId)}`);

export const updateActivities = (collegeId, data) =>
  apiClient.put(`/colleges/activities/${encodeURIComponent(collegeId)}`, data);

export const deleteActivities = (collegeId) =>
  apiClient.delete(`/colleges/activities/${encodeURIComponent(collegeId)}`);
export const addInfrastructure = (data) =>
  apiClient.post('/colleges/infrastructure/add', data);

export const getInfrastructureByCollege = (collegeId) =>
  apiClient.get(`/colleges/infrastructure/${encodeURIComponent(collegeId)}`);

export const updateInfrastructure = (collegeId, data) =>
  apiClient.put(`/colleges/infrastructure/${encodeURIComponent(collegeId)}`, data);

export const deleteInfrastructure = (collegeId) =>
  apiClient.delete(`/colleges/infrastructure/${encodeURIComponent(collegeId)}`);
export const addInternationalExposure = (data) =>
  apiClient.post('/colleges/international/add', data);

export const getInternationalExposureByCollege = (collegeId) =>
  apiClient.get(`/colleges/international/${encodeURIComponent(collegeId)}`);

export const updateInternationalExposure = (collegeId, data) =>
  apiClient.put(`/colleges/international/${encodeURIComponent(collegeId)}`, data);
export const addSafetyAndSecurity = (data) =>
  apiClient.post('/colleges/safety/add', data);

export const getSafetyByCollege = (collegeId) =>
  apiClient.get(`/colleges/safety/${encodeURIComponent(collegeId)}`);

export const updateSafetyByCollege = (collegeId, data) =>
  apiClient.put(`/colleges/safety/${encodeURIComponent(collegeId)}`, data);
export const addAdmissionTimeline = (data) =>
  apiClient.post('/colleges/admission/add', data);

export const getAdmissionTimelineByCollege = (collegeId) =>
  apiClient.get(`/colleges/admission/${encodeURIComponent(collegeId)}`);

export const updateAdmissionTimeline = (collegeId, data) =>
  apiClient.put(`/colleges/admission/${encodeURIComponent(collegeId)}`, data);

export const getAmenitiesByCollegeId = (collegeId) =>
  apiClient.get(`/colleges/amenities/${collegeId}`);
export const updateAmenities = (collegeId, data) =>
  apiClient.put(`/colleges/amenities/${collegeId}`, data);
export const updateOtherDetails = (collegeId, data) =>
  apiClient.put(`/colleges/other-details/${collegeId}`, data);
export const updateSafetyAndSecurity = (collegeId, data) =>
  apiClient.put(`/colleges/safety/${collegeId}`, data);

/**
 * ============================
 * Student Applications
 * ============================
 */

export const getStudentApplicationsBycollege = (collegeId) =>
  apiClient.get(`/applications?collegeId=${encodeURIComponent(collegeId)}`);

export const getStudentApplicationsBycollegeEmail = (collegeEmail) =>
  apiClient.get(`/applications?collegeEmail=${encodeURIComponent(collegeEmail)}`);

export const getAllStudentApplications = () =>
  apiClient.get('/applications');
export const getApprovedcolleges = () => getcollegeByStatus('approved');
export const getRejectedcolleges = () => getcollegeByStatus('rejected');
export const getPendingcolleges = () => getPendingcollege();
export const updatecollegeStatus = (collegeId, newStatus) =>
  apiClient.put(`/college/${encodeURIComponent(collegeId)}`, { status: newStatus });
