import React from 'react';
import { X, Calendar, Clock, MapPin, FileText, User, Map, BookOpen, Heart, Briefcase, DollarSign } from 'lucide-react';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center space-x-2 border-b pb-2 mb-4 mt-6">
    <Icon className="text-blue-600" size={20} />
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const DetailRow = ({ label, value }) => {
  if (!value || value === '—') return null;
  return (
    <div className="mb-2">
      <span className="text-sm font-medium text-gray-500 block">{label}</span>
      <span className="text-base text-gray-900 break-words">{value}</span>
    </div>
  );
};

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const appData = application.fullApplication || {};
  
  // Format Date of Birth
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 px-4">
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Student Application Details</h2>
            <p className="text-blue-100 text-sm mt-1">
              Submitted on {application.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{appData.name || application.studentName}</h1>
                <p className="text-gray-500 font-medium mt-1">Application Status: <span className="text-blue-600 capitalize">{application.status || 'Pending'}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* Personal Information */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={User} title="Personal Information" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailRow label="Date of Birth" value={formatDate(appData.dob)} />
                  <DetailRow label="Age" value={appData.age} />
                  <DetailRow label="Gender" value={appData.gender} />
                  <DetailRow label="Category / Caste" value={appData.category || appData.caste} />
                  <DetailRow label="Subcaste" value={appData.subcaste} />
                  <DetailRow label="Nationality" value={appData.nationality} />
                  <DetailRow label="Religion" value={appData.religion} />
                  <DetailRow label="Mother Tongue" value={appData.motherTongue} />
                  <DetailRow label="Place of Birth" value={appData.placeOfBirth} />
                  <DetailRow label="Blood Group" value={appData.bloodGroup} />
                  <DetailRow label="Aadhar No" value={appData.aadharNo} />
                  <DetailRow label="Allergies" value={appData.allergicTo} />
                  {appData.speciallyAbled && <DetailRow label="Specially Abled" value={appData.speciallyAbledType || 'Yes'} />}
                </div>
              </div>

              {/* Academic Information */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={BookOpen} title="Academic Information" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailRow label="Current Grade / Class" value={appData.currentGrade || application.standard} />
                  <DetailRow label="Qualification Level" value={appData.latestQualification?.level} />
                  <DetailRow label="Stream" value={appData.academicDetails?.stream || application.stream} />
                  <DetailRow label="Board" value={appData.board} />
                  <DetailRow label="Last College/School Name" value={appData.lastcollegeName} />
                  <DetailRow label="Class Completed" value={appData.classCompleted} />
                  <DetailRow label="Last Academic Year" value={appData.lastAcademicYear} />
                  <DetailRow label="Reason for Leaving" value={appData.reasonForLeaving} />
                </div>
              </div>

              {/* College/Application Information */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={FileText} title="College & Application" />
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Applied College" value={appData.collegeName || 'N/A'} />
                  <DetailRow label="College Email" value={appData.collegeEmail || 'N/A'} />
                  <DetailRow label="Application Date" value={application.date} />
                  <DetailRow label="Application Status" value={application.status} />
                  <DetailRow label="Selected Stream" value={appData.academicDetails?.stream || application.stream} />
                  <DetailRow label="Application ID" value={application.application_id || application.id} />
                </div>
                {appData.coursePreferences && appData.coursePreferences.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Course Preferences</span>
                    <ul className="list-disc pl-5">
                      {appData.coursePreferences.map((pref, idx) => (
                        <li key={idx} className="text-gray-900">Priority {pref.priority}: {pref.courseName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Address Details */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={MapPin} title="Address Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Present Address</span>
                    <p className="text-gray-900">{appData.presentAddress || 'N/A'}</p>
                    {(appData.presentCity || appData.presentState || appData.presentPincode) && (
                      <p className="text-gray-700 mt-1">
                        {[appData.presentCity, appData.presentState, appData.presentPincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Permanent Address</span>
                    <p className="text-gray-900">{appData.permanentAddress || 'N/A'}</p>
                    {(appData.permanentCity || appData.permanentState || appData.permanentPincode) && (
                      <p className="text-gray-700 mt-1">
                        {[appData.permanentCity, appData.permanentState, appData.permanentPincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={User} title="Family Information" />
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Parents' Relationship Status</h4>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded border inline-block">{appData.relationshipStatus || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Father */}
                  {appData.fatherName && (
                    <div className="bg-gray-50 p-4 rounded border">
                      <h4 className="font-semibold text-gray-800 mb-3">Father's Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <DetailRow label="Name" value={appData.fatherName} />
                        <DetailRow label="Age" value={appData.fatherAge} />
                        <DetailRow label="Qualification" value={appData.fatherQualification} />
                        <DetailRow label="Profession" value={appData.fatherProfession} />
                        <DetailRow label="Phone" value={appData.fatherPhoneNo} />
                        <DetailRow label="Email" value={appData.fatherEmail} />
                        <DetailRow label="Aadhar No" value={appData.fatherAadharNo} />
                        <DetailRow label="Annual Income" value={appData.fatherAnnualIncome} />
                      </div>
                    </div>
                  )}

                  {/* Mother */}
                  {appData.motherName && (
                    <div className="bg-gray-50 p-4 rounded border">
                      <h4 className="font-semibold text-gray-800 mb-3">Mother's Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <DetailRow label="Name" value={appData.motherName} />
                        <DetailRow label="Age" value={appData.motherAge} />
                        <DetailRow label="Qualification" value={appData.motherQualification} />
                        <DetailRow label="Profession" value={appData.motherProfession} />
                        <DetailRow label="Phone" value={appData.motherPhoneNo} />
                        <DetailRow label="Email" value={appData.motherEmail} />
                        <DetailRow label="Aadhar No" value={appData.motherAadharNo} />
                        <DetailRow label="Annual Income" value={appData.motherAnnualIncome} />
                      </div>
                    </div>
                  )}

                  {/* Guardian */}
                  {appData.guardianName && (
                    <div className="bg-gray-50 p-4 rounded border">
                      <h4 className="font-semibold text-gray-800 mb-3">Guardian's Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <DetailRow label="Name" value={appData.guardianName} />
                        <DetailRow label="Age" value={appData.guardianAge} />
                        <DetailRow label="Qualification" value={appData.guardianQualification} />
                        <DetailRow label="Profession" value={appData.guardianProfession} />
                        <DetailRow label="Phone" value={appData.guardianContactNo || appData.guardianPhoneNo} />
                        <DetailRow label="Email" value={appData.guardianEmail} />
                        <DetailRow label="Aadhar No" value={appData.guardianAadharNo} />
                        <DetailRow label="Annual Income" value={appData.guardianAnnualIncome} />
                      </div>
                    </div>
                  )}
                </div>

                {appData.siblings && appData.siblings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Sibling Details</h4>
                    <div className="space-y-3">
                      {appData.siblings.map((sib, index) => (
                        sib.name && (
                          <div key={index} className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded border">
                            <DetailRow label="Name" value={sib.name} />
                            <DetailRow label="Age" value={sib.age} />
                            <DetailRow label="College/School" value={sib.collegeName} />
                            <DetailRow label="Class/Standard" value={sib.standard} />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div className="col-span-1 md:col-span-2">
                <SectionHeader icon={Heart} title="Student Preferences" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailRow label="Interests/Hobbies" value={appData.interest || 'N/A'} />
                  <DetailRow label="Language Spoken at Home" value={appData.homeLanguage || 'N/A'} />
                  <DetailRow label="Yearly Budget" value={appData.yearlyBudget || 'N/A'} />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
