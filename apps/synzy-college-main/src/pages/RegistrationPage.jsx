import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";


import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2, Info, Building2, Users2, ShieldCheck, HeartHandshake, Heart, Globe2, Sparkles, Image, Award, DollarSign, Cpu, GraduationCap, CalendarDays, Upload, ToggleRight, Briefcase, Save, Edit2, Home} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../api/axios";
import { 
  addcollege, 
  addAmenities, 
  addActivities,
  addAlumni,  
  addInfrastructure, 
  addOtherDetails, 
  addFeesAndScholarships,
  addFaculty,
  addAdmissionTimeline,
  addTechnologyAdoption,
  addSafetyAndSecurity,
  addInternationalExposure,
  addAcademics,
  getcollegeById,
  getcollegesByStatus,
  updateCollegeByAuthId,
  getAmenitiesByCollegeId,
  getActivitiesByCollegeId,
  getInfrastructureById,
  getFeesAndScholarshipsById,
  getAcademicsById,
  getOtherDetailsById,
  getSafetyAndSecurityById,
  getTechnologyAdoptionById,
  getInternationalExposureById,
  getFacultyById,
  getAdmissionTimelineById,
  updateAmenities,
  updateActivities,
  updateInfrastructure,
  
  updateOtherDetails,
  
  updateSafetyAndSecurity,
  updateInternationalExposure,
  updateFaculty,
  updateAdmissionTimeline,
  getScholarshipsByCollege,
  addScholarship,
  upsertCourseFee,
  getCollegeExams,
   getPlacementsByCollege,

  
  getcollegeByAuthId
} from "../api/adminService";
import {
  addHostel,
  getHostelsByCollege,
  updateHostel,
  deleteHostel
} from "../api/adminService";
import { addCourse as addCourseAPI, addExam as addExamAPI , addPlacement as addPlacementAPI, getCoursesByCollege } from "../api/adminService";

import { 
  getAlumniBycollege,
  updateAlumniBycollege, 
} from "../api/collegeService";
import { minimum } from "zod/v4-mini";


