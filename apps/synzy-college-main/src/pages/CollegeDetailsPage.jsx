// src/pages/collegeDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getActivitiesByCollegeId, getcollegeById, getAmenitiesByCollegeId, getAdmissionTimelineById, getSafetyAndSecurityById, getInternationalExposureById, getFacultyById, getOtherDetailsById, getInfrastructureById, getCoursesByCollege, getCourseFeesByCollege, getHostelsByCollege, getPlacementsByCollege, getCollegeExams, getScholarshipsByCollege } from "../api/adminService";

import { toast } from "react-toastify";
import { validatecollegeId, handleInvalidcollegeId } from "../utils/objectIdUtils";
import {
  MapPin,
  BookOpen,
  Users,
  Heart,
  Building,
  Award,
  Sun,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X,
  Check
} from "lucide-react";
import ReviewSection_fixed from "../components/ReviewSection_fixed";
import { getAlumniBycollege } from "../api/collegeService";
import SEO from "../components/SEO";

import {
  CollegePhotosVideos,
  CollegeCourses,
  CollegeCourseFees,
  CollegeScholarships,
  CollegeHostels,
  CollegePlacements,
  CollegeExams,
  CollegeFaculty,
  CollegeSafety,
  CollegeInternationalExposure,
  CollegeDiversity,
  CollegeAdmissionTimeline,
  CollegeOverview,
  CollegeAmenities,
  CollegeActivities,
  CollegeInfrastructure
} from "../components/college/CollegeSections";


const InfoBox = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center text-gray-500 mb-1">
      {icon}
      <h3 className="text-sm font-medium ml-2">{label}</h3>
    </div>
    <p className="text-lg font-semibold text-gray-800">
      {Array.isArray(value) ? value.join(", ") : value || "N/A"}
    </p>
  </div>
);

