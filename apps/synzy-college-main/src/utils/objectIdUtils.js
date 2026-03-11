/**
 * Utility functions for MongoDB ObjectId validation and handling
 */

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates college ID and throws error if invalid
 * @param {string} collegeId - The college ID to validate
 * @throws {Error} - If ID is invalid
 */
export const validatecollegeId = (collegeId) => {
  if (!collegeId) {
    throw new Error('college ID is required');
  }
  
  if (!isValidObjectId(collegeId)) {
    throw new Error(`Invalid college ID format: ${collegeId}. Expected MongoDB ObjectId format (24-character hexadecimal string).`);
  }
  
  return true;
};

/**
 * Safely extracts and validates college ID from URL parameters
 * @param {string} collegeId - The college ID from URL params
 * @returns {string|null} - Valid college ID or null if invalid
 */
export const getValidcollegeId = (collegeId) => {
  try {
    validatecollegeId(collegeId);
    return collegeId;
  } catch (error) {
    console.error('college ID validation failed:', error.message);
    return null;
  }
};

/**
 * Common error handler for invalid college IDs
 * @param {string} collegeId - The invalid college ID
 * @param {Function} navigate - Navigation function
 * @param {string} fallbackRoute - Route to navigate to on error
 */
export const handleInvalidcollegeId = (collegeId, navigate, fallbackRoute = '/colleges') => {
  console.error(`Invalid college ID format: ${collegeId}. Expected MongoDB ObjectId format.`);
  navigate(fallbackRoute);
};


