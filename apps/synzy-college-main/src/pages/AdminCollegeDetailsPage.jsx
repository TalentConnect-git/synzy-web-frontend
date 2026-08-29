import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getcollegeById, 
  getAmenitiesByCollegeId,
  getActivitiesByCollegeId,
  getInfrastructureById,
  getOtherDetailsById,
  getFacultyById,
  getAdmissionTimelineById,
  getSafetyAndSecurityById,
  getInternationalExposureById,
  updatecollegeStatus,
  getScholarshipsByCollege,
  getCourseFeesByCollege,
  getCollegeExams,
  getPlacementsByCollege,
  getCoursesByCollege,
  getHostelsByCollege,
  getAcademicsById
} from "../api/adminService";
import { getAlumniBycollege } from "../api/collegeService";
import { toast } from "react-toastify";
import {
  MapPin,
  BookOpen,
  Users,
  Heart,
  Building,
  Award,
  Sun,
  CheckCircle,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Star,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  XCircle,
} from "lucide-react";

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


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', minHeight: '100vh', zIndex: 9999, position: 'relative' }}>
          <h2>Something went wrong in AdminCollegeDetailsPage.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdmincollegeDetailsPageContent = () => {
  const navigate = useNavigate();
  const { id: collegeId } = useParams();
  const { user: currentUser } = useAuth();

  const [college, setcollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [infrastructure, setInfrastructure] = useState(null);
  
  // College specific sub-collections
  const [scholarships, setScholarships] = useState([]);
  const [courseFees, setCourseFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [hostels, setHostels] = useState([]);
  
  const [otherDetails, setOtherDetails] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [admissionTimeline, setAdmissionTimeline] = useState(null);
  const [safetyAndSecurity, setSafetyAndSecurity] = useState(null);
  const [internationalExposure, setInternationalExposure] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [alumni, setAlumni] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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
      navigate("/admin/dashboard");
      return;
    }

    const fetchcollegeDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching admin college details for ID:', collegeId);
        
        // Fetch college directly by ID
        const response = await getcollegeById(collegeId);
        const raw = response?.data;
        const collegeData = raw?.data || raw; // support {data: {...}} or direct {...}
        
        console.log('🔍 college data:', collegeData);
        
        if (collegeData) {
          console.log('🔍 college Data Structure:', collegeData);
          console.log('🔍 Available Image Fields:', {
            photos: collegeData.photos,
            profilePhoto: collegeData.profilePhoto,
            image: collegeData.image,
            logo: collegeData.logo,
            profileImage: collegeData.profileImage,
            collegeLogo: collegeData.collegeLogo,
            collegeImage: collegeData.collegeImage,
            collegePhoto: collegeData.collegePhoto,
            avatar: collegeData.avatar,
            picture: collegeData.picture,
            thumbnail: collegeData.thumbnail
          });
          console.log('🔍 All college keys containing "image", "photo", "logo", "avatar":', 
            Object.keys(collegeData).filter(key => 
              key.toLowerCase().includes('image') || 
              key.toLowerCase().includes('photo') || 
              key.toLowerCase().includes('logo') || 
              key.toLowerCase().includes('avatar') ||
              key.toLowerCase().includes('picture')
            )
          );
          // Backend getCollegeByIdService returns { college: {...}, courseCount, etc. }
          setcollege(collegeData.college || collegeData);
        } else {
          console.warn(`No college data returned for ID: ${collegeId}`);

          toast.error(`college with ID ${collegeId} not found`);
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("🔍 Fetch college Error:", error);
        toast.error("Could not load college details.");
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    const fetchAmenitiesAndActivities = async () => {
      try {
        const [amenitiesRes, activitiesRes] = await Promise.all([
          getAmenitiesByCollegeId(collegeId).catch(err => { console.error('Failed to load Amenities:', err); return { data: null }; }),
          getActivitiesByCollegeId(collegeId).catch(err => { console.error('Failed to load Activities:', err); return { data: null }; }),
        ]);
        
        console.log("Amenities Response:", amenitiesRes?.data);
        console.log("Activities Response:", activitiesRes?.data);
        
        // Extract amenities from predefinedAmenities and customAmenities
        const amenitiesData = amenitiesRes?.data?.data || amenitiesRes?.data;
        const allAmenities = [
          ...(amenitiesData?.predefinedAmenities || []),
          ...(amenitiesData?.customAmenities || [])
        ];
        
        // Extract activities from activities and customActivities
        const activitiesData = activitiesRes?.data?.data || activitiesRes?.data;
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
          scholarshipsRes,
          courseFeesRes,
          coursesRes,
          examsRes,
          placementsRes,
          hostelsRes,
          otherDetailsRes,
          facultyRes,
          admissionRes,
          safetyRes,
          internationalRes,
          academicsRes,
          alumniRes
        ] = await Promise.allSettled([
          getInfrastructureById(collegeId).catch(err => { console.error('Failed to load Infrastructure:', err); return { data: null }; }),
          getScholarshipsByCollege(collegeId).catch(err => { console.error('Failed to load Scholarships:', err); return { data: null }; }),
          getCourseFeesByCollege(collegeId).catch(err => { console.error('Failed to load Course Fees:', err); return { data: null }; }),
          getCoursesByCollege(collegeId).catch(err => { console.error('Failed to load Courses:', err); return { data: null }; }),
          getCollegeExams(collegeId).catch(err => { console.error('Failed to load Exams:', err); return { data: null }; }),
          getPlacementsByCollege(collegeId).catch(err => { console.error('Failed to load Placements:', err); return { data: null }; }),
          getHostelsByCollege(collegeId).catch(err => { console.error('Failed to load Hostels:', err); return { data: null }; }),
          getOtherDetailsById(collegeId).catch(err => { console.error('Failed to load Other Details:', err); return { data: null }; }),
          getFacultyById(collegeId).catch(err => { console.error('Failed to load Faculty:', err); return { data: null }; }),
          getAdmissionTimelineById(collegeId).catch(err => { console.error('Failed to load Admission Timeline:', err); return { data: null }; }),
          getSafetyAndSecurityById(collegeId).catch(err => { console.error('Failed to load Safety & Security:', err); return { data: null }; }),
          getInternationalExposureById(collegeId).catch(err => { console.error('Failed to load International Exposure:', err); return { data: null }; }),
          getAcademicsById(collegeId).catch(err => { console.error('Failed to load Academics:', err); return { data: null }; }),
          getAlumniBycollege(collegeId).catch(err => { console.error('Failed to load Alumni:', err); return { data: null }; })
        ]);

        const infrastructureData = infrastructureRes?.value?.data?.data || infrastructureRes?.value?.data || null;
        let scholarshipsData = scholarshipsRes?.value?.data?.data || scholarshipsRes?.value?.data || [];
        if (!Array.isArray(scholarshipsData) && scholarshipsData.scholarships) {
          scholarshipsData = scholarshipsData.scholarships;
        }
        
        let courseFeesData = courseFeesRes?.value?.data?.data || courseFeesRes?.value?.data || [];
        if (!Array.isArray(courseFeesData) && courseFeesData.classFees) {
          courseFeesData = courseFeesData.classFees;
        }
        
        // Ensure course fees have courseName attached properly if populated
        if (Array.isArray(courseFeesData)) {
          courseFeesData = courseFeesData.map(fee => ({
            ...fee,
            courseName: fee.courseId?.courseName || fee.courseName || 'Unknown Course'
          }));
        }
        const coursesData = coursesRes?.value?.data?.data || coursesRes?.value?.data || [];
        const examsData = examsRes?.value?.data?.data || examsRes?.value?.data || [];
        const placementsData = placementsRes?.value?.data?.data || placementsRes?.value?.data || [];
        const hostelsData = hostelsRes?.value?.data?.data || hostelsRes?.value?.data || [];
        const otherDetailsData = otherDetailsRes?.value?.data?.data || otherDetailsRes?.value?.data || null;
        const facultyResData = facultyRes?.value?.data?.data || facultyRes?.value?.data || null;
        const facultyData = facultyResData?.facultyMembers || facultyResData?.faculty || (Array.isArray(facultyResData) ? facultyResData : []);
        const admissionData = admissionRes?.value?.data?.data || admissionRes?.value?.data || null;
        const safetyData = safetyRes?.value?.data?.data || safetyRes?.value?.data || null;
        const internationalData = internationalRes?.value?.data?.data || internationalRes?.value?.data || null;
        const academicsData = academicsRes?.value?.data?.data || academicsRes?.value?.data || null;
        const alumniData = alumniRes?.value?.data?.data || alumniRes?.value?.data || null;

        setInfrastructure(infrastructureData);
        setScholarships(scholarshipsData);
        setCourseFees(courseFeesData);
        setCourses(coursesData);
        setExams(examsData);
        setPlacements(placementsData);
        setHostels(hostelsData);
        setOtherDetails(otherDetailsData);
        setFaculty(facultyData);
        setAdmissionTimeline(admissionData);
        setSafetyAndSecurity(safetyData);
        setInternationalExposure(internationalData);
        setAcademics(academicsData);
        setAlumni(alumniData);
      } catch (e) {
        console.error("Error fetching additional details:", e);
      }
    };

    fetchcollegeDetails();
    fetchAmenitiesAndActivities();
    fetchAdditionalDetails();
  }, [collegeId, navigate]);

  const handleAcceptcollege = async () => {
    if (!collegeId) {
      toast.error('college ID is missing');
      return;
    }
    try {
      setIsAccepting(true);
      await updatecollegeStatus(collegeId, 'accepted');
      toast.success('college accepted successfully!');
      // Update local state to reflect the change
      setcollege(prev => ({ ...prev, status: 'accepted' }));
      // Optionally navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to accept college:', error);
      toast.error('Failed to accept college');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectcollege = async () => {
    if (!collegeId) {
      toast.error('college ID is missing');
      return;
    }
    try {
      setIsRejecting(true);
      await updatecollegeStatus(collegeId, 'rejected');
      toast.success('college rejected successfully!');
      // Update local state to reflect the change
      setcollege(prev => ({ ...prev, status: 'rejected' }));
      // Optionally navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to reject college:', error);
      toast.error('Failed to reject college');
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading college details...</span>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-gray-600 mb-4">Could not load college data.</p>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Header Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 relative border border-gray-100">
          <div className="mb-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="flex-shrink-0">
              <img
                src={(() => {
                  const imageSources = [
                    college.photos && college.photos.length > 0 ? (typeof college.photos[0] === 'object' ? college.photos[0].url : college.photos[0]) : null,
                    college.logo && (typeof college.logo === 'object' ? college.logo.url : college.logo),
                    college.profilePhoto
                  ].filter(Boolean);
                  return imageSources[0] || "https://placehold.co/200x200?text=No+Image";
                })()}
                alt={`${college.name} profile`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border-4 border-white shadow-md bg-gray-50"
                onError={(e) => {
                  if (!e.target.src.includes('placehold.co')) {
                    e.target.src = 'https://placehold.co/200x200?text=No+Image';
                  } else {
                    e.target.src = "https://placehold.co/200x200?text=No+Image";
                  }
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {college.name}
              </h1>
              <p className="text-lg text-gray-600 flex items-center mb-4 font-medium">
                <MapPin size={18} className="mr-2 text-indigo-500" />
                {[college.address, college.area, college.city, college.state, college.country].filter(Boolean).join(', ')} {college.pinCode && `- ${college.pinCode}`}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {college.mobileNo && (
                  <div className="flex items-center text-gray-600">
                    <Phone size={16} className="mr-2 text-indigo-400" />
                    <span className="text-sm font-medium">{college.mobileNo}</span>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-2 text-indigo-400" />
                    <span className="text-sm font-medium">{college.email}</span>
                  </div>
                )}
                {college.website && (
                  <div className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                    <Globe size={16} className="mr-2" />
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                      {college.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            {college.status && (
              <div className="w-full mb-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                  college.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  college.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                  college.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {college.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                  {college.status === 'accepted' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {college.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                  Status: {college.status.toUpperCase()}
                </span>
              </div>
            )}

            {college.status === 'pending' && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleAcceptcollege}
                  disabled={isAccepting || isRejecting}
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isAccepting ? "Accepting..." : <><CheckCircle className="h-5 w-5 mr-2" /> Accept College</>}
                </button>
                <button
                  onClick={handleRejectcollege}
                  disabled={isAccepting || isRejecting}
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isRejecting ? "Rejecting..." : <><XCircle className="h-5 w-5 mr-2" /> Reject College</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section: Basic Information */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Building className="mr-3 text-indigo-500" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoBox icon={<Building size={16} />} label="College Mode" value={college.collegeMode} />
            <InfoBox icon={<Users size={16} />} label="Gender Type" value={college.genderType} />
            <InfoBox icon={<Award size={16} />} label="Streams Offered" value={college.streamsOffered} />
            <InfoBox icon={<Award size={16} />} label="Program Levels" value={college.upto} />
            
            <InfoBox icon={<Calendar size={16} />} label="Established Year" value={college.establishedYear || college.estYear} />
            <InfoBox icon={<BookOpen size={16} />} label="Board" value={college.board} />
            <InfoBox icon={<Sun size={16} />} label="Shift(s)" value={college.shifts} />
            <InfoBox icon={<Award size={16} />} label="Fee Range" value={college.feeRange} />
            
            <InfoBox icon={<BookOpen size={16} />} label="Language Medium" value={college.languageMedium} />
            <InfoBox icon={<Star size={16} />} label="Acceptance Rate" value={college.acceptanceRate ? `${college.acceptanceRate}%` : "N/A"} />
            <InfoBox icon={<Heart size={16} />} label="Transport Available" value={college.transportAvailable} />
            <InfoBox icon={<Users size={16} />} label="Teacher:Student Ratio" value={college.TeacherToStudentRatio} />
            
            <InfoBox icon={<Star size={16} />} label="Ranking" value={college.ranking} />
            <InfoBox icon={<Award size={16} />} label="Specialist" value={college.specialist} />
            <InfoBox icon={<Star size={16} />} label="Tags" value={college.tags} />
            <InfoBox icon={<MapPin size={16} />} label="Coordinates" value={`${college.latitude ?? college.lat ?? 'N/A'}, ${college.longitude ?? college.long ?? 'N/A'}`} />
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
             <h3 className="text-sm font-semibold text-gray-600 mb-2">College Information</h3>
             <p className="text-gray-800 whitespace-pre-line">{college.description || college.collegeInfo || "No additional information provided."}</p>
          </div>
        </div>

        {/* Section: Social Media */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Globe className="mr-3 text-blue-500" /> Social Media Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {college.instagramHandle ? (
               <a href={college.instagramHandle} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600 rounded-xl hover:shadow-md transition-shadow border border-pink-100">
                  <Instagram size={24} className="mr-3 flex-shrink-0" /> <span className="font-medium truncate">{college.instagramHandle}</span>
               </a>
            ) : <InfoBox icon={<Instagram size={16} />} label="Instagram" value="Not Provided" />}
            {college.twitterHandle ? (
               <a href={college.twitterHandle} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-blue-50 text-blue-600 rounded-xl hover:shadow-md transition-shadow border border-blue-100">
                  <Twitter size={24} className="mr-3 flex-shrink-0" /> <span className="font-medium truncate">{college.twitterHandle}</span>
               </a>
            ) : <InfoBox icon={<Twitter size={16} />} label="Twitter" value="Not Provided" />}
            {college.linkedinHandle ? (
               <a href={college.linkedinHandle} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-indigo-50 text-indigo-700 rounded-xl hover:shadow-md transition-shadow border border-indigo-100">
                  <Linkedin size={24} className="mr-3 flex-shrink-0" /> <span className="font-medium truncate">{college.linkedinHandle}</span>
               </a>
            ) : <InfoBox icon={<Linkedin size={16} />} label="LinkedIn" value="Not Provided" />}
          </div>
        </div>

        {/* Section: Documents & Media */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Heart className="mr-3 text-red-500" /> Documents & Media
          </h2>
          
          <div className="space-y-8">
             {/* Logo */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">College Logo</h3>
                {college.logo ? (
                  <img 
                    src={typeof college.logo === 'object' ? college.logo.url : college.logo} 
                    alt="Logo" 
                    className="h-32 w-auto object-contain rounded-lg border border-gray-200 bg-gray-50 p-2 shadow-sm"
                  />
                ) : <p className="text-gray-500 italic">No logo uploaded.</p>}
             </div>
             
             {/* Photos */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">College Photos</h3>
                {Array.isArray(college.photos) && college.photos.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {college.photos.map((photo, i) => (
                      <a key={i} href={typeof photo === 'object' ? photo.url : photo} target="_blank" rel="noreferrer">
                        <img 
                          src={typeof photo === 'object' ? photo.url : photo} 
                          alt={`Photo ${i+1}`} 
                          className="h-40 w-60 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity" 
                        />
                      </a>
                    ))}
                  </div>
                ) : <p className="text-gray-500 italic">No photos uploaded.</p>}
             </div>

             {/* Videos */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">College Video</h3>
                {college.videos ? (
                  <div className="max-w-2xl">
                    <video 
                      controls 
                      className="w-full rounded-lg shadow-md border border-gray-200"
                      src={typeof college.videos === 'object' ? college.videos.url : college.videos}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : <p className="text-gray-500 italic">No video uploaded.</p>}
             </div>
          </div>
        </div>

        {/* Section: Amenities & Activities */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="mr-3 text-green-500" /> Amenities & Activities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center">
                 <Building className="mr-2 text-green-600" size={18}/> Amenities ({amenities.length})
              </h3>
              {Array.isArray(amenities) && amenities.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">{typeof item === 'object' ? item.name : item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 italic text-sm">No amenities found.</p>}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center">
                 <Sun className="mr-2 text-purple-600" size={18}/> Activities ({activities.length})
              </h3>
              {Array.isArray(activities) && activities.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activities.map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-purple-500 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">{typeof item === 'object' ? item.name : item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 italic text-sm">No activities found.</p>}
            </div>
          </div>
        </div>

        {/* Section: Infrastructure */}
        {infrastructure && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Building className="mr-3 text-teal-500" /> Infrastructure
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoBox icon={<BookOpen size={16} />} label="Library Books" value={infrastructure.libraryBooks || 0} />
              <InfoBox icon={<Award size={16} />} label="Smart Classrooms" value={infrastructure.smartClassroomsPercentage != null ? `${infrastructure.smartClassroomsPercentage}%` : (infrastructure.smartClassrooms != null ? `${infrastructure.smartClassrooms}%` : '0%')} />
              <InfoBox icon={<Building size={16} />} label="Auditorium" value={infrastructure.auditorium || "N/A"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.isArray(infrastructure.labs) && infrastructure.labs.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Laboratories</h3>
                    <div className="flex flex-wrap gap-2">
                      {infrastructure.labs.map((x, i) => <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">{x}</span>)}
                    </div>
                  </div>
               )}
               {Array.isArray(infrastructure.libraryFacilities) && infrastructure.libraryFacilities.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Library Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {infrastructure.libraryFacilities.map((x, i) => <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-100">{x}</span>)}
                    </div>
                  </div>
               )}
               {Array.isArray(infrastructure.sportsGrounds) && infrastructure.sportsGrounds.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Sports Grounds</h3>
                    <div className="flex flex-wrap gap-2">
                      {infrastructure.sportsGrounds.map((x, i) => <span key={i} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold border border-rose-100">{x}</span>)}
                    </div>
                  </div>
               )}
               {Array.isArray(infrastructure.eLearningPlatforms) && infrastructure.eLearningPlatforms.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">E-Learning Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {infrastructure.eLearningPlatforms.map((x, i) => <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100">{x}</span>)}
                    </div>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* Section: Courses */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen className="mr-3 text-blue-600" /> Courses Offered
          </h2>
          {Array.isArray(courses) && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course, i) => {
                const courseExams = exams.filter(e => e.courseId === course._id || e.courseId?._id === course._id || e.courseName === course.courseName);
                const coursePlacements = placements.filter(p => p.courseId === course._id || p.courseId?._id === course._id || p.courseName === course.courseName);
                const detailedFee = courseFees.find(f => f.courseId?._id === course._id || f.courseId === course._id || f.courseName === course.courseName || f.courseId?.courseName === course.courseName);
                return (
                <div key={i} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.courseName}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Category:</span> {course.category || course.degree || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Duration:</span> {course.duration || detailedFee?.courseDuration || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Fees:</span> {detailedFee ? `₹${(detailedFee.tuition || 0) + (detailedFee.activity || 0) + (detailedFee.transport || 0) + (detailedFee.hostel || 0) + (detailedFee.misc || 0)}` : course.fees ? `₹${course.fees}` : 'N/A'}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Intake:</span> {course.intake || course.seatsAvailable || 'N/A'}</p>
                  </div>
                  {Array.isArray(course.specializations) && course.specializations.length > 0 && (
                     <div className="mb-4">
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specializations</p>
                       <div className="flex flex-wrap gap-1">
                         {course.specializations.map((spec, j) => (
                           <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{spec}</span>
                         ))}
                       </div>
                     </div>
                  )}
                  {courseExams.length > 0 && (
                     <div className="mt-4 border-t pt-4">
                       <p className="text-sm font-bold text-gray-800 mb-2">Exam Eligibility</p>
                       <div className="space-y-2">
                         {courseExams.map((exam, j) => (
                           <div key={j} className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                             <p className="font-semibold text-orange-900 text-sm">{exam.examName || "Exam"}</p>
                             {Array.isArray(exam.acceptedExams) && exam.acceptedExams.length > 0 && (
                               <p className="text-xs text-orange-800 mt-1"><span className="font-semibold">Accepted:</span> {exam.acceptedExams.join(', ')}</p>
                             )}
                             {(exam.minMarks || exam.maxMarks) && (
                               <p className="text-xs text-orange-800 mt-1"><span className="font-semibold">Cutoff:</span> {exam.minMarks || 0} - {exam.maxMarks || 100} ({exam.marksType || 'N/A'})</p>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                  {coursePlacements.length > 0 && (
                     <div className="mt-4 border-t pt-4">
                       <p className="text-sm font-bold text-gray-800 mb-2">Placement Details</p>
                       <div className="space-y-2">
                         {coursePlacements.flatMap(p => (p.placements && Array.isArray(p.placements)) ? p.placements : [p]).map((placement, j) => (
                           <div key={j} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                             {placement.year && <p className="font-semibold text-indigo-900 text-sm mb-1">{placement.year}</p>}
                             <div className="grid grid-cols-2 gap-2 text-xs text-indigo-800">
                               <p><span className="font-semibold">Highest:</span> {placement.maxPackage || placement.highestPackage || 'N/A'}</p>
                               <p><span className="font-semibold">Average:</span> {placement.averagePackage || 'N/A'}</p>
                               <p><span className="font-semibold">Placed:</span> {placement.placedStudents || 0}/{placement.totalStudents || 0}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
              )})}
            </div>
          ) : <p className="text-gray-500 italic">No courses added.</p>}
        </div>

        {/* Section: Exams */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="mr-3 text-orange-500" /> Entrance Exams
          </h2>
          {Array.isArray(exams) && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam, i) => (
                <div key={i} className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-orange-800 mb-2">{exam.examName || "Exam"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(exam.marksType || exam.minMarks || exam.maxMarks) ? (
                      <div className="w-full space-y-1 mt-2">
                         <p className="text-sm text-gray-700"><span className="font-semibold">Type:</span> {exam.marksType || 'N/A'}</p>
                         <p className="text-sm text-gray-700"><span className="font-semibold">Range:</span> {exam.minMarks || 0} - {exam.maxMarks || 100}</p>
                      </div>
                    ) : Array.isArray(exam.acceptedExams) && exam.acceptedExams.map((ex, j) => (
                      <span key={j} className="bg-white text-orange-700 text-xs px-2 py-1 rounded shadow-sm font-semibold">{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 italic">No exams information available.</p>}
        </div>

        {/* Section: Course Fees */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen className="mr-3 text-emerald-500" /> Course Fees
          </h2>
          {Array.isArray(courseFees) && courseFees.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tuition</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transport</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hostel</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Misc</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseFees.map((fee, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{fee.tuition ? fee.tuition.toLocaleString() : '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{fee.activity ? fee.activity.toLocaleString() : '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{fee.transport ? fee.transport.toLocaleString() : '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{fee.hostel ? fee.hostel.toLocaleString() : '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{fee.misc ? fee.misc.toLocaleString() : '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{((fee.tuition||0)+(fee.activity||0)+(fee.transport||0)+(fee.hostel||0)+(fee.misc||0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-500 italic">No course fee information available.</p>}
        </div>

        {/* Section: Scholarships */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="mr-3 text-purple-500" /> Scholarships
          </h2>
          {Array.isArray(scholarships) && scholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.map((scholarship, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-900 mb-2">{scholarship.name || scholarship.scholarshipName}</h3>
                  <div className="space-y-2">
                     <p className="text-sm text-purple-800"><span className="font-semibold">Type:</span> {scholarship.type || scholarship.scholarshipType || 'N/A'}</p>
                     <p className="text-sm text-purple-800"><span className="font-semibold">Amount:</span> {scholarship.amount || scholarship.scholarshipAmount ? `₹${(scholarship.amount || scholarship.scholarshipAmount).toLocaleString()}` : 'N/A'}</p>
                     <p className="text-sm text-purple-800"><span className="font-semibold">Documents Required:</span> {Array.isArray(scholarship.documentsRequired) ? scholarship.documentsRequired.join(', ') : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 italic">No scholarship information available.</p>}
        </div>

        {/* Section: Faculty */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <User className="mr-3 text-cyan-600" /> Faculty Directory
          </h2>
          {Array.isArray(faculty) && faculty.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((member, i) => (
                <div key={i} className="flex items-start p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg mr-4 shadow-sm flex-shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm font-medium text-cyan-700 mb-1">{member.role || member.designation || 'N/A'}</p>
                    <p className="text-xs text-gray-600"><span className="font-semibold">Qualification:</span> {member.qualification}</p>
                    <p className="text-xs text-gray-600"><span className="font-semibold">Experience:</span> {member.experience} {member.experience ? "years" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 italic">No faculty information available.</p>}
        </div>

        {/* Section: Hostels */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Building className="mr-3 text-rose-500" /> Hostels & Accommodation
          </h2>
          {Array.isArray(hostels) && hostels.length > 0 ? (
            <div className="space-y-6">
              {hostels.map((hostel, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-rose-50 px-6 py-4 border-b border-rose-100">
                     <h3 className="text-lg font-bold text-rose-800">Hostel Configuration</h3>
                   </div>
                   <div className="p-6 bg-white">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <InfoBox icon={<Users size={16} />} label="Boys Hostel" value={hostel.type === 'Boys' || hostel.type === 'Both' ? 'Yes' : (hostel.type ? 'No' : 'N/A')} />
                        <InfoBox icon={<Users size={16} />} label="Girls Hostel" value={hostel.type === 'Girls' || hostel.type === 'Both' ? 'Yes' : (hostel.type ? 'No' : 'N/A')} />
                        <InfoBox icon={<BookOpen size={16} />} label="Capacity" value={hostel.capacity || 'N/A'} />
                        <InfoBox icon={<Award size={16} />} label="Hostel Fee" value={hostel.feePerYear ? `₹${hostel.feePerYear.toLocaleString()}` : 'N/A'} />
                     </div>
                     {Array.isArray(hostel.facilities) && hostel.facilities.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-gray-700 mb-2">Hostel Facilities</p>
                          <div className="flex flex-wrap gap-2">
                            {hostel.facilities.map((fac, j) => (
                              <span key={j} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium border border-gray-200">{fac}</span>
                            ))}
                          </div>
                        </div>
                     )}
                   </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 italic">No hostel information available.</p>}
        </div>

        {/* Section: Admission Timeline */}
        {admissionTimeline && Array.isArray(admissionTimeline.timelines) && admissionTimeline.timelines.length > 0 && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-3 text-sky-500" /> Admission Timelines
            </h2>
            <div className="space-y-6">
              {admissionTimeline.timelines.map((timeline, idx) => (
                <div key={idx} className="bg-sky-50 rounded-lg p-5 border border-sky-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoBox 
                      icon={<Calendar size={16} />} 
                      label="Application Start Date" 
                      value={timeline.admissionStartDate ? new Date(timeline.admissionStartDate).toLocaleDateString() : 'N/A'} 
                    />
                    <InfoBox 
                      icon={<Calendar size={16} />} 
                      label="Application End Date" 
                      value={timeline.admissionEndDate ? new Date(timeline.admissionEndDate).toLocaleDateString() : 'N/A'} 
                    />
                    <InfoBox 
                      icon={<BookOpen size={16} />} 
                      label="Eligibility Criteria" 
                      value={timeline.eligibility?.minQualification ? `${timeline.eligibility.minQualification} - ${timeline.eligibility.otherInfo || ''}` : 'N/A'} 
                    />
                    <InfoBox 
                      icon={<Calendar size={16} />} 
                      label="Application Fee" 
                      value={timeline.applicationFee ? `₹${timeline.applicationFee}` : 'Free'} 
                    />
                  </div>
                  {Array.isArray(timeline.documentsRequired) && timeline.documentsRequired.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-gray-700 mb-3 text-sm">Required Documents</h3>
                      <div className="flex flex-wrap gap-2">
                        {timeline.documentsRequired.map((doc, i) => (
                          <span key={i} className="bg-white text-sky-700 px-3 py-1 rounded border border-sky-200 text-sm font-medium">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Safety & Security */}
        {safetyAndSecurity && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Heart className="mr-3 text-red-500" /> Safety & Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               <InfoBox icon={<CheckCircle size={16} />} label="CCTV Surveillance" value={safetyAndSecurity.cctvCoveragePercentage != null ? `${safetyAndSecurity.cctvCoveragePercentage}%` : (safetyAndSecurity.cctv ? 'Yes' : 'No')} />
               <InfoBox icon={<CheckCircle size={16} />} label="Visitor Management" value={safetyAndSecurity.visitorManagementSystem ? 'Yes' : 'No'} />
               <InfoBox icon={<CheckCircle size={16} />} label="Fire Safety Measures" value={Array.isArray(safetyAndSecurity.fireSafetyMeasures) && safetyAndSecurity.fireSafetyMeasures.length > 0 ? safetyAndSecurity.fireSafetyMeasures.join(', ') : (safetyAndSecurity.fireSafety ? 'Yes' : 'No')} />
               <InfoBox icon={<CheckCircle size={16} />} label="Security Guards" value={safetyAndSecurity.securityGuards ? 'Yes' : 'No'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-bold text-red-800 mb-3">Medical Facility</h3>
                {safetyAndSecurity.medicalFacility ? (
                  <ul className="space-y-2 text-sm text-red-700">
                    <li><span className="font-semibold">Doctor Availability:</span> {safetyAndSecurity.medicalFacility.doctorAvailability || 'N/A'}</li>
                    <li><span className="font-semibold">Medkit Available:</span> {safetyAndSecurity.medicalFacility.medkitAvailable ? 'Yes' : 'No'}</li>
                    <li><span className="font-semibold">Ambulance Available:</span> {safetyAndSecurity.medicalFacility.ambulanceAvailable ? 'Yes' : 'No'}</li>
                  </ul>
                ) : <p className="text-sm text-red-700 italic">No medical facility details provided.</p>}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3">Transport Safety</h3>
                {safetyAndSecurity.transportSafety ? (
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li><span className="font-semibold">GPS Tracker:</span> {safetyAndSecurity.transportSafety.gpsTrackerAvailable ? 'Yes' : 'No'}</li>
                    <li><span className="font-semibold">Drivers Verified:</span> {safetyAndSecurity.transportSafety.driversVerified ? 'Yes' : 'No'}</li>
                  </ul>
                ) : <p className="text-sm text-blue-700 italic">No transport safety details provided.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Section: International Exposure */}
        {internationalExposure && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Globe className="mr-3 text-blue-500" /> International Exposure
            </h2>
            <div className="space-y-6">
               {Array.isArray(internationalExposure.globalTieUps) && internationalExposure.globalTieUps.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Global Tie-Ups</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {internationalExposure.globalTieUps.map((tie, i) => (
                       <div key={i} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                         <h4 className="font-bold text-blue-900">{tie.partnerName}</h4>
                         <p className="text-sm text-blue-800 mt-1"><span className="font-semibold">Nature:</span> {tie.nature || tie.natureOfTieUp}</p>
                         <p className="text-sm text-blue-800"><span className="font-semibold">Active Since:</span> {tie.activeSince}</p>
                         <p className="text-sm text-blue-800 mt-2">{tie.description}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               {Array.isArray(internationalExposure.exchangePrograms) && internationalExposure.exchangePrograms.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Exchange Programs</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {internationalExposure.exchangePrograms.map((prog, i) => (
                       <div key={i} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                         <h4 className="font-bold text-indigo-900">{prog.partnercollege}</h4>
                         <p className="text-sm text-indigo-800 mt-1"><span className="font-semibold">Type:</span> {prog.type || prog.programType}</p>
                         <p className="text-sm text-indigo-800"><span className="font-semibold">Duration:</span> {prog.duration}</p>
                         <p className="text-sm text-indigo-800"><span className="font-semibold">Students Participated:</span> {prog.studentsParticipated}</p>
                         <p className="text-sm text-indigo-800"><span className="font-semibold">Active Since:</span> {prog.activeSince}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Section: Academics */}
        {academics && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="mr-3 text-cyan-500" /> Academic Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-cyan-50 p-4 rounded-lg text-center border border-cyan-100">
                <p className="text-xs font-bold text-cyan-600 uppercase">Avg. Class 10 Result</p>
                <p className="text-2xl font-black text-cyan-800 mt-1">{academics.averageClass10Result || 'N/A'}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg text-center border border-cyan-100">
                <p className="text-xs font-bold text-cyan-600 uppercase">Avg. Class 12 Result</p>
                <p className="text-2xl font-black text-cyan-800 mt-1">{academics.averageClass12Result || 'N/A'}</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg text-center border border-cyan-100">
                <p className="text-xs font-bold text-cyan-600 uppercase">Avg. College Marks</p>
                <p className="text-2xl font-black text-cyan-800 mt-1">{academics.averagecollegeMarks || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {Array.isArray(academics.specialExamsTraining) && academics.specialExamsTraining.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Special Exams Training</h3>
                    <div className="flex flex-wrap gap-2">
                      {academics.specialExamsTraining.map((x, i) => <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold border border-gray-200">{x}</span>)}
                    </div>
                  </div>
               )}
               {Array.isArray(academics.extraCurricularActivities) && academics.extraCurricularActivities.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Extra-Curricular Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {academics.extraCurricularActivities.map((x, i) => <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold border border-gray-200">{x}</span>)}
                    </div>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* Section: Alumni */}
        {alumni && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Users className="mr-3 text-fuchsia-500" /> Alumni Directory
            </h2>
            <div className="space-y-6">
               {Array.isArray(alumni.famousAlumnies) && alumni.famousAlumnies.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Famous Alumni</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {alumni.famousAlumnies.map((person, i) => (
                       <div key={i} className="bg-fuchsia-50 p-4 rounded-lg border border-fuchsia-100 flex items-center">
                         <div className="w-10 h-10 bg-fuchsia-200 text-fuchsia-800 rounded-full flex items-center justify-center font-bold mr-3">{person.name ? person.name.charAt(0) : 'A'}</div>
                         <div>
                           <p className="font-bold text-fuchsia-900">{person.name}</p>
                           <p className="text-xs text-fuchsia-700">{person.designation || 'Alumni'}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               {Array.isArray(alumni.topAlumnis) && alumni.topAlumnis.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Top Alumni</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {alumni.topAlumnis.map((person, i) => (
                       <div key={i} className="bg-fuchsia-50 p-4 rounded-lg border border-fuchsia-100 flex items-center">
                         <div className="w-10 h-10 bg-fuchsia-200 text-fuchsia-800 rounded-full flex items-center justify-center font-bold mr-3">{person.name ? person.name.charAt(0) : 'A'}</div>
                         <div>
                           <p className="font-bold text-fuchsia-900">{person.name}</p>
                           <p className="text-xs text-fuchsia-700">{person.designation || 'Alumni'}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               {Array.isArray(alumni.alumnis) && alumni.alumnis.length > 0 && (
                 <div>
                   <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">Other Alumni</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {alumni.alumnis.map((person, i) => (
                       <div key={i} className="bg-fuchsia-50 p-4 rounded-lg border border-fuchsia-100 flex items-center">
                         <div className="w-10 h-10 bg-fuchsia-200 text-fuchsia-800 rounded-full flex items-center justify-center font-bold mr-3">{person.name ? person.name.charAt(0) : 'A'}</div>
                         <div>
                           <p className="font-bold text-fuchsia-900">{person.name}</p>
                           <p className="text-xs text-fuchsia-700">{person.designation || 'Alumni'}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {otherDetails && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <CheckCircle className="mr-3 text-gray-500" /> Other Details & Diversity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InfoBox icon={<CheckCircle size={16} />} label="Minority Representation" value={otherDetails.minorityRepresentation || 'N/A'} />
               <InfoBox icon={<CheckCircle size={16} />} label="International Students" value={otherDetails.internationalStudents || 'N/A'} />
               <InfoBox icon={<CheckCircle size={16} />} label="Special Needs Support" value={
                 otherDetails.specialNeedsSupport ? 
                 (otherDetails.specialNeedsSupport.facilitiesAvailable?.length > 0 
                   ? otherDetails.specialNeedsSupport.facilitiesAvailable.join(', ') 
                   : (otherDetails.specialNeedsSupport.dedicatedStaff ? 'Dedicated Staff Available' : 'Yes'))
                 : 'No'
               } />
               {otherDetails.genderRatio && (
                 <InfoBox icon={<Users size={16} />} label="Gender Ratio (M:F:O)" value={`${otherDetails.genderRatio.male || 0}% : ${otherDetails.genderRatio.female || 0}% : ${otherDetails.genderRatio.others || 0}%`} />
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


const AdmincollegeDetailsPage = () => (
  <ErrorBoundary>
    <AdmincollegeDetailsPageContent />
  </ErrorBoundary>
);
export default AdmincollegeDetailsPage;