console.log(import.meta.env.VITE_API_BASE_URL);

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  options = null,
  checked,
}) => {
  const commonProps = {
    id: name,
    name,
    required,
    onChange,
    className:
      "w-full px-4 py-3 mt-2 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white",
  };

  const renderInput = () => {
    if (type === "select") {
      return (
        <select {...commonProps} value={value || ""}>
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (type === "textarea") {
      return <textarea {...commonProps} value={value || ""} rows="4" />;
    }
    if (type === "checkboxGroup") {
      return (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {options.map((opt) => (
            <label key={opt} className="flex items-center">
              <input
                type="checkbox"
                name={name}
                value={opt}
                checked={(value || []).includes(opt)}
                onChange={onChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return <input type={type} {...commonProps} value={value || ""} />;
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div>
        {renderInput()}
      </div>
    </div>
  );
};

const DynamicListField = ({ label, fields, value, onChange, type = "famous" }) => {
  const list = value || [];
  const getDefaultItem = () => {
    if (type === "famous") return { name: "", profession: "" };
    if (type === "top" || type === "other") return { name: "", percentage: "" };
    return { name: "", profession: "" };
  };
  
  const handleAddItem = () => onChange([...list, getDefaultItem()]);
  const handleRemoveItem = (index) =>
    onChange(list.filter((_, i) => i !== index));
  const handleItemChange = (index, fieldName, fieldValue) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, [fieldName]: fieldValue } : item
    );
    onChange(updatedList);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {list.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="md:col-span-2">
            <FormField
              label="Alumni Name"
              name={`alumni-name-${index}`}
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
            />
          </div>
          <div>
            <FormField
              label={type === "famous" ? "Profession" : "Percentage"}
              name={`alumni-${type === "famous" ? "profession" : "percentage"}-${index}`}
              value={type === "famous" ? item.profession : item.percentage}
              onChange={(e) =>
                handleItemChange(index, type === "famous" ? "profession" : "percentage", e.target.value)
              }
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            className="absolute top-2 right-2 text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Alumni
      </button>
    </div>
  );
};

const DynamicActivitiesField = ({ label, value, onChange }) => {
  const activities = value || [];
  
  const handleAddActivity = () => onChange([...activities, ""]);
  const handleRemoveActivity = (index) =>
    onChange(activities.filter((_, i) => i !== index));
  const handleActivityChange = (index, activityValue) => {
    const updatedActivities = activities.map((activity, i) =>
      i === index ? activityValue : activity
    );
    onChange(updatedActivities);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="flex-1">
            <FormField
              label="Activity Name"
              name={`activity-${index}`}
              value={activity}
              onChange={(e) => handleActivityChange(index, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveActivity(index)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddActivity}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Activity
      </button>
    </div>
  );
};

const DynamicAmenitiesField = ({ label, value, onChange }) => {
  const amenities = value || [];
  
  const handleAddAmenity = () => onChange([...amenities, ""]);
  const handleRemoveAmenity = (index) =>
    onChange(amenities.filter((_, i) => i !== index));
  const handleAmenityChange = (index, amenityValue) => {
    const updatedAmenities = amenities.map((amenity, i) =>
      i === index ? amenityValue : amenity
    );
    onChange(updatedAmenities);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {amenities.map((amenity, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-gray-50 p-4 rounded-md my-2 relative"
        >
          <div className="flex-1">
            <FormField
              label="Amenity Name"
              name={`amenity-${index}`}
              value={amenity}
              onChange={(e) => handleAmenityChange(index, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveAmenity(index)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddAmenity}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Amenity
      </button>
    </div>
  );
};

const DynamicElearningField = ({ label, value, onChange }) => {
  const platforms = Array.isArray(value) ? value : [];

  const handleAdd = () => onChange([...
    platforms,
    { platform: '', usagePercentage: '', frequency: '' }
  ]);

  const handleRemove = (index) => onChange(platforms.filter((_, i) => i !== index));

  const handleChange = (index, field, fieldValue) => {
    const next = platforms.map((item, i) => i === index ? { ...item, [field]: fieldValue } : item);
    onChange(next);
  };

  return (
    <div>
      <label className="text-lg font-semibold text-gray-700">{label}</label>
      {platforms.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md my-2">
          <FormField
            label="Platform"
            name={`elearn-platform-${index}`}
            value={item.platform}
            onChange={(e) => handleChange(index, 'platform', e.target.value)}
          />
          <FormField
            label="Usage %"
            name={`elearn-usage-${index}`}
            type="number"
            value={item.usagePercentage}
            onChange={(e) => handleChange(index, 'usagePercentage', e.target.value)}
          />
          <FormField
            label="Frequency"
            name={`elearn-frequency-${index}`}
            value={item.frequency}
            onChange={(e) => handleChange(index, 'frequency', e.target.value)}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500 mb-2"
            aria-label={`Remove e-learning row ${index + 1}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 flex items-center text-sm text-indigo-600"
      >
        <PlusCircle size={16} className="mr-1" /> Add Platform
      </button>
    </div>
  );
};

const RegistrationPage = () => {
  const [hostels, setHostels] = useState([]);
const [editingId, setEditingId] = useState(null);

// Replace your existing loadAllCollegeData function with this enhanced version
const loadAllCollegeData = async (college) => {
  console.log('🎯 DEBUG - loadAllCollegeData called with college:', {
  id: college._id,
  name: college.name,
  rank: college.rank,
  ranking: college.ranking,
  type_rank: typeof college.rank,
  type_ranking: typeof college.ranking
});
  try {
    console.log('📥 Loading all college data for:', college._id);
    
    // Clear any existing draft
    try {
      localStorage.removeItem("collegeRegDraft");
    } catch (error) {
      console.error("Could not clear draft:", error);
    }
    
    // Load basic college data
    setFormData(prev => ({
      ...prev,
      name: college.name || "",
      description: college.description || "",
      address: college.address || "",
      area: college.area || "",
      city: college.city || "",
      state: college.state || "",
      country: college.country || "India",
      pincode: college.pinCode ? String(college.pinCode) : "",
      establishedYear: college.estYear ? String(college.estYear) : (college.establishedYear ? String(college.establishedYear) : ""),
      board: college.board || "",
      feeRange: college.feeRange || "",
      upto: college.upto || "",
      email: college.email || "",
      website: college.website || "",
      phoneNo: college.mobileNo || "",
      collegeMode: college.collegeMode || "convent",
      genderType: college.genderType === 'boy' ? 'boys' : college.genderType === 'girl' ? 'girls' : (college.genderType || 'co-ed'),
      shifts: Array.isArray(college.shifts) ? college.shifts : ["morning"],
      languageMedium: Array.isArray(college.languageMedium) ? college.languageMedium : ["English"],
      transportAvailable: college.transportAvailable || "no",
      latitude: college.lat != null ? String(college.lat) : (college.latitude != null ? String(college.latitude) : ""),
      longitude: college.long != null ? String(college.long) : (college.longitude != null ? String(college.longitude) : ""),
      TeacherToStudentRatio: college.TeacherToStudentRatio || "",
      rank: college.rank || "",
      ranking: college.rank || "",
      acceptanceRate: college.acceptanceRate != null ? String(college.acceptanceRate) : "",
      collegeInfo: college.collegeInfo || college.description || "",
      streamsOffered: Array.isArray(college.streamsOffered) ? college.streamsOffered : 
                  (college.stream ? [college.stream] : []),
      specialist: Array.isArray(college.specialist) ? college.specialist : [],
      tags: Array.isArray(college.tags) ? college.tags : []
    }));
    console.log('✅ Form data updated - ranking set to:', college.rank || "");

    // Load social links
    setSocialLinks({
      instagramHandle: college.instagramHandle || "",
      twitterHandle: college.twitterHandle || "",
      linkedinHandle: college.linkedinHandle || ""
    });

    // Load logo if available
    if (college.logo) {
      const logoUrl = typeof college.logo === 'object' ? college.logo.url : college.logo;
      if (logoUrl) setLogoPreview(logoUrl);
    }

    // Load all related data in parallel
    const [
      amenitiesRes,
      activitiesRes,
      infraRes,
      feesRes,
      academicsRes,
      otherRes,
      safetyRes,
      techRes,
      intlRes,
      facultyRes,
      timelineRes,
      alumniRes,
      coursesRes,
      hostelsRes,
      scholarshipsRes
    ] = await Promise.allSettled([
      getAmenitiesByCollegeId(college._id).catch(err => {
        console.log('Amenities fetch failed:', err);
        return { data: null };
      }),
      getActivitiesByCollegeId(college._id).catch(err => {
        console.log('Activities fetch failed:', err);
        return { data: null };
      }),
      getInfrastructureById(college._id).catch(err => {
        console.log('Infrastructure fetch failed:', err);
        return { data: null };
      }),
      getFeesAndScholarshipsById(college._id).catch(err => {
        console.log('Fees fetch failed:', err);
        return { data: null };
      }),
      getAcademicsById(college._id).catch(err => {
        console.log('Academics fetch failed:', err);
        return { data: null };
      }),
      getOtherDetailsById(college._id).catch(err => {
        console.log('Other details fetch failed:', err);
        return { data: null };
      }),
      getSafetyAndSecurityById(college._id).catch(err => {
        console.log('Safety fetch failed:', err);
        return { data: null };
      }),
      getTechnologyAdoptionById(college._id).catch(err => {
        console.log('Technology fetch failed:', err);
        return { data: null };
      }),
      getInternationalExposureById(college._id).catch(err => {
        console.log('International fetch failed:', err);
        return { data: null };
      }),
      getFacultyById(college._id).catch(err => {
        console.log('Faculty fetch failed:', err);
        return { data: null };
      }),
      getAdmissionTimelineById(college._id).catch(err => {
        console.log('Timeline fetch failed:', err);
        return { data: null };
      }),
      getAlumniBycollege(college._id).catch(err => {
        console.log('Alumni fetch failed:', err);
        return { data: null };
      }),
      getCoursesByCollege(college._id).catch(err => {
        console.log('Courses fetch failed:', err);
        return { data: [] };
      }),
      getHostelsByCollege(college._id).catch(err => {
        console.log('Hostels fetch failed:', err);
        return { data: [] };
      }),
      getScholarshipsByCollege(college._id).catch(err => {
        console.log('Scholarships fetch failed:', err);
        return { data: [] };
      })
    ]);

    // Helper to log and extract data
    const logAndExtract = (name, result) => {
      console.log(`\n========== ${name} ==========`);
      console.log('Status:', result.status);
      
      if (result.status === 'fulfilled' && result.value) {
        console.log('Full response:', result.value);
        console.log('Response data:', result.value.data);
        console.log('Response data.data:', result.value.data?.data);
        
        // Try to extract the actual data
        const extracted = result.value?.data?.data || result.value?.data || result.value;
        console.log('Extracted data:', extracted);
        return extracted;
      } else if (result.status === 'rejected') {
        console.log('Rejected with:', result.reason);
      }
      console.log('========== END ==========\n');
      return null;
    };

    // ==================== COURSES ====================
    const coursesData = logAndExtract('COURSES', coursesRes);
    if (coursesData && Array.isArray(coursesData) && coursesData.length > 0) {
      const transformedCourses = coursesData.map(course => ({
        _id: course._id,
        courseName: course.courseName || course.name || "",
        duration: course.duration || "",
        fees: course.fees || "",
        category: course.category || "",
        intake: course.intake || "",
        exams: Array.isArray(course.exams) ? course.exams.map(exam => ({
          examType: exam.examType || exam.examName || "",
          metricType: exam.metricType || exam.marksType || "Rank",
          minValue: exam.minValue || exam.minMarks || "",
          maxValue: exam.maxValue || exam.maxMarks || ""
        })) : [],
        placements: Array.isArray(course.placements) ? course.placements.map(p => ({
          year: p.year || "",
          totalStudents: p.totalStudents || "",
          placedStudents: p.placedStudents || "",
          highestPackage: p.highestPackage || p.maxPackage || "",
          minimumPackage: p.minimumPackage || p.minPackage || "",
          averagePackage: p.averagePackage || "",
          topRecruiters: Array.isArray(p.topRecruiters) ? p.topRecruiters : 
                        (Array.isArray(p.companies) ? p.companies : [])
        })) : []
      }));
      setCourses(transformedCourses);
    }

    // ==================== AMENITIES ====================
    const amenities = logAndExtract('AMENITIES', amenitiesRes);
    if (amenities) {
      setFormData(prev => ({
        ...prev,
        predefinedAmenities: Array.isArray(amenities.predefinedAmenities) ? amenities.predefinedAmenities : 
                            (Array.isArray(amenities.amenities) ? amenities.amenities : [])
      }));
      setCustomAmenities(Array.isArray(amenities.customAmenities) ? amenities.customAmenities : []);
    }

    // ==================== ACTIVITIES ====================
    const activities = logAndExtract('ACTIVITIES', activitiesRes);
    if (activities) {
      setFormData(prev => ({
        ...prev,
        activities: Array.isArray(activities.activities) ? activities.activities : []
      }));
      setCustomActivities(Array.isArray(activities.customActivities) ? activities.customActivities : []);
    }

    // ==================== INFRASTRUCTURE ====================
    const infra = logAndExtract('INFRASTRUCTURE', infraRes);
    if (infra) {
      setFormData(prev => ({
        ...prev,
        infraLabTypes: Array.isArray(infra.labs) ? infra.labs : [],
        infraSportsTypes: Array.isArray(infra.sportsGrounds) ? infra.sportsGrounds : [],
        infraLibraryBooks: infra.libraryBooks != null ? String(infra.libraryBooks) : "",
        infraSmartClassrooms: infra.smartClassrooms != null ? String(infra.smartClassrooms) : ""
      }));
    }

    // ==================== SAFETY ====================
    const safety = logAndExtract('SAFETY', safetyRes);
    if (safety) {
      setFormData(prev => ({
        ...prev,
        cctvCoveragePercentage: safety.cctvCoveragePercentage != null ? String(safety.cctvCoveragePercentage) : "0",
        medicalFacility: {
          doctorAvailability: safety.medicalFacility?.doctorAvailability || "",
          medkitAvailable: safety.medicalFacility?.medkitAvailable || false,
          ambulanceAvailable: safety.medicalFacility?.ambulanceAvailable || false
        },
        transportSafety: {
          gpsTrackerAvailable: safety.transportSafety?.gpsTrackerAvailable || false,
          driversVerified: safety.transportSafety?.driversVerified || false
        },
        fireSafetyMeasures: Array.isArray(safety.fireSafetyMeasures) ? safety.fireSafetyMeasures : [],
        visitorManagementSystem: safety.visitorManagementSystem || false
      }));
    }

    // ==================== TECHNOLOGY ====================
    const tech = logAndExtract('TECHNOLOGY', techRes);
    if (tech) {
      setFormData(prev => ({
        ...prev,
        smartClassroomsPercentage: tech.smartClassroomsPercentage != null ? String(tech.smartClassroomsPercentage) : "0",
        eLearningPlatforms: Array.isArray(tech.eLearningPlatforms) ? tech.eLearningPlatforms : []
      }));
    }

    // ==================== INTERNATIONAL ====================
    const intl = logAndExtract('INTERNATIONAL', intlRes);
    if (intl) {
      setFormData(prev => ({
        ...prev,
        exchangePrograms: Array.isArray(intl.exchangePrograms) ? intl.exchangePrograms.map(p => ({
          partnercollege: p.partnercollege || "",
          type: p.type || p.programType || "",
          duration: p.duration || "",
          studentsParticipated: p.studentsParticipated || "",
          activeSince: p.activeSince || ""
        })) : [],
        globalTieUps: Array.isArray(intl.globalTieUps) ? intl.globalTieUps.map(t => ({
          partnerName: t.partnerName || "",
          nature: t.nature || t.natureOfTieUp || "",
          activeSince: t.activeSince || "",
          description: t.description || ""
        })) : []
      }));
    }

    // ==================== FACULTY ====================
    const faculty = logAndExtract('FACULTY', facultyRes);
    if (faculty && faculty.facultyMembers) {
      setFacultyQuality(faculty.facultyMembers.map(f => ({
        name: f.name || "",
        qualification: f.qualification || "",
        awards: Array.isArray(f.awards) ? f.awards.join(', ') : (f.awards || ""),
        experience: f.experience || ""
      })));
    }

    // ==================== ALUMNI ====================
    const alumni = logAndExtract('ALUMNI', alumniRes);
    if (alumni) {
      setFamousAlumnies(Array.isArray(alumni.famousAlumnies) ? alumni.famousAlumnies : []);
      setTopAlumnies(Array.isArray(alumni.topAlumnis) ? alumni.topAlumnis : []);
      setOtherAlumnies(Array.isArray(alumni.alumnis) ? alumni.alumnis : []);
    }

    // ==================== ADMISSION TIMELINE ====================
    const timeline = logAndExtract('TIMELINE', timelineRes);
    if (timeline && timeline.timelines) {
      setAdmissionSteps(timeline.timelines.map(t => ({
        admissionStartDate: t.admissionStartDate ? new Date(t.admissionStartDate).toISOString().split('T')[0] : "",
        admissionEndDate: t.admissionEndDate ? new Date(t.admissionEndDate).toISOString().split('T')[0] : "",
        status: t.status || "",
        applicationFee: t.applicationFee || 0,
        courseId: t.courseId || "",
        documentsRequired: Array.isArray(t.documentsRequired) ? t.documentsRequired : [],
        eligibility: {
          minQualification: t.eligibility?.minQualification || "",
          otherInfo: t.eligibility?.otherInfo || ""
        }
      })));
    }

    // ==================== HOSTELS ====================
    const hostelsData = logAndExtract('HOSTELS', hostelsRes);
    if (hostelsData && Array.isArray(hostelsData) && hostelsData.length > 0) {
      setHostels(hostelsData.map(hostel => ({
        ...hostel,
        _isNew: false
      })));
    }

    // ==================== SCHOLARSHIPS ====================
    const scholarshipsData = logAndExtract('SCHOLARSHIPS', scholarshipsRes);
    if (scholarshipsData && Array.isArray(scholarshipsData) && scholarshipsData.length > 0) {
      setFormData(prev => ({
        ...prev,
        scholarships: scholarshipsData.map(s => ({
          name: s.name || "",
          type: s.type || "",
          amount: s.amount || "",
          documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired : []
        }))
      }));
    }

    // ==================== OTHER DETAILS ====================
    const other = logAndExtract('OTHER DETAILS', otherRes);
    if (other) {
      setFormData(prev => ({
        ...prev,
        genderRatioMale: other.genderRatio?.male != null ? String(other.genderRatio.male) : "",
        genderRatioFemale: other.genderRatio?.female != null ? String(other.genderRatio.female) : "",
        genderRatioOthers: other.genderRatio?.others != null ? String(other.genderRatio.others) : "",
        scholarshipDiversityTypes: Array.isArray(other.scholarshipDiversity?.types) ? other.scholarshipDiversity.types : [],
        scholarshipDiversityCoverage: other.scholarshipDiversity?.studentsCoveredPercentage != null ? 
                                      String(other.scholarshipDiversity.studentsCoveredPercentage) : "",
        specialNeedsStaff: other.specialNeedsSupport?.dedicatedStaff || false,
        specialNeedsSupportPercentage: other.specialNeedsSupport?.studentsSupportedPercentage != null ? 
                                      String(other.specialNeedsSupport.studentsSupportedPercentage) : "",
        specialNeedsFacilities: Array.isArray(other.specialNeedsSupport?.facilitiesAvailable) ? 
                               other.specialNeedsSupport.facilitiesAvailable : []
      }));
    }

    // ==================== FEES ====================
    const fees = logAndExtract('FEES', feesRes);
    if (fees) {
      setFormData(prev => ({
        ...prev,
        feesTransparency: fees.feesTransparency != null ? 
          (fees.feesTransparency === 100 ? 'full' :
           fees.feesTransparency === 50 ? 'partial' :
           fees.feesTransparency === 0 ? 'low' : String(fees.feesTransparency)) : "",
        classFees: Array.isArray(fees.classFees) ? fees.classFees.map(fee => ({
          ...fee,
          tuition: fee.tuition || "",
          activity: fee.activity || "",
          transport: fee.transport || "",
          hostel: fee.hostel || "",
          misc: fee.misc || ""
        })) : []
      }));
    }

    // ==================== ACADEMICS ====================
    const academics = logAndExtract('ACADEMICS', academicsRes);
    if (academics) {
      setFormData(prev => ({
        ...prev,
        averageClass10Result: academics.averageClass10Result || "",
        averageClass12Result: academics.averageClass12Result || "",
        averagecollegeMarks: academics.averagecollegeMarks || "75",
        specialExamsTraining: Array.isArray(academics.specialExamsTraining) ? academics.specialExamsTraining : [],
        extraCurricularActivities: Array.isArray(academics.extraCurricularActivities) ? academics.extraCurricularActivities : []
      }));
    }

    toast.success("✅ All college data loaded successfully!");
    console.log('🎉 Data loading complete!');
    
  } catch (error) {
    console.error("❌ Error loading college data:", error);
    toast.error("Some data could not be loaded. Please check the form.");
  }
};

const emptyHostel = {
  hostelName: "",
  type: "",
  capacity: "",
  availableSeats: "",
  feePerYear: "",
  facilities: [],
  rules: "",
  contactPerson: {
    name: "",
    phone: ""
  },
  isActive: true
};

  const [customStream, setCustomStream] = useState("");

  const [courses, setCourses] = useState([
  {
    courseName: "",
    duration: "",
    fees: "",
    category: "",
    intake: "",

    // MULTIPLE EXAMS PER COURSE
   exams: [
  {
    examType: "",
    metricType: "Rank", // Rank | Percentile | Percentage
    minValue: "",
    maxValue: ""
  }
],

    placements: [
      {
        year: "",
        totalStudents: "",
        placedStudents: "",
        highestPackage: "",
        minimumPackage: "",
        averagePackage: "",
        topRecruiters: [""]
      }
    ]
  }
]);


const addCourse = () => {
  setCourses(prev => [
    ...prev,
    {
      courseName: "",
      duration: "",
      fees: "",
      category: "",
      intake: "",

      exams: [
  {
    examType: "",
    metricType: "Rank", // Rank | Percentile | Percentage
    minValue: "",
    maxValue: ""
  }
],

      placements: [
        {
          year: "",
          totalStudents: "",
          placedStudents: "",
          highestPackage: "",
            minimumPackage: "",
          averagePackage: "",
          topRecruiters: [""]
        }
      ]
    }
  ]);
};
const addExam = (cIndex) => {
  const updated = [...courses];
  updated[cIndex].exams.push({
    examType: "",
    metricType: "Rank",
    minValue: "",
    maxValue: ""
  });
  setCourses(updated);
};

const updateExam = (cIndex, eIndex, field, value) => {
  const updated = [...courses];
  updated[cIndex].exams[eIndex][field] = value;
  setCourses(updated);
};

const removeExam = (cIndex, eIndex) => {
  const updated = [...courses];
  updated[cIndex].exams = updated[cIndex].exams.filter(
    (_, i) => i !== eIndex
  );
  setCourses(updated);
};

const updateCourse = (index, field, value) => {
  const updated = [...courses];
  updated[index][field] = value;
  setCourses(updated);
};


const removeCourse = (index) => {
  setCourses(prev => prev.filter((_, i) => i !== index));
};
const updatePlacement = (cIndex, pIndex, field, value) => {
  const updated = [...courses];
  updated[cIndex].placements[pIndex][field] = value;
  setCourses(updated);
};
const addPlacement = (courseIndex) => {
  const updated = [...courses];
  updated[courseIndex].placements.push({
    year: "",
    totalStudents: "",
    placedStudents: "",
    highestPackage: "",
      minimumPackage: "",
    averagePackage: "",
    topRecruiters: []
  });
  setCourses(updated);
};
 const removePlacement = (cIndex, pIndex) => {
    const updated = [...courses];
    updated[cIndex].placements = updated[cIndex].placements.filter(
      (_, i) => i !== pIndex
    );
    setCourses(updated);
  };
 const toggleStream = (stream) => {
  setFormData(prev => {
    const current = Array.isArray(prev.streamsOffered)
      ? prev.streamsOffered
      : [];

    return {
      ...prev,
      streamsOffered: current.includes(stream)
        ? current.filter(s => s !== stream)
        : [...current, stream]
    };
  });
};
const handleFeeChange = (index, field, value) => {
  setFormData((prev) => {
    const updated = [...prev.classFees];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    return { ...prev, classFees: updated };
  });
};



const addCustomStream = (custom) => {
  const val = custom.trim();
  if (!val) return;

  setFormData(prev => {
    const current = Array.isArray(prev.streamsOffered)
      ? prev.streamsOffered
      : [];

    return {
      ...prev,
      streamsOffered: current.includes(val)
        ? current
        : [...current, val]
    };
  });
};


const photoInputRef = useRef(null);
const videoInputRef = useRef(null);

  const navigate = useNavigate();
  const { user: currentUser, updateUserContext } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingcollegeId, setEditingcollegeId] = useState("");
  const [hasExistingcollege, setHasExistingcollege] = useState(false);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(true);
  const hasCheckedForcollege = React.useRef(false); // Prevent multiple checks

  // State with all the fields required by the backend schema
  const [formData, setFormData] = useState({
    // Core college Fields (matching backend college model)
    name: "",
    description: "",
    address: "",
    area: "", // Added: matches backend field
    city: "",
    state: "",
    pincode: "",
    establishedYear: "",
    board: "",
    feeRange: "",
    upto: "",
    email: currentUser?.email || "",
    website: "",
    phoneNo: "",
    genderType: "co-ed",
    streamsOffered: [], // Updated: matches backend
    collegeMode: "convent", // Updated: matches backend enum ['convent', 'private', 'government']
    shifts: ["morning"], // Updated: array to match backend
    languageMedium: ["English"], // Updated: array to match backend
    transportAvailable: "no",
    latitude: "",
    longitude: "",
    TeacherToStudentRatio: "", // Updated: matches backend field name
    rank: "", // Added: matches backend field
    specialist: [], // Added: matches backend field
    tags: [], // Added: matches backend field
    
    // Amenities Fields (matching backend Amenities model)
    predefinedAmenities: [], // Matches backend enum
    customAmenities: [], // Added: matches backend field
    
    // Activities Fields (matching backend Activities model)
    activities: [], // Matches backend enum
    customActivities: [], // Added: matches backend field
    
    // Infrastructure Fields (matching backend Infrastructure model)
    labs: [], // Updated: matches backend enum ['Physics', 'Chemistry', 'Biology', 'Computer', 'Robotics', 'Language']
    sportsGrounds: [], // Updated: matches backend enum ['Football', 'Cricket', 'Basketball', 'Tennis', 'Athletics', 'Badminton']
    libraryBooks: "", // Updated: matches backend field
    smartClassrooms: "", // Updated: matches backend field
    // Infrastructure form field names (used in the UI)
    infraLabTypes: [], // Form field for labs
    infraSportsTypes: [], // Form field for sports grounds
    infraLibraryBooks: "", // Form field for library books
    infraSmartClassrooms: "", // Form field for smart classrooms
    
    // Safety & Security Fields (matching backend SafetyAndSecurity model)
    cctvCoveragePercentage: 0, // default numeric to avoid uncontrolled->controlled warnings
    medicalFacility: {
      doctorAvailability: "", // Matches backend enum ['Full-time', 'Part-time', 'On-call', 'Not Available']
      medkitAvailable: false, // Matches backend field
      ambulanceAvailable: false // Matches backend field
    },
    transportSafety: {
      gpsTrackerAvailable: false, // Matches backend field
      driversVerified: false // Matches backend field
    },
    fireSafetyMeasures: [], // Updated: matches backend enum ['Extinguishers', 'Alarms', 'Sprinklers', 'Evacuation Drills']
    visitorManagementSystem: false, // Added: matches backend field
    
    // Fees & Scholarships Fields (matching backend FeesAndScholarships model)
    feesTransparency: "", // Updated: matches backend field
    classFees: [], // Updated: matches backend ClassFeeSchema structure
    scholarships: [], // Updated: matches backend ScholarshipSchema structure
    
    // Technology Adoption Fields (matching backend TechnologyAdoption model)
    smartClassroomsPercentage: "", // Matches backend field
    eLearningPlatforms: [], // Updated: matches backend field
    
    // International Exposure Fields (matching backend InternationalExposure model)
    exchangePrograms: [], // Updated: matches backend ExchangeProgramSchema structure
    globalTieUps: [], // Updated: matches backend GlobalTieUpSchema structure
    
    // Other Details Fields (matching backend OtherDetails model)
    genderRatio: {
      male: "", // Matches backend field
      female: "", // Matches backend field
      others: "" // Matches backend field
    },
    scholarshipDiversity: {
      types: [], // Matches backend enum ['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence']
      studentsCoveredPercentage: "" // Matches backend field
    },
    specialNeedsSupport: {
      dedicatedStaff: false, // Matches backend field
      studentsSupportedPercentage: "", // Matches backend field
      facilitiesAvailable: [] // Matches backend enum ['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices']
    },
    
    
    // Academics Fields (matching backend Academics model)
    averageClass10Result: "",
    averageClass12Result: "",
    averagecollegeMarks: "",
    specialExamsTraining: [], // Matches backend enum ['NEET', 'IIT-JEE', 'Olympiads', 'UPSC', 'CLAT', 'SAT/ACT', 'NTSE', 'KVPY']
    extraCurricularActivities: [] // Matches backend field
  });

  const [famousAlumnies, setFamousAlumnies] = useState([]);
  const [topAlumnies, setTopAlumnies] = useState([]);
  const [otherAlumnies, setOtherAlumnies] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);
  const [customAmenities, setCustomAmenities] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  // Logo upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  // UI-only additions: social links (not sent to backend)
  const [socialLinks, setSocialLinks] = useState({
   // Prepared for when you add it to schema
  instagramHandle: "",
  twitterHandle: "",
  linkedinHandle: "",
  });
  const [facultyQuality, setFacultyQuality] = useState([
    { name: '', qualification: '', awards: '', experience: '' }
  ]);
  // Removed academicResults and examQualifiers as they're not in backend schema
  const [admissionSteps, setAdmissionSteps] = useState([]); // { title, type, deadline, amount, file, toggle }

  // Faculty Quality array: each entry will contain { name, qualification, awards, experience }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling: keep ratio and numeric in sync
    if (name === 'TeacherToStudentRatio') {
      const raw = value.trim();
      let students = '';
      const parts = raw.split(':').map(p => p.trim());
      if (parts.length === 2) {
        const teacher = Number(parts[0]);
        const stud = Number(parts[1]);
        if (!Number.isNaN(teacher) && teacher > 0 && !Number.isNaN(stud) && stud > 0) {
          students = String(stud);
        }
      } else if (/^\d+$/.test(raw)) {
        // allow entering just the student count
        students = raw;
      }
      setFormData((prev) => ({ ...prev, TeacherToStudentRatio: value, studentsPerTeacher: students }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleUseCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        // 1️⃣ BigDataCloud (city/state)
        const res1 = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data1 = await res1.json();

        let city = data1.city || data1.locality || '';
        let state = data1.principalSubdivision || '';
        let pincode = '';

        // 2️⃣ OpenStreetMap (CORRECT WAY)
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'https://smart-college-finder-beta.vercel.app/' // REQUIRED
            }
          }
        );

        const data2 = await res2.json();

        // 🔥 STRONG PINCODE EXTRACTION
        if (data2?.address) {
          pincode =
            data2.address.postcode ||
            data2.address.postal_code ||
            data2.address.zip ||
            '';
        }

        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          city,
          state,
          pincode
        }));

        if (!pincode) {
          toast.warning("Pincode not found . Please enter manually.");
        } else {
          toast.success("Location fetched successfully.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch location details.");
      }
    },
    (err) => {
      if (err.code === 1) toast.error("Permission denied for location.");
      else if (err.code === 2) toast.error("Position unavailable.");
      else if (err.code === 3) toast.error("Location request timed out.");
      else toast.error("Could not get current location.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};



  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const currentValues = formData[name] || [];
    if (checked) {
      setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: currentValues.filter((val) => val !== value),
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    setSelectedPhotos(files);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 20 * 1024 * 1024) {
      toast.error("Video must be less than 20MB");
      return;
    }
    setSelectedVideo(file);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.(png|jpg|jpeg)$/i.test(file.name)) {
      toast.error("Upload PNG, JPG or JPEG only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max size 5MB");
      return;
    }
    setLogoFile(file);
    try {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } catch {}
  };

  // Safety transport routes helpers
  const addTransportRoute = () => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    routes.push({ route: "", attendant: false });
    setFormData(prev => ({ ...prev, safetyTransportRoutes: routes }));
  };
  const removeTransportRoute = (index) => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    const next = routes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, safetyTransportRoutes: next }));
  };
  const updateTransportRoute = (index, field, value) => {
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes.slice() : [];
    routes[index] = { ...routes[index], [field]: value };
    setFormData(prev => ({ ...prev, safetyTransportRoutes: routes }));
  };

  const computeSafetyRating = () => {
    const cctv = Number(formData.safetyCCTV || 0); // 0-100
    const doctor = (formData.safetyDoctorAvailability || "").trim();
    const nurse = !!formData.safetyNurseAvailable;
    const gps = !!formData.safetyGPSTracking;
    const driver = !!formData.safetyDriverVerification;
    const routes = Array.isArray(formData.safetyTransportRoutes) ? formData.safetyTransportRoutes : [];
    const routeCount = routes.length;
    const attendantCount = routes.filter(r => r && r.attendant).length;
    const attendantPct = routeCount > 0 ? (attendantCount / routeCount) * 100 : (formData.safetyTransportAttendant ? 100 : 0);

    let score = 0;
    score += (cctv / 100) * 40; // CCTV up to 40
    score += doctor === 'Full-time' ? 15 : doctor === 'Part-time' ? 10 : doctor === 'On-call' ? 5 : 0; // up to 15
    score += nurse ? 10 : 0; // nurse adds 10
    score += gps ? 15 : 0; // GPS adds 15
    score += driver ? 10 : 0; // driver verification adds 10
    score += (attendantPct / 100) * 10; // attendants up to 10
    return Math.round(Math.min(100, score));
  };

  // Also update the normalization functions to be more robust
const normalizeCoursesForBackend = (courses, collegeId) => {
  return (courses || [])
    .filter(c => c.courseName?.trim())
    .map(course => ({
      collegeId,
      name: course.courseName, // Use 'name' field as expected by backend
      courseName: course.courseName,
      duration: course.duration,
      fees: course.fees ? Number(course.fees) : 0,
      category: course.category,
      intake: course.intake ? Number(course.intake) : 0
    }));
};

const normalizeExamsForBackend = (courses, courseIdMap) => {
  const result = [];

  courses.forEach((course, courseIndex) => {
    const courseId = courseIdMap[courseIndex];
    if (!courseId) return;

    const validExams = (course.exams || [])
      .filter(e => e.examType?.trim())
      .map(e => ({
        courseId,
        examName: e.examType,
        marksType: e.metricType || "Rank",
        minMarks: e.minValue ? Number(e.minValue) : 0,
        maxMarks: e.maxValue ? Number(e.maxValue) : 100
      }));

    result.push(...validExams);
  });

  return result;
};

const normalizePlacementsForBackend = (courses, courseIdMap) => {
  const result = [];

  courses.forEach((course, courseIndex) => {
    const courseId = courseIdMap[courseIndex];
    if (!courseId) return;

    const validPlacements = (course.placements || [])
      .filter(p => p.year)
      .map(p => ({
        courseId,
        year: Number(p.year),
        totalStudents: Number(p.totalStudents || 0),
        placedStudents: Number(p.placedStudents || 0),
        minPackage: Number(p.minimumPackage || 0),
        maxPackage: Number(p.highestPackage || 0),
        averagePackage: Number(p.averagePackage || 0),
        companies: (p.topRecruiters || []).filter(Boolean)
      }));

    result.push(...validPlacements);
  });

  return result;
};


  const handleSubmit = async (e) => {
    // ✅ SINGLE SOURCE OF TRUTH


    e.preventDefault();
    if (!currentUser?._id) return toast.error("You must be logged in.");
    setIsSubmitting(true);


    try {
      // Normalize to backend schema
      const allowedcollegeModes = ['convent', 'private', 'government'];
      const normalizedcollegeMode = allowedcollegeModes.includes((formData.collegeMode || '').toLowerCase())
        ? (formData.collegeMode || '').toLowerCase()
        : 'private';

      const rawGender = (formData.genderType || '').toLowerCase();
      const normalizedGender = rawGender === 'boys' ? 'boy' : rawGender === 'girls' ? 'girl' : rawGender || 'co-ed';

      let normalizedFeeRange = formData.feeRange || '';
      if (/^\d+\s?-\s?\d+$/.test(normalizedFeeRange)) {
        const [a, b] = normalizedFeeRange.split('-').map(s => s.trim());
        normalizedFeeRange = `${a} - ${b}`;
      }

      // Client-side validation to prevent backend 500s
      const requiredErrors = [];
      const allowedShifts = ['morning','afternoon','night college'];
      const allowedBoards = [
        'CBSE','ICSE','CISCE','NIOS','SSC','IGCSE','IB','KVS','JNV','DBSE','MSBSHSE','UPMSP','KSEEB','WBBSE','GSEB','RBSE','BSEB','PSEB','BSE','SEBA','MPBSE','STATE','OTHER'
      ];
      const allowedFeeRanges = [
        "1000 - 10000","10000 - 25000","25000 - 50000","50000 - 75000","75000 - 100000","1 Lakh - 2 Lakh","2 Lakh - 3 Lakh","3 Lakh - 4 Lakh","4 Lakh - 5 Lakh","More than 5 Lakh"
      ];

      if (!formData.name?.trim()) requiredErrors.push('college Name');
      //if (!formData.description?.trim()) requiredErrors.push('Description');
      if (!formData.state?.trim()) requiredErrors.push('State');
      if (!formData.city?.trim()) requiredErrors.push('City');
     
      if (!allowedcollegeModes.includes(normalizedcollegeMode)) requiredErrors.push('college Mode');
      if (!['boy','girl','co-ed'].includes(normalizedGender)) requiredErrors.push('Gender Type');
      if (!Array.isArray(formData.shifts) || formData.shifts.length === 0 || formData.shifts.some(s => !allowedShifts.includes(String(s).toLowerCase()))) {
        requiredErrors.push('Shifts');
      }
      if (!allowedFeeRanges.includes(normalizedFeeRange)) requiredErrors.push('Fee Range');
     
      if (!formData.email?.trim()) requiredErrors.push('Email');
      if (!formData.phoneNo?.trim()) requiredErrors.push('Phone Number');
      if (!Array.isArray(formData.languageMedium) || formData.languageMedium.length === 0) requiredErrors.push('Language Medium');
      
      // GPS Location validation (mandatory for distance calculation)
      if (!formData.latitude || isNaN(Number(formData.latitude))) requiredErrors.push('Latitude (GPS)');
      if (!formData.longitude || isNaN(Number(formData.longitude))) requiredErrors.push('Longitude (GPS)');
      
      // Validate latitude and longitude ranges
      if (formData.latitude && (Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
        toast.error('Latitude must be between -90 and 90 degrees');
        setIsSubmitting(false);
        return;
      }
      if (formData.longitude && (Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
        toast.error('Longitude must be between -180 and 180 degrees');
        setIsSubmitting(false);
        return;
      }

      if (requiredErrors.length > 0) {
        toast.error(`Please fill valid values for: ${requiredErrors.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      

      

      const payload = {
        // Core college Fields (matching backend college model)
        name: formData.name,
        
        description: formData.description,
        address: formData.address,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        country: "India", // Default country
        pinCode: formData.pincode ? Number(formData.pincode) : undefined,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : undefined,
        
        feeRange: normalizedFeeRange,
        
        email: formData.email,
        website: formData.website,
        mobileNo: formData.phoneNo,
        collegeMode: normalizedcollegeMode,
        genderType: normalizedGender,
        
        shifts: (Array.isArray(formData.shifts) ? formData.shifts : [formData.shifts].filter(Boolean)).map(s => String(s).toLowerCase()),
        languageMedium: Array.isArray(formData.languageMedium) ? formData.languageMedium : [formData.languageMedium].filter(Boolean),
        // Backend expects enum string for transportAvailable ('yes' | 'no')
        transportAvailable: (String(formData.transportAvailable).toLowerCase() === 'yes' || formData.transportAvailable === true) ? 'yes' : 'no',
        latitude: Number(formData.latitude), // Mandatory for distance calculation
        longitude: Number(formData.longitude), // Mandatory for distance calculation
        // Match backend field casing (backend expects capitalized key)
        TeacherToStudentRatio: formData.TeacherToStudentRatio,
        rank: formData.rank,
        streamsOffered: Array.isArray(formData.streamsOffered) ? formData.streamsOffered : [],
        specialist: Array.isArray(formData.specialist) ? formData.specialist : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
       
         
 instagramHandle: socialLinks.instagramHandle,
  twitterHandle: socialLinks.twitterHandle,
  linkedinHandle: socialLinks.linkedinHandle,

      };
      // =====================
// Backend Schema Mappings (REQUIRED)
// =====================


payload.estYear = Number(
  formData.establishedYear || formData.estYear
);

payload.lat = Number(
  formData.latitude || formData.lat
);

payload.long = Number(
  formData.longitude || formData.long
);

payload.acceptanceRate = Number(formData.acceptanceRate);

payload.collegeInfo = 
  formData.collegeInfo || 
  formData.description || 
  "";

payload.stream = 
  (Array.isArray(formData.streamsOffered) && formData.streamsOffered.length > 0) 
    ? formData.streamsOffered[0] 
    : (formData.stream || "Engineering");
 const updateOrAdd = async (updateFn, addFn, collegeId, payload) => {
    try {
      if (isEditMode) {
        // Remove collegeId from payload for update (it's only needed in URL)
        const { collegeId: _, ...updatePayload } = payload;
        await updateFn(collegeId, updatePayload);
      } else {
        await addFn(payload);
      }
    } catch (error) {
      // If update fails with 404, the resource doesn't exist yet, so add it instead
      if (error.response?.status === 404 && isEditMode) {
        console.log('⚠️ Resource not found, creating new one instead of updating');
        await addFn(payload);
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

      // Always include authId to ensure it's set (for both new and existing colleges)
      // This is crucial for deduplication and tracking which user owns which college
     // 🔑 Attach authId safely
if (currentUser?._id) {
  payload.authId = currentUser._id;
}

// 🔑 Resolve collegeId from reliable sources
let collegeId =
  editingcollegeId ||
  (() => {
    try {
      return localStorage.getItem('lastCreatedcollegeId');
    } catch {
      return null;
    }
  })();

try {
  if (collegeId) {
    // 🟢 UPDATE FLOW (SAFE, NO DUPLICATES)
    console.log('✅ Updating existing college:', collegeId);

    await updateCollegeByAuthId(collegeId, payload);

    setIsEditMode(true);
    setEditingcollegeId(collegeId);
    setHasExistingcollege(true);
  } else {
    // 🆕 CREATE FLOW (RUNS ONLY ONCE)
    console.log('🆕 Creating new college');

    const cleanPayload = { ...payload };
    delete cleanPayload._id; // 🔒 ABSOLUTELY REQUIRED

    const collegeResponse = await addcollege(cleanPayload);
    collegeId = collegeResponse.data.data._id;

    // 🔐 Persist forever to prevent E11000
    try {
      localStorage.setItem('lastCreatedcollegeId', String(collegeId));
    } catch (_) {}

    setIsEditMode(true);
    setEditingcollegeId(collegeId);
    setHasExistingcollege(true);
  }
} catch (err) {
  console.error(
    '❌ College save failed:',
    err?.response?.data || err?.message || err
  );
  throw err;
}



      // Create related data in parallel
      const promises = [];

      // Add/Update amenities
      if (formData.predefinedAmenities?.length > 0 || customAmenities?.length > 0) {
        const payloadAmenities = {
          collegeId,
          predefinedAmenities: formData.predefinedAmenities || [],
          customAmenities: customAmenities || []
        };
        promises.push(updateOrAdd(updateAmenities, addAmenities, collegeId, payloadAmenities));
      }

      // Add/Update activities
      if (formData.activities?.length > 0 || customActivities?.length > 0) {
        const payloadActivities = {
          collegeId,
          activities: formData.activities || [],
          customActivities: customActivities || []
        };
        promises.push(updateOrAdd(updateActivities, addActivities, collegeId, payloadActivities));
      }

      // Add alumni if any (skip for now as there's no alumni UI)
      // TODO: Uncomment when alumni UI is added
      
      if (famousAlumnies.length > 0 || topAlumnies.length > 0 || otherAlumnies.length > 0) {
        
        const alumniPayload = {
          collegeId,
          famousAlumnies: famousAlumnies, 
          // ⚠️ KEY FIX: Map frontend 'topAlumnies' -> backend 'topAlumnis'
          topAlumnis: topAlumnies,        
          // ⚠️ KEY FIX: Map frontend 'otherAlumnies' -> backend 'alumnis'
          alumnis: otherAlumnies          
        };

        // Use updateOrAdd to Handle PUT (Update) or POST (Create)
        promises.push(
           updateOrAdd(updateAlumniBycollege, addAlumni, collegeId, alumniPayload)
        );
      }
      

      // Add/Update infrastructure
      if (formData.infraLabTypes?.length > 0 || formData.infraSportsTypes?.length > 0 || formData.infraLibraryBooks || formData.infraSmartClassrooms) {
        const payloadInfra = {
          collegeId,
          labs: formData.infraLabTypes || [],
          sportsGrounds: formData.infraSportsTypes || [],
          libraryBooks: formData.infraLibraryBooks ? Number(formData.infraLibraryBooks) : undefined,
          smartClassrooms: formData.infraSmartClassrooms ? Number(formData.infraSmartClassrooms) : undefined
        };
        if (isEditMode) {
          // Try update; if not found or not created yet, fall back to create
          promises.push(
            updateInfrastructure(collegeId, payloadInfra).catch(() => addInfrastructure(payloadInfra))
          );
        } else {
          promises.push(addInfrastructure(payloadInfra));
        }
      }

      // Add fees and scholarships if any (matching backend FeesAndScholarships model)
      

      // Add/Update Faculty Quality
      if (facultyQuality && facultyQuality.length > 0) {
        const cleanFaculty = facultyQuality
          .filter(f => f.name || f.qualification || f.awards || f.experience !== undefined)
          .map(f => ({
            name: f.name,
            qualification: f.qualification,
            awards: f.awards ? f.awards.split(',').map(a => a.trim()).filter(Boolean) : [],
            experience: f.experience ? Number(f.experience) : undefined
          }))
          .filter(f => f.name && f.qualification && f.experience !== undefined);
        
        if (cleanFaculty.length > 0) {
          const payloadFaculty = { collegeId, facultyMembers: cleanFaculty };
          promises.push(updateOrAdd(updateFaculty, addFaculty, collegeId, payloadFaculty));
        }
      }

      // Add Admission Timeline if any (matching backend AdmissionTimeline model)
    

      // Add/Update Technology Adoption
    // Corrected Technology Adoption block:
// Add/Update Technology Adoption
if ((formData.smartClassroomsPercentage !== '' && formData.smartClassroomsPercentage != null) || (formData.eLearningPlatforms?.length > 0)) {
  const payloadTech = {
    collegeId, // Use the resolved ID
    smartClassroomsPercentage: (formData.smartClassroomsPercentage === '' || formData.smartClassroomsPercentage == null) ? undefined : Number(formData.smartClassroomsPercentage),
    eLearningPlatforms: formData.eLearningPlatforms || []
  };

  // We call the add function directly because no update route exists.
  // Most backends treat the "Add" of a sub-resource as an "Upsert" if the collegeId is provided.
  
}

      // Add/Update Safety & Security
      if ((formData.cctvCoveragePercentage !== '' && formData.cctvCoveragePercentage != null) || formData.medicalFacility?.doctorAvailability || 
          formData.medicalFacility?.medkitAvailable || formData.medicalFacility?.ambulanceAvailable ||
          formData.transportSafety?.gpsTrackerAvailable || formData.transportSafety?.driversVerified ||
          formData.fireSafetyMeasures?.length > 0 || formData.visitorManagementSystem) {
        const payloadSafety = {
          collegeId,
          cctvCoveragePercentage: (formData.cctvCoveragePercentage === '' || formData.cctvCoveragePercentage == null) ? undefined : Number(formData.cctvCoveragePercentage),
          medicalFacility: {
            doctorAvailability: formData.medicalFacility?.doctorAvailability || undefined,
            medkitAvailable: formData.medicalFacility?.medkitAvailable || false,
            ambulanceAvailable: formData.medicalFacility?.ambulanceAvailable || false
          },
          transportSafety: {
            gpsTrackerAvailable: formData.transportSafety?.gpsTrackerAvailable || false,
            driversVerified: formData.transportSafety?.driversVerified || false
          },
          fireSafetyMeasures: formData.fireSafetyMeasures || [],
          visitorManagementSystem: formData.visitorManagementSystem || false
        };
        promises.push(updateOrAdd(updateSafetyAndSecurity, addSafetyAndSecurity, collegeId, payloadSafety));
      }

      // Add International Exposure if any (matching backend InternationalExposure model)
      console.log('Checking international exposure data:', {
        exchangePrograms: formData.exchangePrograms,
        globalTieUps: formData.globalTieUps
      });
      
      // Validate and clean exchange programs
      const validProgramTypes = ['Student Exchange', 'Faculty Exchange', 'Summer Program', 'Joint Research', 'Cultural Exchange'];
      const validDurations = ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year'];
      
      const validExchangePrograms = (formData.exchangePrograms || []).filter(program => 
        program.partnercollege && program.partnercollege.trim()
      ).map(program => {
        // Validate and set programType
        let programType = 'Student Exchange'; // Default
        if (program.type && validProgramTypes.includes(program.type)) {
          programType = program.type;
        } else if (program.programType && validProgramTypes.includes(program.programType)) {
          programType = program.programType;
        }
        
        // Validate and set duration
        let duration = '1 Month'; // Default
        if (program.duration && validDurations.includes(program.duration)) {
          duration = program.duration;
        }
        
        return {
          partnercollege: program.partnercollege.trim(),
          programType: programType,
          duration: duration,
          studentsParticipated: program.studentsParticipated ? Number(program.studentsParticipated) : 0,
          activeSince: program.activeSince ? Number(program.activeSince) : new Date().getFullYear()
        };
      });

      // Validate and clean global tie-ups
      const validTieUpTypes = ['Memorandum of Understanding (MoU)', 'Research Collaboration', 'Curriculum Development', 'Faculty Training'];
      
      const validGlobalTieUps = (formData.globalTieUps || []).filter(tieup => 
        tieup.partnerName && tieup.partnerName.trim()
      ).map(tieup => {
        // Validate and set natureOfTieUp
        let natureOfTieUp = 'Memorandum of Understanding (MoU)'; // Default
        if (tieup.nature && validTieUpTypes.includes(tieup.nature)) {
          natureOfTieUp = tieup.nature;
        } else if (tieup.natureOfTieUp && validTieUpTypes.includes(tieup.natureOfTieUp)) {
          natureOfTieUp = tieup.natureOfTieUp;
        }
        
        return {
          partnerName: tieup.partnerName.trim(),
          natureOfTieUp: natureOfTieUp,
          activeSince: tieup.activeSince ? Number(tieup.activeSince) : new Date().getFullYear(),
          description: tieup.description || ''
        };
      });

      // Only proceed if we have valid data
      if (validExchangePrograms.length > 0 || validGlobalTieUps.length > 0) {
        console.log('Sending international exposure data:', {
          collegeId,
          exchangePrograms: validExchangePrograms,
          globalTieUps: validGlobalTieUps
        });
        
        const payloadIntl = { collegeId, exchangePrograms: validExchangePrograms, globalTieUps: validGlobalTieUps };
        promises.push(updateOrAdd(updateInternationalExposure, addInternationalExposure, collegeId, payloadIntl));
      } else {
        console.log('No valid international exposure data to send');
      }

      // Add/Update Academics (simplified - only summary fields)
      if ((formData.averageClass10Result !== '' && formData.averageClass10Result != null) || (formData.averageClass12Result !== '' && formData.averageClass12Result != null) || (formData.averagecollegeMarks !== '' && formData.averagecollegeMarks != null) || 
          formData.specialExamsTraining?.length > 0 || formData.extraCurricularActivities?.length > 0) {
        const payloadAcademics = {
          collegeId,
          averageClass10Result: (formData.averageClass10Result === '' || formData.averageClass10Result == null) ? undefined : Number(formData.averageClass10Result),
          averageClass12Result: (formData.averageClass12Result === '' || formData.averageClass12Result == null) ? undefined : Number(formData.averageClass12Result),
          averagecollegeMarks: (formData.averagecollegeMarks === '' || formData.averagecollegeMarks == null) ? 75 : Number(formData.averagecollegeMarks), // Required field, default to 75
          specialExamsTraining: formData.specialExamsTraining || [],
          extraCurricularActivities: formData.extraCurricularActivities || []
        };
        console.log('📚 Sending Academics payload:', payloadAcademics);
       
      }

      // Add/Update other details (matching backend OtherDetails model)
      if ((formData.genderRatioMale !== '' && formData.genderRatioMale != null) || (formData.genderRatioFemale !== '' && formData.genderRatioFemale != null) || (formData.genderRatioOthers !== '' && formData.genderRatioOthers != null) ||
          formData.scholarshipDiversityTypes?.length > 0 || (formData.scholarshipDiversityCoverage !== '' && formData.scholarshipDiversityCoverage != null) ||
          formData.specialNeedsStaff || (formData.specialNeedsSupportPercentage !== '' && formData.specialNeedsSupportPercentage != null) ||
          formData.specialNeedsFacilities?.length > 0) {
        
        // Ensure non-negative values for gender ratios
        const maleRatio = formData.genderRatioMale ? Math.max(0, Number(formData.genderRatioMale)) : 0;
        const femaleRatio = formData.genderRatioFemale ? Math.max(0, Number(formData.genderRatioFemale)) : 0;
        const othersRatio = formData.genderRatioOthers ? Math.max(0, Number(formData.genderRatioOthers)) : 0;
        
        const payloadOther = {
          collegeId,
          genderRatio: {
            male: maleRatio,
            female: femaleRatio,
            others: othersRatio
          },
          scholarshipDiversity: {
            types: formData.scholarshipDiversityTypes || [],
            studentsCoveredPercentage: (formData.scholarshipDiversityCoverage === '' || formData.scholarshipDiversityCoverage == null) ? undefined : Number(formData.scholarshipDiversityCoverage)
          },
          specialNeedsSupport: {
            dedicatedStaff: formData.specialNeedsStaff || false,
            studentsSupportedPercentage: (formData.specialNeedsSupportPercentage === '' || formData.specialNeedsSupportPercentage == null) ? undefined : Number(formData.specialNeedsSupportPercentage),
            facilitiesAvailable: formData.specialNeedsFacilities || []
          }
        };
        promises.push(updateOrAdd(updateOtherDetails, addOtherDetails, collegeId, payloadOther));
      }

      // Wait for all related data to be created
      await Promise.all(promises);
      // ========================
// 🔹 BUILD COURSE LOOKUP MAPS (SAFE)
// ========================
let courseIndexMap = {};
let courseIdMapById = {};
let courseIdMapByName = {};

try {
  const courseRes = await getCoursesByCollege(collegeId);
  const courses = courseRes?.data?.data || courseRes?.data || [];

  courses.forEach((course, index) => {
    if (!course?._id) return;

    courseIndexMap[index] = course._id;
    courseIdMapById[String(course._id)] = course._id;

    if (course.name) {
      courseIdMapByName[course.name.trim().toLowerCase()] = course._id;
    }
  });

  console.log("✅ Course Index Map:", courseIndexMap);
} catch (err) {
  console.error("❌ Failed to fetch courses for admission timeline", err);
}

      // =======================
// =======================
// ADD COURSES (ONE BY ONE)
// =======================
const saveAllCollegeData = async (collegeId, courses, admissionSteps) => {
  try {
    console.log('📚 Saving courses for college:', collegeId);
    
    // Filter out empty courses
    const validCourses = courses.filter(c => c.courseName?.trim());
    
    if (validCourses.length === 0) {
      console.log('No courses to save');
      return;
    }

    // Save each course individually
    const savedCourseIds = [];
    
    for (const course of validCourses) {
      try {
        // Prepare course payload
        const coursePayload = {
          collegeId,
          courseName: course.courseName,
          duration: course.duration,
          fees: course.fees ? Number(course.fees) : 0,
          category: course.category,
          intake: course.intake ? Number(course.intake) : 0
        };

        console.log('Saving course:', coursePayload);
        
        // Save the course
        const response = await addCourseAPI({
          collegeId,
          courses: [coursePayload]
        });
        
        // Extract saved course ID
        const savedCourse = response?.data?.data?.[0] || response?.data?.courses?.[0];
        if (savedCourse?._id) {
          savedCourseIds.push(savedCourse._id);
          console.log('✅ Course saved with ID:', savedCourse._id);
        }
      } catch (error) {
        console.error('❌ Failed to save course:', error);
      }
    }

    if (savedCourseIds.length === 0) {
      throw new Error("No courses were saved successfully");
    }

    // Fetch all saved courses to get complete data
    const courseRes = await getCoursesByCollege(collegeId);
    const savedCourses = courseRes?.data?.data || courseRes?.data || [];
    
    if (!savedCourses.length) {
      throw new Error("No courses found after save");
    }

    // Create course ID map
    const courseIdMap = {};
    savedCourses.forEach((course, index) => {
      if (course?._id) {
        courseIdMap[index] = course._id;
      }
    });

    console.log("✅ Course ID Map:", courseIdMap);

    // Save exams for each course
    for (let cIndex = 0; cIndex < validCourses.length; cIndex++) {
      const course = validCourses[cIndex];
      const courseId = courseIdMap[cIndex];
      
      if (!courseId) continue;

      // Save exams
      if (course.exams?.length > 0) {
        const validExams = course.exams.filter(e => e.examType?.trim());
        
        for (const exam of validExams) {
          try {
            const examPayload = {
              courseId,
              examName: exam.examType,
              marksType: exam.metricType || "Rank",
              minMarks: exam.minValue ? Number(exam.minValue) : 0,
              maxMarks: exam.maxValue ? Number(exam.maxValue) : 100
            };
            
            await addExamAPI(examPayload);
            console.log('✅ Exam saved for course:', courseId);
          } catch (error) {
            console.error('❌ Failed to save exam:', error);
          }
        }
      }

      // Save placements
      if (course.placements?.length > 0) {
        const validPlacements = course.placements.filter(p => p.year);
        
        for (const placement of validPlacements) {
          try {
            const placementPayload = {
              courseId,
              year: Number(placement.year),
              totalStudents: Number(placement.totalStudents || 0),
              placedStudents: Number(placement.placedStudents || 0),
              minPackage: Number(placement.minimumPackage || 0),
              maxPackage: Number(placement.highestPackage || 0),
              averagePackage: Number(placement.averagePackage || 0),
              companies: (placement.topRecruiters || []).filter(Boolean)
            };
            
            await addPlacementAPI(placementPayload);
            console.log('✅ Placement saved for course:', courseId);
          } catch (error) {
            console.error('❌ Failed to save placement:', error);
          }
        }
      }
    }

    // Save admission timelines
    if (admissionSteps?.length > 0) {
      const validTimelines = admissionSteps.filter(t => 
        t.admissionStartDate && t.admissionEndDate && t.courseId
      );

      if (validTimelines.length > 0) {
        const timelinePayload = {
          collegeId,
          timelines: validTimelines.map(t => ({
            admissionStartDate: new Date(t.admissionStartDate),
            admissionEndDate: new Date(t.admissionEndDate),
            status: t.status || "Ongoing",
            applicationFee: Number(t.applicationFee || 0),
            course: t.courseId,
            documentsRequired: t.documentsRequired || [],
            eligibility: {
              minQualification: t.eligibility?.minQualification || "",
              otherInfo: t.eligibility?.otherInfo || ""
            }
          }))
        };

        try {
          await updateAdmissionTimeline(collegeId, timelinePayload);
          console.log('✅ Admission timelines saved');
        } catch (error) {
          if (error?.response?.status === 404) {
            await addAdmissionTimeline(timelinePayload);
          } else {
            throw error;
          }
        }
      }
    }

    toast.success("Details saved successfully!");
    
  } catch (err) {
    console.error("❌ Save failed:", err);
    toast.error(err.message || "Something went wrong while saving data");
    throw err; // Re-throw to handle in the main submit function
  }
};



     await saveAllCollegeData(collegeId, courses, admissionSteps);

if (formData.classFees?.length > 0 || (formData.feesTransparency !== '' && formData.feesTransparency != null)) {
        // Validate and clean classFees
       const validClassFees = (formData.classFees || [])
  .filter(fee => fee.courseId && fee.tuition !== "")
  .map(fee => ({
    courseId: fee.courseId, // MUST be ObjectId string
    tuition: Number(fee.tuition) || 0,
    activity: Number(fee.activity) || 0,
    transport: Number(fee.transport) || 0,
    hostel: Number(fee.hostel) || 0,
    misc: Number(fee.misc) || 0
  }));



        // Validate and clean scholarships
        /*const validScholarships = (formData.scholarships || []).filter(sch => 
          sch.name && sch.amount !== undefined && sch.amount >= 0 && sch.type
        ).map(sch => {
          const scholarship = {
            name: sch.name,
            amount: Number(sch.amount) || 0,
            type: sch.type
          };
          // Only include documentsRequired if it has valid values (non-empty strings)
          const docs = Array.isArray(sch.documentsRequired) 
            ? sch.documentsRequired.filter(d => d && d.trim()) 
            : [];
          if (docs.length > 0) {
            scholarship.documentsRequired = docs;
          }
          return scholarship;
        });*/

        if (validClassFees.length > 0 || validScholarships.length > 0 || (formData.feesTransparency !== '' && formData.feesTransparency != null)) {
          // Map transparency string values to numbers (if backend expects numbers)
          let transparencyValue;
          if (formData.feesTransparency === 'full') transparencyValue = 100;
          else if (formData.feesTransparency === 'partial') transparencyValue = 50;
          else if (formData.feesTransparency === 'low') transparencyValue = 0;
          else if (formData.feesTransparency !== '' && formData.feesTransparency != null) {
            // If it's already a number, use it
            transparencyValue = Number(formData.feesTransparency);
          }
          // =======================
// 🎓 SCHOLARSHIPS (NEW MODEL)
// =======================
if (formData.scholarships?.length > 0) {

  const validScholarships = formData.scholarships
    .filter(sch =>
      sch.name &&
      sch.type &&
      sch.amount !== undefined &&
      sch.amount >= 0
    )
    .map(sch => ({
      collegeId,
      name: sch.name.trim(),
      type: sch.type,
      amount: Number(sch.amount) || 0,
      documentsRequired: Array.isArray(sch.documentsRequired)
        ? sch.documentsRequired.filter(d => d && d.trim())
        : [],
    }));

  console.log("🎓 Sending Scholarships:", validScholarships);

  for (const scholarship of validScholarships) {
    await addScholarship(scholarship); // ✅ Scholarship API
  }
}

          
          const payloadFees = {
            collegeId,
            feesTransparency: transparencyValue,
            classFees: validClassFees,
           
          };
          console.log('💰 Sending Fees & Scholarships:', payloadFees);
          promises.push(upsertCourseFee(payloadFees));
         
        }
      }



      // Upload logo if selected
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await apiClient.post(`/admin/${collegeId}/upload/logo`, logoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Upload photos if selected
      if (selectedPhotos.length > 0) {
        const photoFormData = new FormData();
        selectedPhotos.forEach(photo => photoFormData.append('files', photo));
        await apiClient.post(`/admin/${collegeId}/upload/photos`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Upload video if selected
      if (selectedVideo) {
        const videoFormData = new FormData();
        videoFormData.append('file', selectedVideo);
        await apiClient.post(`/admin/${collegeId}/upload/video`, videoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(
        isEditMode 
          ? "college profile updated successfully!"
          : "college Registration Successful! Your profile is pending approval."
      );

      // Update user context to reflect college user type
      if (currentUser && currentUser._id) {
        updateUserContext({ userType: 'college', collegeId: collegeId });
      }

      // Update state to reflect that college now exists
      if (!isEditMode) {
        console.log('🎉 college registration successful! Switching to edit mode:', {
          collegeId,
          previousState: { hasExistingcollege, isEditMode },
          newState: { hasExistingcollege: true, isEditMode: true }
        });
        setHasExistingcollege(true);
        setIsEditMode(true);
        setEditingcollegeId(collegeId);
        // Clear any draft data since we now have a real college profile
        try {
          localStorage.removeItem("collegeRegDraft");
        } catch (error) {
          console.error("Could not clear draft:", error);
        }
      }

      // Stay on the same page instead of navigating away
      // This allows the user to continue editing their profile
      // navigate("/college-portal/profile-view");
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || (isEditMode ? "Update failed." : "Registration failed.");
      toast.error(errorMessage);
      
      // Show detailed error in console for debugging
      if (error.response?.data) {
        console.error('Backend validation errors:', error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const amenitiesOptions = [
    "Library",
    "Playground",
    "Science Lab",
    "Computer Lab",
    "Cafeteria",
    "Auditorium",
  ];
  const activitiesOptions = [
    'Focusing on Academics',
      'Focuses on Practical Learning',
      'Focuses on Theoretical Learning',
      'Empowering in Sports',
      'Empowering in Arts',
      'Special Focus on Mathematics',
      'Special Focus on Science',
      'Special Focus on Physical Education',
      'Leadership Development',
      'STEM Activities',
      'Cultural Education',
      'Technology Integration',
      'Environmental Awareness',
      'Startup Incubation',
      'Robotics Club'
  ];
  const feeRangeOptions = [
    "1000 - 10000",
    "10000 - 25000",
    "25000 - 50000",
    "50000 - 75000",
    "75000 - 100000",
    "1 Lakh - 2 Lakh",
    "2 Lakh - 3 Lakh",
    "3 Lakh - 4 Lakh",
    "4 Lakh - 5 Lakh",
    "More than 5 Lakh",
  ];

  // UI-only: section navigation (does not change fields or backend)
  const sections = [
    { id: "basic", label: "Basic", Icon: Info },
    { id: "amenities", label: "Amenities", Icon: Sparkles },
    { id: "alumni", label: "Alumni", Icon: Award },
    { id: "faculty", label: "Faculty", Icon: Users2 },
    { id: "infrastructure", label: "Infrastructure", Icon: Building2 },
    { id: "safety", label: "Safety", Icon: ShieldCheck },
    { id: "fees", label: "Fees", Icon: DollarSign },
    { id: "technology", label: "Technology", Icon: Cpu },
    { id: "academics", label: "Academics", Icon: GraduationCap },
    { id: "international", label: "International", Icon: Globe2 },
    { id: "diversity", label: "Diversity", Icon: HeartHandshake },
    { id: "admission", label: "Admission", Icon: CalendarDays },
    { id: "media", label: "Media", Icon: Image },
  ];

  const [activeSection, setActiveSection] = useState("basic");
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const sectionIndex = (id) => sections.findIndex((s) => s.id === id);
  const progressPercent = Math.round(((sectionIndex(activeSection) + 1) / sections.length) * 100);
  const isFirst = sectionIndex(activeSection) === 0;
  const isLast = sectionIndex(activeSection) === sections.length - 1;

  const saveDraft = () => {
    const draft = {
      formData,
      famousAlumnies,
      topAlumnies,
      otherAlumnies,
      customActivities,
      customAmenities,
      facultyQuality,
      activeSection,
      editingcollegeId, // Include collegeId for existing colleges
      hasExistingcollege, // Include state to know if this was an existing college
      isEditMode, // Include edit mode state
      logoPreview, // Include logo preview
      socialLinks, // Include social media links
      admissionSteps, // Include admission timeline
    };
    try {
      localStorage.setItem("collegeRegDraft", JSON.stringify(draft));
      toast.success("Draft saved");
    } catch {
      toast.error("Could not save draft");
    }
  };

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem("collegeRegDraft");
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);

        // Restore form data
        if (draft.formData) {
          setFormData(draft.formData);
        }

        // Restore alumni data
        if (draft.famousAlumnies) {
          setFamousAlumnies(draft.famousAlumnies);
        }
        if (draft.topAlumnies) {
          setTopAlumnies(draft.topAlumnies);
        }
        if (draft.otherAlumnies) {
          setOtherAlumnies(draft.otherAlumnies);
        }

        // Restore activities and amenities
        if (draft.customActivities) {
          setCustomActivities(draft.customActivities);
        }
        if (draft.customAmenities) {
          setCustomAmenities(draft.customAmenities);
        }

        // Restore faculty and academic data
        if (draft.facultyQuality) {
          setFacultyQuality(draft.facultyQuality);
        }
        // academicResults and examQualifiers removed - not in backend schema

        // Restore active section
        if (draft.activeSection) {
          setActiveSection(draft.activeSection);
        }

        // Restore edit mode states for existing colleges
        if (draft.editingcollegeId) {
          setEditingcollegeId(draft.editingcollegeId);
        }
        if (draft.hasExistingcollege !== undefined) {
          setHasExistingcollege(draft.hasExistingcollege);
        }
        if (draft.isEditMode !== undefined) {
          setIsEditMode(draft.isEditMode);
        }

        // Restore logo, social links, and admission timeline
        if (draft.logoPreview) {
          setLogoPreview(draft.logoPreview);
        }
        
        if (draft.admissionSteps) {
          setAdmissionSteps(draft.admissionSteps);
        }

        // Only show toast if we actually have meaningful draft data
        if (draft.formData?.name || draft.formData?.email || draft.formData?.description) {
          toast.success("Draft loaded successfully!");
        }
        return true;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error("Could not load draft");
    }
    return false;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem("collegeRegDraft");
      toast.success("Draft cleared");
    } catch (error) {
      toast.error("Could not clear draft");
    }
  };
   const selectedCollegeId = editingcollegeId || formData.collegeId;
   useEffect(() => {
  if (!selectedCollegeId) return;

  const fetchAllData = async () => {
    try {
      // 1️⃣ Fetch Courses
      const courseRes = await getCoursesByCollege(selectedCollegeId);
      const fetchedCourses = courseRes?.data?.courses || courseRes?.data || [];

      if (fetchedCourses.length > 0) {
        setCourses(fetchedCourses);
      }

      // 2️⃣ Fetch Hostels
      const hostelRes = await getHostelsByCollege(selectedCollegeId);
      const fetchedHostels = hostelRes?.data?.data || hostelRes?.data || [];

      if (fetchedHostels.length > 0) {
        setHostels(fetchedHostels);
      }

    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  fetchAllData();
}, [selectedCollegeId]);


// Add near your other useEffects (around line 2700)
useEffect(() => {
  console.log('📊 Current formData.ranking value:', formData.ranking);
}, [formData.ranking]);

  // 🔹 PASTE useEffect RIGHT HERE 👇
useEffect(() => {
  if (!selectedCollegeId) return;

  const fetchHostels = async () => {
    try {
      const res = await getHostelsByCollege(selectedCollegeId);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setHostels(list);
    } catch {
      toast.error("Failed to load hostels");
      setHostels([]);
    }
  };

  fetchHostels();
}, [selectedCollegeId]);
useEffect(() => {
  if (!editingcollegeId) return;

  const fetchScholarships = async () => {
    try {
      const res = await getScholarshipsByCollege(editingcollegeId);
      const data = res.data || [];

      setFormData(prev => ({
        ...prev,
        scholarships: data.map(s => ({
          name: s.name || "",
          type: s.type || "",
          amount: s.amount || "",
          documentsRequired: s.documentsRequired || []
        }))
      }));
    } catch (err) {
      console.error("❌ Scholarship fetch failed", err);
    }
  };

  fetchScholarships();
}, [editingcollegeId]);




  // Check for existing college data on mount and when currentUser becomes available
  useEffect(() => {
    if (currentUser?._id && !hasCheckedForcollege.current) {
      hasCheckedForcollege.current = true;
      checkForExistingcollege();
    }
  }, [currentUser?._id]); // Re-run when currentUser becomes available

  // Debug: Log state changes (remove this in production)
  useEffect(() => {
    console.log('🔍 State update:', {
      hasExistingcollege,
      isLoadingExistingData,
      isEditMode,
      hasCurrentUser: !!currentUser?._id
    });
  }, [hasExistingcollege, isLoadingExistingData, isEditMode, currentUser?._id]);

  // Auto-fill user details when currentUser becomes available
  useEffect(() => {
    if (currentUser && !hasExistingcollege && !isLoadingExistingData) {
      console.log('🔍 Auto-filling user details:', {
        email: currentUser.email,
        availableFields: Object.keys(currentUser)
      });
      
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser, hasExistingcollege, isLoadingExistingData]);

  // Update your checkForExistingcollege function
const checkForExistingcollege = async () => {
  console.log('🔍 Starting checkForExistingcollege...');
  
  if (!currentUser?._id) {
    console.log('❌ No current user, treating as new college');
    setHasExistingcollege(false);
    setIsEditMode(false);
    setIsLoadingExistingData(false);
    loadDraft();
    return;
  }
  
  try {
    setIsLoadingExistingData(true);
    let college = null;
    
    // Try localStorage first
    const cachedcollegeId = localStorage.getItem('lastCreatedcollegeId');
    if (cachedcollegeId) {
      try {
        const res = await getcollegeById(cachedcollegeId);
        const found = res?.data?.data || res?.data || res;
        if (found && found.authId === currentUser._id) {
          college = found;
          console.log('✅ Found existing college from localStorage:', college._id);
        }
      } catch (e) {
        localStorage.removeItem('lastCreatedcollegeId');
      }
    }
    
    // Try direct database lookup via Auth ID
    if (!college) {
      try {
        console.log('🔍 Fetching directly via Auth ID:', currentUser._id);
        const res = await getcollegeByAuthId(currentUser._id);
        console.log('📦 Auth ID lookup response:', res);
        console.log('📦 Response data:', res?.data);
        
        // The response from your API has a 'college' property
        // It might be in res.data or directly in res
        let foundCollege = null;
        
        // Check all possible locations for the college data
        if (res?.data?.college) {
          // Case: { data: { college: {...}, courseCount: 1, ... } }
          foundCollege = res.data.college;
          console.log('✅ Found college in res.data.college');
        } else if (res?.college) {
          // Case: { college: {...}, courseCount: 1, ... }
          foundCollege = res.college;
          console.log('✅ Found college in res.college');
        } else if (res?.data?.data?.college) {
          // Case: { data: { data: { college: {...} } } }
          foundCollege = res.data.data.college;
          console.log('✅ Found college in res.data.data.college');
        } else if (res?.data?.data) {
          // Case: { data: { data: {...} } }
          foundCollege = res.data.data;
          console.log('✅ Found college in res.data.data');
        } else if (res?.data && typeof res.data === 'object') {
          // If the data itself has an _id, it might be the college
          if (res.data._id) {
            foundCollege = res.data;
            console.log('✅ Found college directly in res.data');
          }
        }
        
        console.log('🔍 Extracted college:', foundCollege);
        
        if (foundCollege && foundCollege._id) {
          college = foundCollege;
          console.log('✅ Success! College found:', college._id, college.name);
          localStorage.setItem('lastCreatedcollegeId', college._id);
        } else {
          console.log('❌ No valid college found in response');
        }
      } catch (e) {
        console.log('❌ Error in Auth ID lookup:', e);
      }
    }
    
    if (college && college._id) {
      console.log('🎉 College found! Loading all data...');
      setHasExistingcollege(true);
      setEditingcollegeId(college._id);
      setIsEditMode(true);
      
      // Load all college data
      await loadAllCollegeData(college);
      
    } else {
      console.log('❌ No existing college found. Starting fresh.');
      setHasExistingcollege(false);
      setIsEditMode(false);
      
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || prev.email
      }));
      
      loadDraft();
    }
  } catch (error) {
    console.error('Error in check process:', error);
    setHasExistingcollege(false);
  } finally {
    setIsLoadingExistingData(false);
  }
};

  // Load existing college data into form
  const loadExistingcollegeData = async (college) => {
    console.log('📥 loadExistingcollegeData called with college:', {
      id: college._id,
      name: college.name,
      email: college.email,
      city: college.city
    });
    
    // Clear any existing draft since we're loading real college data
    try {
      localStorage.removeItem("collegeRegDraft");
    } catch (error) {
      console.error("Could not clear draft:", error);
    }
    
    // Load existing logo if available
    if (college.logo) {
      // Backend returns logo as object with url property
      const logoUrl = typeof college.logo === 'object' ? college.logo.url : college.logo;
      if (logoUrl) {
        setLogoPreview(logoUrl);
      }
    }
    
    console.log('📝 Setting basic form data...');
    setFormData(prev => ({
      ...prev,
      name: college.name || "",
      description: college.description || "",
      address: college.address || "",
      area: college.area || "",
      city: college.city || "",
      state: college.state || "",
      country: college.country || "",
      pincode: college.pinCode ? String(college.pinCode) : "",
      establishedYear: college.estYear ? String(college.estYear) : (college.establishedYear ? String(college.establishedYear) : ""),
      board: college.board || "",
      feeRange: college.feeRange || "",
      upto: college.upto || "",
      email: college.email || "",
      website: college.website || "",
      phoneNo: college.mobileNo || "",
      collegeMode: college.collegeMode || "convent",
      genderType: college.genderType === 'boy' ? 'boys' : college.genderType === 'girl' ? 'girls' : (college.genderType || 'co-ed'),
      shifts: Array.isArray(college.shifts) ? college.shifts : [],
      languageMedium: Array.isArray(college.languageMedium) ? college.languageMedium : [],
      transportAvailable: college.transportAvailable || "no",
      latitude: college.lat != null ? String(college.lat) : (college.latitude != null ? String(college.latitude) : ""),
      longitude: college.long != null ? String(college.long) : (college.longitude != null ? String(college.longitude) : ""),
      TeacherToStudentRatio: college.TeacherToStudentRatio || "",
      rank: college.rank || "",
      ranking: college.ranking || college.rank || "",
      acceptanceRate: college.acceptanceRate != null ? String(college.acceptanceRate) : "",
      streamsOffered: Array.isArray(formData.streamsOffered) ? formData.streamsOffered : [],
      specialist: Array.isArray(college.specialist) ? college.specialist : [],
      tags: Array.isArray(college.tags) ? college.tags : [],
      
      
    }));
    setSocialLinks({
  
  instagramHandle: college.instagramHandle || "",
  twitterHandle: college.twitterHandle || "",
  linkedinHandle: college.linkedinHandle || ""
});
    debugger;
    // Load sub-resources in parallel and prefill form controls
    try {
      const [
        amenitiesRes,
        activitiesRes,
        infraRes,
        feesRes,
        academicsRes,
        otherRes,
        safetyRes,
        techRes,
        intlRes,
        facultyRes,
        timelineRes,
        alumniRes
      ] = await Promise.allSettled([
        getAmenitiesByCollegeId(college._id),
        getActivitiesByCollegeId(college._id),
        getInfrastructureById(college._id),
        getFeesAndScholarshipsById(college._id),
        getAcademicsById(college._id),
        getOtherDetailsById(college._id),
        getSafetyAndSecurityById(college._id),
        getTechnologyAdoptionById(college._id),
        getInternationalExposureById(college._id),
        getFacultyById(college._id),
        getAdmissionTimelineById(college._id),
        getAlumniBycollege(college._id)
      ]);

      const val = (s) => (s && s.status === 'fulfilled') ? (s.value?.data?.data ?? s.value?.data) : null;
      const amenities = val(amenitiesRes) || {};
      const activities = val(activitiesRes) || {};
      const infra = val(infraRes) || {};
      const fees = val(feesRes) || {};
      const academics = val(academicsRes) || {};
      const other = val(otherRes) || {};
      const safety = val(safetyRes) || {};
      const tech = val(techRes) || {};
      const intl = val(intlRes) || {};
      const faculty = val(facultyRes) || {};
      const timeline = val(timelineRes) || {};
      const alumniData = (alumniRes.status === 'fulfilled' && alumniRes.value?.data?.data) 
      ? alumniRes.value.data.data 
      : {};
      // Prefill arrays/booleans safely (preserve 0/false values)
      setFormData(prev => ({
        ...prev,
        predefinedAmenities: Array.isArray(amenities.predefinedAmenities) ? amenities.predefinedAmenities : (Array.isArray(amenities.amenities) ? amenities.amenities : prev.predefinedAmenities),
        activities: Array.isArray(activities.activities) ? activities.activities : prev.activities,
        infraLabTypes: Array.isArray(infra.labs) ? infra.labs : prev.infraLabTypes,
        infraSportsTypes: Array.isArray(infra.sportsGrounds) ? infra.sportsGrounds : prev.infraSportsTypes,
        infraLibraryBooks: infra.libraryBooks != null ? String(infra.libraryBooks) : prev.infraLibraryBooks,
        infraSmartClassrooms: infra.smartClassrooms != null ? String(infra.smartClassrooms) : prev.infraSmartClassrooms,
        // Safety & Security
        cctvCoveragePercentage: safety.cctvCoveragePercentage != null ? String(safety.cctvCoveragePercentage) : prev.cctvCoveragePercentage,
        medicalFacility: safety.medicalFacility ? {
          doctorAvailability: safety.medicalFacility.doctorAvailability ?? prev.medicalFacility.doctorAvailability,
          medkitAvailable: !!safety.medicalFacility.medkitAvailable,
          ambulanceAvailable: !!safety.medicalFacility.ambulanceAvailable
        } : prev.medicalFacility,
        transportSafety: safety.transportSafety ? {
          gpsTrackerAvailable: !!safety.transportSafety.gpsTrackerAvailable,
          driversVerified: !!safety.transportSafety.driversVerified
        } : prev.transportSafety,
        fireSafetyMeasures: Array.isArray(safety.fireSafetyMeasures) ? safety.fireSafetyMeasures : prev.fireSafetyMeasures,
        visitorManagementSystem: safety.visitorManagementSystem != null ? !!safety.visitorManagementSystem : prev.visitorManagementSystem,
        // Technology Adoption
        smartClassroomsPercentage: tech.smartClassroomsPercentage != null ? String(tech.smartClassroomsPercentage) : prev.smartClassroomsPercentage,
        eLearningPlatforms: Array.isArray(tech.eLearningPlatforms) ? tech.eLearningPlatforms : prev.eLearningPlatforms,
        // International Exposure
        exchangePrograms: Array.isArray(intl.exchangePrograms) ? intl.exchangePrograms.map(prog => ({
          partnercollege: prog.partnercollege ?? '',
          type: prog.type ?? prog.programType ?? '',
          duration: prog.duration ?? '',
          studentsParticipated: prog.studentsParticipated ?? '',
          activeSince: prog.activeSince ?? ''
        })) : prev.exchangePrograms,
        globalTieUps: Array.isArray(intl.globalTieUps) ? intl.globalTieUps.map(tie => ({
          partnerName: tie.partnerName ?? '',
          nature: tie.nature ?? tie.natureOfTieUp ?? '',
          activeSince: tie.activeSince ?? '',
          description: tie.description ?? ''
        })) : prev.globalTieUps,
        // Other Details
        genderRatio: other.genderRatio ? {
          male: other.genderRatio.male ?? prev.genderRatio.male,
          female: other.genderRatio.female ?? prev.genderRatio.female,
          others: other.genderRatio.others ?? prev.genderRatio.others
        } : prev.genderRatio,
        scholarshipDiversity: other.scholarshipDiversity ? {
          types: Array.isArray(other.scholarshipDiversity.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversity.types,
          studentsCoveredPercentage: other.scholarshipDiversity.studentsCoveredPercentage ?? prev.scholarshipDiversity.studentsCoveredPercentage
        } : prev.scholarshipDiversity,
        specialNeedsSupport: other.specialNeedsSupport ? {
          dedicatedStaff: !!other.specialNeedsSupport.dedicatedStaff,
          studentsSupportedPercentage: other.specialNeedsSupport.studentsSupportedPercentage ?? prev.specialNeedsSupport.studentsSupportedPercentage,
          facilitiesAvailable: Array.isArray(other.specialNeedsSupport.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsSupport.facilitiesAvailable
        } : prev.specialNeedsSupport,
        // Academics summary fields
        averageClass10Result: academics.averageClass10Result ?? prev.averageClass10Result,
        averageClass12Result: academics.averageClass12Result ?? prev.averageClass12Result,
        averagecollegeMarks: academics.averagecollegeMarks ?? prev.averagecollegeMarks,
        specialExamsTraining: Array.isArray(academics.specialExamsTraining) ? academics.specialExamsTraining : prev.specialExamsTraining,
        extraCurricularActivities: Array.isArray(academics.extraCurricularActivities) ? academics.extraCurricularActivities : prev.extraCurricularActivities,
        // Fees & Scholarships
        feesTransparency: fees.feesTransparency != null ? (
          fees.feesTransparency === 100 || fees.feesTransparency === 'full' ? 'full' :
          fees.feesTransparency === 50 || fees.feesTransparency === 'partial' ? 'partial' :
          fees.feesTransparency === 0 || fees.feesTransparency === 'low' ? 'low' :
          String(fees.feesTransparency)
        ) : prev.feesTransparency,
        classFees: Array.isArray(fees.classFees) ? fees.classFees : prev.classFees,
        scholarships: Array.isArray(fees.scholarships) ? fees.scholarships : prev.scholarships,
        // UI mirrors for Other Details
        genderRatioMale: other.genderRatio && other.genderRatio.male != null ? String(other.genderRatio.male) : prev.genderRatioMale,
        genderRatioFemale: other.genderRatio && other.genderRatio.female != null ? String(other.genderRatio.female) : prev.genderRatioFemale,
        genderRatioOthers: other.genderRatio && other.genderRatio.others != null ? String(other.genderRatio.others) : prev.genderRatioOthers,
        scholarshipDiversityTypes: Array.isArray(other.scholarshipDiversity?.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversityTypes,
        scholarshipDiversityCoverage: other.scholarshipDiversity && other.scholarshipDiversity.studentsCoveredPercentage != null ? String(other.scholarshipDiversity.studentsCoveredPercentage) : prev.scholarshipDiversityCoverage,
        specialNeedsStaff: other.specialNeedsSupport ? !!other.specialNeedsSupport.dedicatedStaff : prev.specialNeedsStaff,
        specialNeedsSupportPercentage: other.specialNeedsSupport && other.specialNeedsSupport.studentsSupportedPercentage != null ? String(other.specialNeedsSupport.studentsSupportedPercentage) : prev.specialNeedsSupportPercentage,
        specialNeedsFacilities: Array.isArray(other.specialNeedsSupport?.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsFacilities
      }));

      // academicResults and examQualifiers removed - not in backend schema

      // Load additional data arrays
      if (Array.isArray(amenities.customAmenities)) {
        setCustomAmenities(amenities.customAmenities);
      }
      if (Array.isArray(activities.customActivities)) {
        setCustomActivities(activities.customActivities);
      }
      if (Array.isArray(faculty.facultyMembers)) {
        setFacultyQuality(faculty.facultyMembers.map(f => ({
          name: f.name || '',
          qualification: f.qualification || '',
          awards: Array.isArray(f.awards) ? f.awards.join(', ') : (f.awards || ''),
          experience: f.experience || ''
        })));
      }
      if (Array.isArray(timeline.timelines)) {
  setAdmissionSteps(
    timeline.timelines.map(t => ({
      admissionStartDate: t.admissionStartDate
        ? new Date(t.admissionStartDate).toISOString().split('T')[0]
        : '',
      admissionEndDate: t.admissionEndDate
        ? new Date(t.admissionEndDate).toISOString().split('T')[0]
        : '',
      status: t.status || '',
      applicationFee: t.applicationFee ?? 0,
      courseId: t.courseId || '',

      documentsRequired: Array.isArray(t.documentsRequired)
        ? t.documentsRequired
        : [],

      eligibility: {
        minQualification: t.eligibility?.minQualification || '',
        otherInfo: t.eligibility?.otherInfo || ''
      }
    }))
  );
}

      console.log('✅ Successfully loaded existing college data');
      console.log('📋 college data loaded:', {
        name: college.name,
        email: college.email,
        city: college.city,
        board: college.board,
        hasAmenities: !!amenities,
        hasActivities: !!activities,
        hasInfrastructure: !!infra,
        hasFees: !!fees,
        hasAcademics: !!academics
      });
      console.log('✅ Form should now display the loaded data. Check the form fields.');
    } catch (error) {
      console.error('❌ Error loading sub-resources:', error);
      console.error('Error details:', error.message, error.response?.data);
      toast.error('Some college details could not be loaded. Please check and fill any missing information.');
    }
  };

  // Auto-save draft when form data changes (debounced) - works for both new and existing colleges
  useEffect(() => {
    // Only auto-save if user has started filling the form and we're not currently loading existing data
    if (isLoadingExistingData || !currentUser) return;

    const autoSaveTimer = setTimeout(() => {
      if (formData.name || formData.description || formData.email) {
        // Only auto-save if user has started filling the form
        const draft = {
          formData,
          famousAlumnies,
          topAlumnies,
          otherAlumnies,
          customActivities,
          customAmenities,
          facultyQuality,
          activeSection,
          editingcollegeId, // Include collegeId for existing colleges
          hasExistingcollege, // Include state to know if this was an existing college
          isEditMode, // Include edit mode state
          logoPreview, // Include logo preview
          socialLinks, // Include social media links
          admissionSteps, // Include admission timeline
        };
        try {
          localStorage.setItem("collegeRegDraft", JSON.stringify(draft));
          // Don't show toast for auto-save to avoid spam
          console.log('💾 Auto-saved draft');
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, famousAlumnies, topAlumnies, otherAlumnies, customActivities, customAmenities, facultyQuality, activeSection, editingcollegeId, hasExistingcollege, isEditMode, logoPreview, socialLinks, admissionSteps, isLoadingExistingData, currentUser]);

  const goPrev = () => {
    if (isFirst) return;
    const idx = sectionIndex(activeSection);
    setActiveSection(sections[idx - 1].id);
  };
  const goNext = () => {
    const idx = sectionIndex(activeSection);
    if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
  };

  useEffect(() => {
    console.log('Active section changed to:', activeSection); // Debug log
  }, [activeSection]);

  useEffect(() => {
    const observers = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isManualNavigation) {
            console.log('Intersection observer triggered for:', s.id);
            setActiveSection(s.id);
          }
        },
        { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [isManualNavigation]);

  const scrollToSection = (id) => {
    console.log('Scrolling to section:', id); // Debug log
    setActiveSection(id);
    // Smooth scroll to the section
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ 
        behavior: "smooth", 
        block: "start",
        inline: "nearest"
      });
      // Add a subtle highlight effect to the section
      setTimeout(() => {
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 1000);
      }, 500);
    }
  };

  const handleEnterEditMode = async () => {
    if (!currentUser?._id) {
      return toast.error("You must be logged in.");
    }
    try {
      setIsSubmitting(true);
      
      let college;
      
      // Method 1: Try localStorage (works if same session)
      const cachedcollegeId = typeof localStorage !== 'undefined' && localStorage.getItem('lastCreatedcollegeId');
      if (cachedcollegeId) {
        try {
          const res = await getcollegeById(cachedcollegeId, { headers: { 'X-Silent-Request': '1' } });
          college = res?.data?.data;
          console.log('✅ Found college from localStorage');
        } catch (e) {
          console.log('❌ localStorage collegeId not valid, trying other methods...');
        }
      }
      
      // Method 2: Try currentUser.collegeId (works if backend returns it)
      if (!college && currentUser?.collegeId) {
        try {
          const res = await getcollegeById(currentUser.collegeId, { headers: { 'X-Silent-Request': '1' } });
          college = res?.data?.data;
          console.log('✅ Found college from currentUser.collegeId');
        } catch (e) {
          console.log('❌ currentUser.collegeId not valid, trying other methods...');
        }
      }
      
      // Method 3: Fetch colleges and filter by authId (frontend-only solution)
      if (!college) {
        try {
          console.log('🔍 Fetching colleges to find match by authId...');
          
          // Try multiple status endpoints since 'all' doesn't work
          let colleges = [];
          const statuses = ['accepted', 'pending', 'rejected'];
          
          for (const status of statuses) {
            try {
              const res = await getcollegesByStatus(status);
              const statuscolleges = res?.data?.data || res?.data || [];
              colleges = colleges.concat(statuscolleges);
            } catch (statusErr) {
              console.log(`Could not fetch ${status} colleges:`, statusErr.message);
            }
          }
          
          console.log(`Found ${colleges.length} total colleges across all statuses`);
          
          // Find college where authId matches current user's _id
          college = colleges.find(s => s.authId === currentUser._id);
          
          if (college) {
            console.log('✅ Found college by authId match');
            localStorage.setItem('lastCreatedcollegeId', college._id);
          } else {
            console.log('⚠️ No college found with authId, trying email match...');
            
            // Fallback: Try to match by email (for colleges created before authId was added)
            if (currentUser.email) {
              college = colleges.find(s => s.email && s.email.toLowerCase() === currentUser.email.toLowerCase());
              
              if (college) {
                console.log('✅ Found college by email match');
                localStorage.setItem('lastCreatedcollegeId', college._id);
              } else {
                console.log('❌ No college found with authId or email');
                console.log('Your authId:', currentUser._id);
                console.log('Your email:', currentUser.email);
                console.log('Sample college data:', colleges[0]);
              }
            }
          }
        } catch (e) {
          console.log('❌ Could not fetch colleges:', e.message);
        }
      }
      
      if (!college) {
        toast.error("No linked college profile found for this account. Please create a college profile first.");
        return;
      }
      
      // Clear any existing draft since we're loading real college data
      try {
        localStorage.removeItem("collegeRegDraft");
      } catch (error) {
        console.error("Could not clear draft:", error);
      }
      
      setEditingcollegeId(college._id);
      setIsEditMode(true);
      setHasExistingcollege(true);

      setFormData(prev => ({
        ...prev,
        name: college.name || "",
        description: college.description || "",
        address: college.address || "",
        area: college.area || "",
        city: college.city || "",
        state: college.state || "",
        country: college.country || "",
        pincode: college.pinCode ? String(college.pinCode) : "",
        establishedYear: college.establishedYear ? String(college.establishedYear) : "",
        board: college.board || "",
        feeRange: college.feeRange || "",
        upto: college.upto || "",
        email: college.email || "",
        website: college.website || "",
        phoneNo: college.mobileNo || "",
        collegeMode: college.collegeMode || "convent",
        genderType: college.genderType === 'boy' ? 'boys' : college.genderType === 'girl' ? 'girls' : (college.genderType || 'co-ed'),
        shifts: Array.isArray(college.shifts) ? college.shifts : [],
        languageMedium: Array.isArray(college.languageMedium) ? college.languageMedium : [],
        transportAvailable: college.transportAvailable || "no",
        latitude: college.latitude != null ? String(college.latitude) : "",
        longitude: college.longitude != null ? String(college.longitude) : "",
        TeacherToStudentRatio: college.TeacherToStudentRatio || "",
        rank: college.rank || "",
         streamsOffered: Array.isArray(formData.streamsOffered) ? formData.streamsOffered : [],
        specialist: Array.isArray(college.specialist) ? college.specialist : [],
        tags: Array.isArray(college.tags) ? college.tags : []
      }));
      
     setSocialLinks({
   // Note: Ensure this exists in your backend schema
  instagramHandle: college.instagramHandle || "", 
  twitterHandle: college.twitterHandle || "", 
  linkedinHandle: college.linkedinHandle || ""
});

      
      // Load sub-resources in parallel and prefill form controls
      const [
        amenitiesRes,
        activitiesRes,
        infraRes,
        feesRes,
        academicsRes,
        otherRes,
        safetyRes,
        techRes,
        intlRes,
        facultyRes,
        timelineRes
      ] = await Promise.allSettled([
        getAmenitiesByCollegeId(college._id),
        getActivitiesByCollegeId(college._id),
        getInfrastructureById(college._id),
        getFeesAndScholarshipsById(college._id),
        getAcademicsById(college._id),
        getOtherDetailsById(college._id),
        getSafetyAndSecurityById(college._id),
        getTechnologyAdoptionById(college._id),
        getInternationalExposureById(college._id),
        getFacultyById(college._id),
        getAdmissionTimelineById(college._id)
      ]);

      const val = (s) => (s && s.status === 'fulfilled') ? (s.value?.data?.data ?? s.value?.data) : null;
      const amenities = val(amenitiesRes) || {};
      const activities = val(activitiesRes) || {};
      const infra = val(infraRes) || {};
      const fees = val(feesRes) || {};
      const academics = val(academicsRes) || {};
      const other = val(otherRes) || {};
      const safety = val(safetyRes) || {};
      const tech = val(techRes) || {};
      const intl = val(intlRes) || {};
      const faculty = val(facultyRes) || {};
      const timeline = val(timelineRes) || {};

      // Prefill arrays/booleans safely
      setFormData(prev => ({
        ...prev,
        predefinedAmenities: Array.isArray(amenities.predefinedAmenities) ? amenities.predefinedAmenities : (Array.isArray(amenities.amenities) ? amenities.amenities : prev.predefinedAmenities),
        activities: Array.isArray(activities.activities) ? activities.activities : prev.activities,
        infraLabTypes: Array.isArray(infra.labs) ? infra.labs : prev.infraLabTypes,
        infraSportsTypes: Array.isArray(infra.sportsGrounds) ? infra.sportsGrounds : prev.infraSportsTypes,
        infraLibraryBooks: infra.libraryBooks != null ? String(infra.libraryBooks) : prev.infraLibraryBooks,
        infraSmartClassrooms: infra.smartClassrooms != null ? String(infra.smartClassrooms) : prev.infraSmartClassrooms,
        // Technology Adoption
        smartClassroomsPercentage: tech.smartClassroomsPercentage != null ? String(tech.smartClassroomsPercentage) : prev.smartClassroomsPercentage,
        eLearningPlatforms: Array.isArray(tech.eLearningPlatforms) ? tech.eLearningPlatforms : prev.eLearningPlatforms,
        feesTransparency: fees.feesTransparency != null ? (
          fees.feesTransparency === 100 || fees.feesTransparency === 'full' ? 'full' :
          fees.feesTransparency === 50 || fees.feesTransparency === 'partial' ? 'partial' :
          fees.feesTransparency === 0 || fees.feesTransparency === 'low' ? 'low' :
          String(fees.feesTransparency)
        ) : prev.feesTransparency,
        classFees: Array.isArray(fees.classFees) ? fees.classFees : prev.classFees,
        scholarships: Array.isArray(fees.scholarships) ? fees.scholarships : prev.scholarships,
        averageClass10Result: academics.averageClass10Result ?? prev.averageClass10Result,
        averageClass12Result: academics.averageClass12Result ?? prev.averageClass12Result,
        averagecollegeMarks: academics.averagecollegeMarks ?? prev.averagecollegeMarks,
        specialExamsTraining: Array.isArray(academics.specialExamsTraining) ? academics.specialExamsTraining : prev.specialExamsTraining,
        extraCurricularActivities: Array.isArray(academics.extraCurricularActivities) ? academics.extraCurricularActivities : prev.extraCurricularActivities,
        // Safety & Security
        cctvCoveragePercentage: safety.cctvCoveragePercentage != null ? String(safety.cctvCoveragePercentage) : prev.cctvCoveragePercentage,
        medicalFacility: safety.medicalFacility ? {
          doctorAvailability: safety.medicalFacility.doctorAvailability ?? prev.medicalFacility.doctorAvailability,
          medkitAvailable: !!safety.medicalFacility.medkitAvailable,
          ambulanceAvailable: !!safety.medicalFacility.ambulanceAvailable,
        } : prev.medicalFacility,
        transportSafety: safety.transportSafety ? {
          gpsTrackerAvailable: !!safety.transportSafety.gpsTrackerAvailable,
          driversVerified: !!safety.transportSafety.driversVerified,
        } : prev.transportSafety,
        fireSafetyMeasures: Array.isArray(safety.fireSafetyMeasures) ? safety.fireSafetyMeasures : prev.fireSafetyMeasures,
        visitorManagementSystem: safety.visitorManagementSystem != null ? !!safety.visitorManagementSystem : prev.visitorManagementSystem,
        genderRatio: other.genderRatio ? {
          male: other.genderRatio.male ?? prev.genderRatio.male,
          female: other.genderRatio.female ?? prev.genderRatio.female,
          others: other.genderRatio.others ?? prev.genderRatio.others,
        } : prev.genderRatio,
        scholarshipDiversity: other.scholarshipDiversity ? {
          types: Array.isArray(other.scholarshipDiversity.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversity.types,
          studentsCoveredPercentage: other.scholarshipDiversity.studentsCoveredPercentage ?? prev.scholarshipDiversity.studentsCoveredPercentage,
        } : prev.scholarshipDiversity,
        specialNeedsSupport: other.specialNeedsSupport ? {
          dedicatedStaff: !!other.specialNeedsSupport.dedicatedStaff,
          studentsSupportedPercentage: other.specialNeedsSupport.studentsSupportedPercentage ?? prev.specialNeedsSupport.studentsSupportedPercentage,
          facilitiesAvailable: Array.isArray(other.specialNeedsSupport.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsSupport.facilitiesAvailable,
        } : prev.specialNeedsSupport,
        // UI-flat mirrors for Other Details (to update existing inputs)
        genderRatioMale: other.genderRatio && other.genderRatio.male != null ? String(other.genderRatio.male) : prev.genderRatioMale,
        genderRatioFemale: other.genderRatio && other.genderRatio.female != null ? String(other.genderRatio.female) : prev.genderRatioFemale,
        genderRatioOthers: other.genderRatio && other.genderRatio.others != null ? String(other.genderRatio.others) : prev.genderRatioOthers,
        scholarshipDiversityTypes: Array.isArray(other.scholarshipDiversity?.types) ? other.scholarshipDiversity.types : prev.scholarshipDiversityTypes,
        scholarshipDiversityCoverage: other.scholarshipDiversity && other.scholarshipDiversity.studentsCoveredPercentage != null ? String(other.scholarshipDiversity.studentsCoveredPercentage) : prev.scholarshipDiversityCoverage,
        specialNeedsFacilities: Array.isArray(other.specialNeedsSupport?.facilitiesAvailable) ? other.specialNeedsSupport.facilitiesAvailable : prev.specialNeedsFacilities,
        specialNeedsSupportPercentage: other.specialNeedsSupport && other.specialNeedsSupport.studentsSupportedPercentage != null ? String(other.specialNeedsSupport.studentsSupportedPercentage) : prev.specialNeedsSupportPercentage,
        specialNeedsStaff: other.specialNeedsSupport ? !!other.specialNeedsSupport.dedicatedStaff : prev.specialNeedsStaff,
        // International Exposure
        exchangePrograms: Array.isArray(intl.exchangePrograms) ? intl.exchangePrograms.map(prog => ({
          partnercollege: prog.partnercollege ?? '',
          type: prog.type ?? prog.programType ?? '',
          duration: prog.duration ?? '',
          studentsParticipated: prog.studentsParticipated ?? '',
          activeSince: prog.activeSince ?? ''
        })) : prev.exchangePrograms,
        globalTieUps: Array.isArray(intl.globalTieUps) ? intl.globalTieUps.map(tie => ({
          partnerName: tie.partnerName ?? '',
          nature: tie.nature ?? tie.natureOfTieUp ?? '',
          activeSince: tie.activeSince ?? '',
          description: tie.description ?? ''
        })) : prev.globalTieUps,
      }));

      // Prefill complex UI-specific states
      setCustomAmenities(Array.isArray(amenities.customAmenities) ? amenities.customAmenities : []);
      setCustomActivities(Array.isArray(activities.customActivities) ? activities.customActivities : []);
      setFamousAlumnies(Array.isArray(alumniData.famousAlumnies) ? alumniData.famousAlumnies : []);
      setTopAlumnies(Array.isArray(alumniData.topAlumnis) ? alumniData.topAlumnis : []);
      setOtherAlumnies(Array.isArray(alumniData.alumnis) ? alumniData.alumnis : []);
      setFacultyQuality(Array.isArray(faculty.facultyMembers) ? faculty.facultyMembers.map(m => ({
        name: m.name || '',
        qualification: m.qualification || '',
        awards: Array.isArray(m.awards) ? m.awards.join(', ') : (m.awards || ''),
        experience: m.experience ?? ''
      })) : facultyQuality);
      setAdmissionSteps(Array.isArray(timeline.timelines) ? timeline.timelines : Array.isArray(timeline) ? timeline : []);
      
      // Load academic performance trends and exam qualifiers
      console.log('📚 Loading Academics from Backend:', {
        fullAcademics: academics
      });
      
      // academicResults and examQualifiers removed - not in backend schema

      toast.success("Loaded your existing college details. You can update and save.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load college details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen py-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
        >
          {isLoadingExistingData ? (
            <div className="text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading your college information...</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center mb-2 animate-fade-in">
                {hasExistingcollege ? '🏫 college Profile' : '🎓 college Registration Portal'}
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <p className="text-center text-gray-600 animate-fade-in-delay">
                  {hasExistingcollege 
                    ? 'Update your college profile information'
                    : 'Complete your college profile with our interactive presentation'
                  }
                </p>
              </div>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                  <strong>Debug:</strong> hasExistingcollege={String(hasExistingcollege)}, isEditMode={String(isEditMode)}, 
                  collegeId={editingcollegeId || 'none'}, formData.name={formData.name || 'empty'}
                </div>
              )}
            </>
          )}
          
          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  console.log('Slide indicator clicked:', section.id); // Debug log
                  scrollToSection(section.id);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 scale-125'
                    : 'bg-gray-300'
                }`}
                title={`Go to ${section.label}`}
              />
            ))}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Step {sectionIndex(activeSection) + 1} of {sections.length}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1 h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Interactive Stepper navigation */}
          <div className="sticky top-0 z-20 -mx-6 px-6 py-6 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sections.map(({ id, label, Icon }, index) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    console.log('Navigation clicked:', id); // Debug log
                    scrollToSection(id);
                  }}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-sm font-medium border-2 ${
                    activeSection === id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                      : "bg-white/80 text-gray-700 border-gray-200 shadow-md"
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    activeSection === id 
                      ? "bg-white/20" 
                      : "bg-gray-100"
                  }`}>
                    {Icon ? <Icon size={20} className={activeSection === id ? "text-white" : "text-gray-600"} /> : null}
                  </div>
                  <span className="font-semibold">{label}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    activeSection === id 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content area - All sections visible */}
          <div className="mt-8 space-y-12">
            <div className="block" id="basic">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    📋 Basic Information
                  </h2>
                  <p className="text-gray-600 mt-1">Essential details about your college</p>
                </div>
              </div>

             {/* college Identity */}
             <div className="mb-6 bg-white border rounded-lg p-4">
               <div className="flex items-start gap-4">
                 <div>
                   <div className="text-sm font-medium text-gray-800 mb-1">College Identity</div>
                   <div className="text-xs text-gray-500">Upload your College logo (PNG, JPG, JPEG). Max 5MB.</div>
                 </div>
               </div>
               <div className="mt-4 flex items-center gap-4">
                 <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                   {logoPreview ? (
                     <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                   ) : (
                     <span className="text-xs text-gray-400">Logo</span>
                   )}
                 </div>
                 <div>
                   <input id="logo-input" type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
                   <button type="button" onClick={() => document.getElementById("logo-input").click()} className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white">Upload Logo</button>
                   {logoFile && <div className="text-xs text-gray-500 mt-1">{logoFile.name}</div>}
                 </div>
               </div>
             </div>

             {/* Social Media Links */}
             <div className="mb-6 bg-white border rounded-lg p-4">
               <div className="text-sm font-medium text-gray-800 mb-2">Social Media Links</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                 <input
                   type="url"
                   placeholder="https://instagram.com/yourcollege"
                   value={socialLinks.instagramHandle}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, instagramHandle: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <input
                   type="url"
                   placeholder="https://twitter.com/yourcollege"
                   value={socialLinks.twitterHandle}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, twitterHandle: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <input
                   type="url"
                   placeholder="https://linkedin.com/company/yourcollege"
                   value={socialLinks.linkedinHandle}
                   onChange={(e) => setSocialLinks((p) => ({ ...p, linkedinHandle: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
               </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="College Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Phone Number"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  label="Latitude (GPS)"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Longitude (GPS)"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="h-10 mt-7 bg-indigo-600 text-white rounded-md px-4"
                >
                  Use Current Location
                </button>
              </div>
              <div className="md:col-span-2 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>GPS Location Required:</strong> Latitude and Longitude are mandatory for accurate distance calculation. 
                    This helps parents find colleges near their location. Click "Use Current Location" to automatically fill these fields.
                  </p>
                </div>
              </div>
              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
              
              <FormField 
              label="Established Year" 
              name="establishedYear" 
               
              value={formData.establishedYear} onChange={handleInputChange} 
              required 
              />
              <FormField 
  label="Ranking"
  name="rank"  // ← Change from "ranking" to "rank"
  type="number"
  value={formData.rank}  // ← Change from formData.ranking to formData.rank
  onChange={handleInputChange} 
  required 
/>
        <FormField
         label="Acceptance Rate" 
         name="acceptanceRate"
          value={formData.acceptanceRate}
           onChange={handleInputChange}
            required />
              <FormField
                label="Gender Type"
                name="genderType"
                type="select"
                options={["co-ed", "boys", "girls"]}
                value={formData.genderType}
                onChange={handleInputChange}
                required
              />
               <FormField
          label="College Mode"
          name="collegeMode"
          type="select"
          options={["convent", "private", "government"]}
          value={formData.collegeMode}
          onChange={handleInputChange}
          required
        />
        <div className="mb-6">
  <label className="block text-sm font-medium mb-3 text-gray-800">
    Streams Offered <span className="text-red-500">*</span>
  </label>

  {/* STREAM PILLS */}
  <div className="flex flex-wrap gap-2 mb-4">
    {[
      "Engineering",
      "Management",
      "Arts",
      "Science",
      "Law",
      "Medical",
      "Design",
      "Humanities"
    ].map((stream) => {
      const selected = Array.isArray(formData.streamsOffered)
        ? formData.streamsOffered.includes(stream)
        : false;

      return (
        <button
          key={stream}
          type="button"
          onClick={() => toggleStream(stream)}
          className={`px-4 py-1.5 rounded-full text-sm border transition
            ${
              selected
                ? "border-indigo-600 text-indigo-700 font-medium bg-indigo-50"
                : "border-gray-300 text-gray-700 bg-white hover:border-gray-400"
            }
          `}
        >
          {stream}
        </button>
      );
    })}
  </div>

  {/* CUSTOM STREAM INPUT */}
  <div className="flex gap-3 max-w-md">
    <input
      type="text"
      placeholder="Add custom stream..."
      className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
      value={customStream}
      onChange={(e) => setCustomStream(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addCustomStream(customStream);
          setCustomStream("");
        }
      }}
    />

    <button
      type="button"
      onClick={() => {
        addCustomStream(customStream);
        setCustomStream("");
      }}
      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      disabled={!customStream.trim()}
    >
      Add
    </button>
  </div>

  {/* SELECTED STREAMS PREVIEW */}
  {Array.isArray(formData.streamsOffered) &&
    formData.streamsOffered.length > 0 && (
      <p className="text-xs text-gray-600 mt-2">
        Selected: {formData.streamsOffered.join(", ")}
      </p>
    )}
</div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Shifts <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["morning", "afternoon", "night college","online"].map((shift) => (
                    <label key={shift} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shifts.includes(shift)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              shifts: [...prev.shifts, shift]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              shifts: prev.shifts.filter(s => s !== shift)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {shift === "night college" ? "Night college" : shift}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.shifts.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">Please select at least one shift</p>
                )}
              </div>
              
              <FormField
                label="Fee Range"
                name="feeRange"
                type="select"
                options={feeRangeOptions}
                value={formData.feeRange}
                onChange={handleInputChange}
                required
              />
             <FormField
                label="Teacher:Student Ratio (e.g., 1:20)"
                name="TeacherToStudentRatio"
                type="text"
                value={formData.TeacherToStudentRatio}
                onChange={handleInputChange}
              />
              <FormField
  label="Transport Available"
  name="transportAvailable"
  type="select"
  options={["yes","no"]}
  value={formData.transportAvailable}
  onChange={handleInputChange}
/>
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Language Medium <span className="text-red-500">*</span>
  </label>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {["English", "Hindi", "Marathi", "Other"].map((lang) => (
      <label key={lang} className="flex items-center gap-2">
        <input
          type="checkbox"
          value={lang}
          checked={formData.languageMedium.includes(lang)}
          onChange={(e) => {
            const checked = e.target.checked;

            setFormData((prev) => ({
              ...prev,
              languageMedium: checked
                ? [...prev.languageMedium, lang]
                : prev.languageMedium.filter((l) => l !== lang),
            }));
          }}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">{lang}</span>
      </label>
    ))}
  </div>

  {/* Validation message */}
  {formData.languageMedium.length === 0 && (
    <p className="text-xs text-red-600 mt-1">
      Please select at least one language medium
    </p>
  )}
</div>

<FormField
  label="Specialist (comma separated)"
  value={formData.specialist.join(",")}
  onChange={(e) =>
    setFormData(p => ({ ...p, specialist: e.target.value.split(",") }))
  }
/>

<FormField
  label="Tags (comma separated)"
  value={formData.tags.join(",")}
  onChange={(e) =>
    setFormData(p => ({ ...p, tags: e.target.value.split(",") }))
  }
/>

              <div className="md:col-span-2">
               <FormField
            label="College Information"
            name="collegeInfo"
            type="textarea"
            value={formData.collegeInfo}
            onChange={handleInputChange}
            required
          />
              </div>
            </div>
            <div className="block mt-10" id="courses">
  <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border shadow">
    <h3 className="text-xl font-semibold text-indigo-700">
      📚 Courses Offered
    </h3>
  </div>

  {courses.map((course, cIndex) => (
    <div
      key={cIndex}
      className="mb-10 bg-white border rounded-xl p-6 shadow"
    >
      {/* COURSE HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-indigo-600">
          Course {cIndex + 1}
        </h3>

        {courses.length > 1 && (
          <button
            type="button"
            onClick={() => removeCourse(cIndex)}
            className="text-sm text-red-600"
          >
            Remove Course
          </button>
        )}
      </div>

      {/* COURSE + EXAM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Course Name"
          value={course.courseName}
          onChange={(e) =>
            updateCourse(cIndex, "courseName", e.target.value)
          }
          required
        />

        <FormField
          label="Duration"
          value={course.duration}
          onChange={(e) =>
            updateCourse(cIndex, "duration", e.target.value)
          }
          required
        />

        

        <FormField
          label="Category"
          value={course.category}
          onChange={(e) =>
            updateCourse(cIndex, "category", e.target.value)
          }
          required
        />

        <FormField
          label="Student Strength"
          type="number"
          value={course.intake}
          onChange={(e) =>
            updateCourse(cIndex, "intake", e.target.value)
          }
          required
        />

      {/* EXAM ELIGIBILITY */}
<div className="md:col-span-2 mt-4">
  <h3 className="text-lg font-semibold text-indigo-700">
    📝 Exam Eligibility
  </h3>
</div>

{(course.exams || []).map((exam, eIndex) => (
  <React.Fragment key={eIndex}>
    <div className="md:col-span-2 flex justify-between items-center">
      <p className="text-sm font-medium text-indigo-600">
        Exam {eIndex + 1}
      </p>

      {course.exams.length > 1 && (
        <button
          type="button"
          onClick={() => removeExam(cIndex, eIndex)}
          className="text-xs text-red-600"
        >
          Remove
        </button>
      )}
    </div>

    {/* Exam Name */}
    <input
      className="border px-3 py-2 rounded"
      placeholder="Exam Name (JEE, CET, NEET...)"
      value={exam.examType}
      onChange={(e) =>
        updateExam(
          cIndex,
          eIndex,
          "examType",
          e.target.value
        )
      }
    />

    {/* Metric Type */}
    <select
      className="border px-3 py-2 rounded"
      value={exam.metricType}
      onChange={(e) =>
        updateExam(
          cIndex,
          eIndex,
          "metricType",
          e.target.value
        )
      }
    >
      <option value="Rank">Rank</option>
      <option value="Percentile">Percentile</option>
      <option value="Percentage">Percentage</option>
    </select>

    {/* Min Value */}
    <input
      className="border px-3 py-2 rounded"
      type="number"
      placeholder={`Min ${exam.metricType}`}
      value={exam.minValue}
      onChange={(e) =>
        updateExam(
          cIndex,
          eIndex,
          "minValue",
          e.target.value
        )
      }
    />

    {/* Max Value */}
    <input
      className="border px-3 py-2 rounded"
      type="number"
      placeholder={`Max ${exam.metricType}`}
      value={exam.maxValue}
      onChange={(e) =>
        updateExam(
          cIndex,
          eIndex,
          "maxValue",
          e.target.value
        )
      }
    />
  </React.Fragment>
))}

<div className="md:col-span-2">
  <button
    type="button"
    onClick={() => addExam(cIndex)}
    className="text-sm text-indigo-700"
  >
    + Add Another Exam
  </button>
</div>

        
      </div>

      {/* PLACEMENTS */}
      <div className="mt-10">
        <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border shadow">
          <h3 className="text-xl font-semibold text-indigo-700">
            🎓 Placement Details
          </h3>
        </div>

        {(course.placements || []).map((place, pIndex) => (
          <div
            key={pIndex}
            className="mb-8 bg-white border rounded-xl p-6 shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-600">
                Placement Year {pIndex + 1}
              </h3>

              {course.placements.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removePlacement(cIndex, pIndex)
                  }
                  className="text-sm text-red-600"
                >
                  Remove Placement Year
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Year"
                value={place.year}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "year",
                    e.target.value
                  )
                }
              />

              <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Total Students"
                value={place.totalStudents}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "totalStudents",
                    e.target.value
                  )
                }
              />

              <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Placed Students"
                value={place.placedStudents}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "placedStudents",
                    e.target.value
                  )
                }
              />

              <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Highest Package (LPA)"
                value={place.highestPackage}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "highestPackage",
                    e.target.value
                  )
                }
              />
               <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Minimum Package (LPA)"
                value={place.minimumPackage}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "minimumPackage",
                    e.target.value
                  )
                }
              />

              <input
                className="border px-3 py-2 rounded"
                type="number"
                placeholder="Average Package (LPA)"
                value={place.averagePackage}
                onChange={(e) =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "averagePackage",
                    e.target.value
                  )
                }
              />
            </div>

            <p className="mt-3 text-sm font-medium text-indigo-600">
              Placement % :{" "}
              {place.totalStudents && place.placedStudents
                ? Math.round(
                    (place.placedStudents /
                      place.totalStudents) *
                      100
                  ) + "%"
                : "0%"}
            </p>

            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2">
                Top Recruiters
              </h6>

              {(place.topRecruiters || []).map((rec, rIndex) => (
                <input
                  key={rIndex}
                  value={rec}
                  onChange={(e) => {
                    const updated = [
                      ...place.topRecruiters
                    ];
                    updated[rIndex] = e.target.value;
                    updatePlacement(
                      cIndex,
                      pIndex,
                      "topRecruiters",
                      updated
                    );
                  }}
                  className="border px-3 py-2 rounded mb-2 w-full"
                  placeholder="Recruiter Name"
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  updatePlacement(
                    cIndex,
                    pIndex,
                    "topRecruiters",
                    [...place.topRecruiters, ""]
                  )
                }
                className="text-sm text-indigo-600"
              >
                + Add Recruiter
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addPlacement(cIndex)}
          className="text-sm text-indigo-700"
        >
          + Add Placement Year
        </button>
      </div>
    </div>
  ))}

  <button
    type="button"
    onClick={addCourse}
    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
  >
    + Add Another Course
  </button>
</div>
<div className="block" id="hostels">
  {/* Header */}
  <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 shadow-lg">
    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
      <Home className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        🏠 Hostel Management
      </h2>
      <p className="text-gray-600 mt-1">
        Add, update, and manage hostel details
      </p>
    </div>
  </div>

  <div className="space-y-6">
    {hostels.map((hostel, index) => (
      <div
        key={hostel._id || index}
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            Hostel {index + 1}
            {hostel._isNew && (
              <span className="ml-2 text-xs text-indigo-600">
                (New)
              </span>
            )}
          </h3>

          <div className="flex gap-2">
            {!hostel._isNew && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("Delete this hostel?")) return;
                  try {
                    await deleteHostel(hostel._id);
                    setHostels(prev =>
                      prev.filter(h => h._id !== hostel._id)
                    );
                    toast.success("Hostel deleted");
                  } catch {
                    toast.error("Delete failed");
                  }
                }}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hostel Name */}
          <FormField
            label="Hostel Name *"
            value={hostel.hostelName ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].hostelName = e.target.value;
              setHostels(list);
            }}
          />

          {/* Type */}
          <FormField
            label="Type *"
            type="select"
            options={["Boys", "Girls", "Co-Ed"]}
            value={hostel.type ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].type = e.target.value;
              setHostels(list);
            }}
          />

          {/* Capacity */}
          <FormField
            label="Capacity *"
            type="number"
            value={hostel.capacity ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].capacity = Number(e.target.value);
              setHostels(list);
            }}
          />

          {/* Available Seats */}
          <FormField
            label="Available Seats *"
            type="number"
            value={hostel.availableSeats ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].availableSeats = Number(e.target.value);
              setHostels(list);
            }}
          />

          {/* Fee Per Year */}
          <FormField
            label="Fee Per Year *"
            type="number"
            value={hostel.feePerYear ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].feePerYear = Number(e.target.value);
              setHostels(list);
            }}
          />

          {/* Active */}
          <FormField
            label="Active"
            type="select"
            options={["true", "false"]}
            value={String(hostel.isActive ?? true)}
            onChange={(e) => {
              const list = [...hostels];
              list[index].isActive = e.target.value === "true";
              setHostels(list);
            }}
          />

          {/* Contact Name */}
          <FormField
            label="Contact Name"
            value={hostel.contactPerson?.name ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].contactPerson = {
                ...list[index].contactPerson,
                name: e.target.value
              };
              setHostels(list);
            }}
          />

          {/* Contact Phone */}
          <FormField
            label="Contact Phone"
            value={hostel.contactPerson?.phone ?? ""}
            onChange={(e) => {
              const list = [...hostels];
              list[index].contactPerson = {
                ...list[index].contactPerson,
                phone: e.target.value
              };
              setHostels(list);
            }}
          />

          {/* Rules */}
          <div className="md:col-span-2">
            <FormField
              label="Rules"
              value={hostel.rules ?? ""}
              onChange={(e) => {
                const list = [...hostels];
                list[index].rules = e.target.value;
                setHostels(list);
              }}
            />
          </div>

          {/* Facilities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Facilities (comma separated)
            </label>
            <input
              type="text"
              value={(hostel.facilities || []).join(", ")}
              onChange={(e) => {
                const list = [...hostels];
                list[index].facilities = e.target.value
                  .split(",")
                  .map(f => f.trim())
                  .filter(Boolean);
                setHostels(list);
              }}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={async () => {
              const h = hostels[index];

              // 🔐 Required field validation
              if (
                !h.hostelName ||
                !h.type ||
                !h.capacity ||
                !h.availableSeats ||
                !h.feePerYear
              ) {
                toast.error("Fill all required fields before saving");
                return;
              }

              const payload = {
                collegeId: selectedCollegeId,
                hostelName: h.hostelName,
                type: h.type,
                capacity: Number(h.capacity),
                availableSeats: Number(h.availableSeats),
                feePerYear: Number(h.feePerYear),
                facilities: h.facilities || [],
                rules: h.rules || "",
                contactPerson: h.contactPerson || { name: "", phone: "" },
                isActive: h.isActive !== false
              };

              try {
                // 🆕 CREATE
                if (h._isNew) {
                  const res = await addHostel(payload);
                  

const savedHostel = res?.data?.data || res?.data;

const list = [...hostels];
list[index] = savedHostel; // now real hostel object with _id
setHostels(list);

                  toast.success("Hostel added successfully");
                }
                // ✏️ UPDATE
                else {
                  await updateHostel(h._id, payload);
                  toast.success("Hostel updated");
                }
              } catch (err) {
                toast.error(
                  err?.response?.data?.message || "Failed to save hostel"
                );
              }
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* ADD HOSTEL — NO API CALL HERE */}
  <button
    type="button"
    onClick={() => {
      setHostels(prev => [
        ...prev,
        {
          hostelName: "",
          type: "",
          capacity: "",
          availableSeats: "",
          feePerYear: "",
          facilities: [],
          rules: "",
          contactPerson: { name: "", phone: "" },
          isActive: true,
          _isNew: true
        }
      ]);
    }}
    className="mt-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border"
  >
    <PlusCircle size={16} /> Add Hostel
  </button>
</div>




            <div className="block" id="amenities">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ✨ Amenities & Activities
                  </h2>
                  <p className="text-gray-600 mt-1">Facilities and programs offered</p>
                </div>
              </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <FormField
                  label="Amenities"
                  name="predefinedAmenities"
                  type="checkboxGroup"
                  options={amenitiesOptions}
                  value={formData.predefinedAmenities}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div>
                <DynamicAmenitiesField
                  label="Other Amenities"
                  value={customAmenities}
                  onChange={setCustomAmenities}
                />
              </div>
              <div>
                <FormField
                  label="Activities"
                  name="activities"
                  type="checkboxGroup"
                  options={activitiesOptions}
                  value={formData.activities}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div>
                <DynamicActivitiesField
                  label="Other Activities"
                  value={customActivities}
                  onChange={setCustomActivities}
                />
              </div>
            </div>

            <div className="block" id="alumni">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    🏆 Alumni Information
                  </h2>
                  <p className="text-gray-600 mt-1">Notable graduates and achievements</p>
                </div>
              </div>
            <div className="space-y-8">
              <DynamicListField
                label="Famous Alumni (Name & Profession)"
                value={famousAlumnies}
                onChange={setFamousAlumnies}
                type="famous"
              />
              <DynamicListField
                label="Top Alumni (Name & Percentage)"
                value={topAlumnies}
                onChange={setTopAlumnies}
                type="top"
              />
              <DynamicListField
                label="Other Alumni (Name & Percentage)"
                value={otherAlumnies}
                onChange={setOtherAlumnies}
                type="other"
              />
            </div>

            <div className="block" id="faculty">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    👥 Faculty Quality
                  </h2>
                  <p className="text-gray-600 mt-1">Teaching staff qualifications and experience</p>
                </div>
              </div>
          {/* Simplified Faculty Quality inputs handled per-entry below */}

          <div className="mt-6">
            {facultyQuality.map((fq, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-md my-2">
                <FormField
                  label="Faculty Name"
                  name={`fq-name-${index}`}
                  value={fq.name || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], name: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Qualification"
                  name={`fq-qualification-${index}`}
                  value={fq.qualification || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], qualification: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Awards"
                  name={`fq-awards-${index}`}
                  value={fq.awards || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], awards: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <FormField
                  label="Teaching experience (yrs)"
                  name={`fq-exp-${index}`}
                  type="number"
                  value={fq.experience || ''}
                  onChange={(e) => {
                    const list = facultyQuality.slice();
                    list[index] = { ...list[index], experience: e.target.value };
                    setFacultyQuality(list);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFacultyQuality(facultyQuality.filter((_, i) => i !== index))}
                  className="text-red-500 mb-2"
                  aria-label={`Remove faculty row ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFacultyQuality([...facultyQuality, { name: '', qualification: '', awards: '', experience: '' }])}
              className="mt-2 flex items-center text-sm text-indigo-600"
            >
              <PlusCircle size={16} className="mr-1" /> Add Faculty
            </button>
          </div>
            </div>

            <div className="block" id="infrastructure">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    🏢 Infrastructure
                  </h2>
                  <p className="text-gray-600 mt-1">Facilities, labs, and physical resources</p>
                </div>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Labs - Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[ "Computer Lab",
      "Science Lab",
      "Research Lab",
      "Language Lab",
      "Innovation Lab",
      "Skill Development Lab",
      "Simulation Lab",
      "Digital Lab",
      "Analytics Lab",
      "Practical Training Lab",
      "Workshop",
      "Multimedia Lab"].map(opt => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      name="infraLabTypes"
                      value={opt}
                      checked={(formData.infraLabTypes || []).includes(opt)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        const current = formData.infraLabTypes || [];
                        const next = checked ? [...current, value] : current.filter(v => v !== value);
                        setFormData(prev => ({ ...prev, infraLabTypes: next }));
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <FormField
              label="Library - number of books"
              name="infraLibraryBooks"
              type="number"
              value={formData.infraLibraryBooks}
              onChange={handleInputChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Sports Grounds - Type</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {['Football','Cricket','Basketball','Tennis','Athletics','Badminton'].map(opt => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="checkbox"
                      name="infraSportsTypes"
                      value={opt}
                      checked={(formData.infraSportsTypes || []).includes(opt)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        const current = formData.infraSportsTypes || [];
                        const next = checked ? [...current, value] : current.filter(v => v !== value);
                        setFormData(prev => ({ ...prev, infraSportsTypes: next }));
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <FormField
              label="Smart Classrooms - number"
              name="infraSmartClassrooms"
              type="number"
              value={formData.infraSmartClassrooms}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Labs</div>
              <div className="text-lg font-semibold text-gray-900">{(formData.infraLabTypes || []).join(', ') || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Books</div>
              <div className="text-lg font-semibold text-gray-900">{formData.infraLibraryBooks || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Sports</div>
              <div className="text-lg font-semibold text-gray-900">{(formData.infraSportsTypes || []).join(', ') || '—'}</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">Smart Rooms</div>
              <div className="text-lg font-semibold text-gray-900">{formData.infraSmartClassrooms || '—'}</div>
            </div>
          </div>
            </div>

            <div className="block" id="safety">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    🛡️ Safety & Security
                  </h2>
                  <p className="text-gray-600 mt-1">Security measures and safety protocols</p>
                </div>
              </div>
          
          <div className="space-y-8">
            {/* CCTV Coverage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">CCTV Coverage</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCTV Coverage Percentage
                </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                  value={formData.cctvCoveragePercentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, cctvCoveragePercentage: e.target.value }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-indigo-600">{formData.cctvCoveragePercentage || 0}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Medical Facility */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Facility</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Availability
                  </label>
              <select
                    value={formData.medicalFacility?.doctorAvailability || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      medicalFacility: {
                        ...prev.medicalFacility,
                        doctorAvailability: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="On-call">On-call</option>
                    <option value="Not Available">Not Available</option>
              </select>
            </div>

                <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                      checked={formData.medicalFacility?.medkitAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalFacility: {
                          ...prev.medicalFacility,
                          medkitAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Medkit Available</span>
                </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                <input
                      type="checkbox"
                      checked={formData.medicalFacility?.ambulanceAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalFacility: {
                          ...prev.medicalFacility,
                          ambulanceAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Ambulance Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Transport Safety */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport Safety</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transportSafety?.gpsTrackerAvailable || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportSafety: {
                          ...prev.transportSafety,
                          gpsTrackerAvailable: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">GPS Tracker Available</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.transportSafety?.driversVerified || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportSafety: {
                          ...prev.transportSafety,
                          driversVerified: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Drivers Verified</span>
                  </label>
                </div>
                  </div>
            </div>

            {/* Fire Safety Measures */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fire Safety Measures</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Extinguishers', 'Alarms', 'Sprinklers', 'Evacuation Drills'].map((measure) => (
                  <label key={measure} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                      checked={(formData.fireSafetyMeasures || []).includes(measure)}
                      onChange={(e) => {
                        const current = formData.fireSafetyMeasures || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, fireSafetyMeasures: [...current, measure] }));
                        } else {
                          setFormData(prev => ({ ...prev, fireSafetyMeasures: current.filter(m => m !== measure) }));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{measure}</span>
                        </label>
                    ))}
            </div>
          </div>

            {/* Visitor Management System */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Visitor Management</h3>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visitorManagementSystem || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitorManagementSystem: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Visitor Management System Available</span>
                </label>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="fees">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    💰 Fees & Affordability
                  </h2>
                  <p className="text-gray-600 mt-1">Pricing structure and scholarship options</p>
                </div>
              </div>
          
          {/* Fee Transparency Indicator */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Transparency Indicator</label>
            <div className="flex items-center gap-4">
             <select
  name="feesTransparency"
  value={formData.feesTransparency}
  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      feesTransparency: Number(e.target.value)
    }))
  }
  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
>
  <option value={100}>🟢 Fully Transparent</option>
  <option value={50}>🟡 Partial Transparency</option>
  <option value={0}>🔴 Low Transparency</option>
</select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.feesTransparency === 'full' ? 'bg-green-100 text-green-800' :
                  formData.feesTransparency === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.feesTransparency === 100? 'Fully Transparent' :
                   formData.feesTransparency === 50 ? 'Partial' : 'Low Transparency'}
                </span>
              </div>
            </div>
          </div>

          {/* Class-wise Fees Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Class-wise Fees Table</h3>
              <button
                type="button"
                onClick={() => {
                  const newFees = [...(formData.classFees || []), { className: '', tuition: '', activity: '', transport: '', hostel: '', misc: '' }];
                  setFormData(prev => ({ ...prev, classFees: newFees }));
                }}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Class
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Duration
</th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">💰 Tuition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🎭 Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🚌 Transport</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🏫 Hostel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🏷️ Misc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(formData.classFees || []).map((fee, index) => (
                    <tr key={index} className="">
                      <td className="px-4 py-3">
                    <select
  value={fee.courseId || ""}
  onChange={(e) =>
    handleFeeChange(index, "courseId", e.target.value)
  }
>
  <option value="">Select Course</option>

  {courses.map((course) => (
    <option key={course._id} value={course._id}>
      {course.courseName}
    </option>
  ))}
</select>



                      </td>
                      <td className="px-4 py-3">
  <input
    type="text"
    value={fee.courseDuration || ''}
    onChange={(e) => {
      const newFees = [...(formData.classFees || [])];
      newFees[index].courseDuration = e.target.value;
      setFormData(prev => ({ ...prev, classFees: newFees }));
    }}
    placeholder="e.g. 1 Year"
    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
  />
</td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.tuition || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], tuition: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.activity || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], activity: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.transport || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], transport: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.hostel || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], hostel: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={fee.misc || ''}
                          onChange={(e) => {
                            const newFees = [...(formData.classFees || [])];
                            newFees[index] = { ...newFees[index], misc: e.target.value };
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {(() => {
                          const tuition = Number(fee.tuition || 0);
                          const activity = Number(fee.activity || 0);
                          const transport = Number(fee.transport || 0);
                          const hostel = Number(fee.hostel || 0);
                          const misc = Number(fee.misc || 0);
                          return tuition + activity + transport + hostel + misc;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newFees = (formData.classFees || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, classFees: newFees }));
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scholarships / Concessions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Scholarships / Concessions</h3>
              <button
                type="button"
                onClick={() => {
                  const newScholarships = [...(formData.scholarships || []), { name: '', type: '', amount: '', documentsRequired: [] }];
                  setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                }}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Scholarship
              </button>
            </div>
            
            <div className="space-y-4">
              {(formData.scholarships || []).map((scholarship, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name *</label>
                      <input
                        type="text"
                        value={scholarship.name || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], name: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., Merit Scholarship, Sports Excellence Award"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={scholarship.type || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], type: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                       <option value="">Select type</option>
<option value="Merit">Merit</option>
<option value="Socio-economic">Socio-economic</option>
<option value="Cultural">Cultural</option>
<option value="Sports">Sports</option>
<option value="Community">Community</option>
<option value="Academic Excellence">Academic Excellence</option>
<option value="Other">Other</option>

                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        value={scholarship.amount || ''}
                        onChange={(e) => {
                          const newScholarships = [...(formData.scholarships || [])];
                          newScholarships[index] = { ...newScholarships[index], amount: e.target.value };
                          setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                        }}
                        placeholder="e.g., 5000, 10000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                   <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Documents Required (Optional)
  </label>

  <select
    value={scholarship.documentsRequired?.[0] || ''}
    onChange={(e) => {
      const value = e.target.value;

      const newScholarships = [...(formData.scholarships || [])];
      newScholarships[index] = {
        ...newScholarships[index],
        documentsRequired: value ? [value] : []
      };

      setFormData(prev => ({
        ...prev,
        scholarships: newScholarships
      }));
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
               focus:ring-indigo-500 focus:border-indigo-500"
  >
    <option value="Income Certificate">Income Certificate</option>
<option value="Caste Certificate">Caste Certificate</option>
<option value="Aadhar Card">Aadhar Card</option>
<option value="Previous Marksheet">Previous Marksheet</option>
<option value="Bonafide Certificate">Bonafide Certificate</option>
<option value="Sports Achievement Certificate">Sports Achievement Certificate</option>
<option value="Domicile Certificate">Domicile Certificate</option>
<option value="Other">Other</option>

  </select>
</div>

                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newScholarships = (formData.scholarships || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, scholarships: newScholarships }));
                      }}
                      className="text-red-500 text-sm"
                    >
                      <Trash2 size={16} className="inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fees Visualization */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Visualization: Fee Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Transparency</div>
                <div className={`text-lg font-semibold ${
                  formData.feesTransparency === 'full' ? 'text-green-600' :
                  formData.feesTransparency === 'partial' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formData.feesTransparency === 'full' ? '🟢 Full' :
                   formData.feesTransparency === 'partial' ? '🟡 Partial' : '🔴 Low'}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Classes</div>
                <div className="text-lg font-semibold text-gray-900">{(formData.classFees || []).length}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm">Scholarships</div>
                <div className="text-lg font-semibold text-gray-900">{(formData.scholarships || []).length}</div>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="technology">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    💻 Technology Adoption
                  </h2>
                  <p className="text-gray-600 mt-1">Smart classrooms and digital infrastructure</p>
                </div>
              </div>
          <div className="space-y-8">
            {/* Smart Classrooms Percentage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Classrooms</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smart Classrooms Percentage
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.smartClassroomsPercentage || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartClassroomsPercentage: e.target.value }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-indigo-600">{formData.smartClassroomsPercentage || 0}%</span>
                  <span>100%</span>
          </div>
                <p className="text-xs text-gray-500 mt-2">
                  Percentage of classrooms equipped with smart technology (interactive boards, projectors, etc.)
                </p>
              </div>
            </div>

            {/* E-Learning Platforms */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">E-Learning Platforms</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available E-Learning Platforms
                </label>
                <div className="space-y-3">
                  {(formData.eLearningPlatforms || []).map((platform, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => {
                          const next = [...(formData.eLearningPlatforms || [])];
                          next[index] = e.target.value;
                          setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                        }}
                        placeholder="Platform name (e.g., Google Classroom, Zoom, Microsoft Teams)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(formData.eLearningPlatforms || [])];
                          next.splice(index, 1);
                          setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
          </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(formData.eLearningPlatforms || []), ''];
                      setFormData(prev => ({ ...prev, eLearningPlatforms: next }));
                    }}
                    className="flex items-center text-sm text-indigo-600"
                  >
                    <PlusCircle size={16} className="mr-1" /> Add Platform
                  </button>
            </div>
                <p className="text-xs text-gray-500 mt-2">
                  List all e-learning platforms used by the college (LMS, video conferencing, etc.)
                </p>
              </div>
            </div>

            {/* Technology Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
                <div className="text-indigo-600 text-sm font-medium mb-2">Smart Classrooms</div>
                <div className="text-3xl font-bold text-indigo-700">{formData.smartClassroomsPercentage || 0}%</div>
                <div className="text-xs text-indigo-600 mt-1">of classrooms are smart-enabled</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-sm font-medium mb-2">E-Learning Platforms</div>
                <div className="text-3xl font-bold text-green-700">{formData.eLearningPlatforms?.length || 0}</div>
                <div className="text-xs text-green-600 mt-1">platforms in use</div>
              </div>
            </div>
          </div>
            </div>

            <div className="block" id="academics">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200/50 shadow-lg">
               
               
              </div>

          


          {/* Board Results and Exam Qualifiers removed - not in backend schema */}
            </div>

            <div className="block" id="international">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    🌍 International Exposure
                  </h2>
                  <p className="text-gray-600 mt-1">Global programs and partnerships</p>
                </div>
              </div>

          {/* Exchange Programs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Exchange Programs</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  exchangePrograms: [...(prev.exchangePrograms || []), { partnercollege: '', type: '', duration: '', studentsParticipated: '', activeSince: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Program
              </button>
            </div>
            <div className="space-y-3">
              {(formData.exchangePrograms || []).map((prog, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Partner college"
                    name={`ex-partner-${index}`}
                    value={prog.partnercollege}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], partnercollege: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Type"
                    name={`ex-type-${index}`}
                    type="select"
                    options={['Student Exchange', 'Faculty Exchange', 'Summer Program', 'Joint Research', 'Cultural Exchange']}
                    value={prog.type}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], type: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Duration"
                    name={`ex-duration-${index}`}
                    type="select"
                    options={['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year']}
                    value={prog.duration}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], duration: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <FormField
                    label="Students"
                    name={`ex-students-${index}`}
                    type="number"
                    value={prog.studentsParticipated}
                    onChange={(e) => {
                      const list = [...(formData.exchangePrograms || [])];
                      list[index] = { ...list[index], studentsParticipated: e.target.value };
                      setFormData(prev => ({ ...prev, exchangePrograms: list }));
                    }}
                  />
                  <div className="flex items-end gap-2">
                    <FormField
                      label="Active Since"
                      name={`ex-active-${index}`}
                      value={prog.activeSince}
                      onChange={(e) => {
                        const list = [...(formData.exchangePrograms || [])];
                        list[index] = { ...list[index], activeSince: e.target.value };
                        setFormData(prev => ({ ...prev, exchangePrograms: list }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, exchangePrograms: (prev.exchangePrograms || []).filter((_, i) => i !== index) }))}
                      className="text-red-500 mb-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Tie-ups */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Global Tie-ups</h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  globalTieUps: [...(prev.globalTieUps || []), { partnerName: '', nature: '', activeSince: '', description: '' }]
                }))}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Tie-up
              </button>
            </div>
            <div className="space-y-3">
              {(formData.globalTieUps || []).map((tie, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-md">
                  <FormField
                    label="Partner Name"
                    name={`gt-name-${index}`}
                    value={tie.partnerName}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], partnerName: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <FormField
                    label="Nature"
                    name={`gt-nature-${index}`}
                    type="select"
                    options={['Memorandum of Understanding (MoU)', 'Research Collaboration', 'Curriculum Development', 'Faculty Training']}
                    value={tie.nature}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], nature: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <FormField
                    label="Active Since"
                    name={`gt-active-${index}`}
                    value={tie.activeSince}
                    onChange={(e) => {
                      const list = [...(formData.globalTieUps || [])];
                      list[index] = { ...list[index], activeSince: e.target.value };
                      setFormData(prev => ({ ...prev, globalTieUps: list }));
                    }}
                  />
                  <div className="md:col-span-2 grid grid-cols-1 items-end gap-2">
                    <FormField
                      label="Description"
                      name={`gt-desc-${index}`}
                      value={tie.description}
                      onChange={(e) => {
                        const list = [...(formData.globalTieUps || [])];
                        list[index] = { ...list[index], description: e.target.value };
                        setFormData(prev => ({ ...prev, globalTieUps: list }));
                      }}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, globalTieUps: (prev.globalTieUps || []).filter((_, i) => i !== index) }))}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </div>

            <div className="block" id="diversity">
              <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200/50 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    ♡ Diversity & Inclusivity
                  </h2>
                  <p className="text-gray-600 mt-1">Inclusive policies and support systems</p>
                </div>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Gender Ratio - Male (%)"
              name="genderRatioMale"
              type="number"
              value={formData.genderRatioMale}
              onChange={handleInputChange}
            />
            <FormField
              label="Gender Ratio - Female (%)"
              name="genderRatioFemale"
              type="number"
              value={formData.genderRatioFemale}
              onChange={handleInputChange}
            />
            <FormField
              label="Gender Ratio - Others (%)"
              name="genderRatioOthers"
              type="number"
              value={formData.genderRatioOthers}
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Scholarship Diversity Types</label>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence'].map(opt => (
                  <label key={opt} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="scholarshipDiversityTypes"
                    value={opt}
                    checked={(formData.scholarshipDiversityTypes || []).includes(opt)}
                    onChange={handleCheckboxChange}
                      className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                    <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                </label>
              ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">Scholarship Coverage (%)</label>
              <input
              type="number"
                name="scholarshipDiversityCoverage"
              value={formData.scholarshipDiversityCoverage}
              onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                placeholder="Enter coverage percentage"
            />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">Special Needs Support</label>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <label className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="specialNeedsStaff"
                    checked={formData.specialNeedsStaff}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialNeedsStaff: e.target.checked }))}
                    className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Dedicated Staff Available</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Students Supported (%)
                  </label>
                  <input
                  type="number"
                    name="specialNeedsSupportPercentage"
                  value={formData.specialNeedsSupportPercentage}
                  onChange={handleInputChange}
                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Facilities Available</label>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                    {['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices'].map(opt => (
                  <label key={opt} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          name="specialNeedsFacilities"
                          value={opt}
                          checked={(formData.specialNeedsFacilities || []).includes(opt)}
                          onChange={handleCheckboxChange}
                      className="h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                    <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                      </label>
                    ))}
              </div>
            </div>
          </div>
            </div>

           <div className="block" id="admission">
  {/* HEADER */}
  <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/50 shadow-lg">
    <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl shadow-lg">
      <CalendarDays className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
        📅 Admission Process Timeline
      </h2>
      <p className="text-gray-600 mt-1">
        Define admission timelines with dates, eligibility, and required documents
      </p>
    </div>
  </div>

  <div className="space-y-6">
    {admissionSteps.map((timeline, index) => (
      <div
        key={index}
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Timeline Entry {index + 1}
          </h3>
          <button
            type="button"
            onClick={() => {
              const next = admissionSteps.filter((_, i) => i !== index);
              setAdmissionSteps(next);
            }}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label={`Remove timeline ${index + 1}`}
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Admission Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={timeline.admissionStartDate || ""}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].admissionStartDate = e.target.value;
                setAdmissionSteps(next);
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Admission End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={timeline.admissionEndDate || ""}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].admissionEndDate = e.target.value;
                setAdmissionSteps(next);
              }}
              min={
                timeline.admissionStartDate ||
                new Date().toISOString().split("T")[0]
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={timeline.status || ""}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].status = e.target.value;
                setAdmissionSteps(next);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Ended">Ended</option>
              <option value="Starting Soon">Starting Soon</option>
            </select>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
  value={timeline.courseId || ""}
 onChange={(e) => {
  const next = [...admissionSteps];
  next[index] = {
    ...next[index],
    courseId: e.target.value
  };
  setAdmissionSteps(next);
}}

  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
>
  <option value="">Select Course</option>

 {Array.isArray(courses) &&
  courses.map((course, i) => {
    const label =
      course.courseName ||
      course.title ||
      course.course ||
      course.name ||
      course.program ||
      "Unnamed Course";

    return (
      <option key={course._id || i} value={course._id}>
        {label}
      </option>
    );
  })}
</select>

          </div>

          {/* Application Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Fee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={timeline.applicationFee ?? 0}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].applicationFee = Number(e.target.value) || 0;
                setAdmissionSteps(next);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Minimum Qualification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Qualification
            </label>
            <select
              value={timeline.eligibility?.minQualification || ""}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].eligibility = {
                  ...next[index].eligibility,
                  minQualification: e.target.value
                };
                setAdmissionSteps(next);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Qualification</option>
              <option value="SSC Passed">SSC Passed</option>
              <option value="HSC Passed">HSC Passed</option>
              <option value="Dipoma Passed">Dipoma Passed</option>
              <option value="Under-Graduate">Under-Graduate</option>
              <option value="Post-Graduate">Post-Graduate</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="Phd">Phd</option>
            </select>
          </div>

          {/* Other Eligibility Info */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Eligibility Information
            </label>
            <textarea
              placeholder="Any other eligibility information..."
              value={timeline.eligibility?.otherInfo || ""}
              onChange={(e) => {
                const next = [...admissionSteps];
                next[index].eligibility = {
                  ...next[index].eligibility,
                  otherInfo: e.target.value
                };
                setAdmissionSteps(next);
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Documents Required */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents Required
            </label>
            <div className="space-y-2">
              {(timeline.documentsRequired || []).map((doc, docIndex) => (
                <div key={docIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => {
                      const next = [...admissionSteps];
                      const nextDocs = [
                        ...(next[index].documentsRequired || [])
                      ];
                      nextDocs[docIndex] = e.target.value;
                      next[index].documentsRequired = nextDocs;
                      setAdmissionSteps(next);
                    }}
                    placeholder="Document name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...admissionSteps];
                      const nextDocs = [
                        ...(next[index].documentsRequired || [])
                      ];
                      nextDocs.splice(docIndex, 1);
                      next[index].documentsRequired = nextDocs;
                      setAdmissionSteps(next);
                    }}
                    className="text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const next = [...admissionSteps];
                  const nextDocs = [
                    ...(next[index].documentsRequired || []),
                    ""
                  ];
                  next[index].documentsRequired = nextDocs;
                  setAdmissionSteps(next);
                }}
                className="flex items-center text-sm text-indigo-600"
              >
                <PlusCircle size={16} className="mr-1" /> Add Document
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}

    {/* Add Timeline Entry */}
    <button
      type="button"
      onClick={() =>
        setAdmissionSteps([
          ...admissionSteps,
          {
            admissionStartDate: "",
            admissionEndDate: "",
            status: "",
            courseId: "",
            documentsRequired: [],
            applicationFee: 0,
            eligibility: {
              minQualification: "",
              otherInfo: ""
            }
          }
        ])
      }
      className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200"
    >
      <PlusCircle size={16} className="mr-2" /> Add Timeline Entry
    </button>
  </div>
</div>



               

            <div className="block" id="media">
  <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50 shadow-lg">
    <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg">
      <Image className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        📸 Media
      </h2>
      <p className="text-gray-600 mt-1">Photos and videos showcasing your college</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Photos Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Upload Photos (4–5 recommended, max 5)
      </label>

      {/* Hidden Input */}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={photoInputRef}
        onChange={handlePhotoChange}
        className="hidden"
      />

      {/* Button */}
      <button
        type="button"
        onClick={() => photoInputRef.current.click()}
        className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
      >
        Choose Photos
      </button>

      {selectedPhotos?.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedPhotos.length} selected
        </div>
      )}
    </div>

    {/* Video Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Upload Video (max 20MB)
      </label>

      {/* Hidden Input */}
      <input
        type="file"
        accept="video/*"
        ref={videoInputRef}
        onChange={handleVideoChange}
        className="hidden"
      />

      {/* Button */}
      <button
        type="button"
        onClick={() => videoInputRef.current.click()}
        className="mt-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition"
      >
        Choose Video
      </button>

      {selectedVideo && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedVideo.name}
        </div>
      )}
    </div>

  </div>
</div>

          </div>

          <div className="sticky bottom-0 -mx-6 px-6 py-6 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={saveDraft} 
                className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold text-gray-700"
              >
                💾 Save Draft
              </button>
              <button 
                type="button" 
                onClick={clearDraft} 
                className="px-4 py-3 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-semibold text-red-700"
              >
                🗑️ Clear Draft
              </button>
              <button 
                type="button" 
                disabled={isFirst} 
                onClick={goPrev} 
                className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isFirst 
                    ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' 
                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 hover:shadow-lg'
                }`}
              >
                ← Previous Slide
              </button>
              {!isLast ? (
                <button 
                  type="button" 
                  onClick={goNext} 
                  className="flex-1 px-6 py-4 font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                >
                  Next Slide →
                </button>
              ) : (
                <button
                  type="submit"
                  className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-[1.01]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {hasExistingcollege ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    hasExistingcollege ? 'Update college Profile' : 'Submit Registration'
                  )}
                </button>
              )}
            </div>
          </div>
          </div>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