const CollegeDetailsPage = ({ shortlist, onShortlistToggle }) => {
  const navigate = useNavigate();
  const { id: collegeId } = useParams();
  const { user: currentUser } = useAuth();

  const [college, setcollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [infrastructure, setInfrastructure] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseFees, setCourseFees] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [exams, setExams] = useState([]);
  const [otherDetails, setOtherDetails] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [alumni, setAlumni] = useState(null);
  const [admissionTimeline, setAdmissionTimeline] = useState(null);
  const [safetyAndSecurity, setSafetyAndSecurity] = useState(null);
  const [internationalExposure, setInternationalExposure] = useState(null);

  const handleCompare = () => {
    if (!college?._id) return;
    // seed comparison list with current college for convenience
    try {
      const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
      const exists = saved.some((s) => (s.collegeId || s._id) === (college._id));
      const toSave = exists ? saved : [...saved, { ...college, collegeId: college._id }];
      localStorage.setItem('comparisonList', JSON.stringify(toSave));
      window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: toSave }));
    } catch (_) {}
    navigate('/compare/select');
  };

  useEffect(() => {
    if (!collegeId) return;

    // Validate collegeId format
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // If collegeId is not a valid ObjectId, show error
    if (!isValidObjectId(collegeId)) {
      console.error(`Invalid college ID format: ${collegeId}. Expected MongoDB ObjectId format.`);
      toast.error("Invalid college ID format. Please check the URL.");
      navigate("/colleges");
      return;
    }

    const fetchcollegeDetails = async () => {
      try {
        setLoading(true);
        const response = await getcollegeById(collegeId);
        const collegeData = response?.data?.data || response?.data;

        if (collegeData) {
          // Backend getCollegeByIdService returns { college: {...}, courseCount, etc. }
          setcollege(collegeData.college || collegeData);
        } else {
          console.warn(`No college data returned for ID: ${collegeId}`);
          toast.error("college not found.");
          navigate("/colleges");
        }
      } catch (error) {
        toast.error("Could not load college details.");
        console.error("Fetch college Error:", error);
        navigate("/colleges");
      } finally {
        setLoading(false);
      }
    };

    const fetchAmenitiesAndActivities = async () => {
      try {
        const [amenitiesRes, activitiesRes] = await Promise.allSettled([
          getAmenitiesByCollegeId(collegeId).catch(() => ({ data: null })),
          getActivitiesByCollegeId(collegeId).catch(() => ({ data: null })),
        ]);
        
        console.log("Amenities Response:", amenitiesRes?.value?.data);
        console.log("Activities Response:", activitiesRes?.value?.data);
        
        // Extract amenities from predefinedAmenities and customAmenities
        const amenitiesData = amenitiesRes?.value?.data?.data || amenitiesRes?.value?.data;
        const allAmenities = [
          ...(amenitiesData?.predefinedAmenities || []),
          ...(amenitiesData?.customAmenities || [])
        ];
        
        // Extract activities from activities and customActivities
        const activitiesData = activitiesRes?.value?.data?.data || activitiesRes?.value?.data;
        const allActivities = [
          ...(activitiesData?.activities || []),
          ...(activitiesData?.customActivities || [])
        ];
        
        setAmenities(allAmenities);
        setActivities(allActivities);
      } catch (e) {
        console.error("Error fetching amenities and activities:", e);
        setAmenities([]);
        setActivities([]);
      }
    };

    const fetchAdditionalDetails = async () => {
      try {
        const [
          infrastructureRes,
          coursesRes,
          courseFeesRes,
          hostelsRes,
          placementsRes,
          examsRes,
          scholarshipsRes,
          facultyRes,
          otherDetailsRes,
          admissionRes,
          safetyRes,
          internationalRes,
          alumniRes
        ] = await Promise.allSettled([
          getInfrastructureById(collegeId).catch(() => ({ data: null })),
          getCoursesByCollege(collegeId).catch(() => ({ data: null })),
          getCourseFeesByCollege(collegeId).catch(() => ({ data: null })),
          getHostelsByCollege(collegeId).catch(() => ({ data: null })),
          getPlacementsByCollege(collegeId).catch(() => ({ data: null })),
          getCollegeExams(collegeId).catch(() => ({ data: null })),
          getScholarshipsByCollege(collegeId).catch(() => ({ data: null })),
          getFacultyById(collegeId).catch(() => ({ data: null })),
          getOtherDetailsById(collegeId).catch(() => ({ data: null })),
          getAdmissionTimelineById(collegeId).catch(() => ({ data: null })),
          getSafetyAndSecurityById(collegeId).catch(() => ({ data: null })),
          getInternationalExposureById(collegeId).catch(() => ({ data: null })),
          getAlumniBycollege(collegeId).catch(() => ({ data: null }))
        ]);

        setInfrastructure(infrastructureRes?.value?.data?.data || infrastructureRes?.value?.data);
        setCourses(coursesRes?.value?.data?.data || coursesRes?.value?.data || []);
        setCourseFees(courseFeesRes?.value?.data?.data || courseFeesRes?.value?.data || []);
        setHostels(hostelsRes?.value?.data?.data || hostelsRes?.value?.data || []);
        setPlacements(placementsRes?.value?.data?.data || placementsRes?.value?.data || []);
        setExams(examsRes?.value?.data?.data || examsRes?.value?.data || []);
        setScholarships(scholarshipsRes?.value?.data?.data || scholarshipsRes?.value?.data || []);
        const facultyDataRes = facultyRes?.value?.data?.data || facultyRes?.value?.data;
        setFaculty(facultyDataRes?.facultyMembers || facultyDataRes?.faculty || (Array.isArray(facultyDataRes) ? facultyDataRes : []));
        setOtherDetails(otherDetailsRes?.value?.data?.data || otherDetailsRes?.value?.data);
        setAdmissionTimeline(admissionRes?.value?.data?.data || admissionRes?.value?.data);
        setSafetyAndSecurity(safetyRes?.value?.data?.data || safetyRes?.value?.data);
        setInternationalExposure(internationalRes?.value?.data?.data || internationalRes?.value?.data);
        setAlumni(alumniRes?.value?.data?.data || alumniRes?.value?.data);
      } catch (e) {
        console.error("Error fetching grouped details:", e);
      }
    };

    fetchcollegeDetails();
    fetchAmenitiesAndActivities();
    fetchAdditionalDetails();
  }, [collegeId, navigate]);

  const handleApplyNow = () => {
    if (!currentUser) {
      toast.info("Please log in to apply.");
      navigate(`/login`);
      return;
    }
    if (currentUser.userType === "college") {
      toast.error("college accounts cannot submit student applications.");
      navigate('/college-portal');
      return;
    }
    navigate(`/apply/${college._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-lg rounded-lg p-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>

          {/* Content Sections Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Could not load college data.</p>
        <button
          onClick={() => navigate("/colleges")}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back to colleges
        </button>
      </div>
    );
  }

  const isShortlisted = shortlist.some((item) => item._id === college._id);

  // Prepare structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": college.name,
    "description": college.description,
    "url": college.website || `https://synzy.in/college/${college._id}`,
    "logo": typeof college.logo === "object" ? college.logo?.url : college.logo,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": college.city,
      "addressRegion": college.state,
      "streetAddress": college.area || college.location
    },
    "telephone": college.mobileNo
  };

  return (
    <div className="bg-gray-100">
      <SEO 
        title={`${college.name} | Courses, Fees & Admission | Synzy`}
        description={`Explore ${college.name} in ${college.city || college.location}. View college information, courses, facilities, admission details and other important information.`}
        canonical={`https://synzy.in/college/${college._id}`}
        image={typeof college.logo === "object" ? college.logo?.url : college.logo}
        structuredData={structuredData}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-700 hover:text-indigo-600"
            >
              ← Back
            </button>
          </div>
          {currentUser &&
            (currentUser.userType === "parent" ||
              currentUser.userType === "student") && (
              <button
                onClick={() => onShortlistToggle(college)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-10"
              >
                <Heart
                  size={28}
                  className={isShortlisted ? "fill-current text-red-500" : ""}
                />
              </button>
            )}
          
          {/* college Header with Profile Photo and Details */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            {/* college Profile Photo - Optimized */}
            <div className="flex-shrink-0">
              <img
               src={(() => {
    // Normalize possible image sources to URL strings
    const logoUrl =
      typeof college.logo === "object" ? college.logo?.url : college.logo;

    const firstPhotoUrl =
      typeof college.photos?.[0] === "object"
        ? college.photos?.[0]?.url
        : college.photos?.[0];

    const imageSources = [
      firstPhotoUrl,
      college.profilePhoto,
      college.image,
      logoUrl,
      college.profileImage,
      college.collegeLogo
    ].filter(Boolean);

    return imageSources[0] || "https://placehold.co/200x200?text=No+Image";
  })()}
  alt={`${college.name} profile`}
  className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-4 border-gray-200 shadow-lg"
  loading="lazy"
  onError={(e) => {
    if (!e.currentTarget.src.includes("placehold.co")) {
      e.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
    }
  }}
              />
            </div>
            
            {/* college Details */}
            <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            {college.name}
          </h1>
          <p className="text-lg text-gray-600 flex items-center mb-4">
            <MapPin size={18} className="mr-2" />
                {(() => {
                  // Try different location field combinations
                  if (college.location) return college.location;
                  if (college.city && college.state) {
                    return `${college.area ? college.area + ', ' : ''}${college.city}, ${college.state}`;
                  }
                  if (college.city) return college.city;
                  if (college.state) return college.state;
                  if (college.area) return college.area;
                  return 'Location not specified';
                })()}
              </p>
              <p className="text-md text-gray-700 mb-4">{college.description}</p>
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-4">
                {college.mobileNo && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Phone size={16} className="mr-2" />
                    <span className="text-sm">{college.mobileNo}</span>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{college.email}</span>
                  </div>
                )}
                {college.website && (
                  <div className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <Globe size={16} className="mr-2" />
                    <a 
                      href={college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {college.website}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Social Media Links */}
              {(college.socialLinks || (college.facebook || college.twitter || college.instagram || college.linkedin)) && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Follow us:</span>
                  <div className="flex gap-2">
                    {college.socialLinks?.facebook && (
                      <a 
                        href={college.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {college.socialLinks?.instagram && (
                      <a 
                        href={college.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {college.socialLinks?.twitter && (
                      <a 
                        href={college.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {college.socialLinks?.linkedin && (
                      <a 
                        href={college.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                    {/* Fallback for direct social media fields */}
                    {college.facebook && (
                      <a 
                        href={college.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {college.instagram && (
                      <a 
                        href={college.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {college.twitter && (
                      <a 
                        href={college.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {college.linkedin && (
                      <a 
                        href={college.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          

          
          </div>
          {/* New College Sections */}
          <CollegeOverview college={college} />
          <CollegePhotosVideos college={college} />
          <CollegeAmenities amenities={amenities} />
          <CollegeActivities activities={activities} />
          <CollegeInfrastructure infra={infrastructure} />
          <CollegeCourses courses={courses} />
          <CollegeCourseFees courseFees={courseFees} />
          <CollegeScholarships scholarships={scholarships} />
          <CollegeHostels hostels={hostels} />
          <CollegePlacements placements={placements} />
          <CollegeExams exams={exams} />
          <CollegeFaculty faculty={faculty} />
          <CollegeSafety safety={safetyAndSecurity} />
          <CollegeInternationalExposure exposure={internationalExposure} />
          <CollegeDiversity details={otherDetails} />
          <CollegeAdmissionTimeline timeline={admissionTimeline} />
          
{/* Reviews Section */}
        <ReviewSection_fixed collegeId={college._id} />

        
            
           

            
         
        
      </div>
    </div>
  );
};

export default CollegeDetailsPage;
