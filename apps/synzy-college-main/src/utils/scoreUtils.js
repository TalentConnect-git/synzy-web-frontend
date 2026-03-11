// src/utils/scoreUtils.js

/**
 * Calculate college score based on various factors
 * @param {Object} college - college object
 * @returns {number} Score out of 100
 */
export const calculatecollegeScore = (college) => {
  let score = 0;
  let factors = 0;

  // Factor 1: Rank (if available) - Higher rank = lower score
  if (college.rank && college.rank > 0) {
    // Convert rank to score (rank 1 = 100, rank 100 = 50, etc.)
    const rankScore = Math.max(0, 100 - (college.rank - 1) * 0.5);
    score += rankScore;
    factors++;
  }

  // Factor 2: Teacher to Student Ratio (if available)
  if (college.TeacherToStudentRatio && college.TeacherToStudentRatio > 0) {
    // Ideal ratio is around 1:15-1:20, give higher score for better ratios
    const ratio = college.TeacherToStudentRatio;
    let ratioScore = 0;
    if (ratio <= 15) ratioScore = 100;
    else if (ratio <= 20) ratioScore = 85;
    else if (ratio <= 25) ratioScore = 70;
    else if (ratio <= 30) ratioScore = 55;
    else ratioScore = 40;
    
    score += ratioScore;
    factors++;
  }

  // Factor 3: Technology Adoption (if available)
  if (college.smartClassroomsPercentage) {
    const techScore = college.smartClassroomsPercentage; // Already a percentage
    score += techScore;
    factors++;
  }

  // Factor 4: Facilities/Amenities count
  const facilitiesCount = (college.facilities || college.amenities || []).length;
  if (facilitiesCount > 0) {
    // More facilities = higher score (max 100 for 10+ facilities)
    const facilitiesScore = Math.min(100, facilitiesCount * 10);
    score += facilitiesScore;
    factors++;
  }

  // Factor 5: International Programs
  const internationalPrograms = (college.exchangePrograms || []).length + (college.globalTieups || []).length;
  if (internationalPrograms > 0) {
    const internationalScore = Math.min(100, internationalPrograms * 20);
    score += internationalScore;
    factors++;
  }

  // Factor 6: Board reputation (subjective scoring)
  if (college.board) {
    let boardScore = 70; // Default score
    const board = college.board.toLowerCase();
    if (board.includes('cbse')) boardScore = 85;
    else if (board.includes('icse')) boardScore = 90;
    else if (board.includes('ib')) boardScore = 95;
    else if (board.includes('state')) boardScore = 65;
    
    score += boardScore;
    factors++;
  }

  // Calculate average score
  const finalScore = factors > 0 ? Math.round(score / factors) : 0;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, finalScore));
};

/**
 * Get score display text
 * @param {number} score - Score out of 100
 * @returns {string} Display text for score
 */
export const getScoreDisplay = (score) => {
  return score > 0 ? `${score}` : 'N/A';
};

/**
 * Get score color class for styling
 * @param {number} score - Score out of 100
 * @returns {string} CSS color class
 */
export const getScoreColorClass = (score) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  if (score >= 50) return 'text-red-500';
  return 'text-gray-500';
};

/**
 * Add calculated scores to colleges array
 * @param {Array} colleges - Array of college objects
 * @returns {Array} colleges array with calculated scores
 */
export const addScoresTocolleges = (colleges) => {
  if (!Array.isArray(colleges)) {
    return colleges;
  }

  return colleges.map(college => {
    const calculatedScore = calculatecollegeScore(college);
    
    return {
      ...college,
      score: calculatedScore,
      scoreDisplay: getScoreDisplay(calculatedScore),
      scoreColorClass: getScoreColorClass(calculatedScore)
    };
  });
};

export default {
  calculatecollegeScore,
  getScoreDisplay,
  getScoreColorClass,
  addScoresTocolleges
};
