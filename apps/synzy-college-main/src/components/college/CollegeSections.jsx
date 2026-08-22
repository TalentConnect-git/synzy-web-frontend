import React from 'react';
import {
  BookOpen,
  DollarSign,
  Award,
  Home,
  Briefcase,
  Users,
  Shield,
  Globe,
  Star,
  FileText,
  Video,
  Image as ImageIcon,
  Building,
  Calendar,
  Sun,
  Heart,
  CheckCircle,
  Activity,
  Wifi,
  Monitor,
  Book,
  Coffee
} from 'lucide-react';

export const CollegePhotosVideos = ({ college }) => {
  const photos = college?.photos || [];
  const videos = college?.videos ? [college.videos] : [];
  
  if (photos.length === 0 && videos.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <ImageIcon size={16} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Photos & Videos</h2>
          <p className="text-sm text-gray-600">Campus gallery and media</p>
        </div>
      </div>
      
      {photos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                  src={photo.url} 
                  alt={`College Photo ${idx+1}`} 
                  className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, idx) => (
              <div key={idx} className="w-full aspect-video rounded-lg overflow-hidden border bg-black">
                <video src={video.url} controls className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const CollegeCourses = ({ courses }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
          <BookOpen size={16} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Courses Offered</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, idx) => (
          <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.courseName}</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Category:</strong> {course.category || 'N/A'}</p>
              <p><strong>Duration:</strong> {course.duration || 'N/A'}</p>
              <p><strong>Fees:</strong> {course.fees ? `₹${course.fees}` : 'N/A'}</p>
              <p><strong>Intake:</strong> {course.intake || course.seatsAvailable || 'N/A'} seats</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegeCourseFees = ({ courseFees }) => {
  if (!courseFees || courseFees.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <DollarSign size={16} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Course Fees</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courseFees.map((fee, idx) => {
              const total = (fee.tuition || 0) + (fee.activity || 0) + (fee.transport || 0) + (fee.hostel || 0) + (fee.misc || 0);
              return (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.courseId?.courseName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{fee.tuition || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{fee.activity || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{fee.transport || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{fee.hostel || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CollegeScholarships = ({ scholarships }) => {
  if (!scholarships || scholarships.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
          <Award size={16} className="text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Scholarships</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scholarships.map((sch, idx) => (
          <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{sch.name}</h3>
                <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">{sch.type}</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700 mb-3">₹{sch.amount}</p>
            </div>
            {sch.documentsRequired && sch.documentsRequired.length > 0 && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Required Documents:</p>
                <div className="flex flex-wrap gap-1">
                  {sch.documentsRequired.map((doc, i) => (
                    <span key={i} className="text-[10px] bg-white border border-yellow-300 px-2 py-1 rounded text-gray-700">{doc}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegeHostels = ({ hostels }) => {
  if (!hostels || hostels.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
          <Home size={16} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hostels & Accommodation</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hostels.map((hostel, idx) => (
          <div key={idx} className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{hostel.hostelName || hostel.hostelType || 'Hostel'}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                ${hostel.type === 'Boys' || hostel.hostelType === 'Boys' ? 'bg-blue-100 text-blue-700' : 
                  hostel.type === 'Girls' || hostel.hostelType === 'Girls' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                {hostel.type || hostel.hostelType || 'Hostel'}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fee Per Year</p>
                  <p className="text-xl font-bold text-gray-900">₹{hostel.feeRange || hostel.feePerYear || hostel.feesPerYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Capacity</p>
                  <p className="text-lg font-medium text-gray-800">{hostel.availableSeats || hostel.intake || hostel.capacity || 'N/A'} / {hostel.intake || hostel.capacity || 'N/A'} Available</p>
                </div>
              </div>
              {hostel.facilities && hostel.facilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Facilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {hostel.facilities.map((fac, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{fac}</span>
                    ))}
                  </div>
                </div>
              )}
              {hostel.contactPerson && (
                <div className="mt-auto pt-3 border-t">
                  <p className="text-sm text-gray-600">Contact: <strong>{hostel.contactPerson.name}</strong> ({hostel.contactPerson.phone})</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegePlacements = ({ placements }) => {
  if (!placements || placements.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Briefcase size={16} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Placements</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {placements.flatMap(p => p.placements ? p.placements.map(subP => ({ courseName: p.courseName, ...subP })) : [p]).map((placement, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{placement.courseName || placement.courseId?.courseName || 'All Courses'}</h3>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">{placement.year}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Highest Package</p>
                <p className="text-lg font-bold text-blue-700">₹{placement.maxPackage || placement.highestPackage || 'N/A'} LPA</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Package</p>
                <p className="text-lg font-bold text-gray-700">₹{placement.minPackage || placement.averagePackage || 'N/A'} LPA</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-lg font-bold text-gray-700">{placement.totalStudents || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Placed Students</p>
                <p className="text-lg font-bold text-green-600">{placement.placedStudents || 'N/A'}</p>
              </div>
            </div>
            {placement.companies && placement.companies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Top Recruiters:</p>
                <div className="flex flex-wrap gap-2">
                  {placement.companies.map((comp, i) => (
                    <span key={i} className="text-xs bg-white border border-blue-200 px-2 py-1 rounded text-gray-700">{comp}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegeExams = ({ exams }) => {
  if (!exams || exams.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <FileText size={16} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Accepted Exams</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((exam, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-4 shadow-sm text-center flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{exam.examName}</h3>
            <p className="text-sm text-gray-500 mb-2">For {exam.courseId?.courseName || 'Admissions'}</p>
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
              Min {exam.marksType}: {exam.minMarks}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegeFaculty = ({ faculty }) => {
  const members = faculty?.facultyMembers || [];
  if (members.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
          <Users size={16} className="text-teal-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Faculty</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center hover:shadow-md transition">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="font-bold text-gray-900">{member.name}</h3>
            <p className="text-sm text-teal-600 font-medium">{member.qualification || member.role || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">{member.experience || 0} Years Experience</p>
              {member.awards && member.awards.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {member.awards.map((award, i) => (
                    <span key={i} className="text-[10px] bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded">{award}</span>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollegeSafety = ({ safety }) => {
  if (!safety) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          <Shield size={16} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Safety & Security</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safety.cctvCoveragePercentage !== undefined && (
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <p className="text-3xl font-bold text-gray-800 mb-2">{safety.cctvCoveragePercentage}%</p>
            <p className="text-sm text-gray-600">CCTV Coverage</p>
          </div>
        )}
        {safety.medicalFacility && (
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <h3 className="font-semibold text-gray-800 mb-3">Medical Facility</h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Available</span>
          </div>
        )}
        {safety.fireSafetyMeasures && safety.fireSafetyMeasures.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-3">Fire Safety</h3>
            <div className="flex flex-wrap gap-2">
              {safety.fireSafetyMeasures.map((measure, idx) => (
                <span key={idx} className="bg-white border text-xs px-2 py-1 rounded">{measure}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CollegeInternationalExposure = ({ exposure }) => {
  if (!exposure) return null;
  const hasTieups = exposure.tieUps;
  const hasStudentExchange = exposure.studentExchange;
  const hasFacultyExchange = exposure.facultyExchange;

  if (!hasTieups && !hasStudentExchange && !hasFacultyExchange) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
          <Globe size={16} className="text-cyan-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">International Exposure</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasTieups && (
          <div className="border rounded-lg p-4 bg-cyan-50 border-cyan-100 flex items-center gap-3">
            <CheckCircle className="text-cyan-600 w-5 h-5" />
            <span className="font-bold text-gray-800">International Tie-Ups</span>
          </div>
        )}
        {hasStudentExchange && (
          <div className="border rounded-lg p-4 bg-cyan-50 border-cyan-100 flex items-center gap-3">
            <CheckCircle className="text-cyan-600 w-5 h-5" />
            <span className="font-bold text-gray-800">Student Exchange</span>
          </div>
        )}
        {hasFacultyExchange && (
          <div className="border rounded-lg p-4 bg-cyan-50 border-cyan-100 flex items-center gap-3">
            <CheckCircle className="text-cyan-600 w-5 h-5" />
            <span className="font-bold text-gray-800">Faculty Exchange</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const CollegeDiversity = ({ details }) => {
  if (!details) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
          <Star size={16} className="text-pink-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Diversity & Inclusivity</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {details.genderRatio && (
          <div className="border rounded-lg p-4 bg-gray-50 text-center">
            <h3 className="font-semibold text-gray-700 mb-4">Gender Ratio</h3>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-500">{details.genderRatio.male}%</p>
                <p className="text-xs text-gray-500 uppercase">Male</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-pink-500">{details.genderRatio.female}%</p>
                <p className="text-xs text-gray-500 uppercase">Female</p>
              </div>
            </div>
          </div>
        )}
        
        {details.specialNeedsSupport && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">Special Needs Support</h3>
            <p className="text-sm mb-2 text-gray-600">Dedicated Staff: {details.specialNeedsSupport.dedicatedStaff ? 'Yes' : 'No'}</p>
            {details.specialNeedsSupport.facilitiesAvailable && details.specialNeedsSupport.facilitiesAvailable.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {details.specialNeedsSupport.facilitiesAvailable.map((fac, idx) => (
                  <span key={idx} className="text-xs bg-pink-50 border border-pink-200 text-pink-700 px-2 py-0.5 rounded">{fac}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export const CollegeAdmissionTimeline = ({ timeline }) => {
  const items = timeline?.timeline || (Array.isArray(timeline) ? timeline : []);
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
          <Award size={16} className="text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admission Timeline</h2>
          <p className="text-sm text-gray-600">Admission schedule</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((tl, index) => {
          return (
            <div key={index} className="border rounded-xl p-5 shadow-sm bg-gray-50 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{tl.title || 'Event'}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border text-gray-700">{tl.type || 'General'}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Deadline:</strong> {tl.deadline ? new Date(tl.deadline).toLocaleDateString() : 'N/A'}</p>
                {tl.amount && <p><strong>Fee:</strong> ₹{tl.amount}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const InfoBox = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-start border border-gray-100">
    <div className="text-indigo-500 mt-1 mr-3">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {Array.isArray(value) ? (value.length > 0 ? value.join(', ') : 'N/A') : (value || 'N/A')}
      </p>
    </div>
  </div>
);

export const CollegeOverview = ({ college }) => {
  if (!college) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
          <Building size={16} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoBox icon={<Building size={16} />} label="College Mode" value={college.collegeMode} />
        <InfoBox icon={<Users size={16} />} label="Gender Type" value={college.genderType} />
        <InfoBox icon={<Award size={16} />} label="Stream" value={college.stream} />
        <InfoBox icon={<Calendar size={16} />} label="Established Year" value={college.estYear || college.establishedYear} />
        <InfoBox icon={<Sun size={16} />} label="Shift(s)" value={college.shifts} />
        <InfoBox icon={<Award size={16} />} label="Fee Range" value={college.feeRange} />
        <InfoBox icon={<BookOpen size={16} />} label="Language Medium" value={college.languageMedium} />
        <InfoBox icon={<Star size={16} />} label="Acceptance Rate" value={college.acceptanceRate} />
        <InfoBox icon={<Heart size={16} />} label="Transport Available" value={college.transportAvailable} />
        <InfoBox icon={<Users size={16} />} label="Teacher:Student Ratio" value={college.TeacherToStudentRatio} />
        <InfoBox icon={<Star size={16} />} label="Ranking" value={college.ranking} />
        <InfoBox icon={<BookOpen size={16} />} label="Score" value={college.score} />
        <InfoBox icon={<Award size={16} />} label="Specialist" value={college.specialist} />
        <InfoBox icon={<Star size={16} />} label="Tags" value={college.tags} />
      </div>
      
      {college.collegeInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">About College</h3>
          <p className="text-gray-800 whitespace-pre-line">{college.collegeInfo}</p>
        </div>
      )}
    </div>
  );
};

export const CollegeAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <CheckCircle size={16} className="text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Amenities</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity, index) => (
          <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm border border-purple-100">
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );
};

export const CollegeActivities = ({ activities }) => {
  if (!activities || activities.length === 0) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
          <Star size={16} className="text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Activities</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {activities.map((activity, index) => (
          <span key={index} className="bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-sm border border-pink-100">
            {activity}
          </span>
        ))}
      </div>
    </div>
  );
};

export const CollegeInfrastructure = ({ infra }) => {
  if (!infra) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 mt-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Building size={16} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Infrastructure</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infra.libraryBooks > 0 && (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-sm">Library Books</p>
            <p className="font-semibold text-lg">{infra.libraryBooks}</p>
          </div>
        )}
        {infra.smartClassrooms > 0 && (
          <div className="p-4 border rounded-lg">
            <p className="text-gray-500 text-sm">Smart Classrooms</p>
            <p className="font-semibold text-lg">{infra.smartClassrooms}</p>
          </div>
        )}
        {infra.labs && infra.labs.length > 0 && (
          <div className="p-4 border rounded-lg col-span-1 md:col-span-2">
            <p className="text-gray-500 text-sm mb-2">Labs</p>
            <div className="flex flex-wrap gap-2">
              {infra.labs.map((lab, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{lab}</span>)}
            </div>
          </div>
        )}
        {infra.sportsGrounds && infra.sportsGrounds.length > 0 && (
          <div className="p-4 border rounded-lg col-span-1 md:col-span-2">
            <p className="text-gray-500 text-sm mb-2">Sports Grounds</p>
            <div className="flex flex-wrap gap-2">
              {infra.sportsGrounds.map((sport, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{sport}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
