// src/api/applicationService.js
import apiClient from './axios';

/**
 * ============================
 * APPLICATION FLOW SERVICE
 * ============================
 * 
 * Step 1: Check if Application Exists
 * ├─> GET /api/applications/:studId
 * │
 * ├─> If ERROR (404 - No application found):
 * │   └─> Show Application Form to fill
 * │       └─> User fills the form with all details
 * │       └─> POST /api/applications/ (create new application)
 * │       └─> Then proceed to Step 2
 * │
 * └─> If SUCCESS (200 - Application found):
 *     └─> Application already exists
 *     └─> Proceed directly to Step 2
 * 
 * Step 2: Submit Form to college
 * └─> POST /api/form/:collegeId/:studId/:formId
 *     └─> Creates Form submission record
 *     └─> Links: Student + college + Application PDF
 *     └─> Status: "Pending"
 */

/**
 * Step 1: Check if application exists for a student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Application data if exists, null if not found
 */
export const checkApplicationExists = async (studId) => {
  try {
    const response = await apiClient.get(`/application/stud/${studId}`);
    // Ensure we return the array of applications
    return response.data; 
  } catch (error) {
    return []; // Return empty array if none found
  }
};

/**
 * Create a new student application
 * @param {Object} applicationData - Application form data
 * @returns {Promise<Object>} Created application data
 */
export const createApplication = async (applicationData) => {
  try {
    const response = await apiClient.post('/application/', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error creating application:', error.response?.data || error.message);
    throw error;
  }
};
export const getAllStudentApplications = async (studId) => {
    try {
        const response = await apiClient.get(`/application/stud/${studId}`);
        // Ensure we return an array. Backend might return { data: [...] } or just [...]
        return response.data.data || response.data || []; 
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
};
export const getApplicationById = async (appId) => {
    try {
        const response = await apiClient.get(`/application/${appId}`); 
        // Note: Backend team said use applicationId for specific fetching
        return response.data;
    } catch (error) {
        console.error("Error fetching specific application:", error);
        throw error;
    }
};

/**
 * Get application by student ID
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Application data
 */
export const getApplicationByStudentId = async (studId) => {
  try {
    const response = await apiClient.get(`/application/stud/${studId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update existing application
 * @param {string} studId - Student ID
 * @param {Object} updateData - Updated application data
 * @returns {Promise<Object>} Updated application data
 */
export const updateApplication = async (applicationId, updateData) => {
  try {
    const response = await apiClient.put(`/application/${applicationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating application:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete application
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteApplication = async (applicationId) => {
  try {
    const response = await apiClient.delete(`/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting application:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check if form has already been submitted to a college
 * @param {string} collegeId - college ID
 * @param {string} studId - Student ID  
 * @param {string} formId - Form/Application ID
 * @returns {Promise<Object>} Form submission status
 */
/**
 * Check if form has already been submitted to a college
 * FIXED: Now checks if the specific APPLICATION ID matches, not just the student/user ID.
 */
export const checkFormSubmission = async (collegeId, studId, applicationId) => {
  try {
    // Get all forms for this user/student
    const forms = await getFormsByStudent(studId);
    
    // We need to find if THIS specific application has already been sent to THIS college
    const existingForm = forms.data?.find(form => {
      // 1. Check if it is the same college
      const isSamecollege = (form.collegeId === collegeId || form.collegeId?._id === collegeId);
      
      // 2. Check if it is the same application (Child Profile)
      // We check multiple fields because backend naming might vary (applicationId, formId, or linked object)
      const isSameApplication = (
          form.applicationId === applicationId || 
          form.formId === applicationId ||
          form.application?._id === applicationId
      );

      // It is a duplicate ONLY if BOTH match
      return isSamecollege && isSameApplication;
    });
    
    return {
      exists: !!existingForm,
      form: existingForm
    };
  } catch (error) {
    console.error('Error checking form submission:', error.response?.data || error.message);
    return { exists: false, form: null };
  }
};

/**
 * Step 2: Submit form to college
 * @param {string} collegeId - college ID
 * @param {string} studId - Student ID  
 * @param {string} formId - Form/Application ID
 * @returns {Promise<Object>} Form submission result
 */
/**
 * Step 2: Submit form to college
 * FIXED: Explicitly passes applicationId to the check function
 */
export const submitFormTocollege = async (collegeId, studId, formId, applicationId, timelineId) => {
  try {
    // 1. We MUST pass the applicationId (child profile ID) to the check function
    //    If we don't, it might just check "Does this student exist at this college?" which causes your bug.
    const submissionCheck = await checkFormSubmission(collegeId, studId, applicationId);

    if (submissionCheck.exists) {
      console.log('Form already submitted to this college:', submissionCheck.form);
      return {
        success: true,
        message: 'Form already submitted to this college',
        data: submissionCheck.form,
        alreadySubmitted: true
      };
    }    
    
    // 2. If check passes (returns false), proceed to Submit
    // Added timelineId to match the backend route /:collegeId/:studId/:timelineId/:formId
    const response = await apiClient.post(
      `/form/${collegeId}/${studId}/${timelineId}/${formId}`,
      { 
        applicationId: applicationId, // Ensure backend links this specific child profile
        amount: 100 
      }
    );

    return response.data;

  } catch (error) {
    if (error.response?.status === 409) {
      return {
        success: true,
        message: 'Form already submitted to this college',
        alreadySubmitted: true
      };
    }
    console.error('Error submitting form to college:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get forms by student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Student forms data
 */
export const getFormsByStudent = async (studId) => {
  try {
    const response = await apiClient.get(`/form/student/${studId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by student:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get forms by college
 * @param {string} collegeId - college ID
 * @returns {Promise<Object>} college forms data
 */
export const getFormsBycollege = async (collegeId) => {
  try {
    const response = await apiClient.get(`/form/college/${collegeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms by college:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Track form status
 * @param {string} formId - Form ID
 * @returns {Promise<Object>} Form tracking data
 */
export const trackForm = async (formId) => {
  try {
    // Validate formId before making the API call
    if (!formId || formId === 'undefined' || formId === 'null') {
      throw new Error('Invalid form ID provided');
    }
    
    const response = await apiClient.get(`/form/track/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error tracking form:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get all forms for a student with optional status filtering
 * @param {string} studId - Student ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} Student forms data
 */
export const getStudentForms = async (studId, status = null) => {
  try {
    const url = status ? `/form/student/${studId}?status=${status}` : `/form/student/${studId}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student forms:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get all forms for a college with optional status filtering
 * @param {string} collegeId - college ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} college forms data
 */
export const getcollegeForms = async (collegeId, status = null) => {
  try {
    const url = status ? `/form/college/${collegeId}?status=${status}` : `/form/college/${collegeId}`;
    const response = await apiClient.get(url);
    
    const raw = response?.data;
    let forms = [];
    if (Array.isArray(raw)) {
      forms = raw;
    } else if (Array.isArray(raw?.data)) {
      forms = raw.data;
    } else if (Array.isArray(raw?.forms)) {
      forms = raw.forms;
    }

    // console.log(`✅ Fetched ${forms.length} forms for college`);

    if (forms.length === 0) {
      return { data: [] };
    }

    // Normalize and fetch student application data for each form
    const normalized = await Promise.all(
      forms.map(async (form, idx) => {
        // Extract student ID properly
        let studId = null;
        if (typeof form?.studId === 'string') {
          studId = form.studId;
        } else if (typeof form?.student?._id === 'string') {
          studId = form.student._id;
        } else if (typeof form?.student === 'string') {
          studId = form.student;
        } else if (form?.studId && typeof form.studId === 'object' && form.studId._id) {
          studId = form.studId._id;
        }
        
        // console.log(`🔍 Form ${idx} - studId extracted:`, studId, 'from form:', form);
        
        // Fetch student application data to get name and class
        let studentName = '—';
        let studentstandard = '—';
        if (studId) {
          try {
            // console.log(`🔍 Fetching application data for student: ${studId}`);
            const appResponse = await apiClient.get(`/application/stud/${studId}`);
            if (appResponse?.data?.data && Array.isArray(appResponse.data.data) && appResponse.data.data.length > 0) {
              const appData = appResponse.data.data[0];
              studentName = appData.name || '—';
              studentstandard = appData.classCompleted || appData.standard || '—';
              // console.log(`✅ Found student data: ${studentName}, Standard: ${studentstandard}`);
            }
          } catch (appError) {
            console.warn(`⚠️ Could not fetch application data for student ${studId}:`, appError.message);
            // Fallback to populated student data if available
            studentName = form?.studId?.name || form?.student?.name || '—';
            studentstandard = form?.studId?.standard || form?.student?.standard || '—';
          }
        }

        return {
          id: form?._id || form?.id || `form-${idx}`,
          formId: form?._id,
          studentName: studentName,
          standard: studentstandard,
          date: form?.createdAt
            ? new Date(form?.createdAt).toISOString().slice(0, 10)
            : (form?.date || '—'),
          status: form?.status || 'Pending',
          collegeId: form?.collegeId,
          studId: studId,
          applicationData: form,
          _raw: form,
        };
      })
    );

    // console.log(`✅ Normalized ${normalized.length} forms for college`, normalized);
    return { data: normalized };
    
  } catch (error) {
    console.error('Error fetching college forms:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get detailed form information
 * @param {string} formId - Form ID
 * @returns {Promise<Object>} Detailed form data
 */
export const getFormDetails = async (formId) => {
  try {
    const response = await apiClient.get(`/form/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form details:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update form status
 * @param {string} formId - Form ID
 * @param {string} status - New status
 * @param {string} note - Optional note for the status change
 * @returns {Promise<Object>} Updated form data
 */
export const updateFormStatus = async (formId, status, note = null) => {
  try {
    const url = `/form/${formId}`;
    const body = { status, ...(note ? { note } : {}) };
    const response = await apiClient.put(url, body);
    return response.data;
  } catch (error) {
    console.error('Error updating form status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Complete application flow: Check if exists, create if needed, then submit to college
 * @param {string} studId - Student ID
 * @param {string} collegeId - college ID
 * @param {Object} applicationData - Application form data (if creating new)
 * @param {string} timelineId - Admission timeline ID
 * @returns {Promise<Object>} Complete flow result
 */
export const completeApplicationFlow = async (studId, collegeId, applicationData = null, timelineId) => {
  try {
    // Step 1: Check if application exists
    let application = await checkApplicationExists(studId);
    
    if (!application) {
      // Scenario A: First-time applicant
      if (!applicationData) {
        throw new Error('Application data is required to create new application');
      }
      
      // console.log('Creating new application (First-time applicant)...');
      const createResult = await createApplication(applicationData);
      application = createResult.data;
      // console.log('Application created:', application);
    } else {
      // Scenario B: Returning applicant
      console.log('Application already exists (Returning applicant):', application);
    }
    
    // Step 2: Submit form to college using application ID as formId
    // console.log('Submitting form to college...');
    const formId = application._id || application.id; // formId = application ID
    const submitResult = await submitFormTocollege(collegeId, studId, formId, formId, timelineId);
    
    return {
      success: true,
      application,
      formSubmission: submitResult,
      message: 'Application flow completed successfully',
      scenario: application ? 'returning' : 'first-time'
    };
    
  } catch (error) {
    console.error('Error in complete application flow:', error);
    throw error;
  }
};

/**
 * Handle application flow based on scenarios
 * @param {string} studId - Student ID
 * @param {string} collegeId - college ID
 * @param {Object} applicationData - Application form data (optional)
 * @param {string} timelineId - Admission timeline ID
 * @returns {Promise<Object>} Flow result with scenario info
 */
export const handleApplicationFlow = async (studId, collegeId, applicationData = null, timelineId) => {
  try {
    // Check if application exists
    const existingApplication = await checkApplicationExists(studId);
    
    if (!existingApplication) {
      // Scenario A: First-time applicant
      if (!applicationData) {
        return {
          scenario: 'first-time',
          needsForm: true,
          message: 'No application found. Please fill out the application form.',
          application: null
        };
      }
      
      // Create new application
      const createResult = await createApplication(applicationData);
      const application = createResult.data;
      
      // Submit to college
      const formId = application._id || application.id;
      const submitResult = await submitFormTocollege(collegeId, studId, formId, formId, timelineId);
      
      return {
        scenario: 'first-time',
        needsForm: false,
        application,
        formSubmission: submitResult,
        message: 'Application created and submitted successfully'
      };
      
    } else {
      // Scenario B: Returning applicant
      const application = existingApplication.data;
      const formId = application._id || application.id;
      
      // Submit to college using existing application
      const submitResult = await submitFormTocollege(collegeId, studId, formId, formId, timelineId);
      
      return {
        scenario: 'returning',
        needsForm: false,
        application,
        formSubmission: submitResult,
        message: submitResult.alreadySubmitted 
          ? 'Application already submitted to this college'
          : 'Application submitted successfully using existing data'
      };
    }
    
  } catch (error) {
    console.error('Error in application flow:', error);
    throw error;
  }
};

/**
 * Update existing application (Scenario C)
 * @param {string} studId - Student ID
 * @param {Object} updateData - Updated application data
 * @returns {Promise<Object>} Updated application
 */
export const updateExistingApplication = async (applicationId, updateData) => {
  try {
    const response = await apiClient.put(`/application/${applicationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating application:', error.response?.data || error.message);
    throw error;
  }
};
