// src/components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import CollegeCard from './CollegeCard';
import UserProfileForm from './UserProfileForm';
import { fetchStudentPDF } from '../api/apiService';
import {
  updateUserProfile,
  createStudentProfile,
  getUserProfile,
  updateUserPreferences,
  createUserPreferences,
  saveUserPreferences,
  getUserPreferences,
  getFormsByStudent
} from '../api/userService';
import { getcollegeById } from '../api/adminService';
import { Download, Eye } from 'lucide-react';

const UserDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser, updateUserContext } = useAuth();

  const [applicationExists, setApplicationExists] = useState(false);
  const [applications, setApplications] = useState([]);
  const [collegeNameById, setcollegeNameById] = useState({});
  const [forms, setForms] = useState([]);
  const [displayForms, setDisplayForms] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(() => !currentUser?.contactNo);

  // Ensure student profile exists and load preferences
  useEffect(() => {
    const ensureStudentProfile = async () => {
      if (!currentUser?._id) return;

      try {
        const profileRes = await getUserProfile(currentUser._id);
        const profileData = profileRes?.data?.data || profileRes?.data;

        if (!profileData) {
          console.log('🔄 User profile not found, creating new profile...');
          const createRes = await createStudentProfile({
            name: currentUser.name || '',
            email: currentUser.email,
            authId: currentUser._id
          });
          const createdProfileData = createRes?.data?.data || createRes?.data;
          if (createdProfileData) {
            console.log('✅ User profile created successfully');
            updateUserContext({ ...currentUser, ...createdProfileData });
          }
        } else if (!currentUser.contactNo) {
          console.log('✅ User profile found, updating context');
          updateUserContext({ ...currentUser, ...profileData });
        }

        // Load user preferences
        try {
          const studentId = currentUser.studentId || profileData?._id || currentUser._id;
          console.log("Fetching preferences for studentId:", studentId);
          const preferencesRes = await getUserPreferences(studentId);
          console.log("Preferences response:", preferencesRes);
          
          // Handle different response structures
          let preferencesData = null;
          if (preferencesRes?.data?.data) {
            preferencesData = preferencesRes.data.data;
          } else if (preferencesRes?.data && preferencesRes.status !== 'Not Found') {
            preferencesData = preferencesRes.data;
          } else if (preferencesRes && !preferencesRes.status) {
            preferencesData = preferencesRes;
          }
          
          console.log("Parsed preferences data:", preferencesData);
          
          if (preferencesData) {
            updateUserContext({ 
              ...currentUser, 
              ...profileData,
              preferences: preferencesData 
            });
          } else {
            console.log('No preferences data found, user may need to set preferences');
          }
        } catch (prefErr) {
          console.log('Error fetching preferences:', prefErr.message);
          // Don't fail silently - preferences might be important for display
          console.error('Full preference error:', prefErr);
        }
      } catch (err) {
        console.error('Error ensuring student profile:', err);
        
        // If it's a "Student Not Found" error, try to create the profile
        if (err?.message?.includes('Student Not Found') || err?.status === 'failed') {
          console.log('🔄 Student not found, attempting to create profile...');
          try {
            const createRes = await createStudentProfile({
              name: currentUser.name || '',
              email: currentUser.email,
              authId: currentUser._id
            });
            const createdProfileData = createRes?.data?.data || createRes?.data;
            if (createdProfileData) {
              console.log('✅ User profile created after "Student Not Found" error');
              updateUserContext({ ...currentUser, ...createdProfileData });
            }
          } catch (createErr) {
            console.error('Failed to create user profile after "Student Not Found":', createErr);
          }
        }
      }
    };

    ensureStudentProfile();
  }, [currentUser, updateUserContext]);

  // Fetch forms once when user changes
  useEffect(() => {
    const loadForms = async () => {
      try {
        if (!currentUser?._id) return;
        // Use student profile ID if available, otherwise auth ID
        const studentId = currentUser.studentId || currentUser._id;
        console.log('🔍 Dashboard fetching applications for student ID:', studentId);
        const res = await getFormsByStudent(studentId);
        const list = Array.isArray(res?.data) ? res.data : [];
        console.log('📊 Dashboard applications data:', list);
        setForms(list);
        setApplications(list);
        setApplicationExists(list.length > 0);
      } catch (err) {
        console.error('Failed to load applications:', err);
        setForms([]);
        setApplications([]);
        setApplicationExists(false);
      }
    };
    loadForms();
  }, [currentUser]);

  // Disable synthetic localStorage merging to fix duplicates
  useEffect(() => {
    setDisplayForms(forms || []);
  }, [forms, currentUser]);

  // Load college names for applications (only based on current display list)
  useEffect(() => {
    const loadcollegeNames = async () => {
      const ids = (displayForms.length ? displayForms : forms)
        .map(app =>
          typeof (app.collegeId || app.college) === 'object'
            ? (app.collegeId || app.college)?._id
            : (app.collegeId || app.college)
        )
        .filter(Boolean);

      const uniqueIds = Array.from(new Set(ids));
      const idsToFetch = uniqueIds.filter(id => !collegeNameById[id]);
      if (!idsToFetch.length) return;

      try {
        const results = await Promise.allSettled(idsToFetch.map(id => getcollegeById(id)));
        const newMap = {};
        results.forEach((res, idx) => {
          const id = idsToFetch[idx];
          newMap[id] =
            res.status === 'fulfilled'
              ? res.value?.data?.data?.name || res.value?.data?.name || 'college'
              : 'college';
        });
        setcollegeNameById(prev => ({ ...prev, ...newMap }));
      } catch (err) {
        console.error('Error loading college names:', err);
      }
    };

    loadcollegeNames();
  }, [displayForms, forms]);

  // Handle profile update
  const handleProfileUpdate = async (profileData) => {
    try {
      const authId = currentUser.authId || currentUser._id;
      if (!authId) throw new Error('User ID not found. Cannot update profile.');

      // Update main profile fields
      const updatedProfile = await updateUserProfile(authId, profileData);

      // Fetch the updated profile from the server to ensure we have the latest data
      const freshProfile = await getUserProfile(authId);
      const freshData = freshProfile?.data?.data || freshProfile?.data;

      // Update preferences separately if present
      if (profileData.preferences) {
        console.log('Saving preferences with studentId:', freshData?._id || authId);
        await saveUserPreferences(freshData?._id || authId, {
          studentId: freshData?._id || authId,
          ...profileData.preferences
        });
      }

      // Also fetch updated preferences
      let freshPreferences = null;
      try {
        const studentId = freshData?._id || authId;
        const preferencesRes = await getUserPreferences(studentId);
        console.log("Updated preferences response:", preferencesRes);
        
        // Handle different response structures
        if (preferencesRes?.data?.data) {
          freshPreferences = preferencesRes.data.data;
        } else if (preferencesRes?.data && preferencesRes.status !== 'Not Found') {
          freshPreferences = preferencesRes.data;
        } else if (preferencesRes && !preferencesRes.status) {
          freshPreferences = preferencesRes;
        }
        
        console.log("Updated preferences data:", freshPreferences);
      } catch (prefErr) {
        console.log('No preferences found after update:', prefErr.message);
      }

      // Update the context with the fresh data from the server
      updateUserContext({
        ...currentUser,
        ...freshData,
        preferences: freshPreferences
      });

      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      return updatedProfile;
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile.');
      throw err;
    }
  };

  // Card and Apply actions
  const handleCardClick = college => navigate(`/college/${college._id || college.collegeId}`);
  const handleApplyClick = college => {
    const collegeId = college._id || college.collegeId;
    if (!collegeId) return;
    localStorage.setItem('lastAppliedcollegeId', String(collegeId));
    const displayName = college.name || college.collegeName || college.title || college.instituteName;
    if (displayName) {
      try { localStorage.setItem(`collegeName:${collegeId}`, displayName); } catch (_) {}
    }
    navigate(`/apply/${collegeId}`);
  };

  if (!currentUser) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Profile Summary component
  const ProfileSummary = () => {
    const profile = currentUser || {};
    console.log("ProfileSummary - currentUser:", currentUser);
    console.log("ProfileSummary - preferences:", profile.preferences);
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">My Profile</h2>
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="inline-flex items-center bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-700"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>{' '}
            <span className="text-gray-900">{profile.name || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <span className="text-gray-900">{profile.email || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Contact:</span>{' '}
            <span className="text-gray-900">{profile.contactNo || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">DOB:</span>{' '}
            <span className="text-gray-900">
              {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>{' '}
            <span className="text-gray-900">{profile.gender || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>{' '}
            <span className="text-gray-900">
              {[profile.city, profile.state].filter(Boolean).join(', ') || '—'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500">Preferences:</span>{' '}
            <span className="text-gray-900">
              {profile.preferences
                ? [
                    profile.preferences.boards,
                    profile.preferences.preferredStandard,
                    profile.preferences.collegeType,
                    profile.preferences.shift
                  ]
                    .filter(Boolean)
                    .join(' • ')
                : '—'}
            </span>
          </div>
        </div>
      </div>
    );
  };
 // ✅ Extract ONLY the REAL applicationId (not formId / wrapper id)
const extractApplicationId = (app) => {
  let applicationId = null;

  // ⭐ CASE 1 (MOST IMPORTANT): applicationData.applicationId._id
  if (typeof app?.applicationData?.applicationId?._id === 'string') {
    applicationId = app.applicationData.applicationId._id;
  }
  // Case 2: deeply nested raw object (backup)
  else if (typeof app?._raw?.applicationId?._id === 'string') {
    applicationId = app._raw.applicationId._id;
  }
  // Case 3: applicationId populated object
  else if (typeof app?.applicationId === 'object' && app?.applicationId?._id) {
    applicationId = app.applicationId._id;
  }
  // Case 4: applicationId as string
  else if (typeof app?.applicationId === 'string') {
    applicationId = app.applicationId;
  }

  return applicationId;
};

const extractStudentId = (app, currentUser) => {
  return (
    app?.applicationData?.studId?._id ||
    app?.studId?._id ||
    app?.studId ||
    currentUser?.studentId ||
    currentUser?._id ||
    null
  );
};

  // Main render
  return (
    <div className="space-y-12">
      {/* Shortlist */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Shortlisted colleges</h2>
        {shortlist && shortlist.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shortlist.map(college => (
              <CollegeCard
                key={college.collegeId || college._id}
                college={college}
                onCardClick={() => handleCardClick(college)}
                onShortlistToggle={() => onShortlistToggle(college)}
                isShortlisted={shortlist.some(
                  item =>
                    (item.collegeId || item._id) === (college.collegeId || college._id)
                )}
                onCompareToggle={() => onCompareToggle(college)}
                isCompared={comparisonList?.some(
                  item =>
                    (item.collegeId || item._id) === (college.collegeId || college._id)
                )}
                currentUser={currentUser}
                onApply={() => handleApplyClick(college)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p>
              {!shortlist?.length
                ? 'Loading...'
                : "You haven't shortlisted any colleges yet."}
            </p>
          </div>
        )}
      </div>

      {/* Applications */}
      {applicationExists && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">My Applications</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">college</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Application ID</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(displayForms.length ? displayForms : (forms.length ? forms : applications)).map(row => {
                    const collegeRef = row.collegeId || row.college;
                    let collegeIdStr =
                      typeof collegeRef === 'object' ? collegeRef?._id : collegeRef;
                    if (!collegeIdStr)
                      collegeIdStr = localStorage.getItem('lastAppliedcollegeId') || null;
                    const displayName =
                      typeof collegeRef === 'object'
                        ? (collegeRef?.name || collegeRef?.collegeName)
                        : (row.collegeName || collegeNameById[collegeIdStr] || collegeIdStr || '—');
                    const rawStatus = (row.status || row.applicationStatus || row.formStatus || row.decision || 'Pending');
                    const status = String(rawStatus).toLowerCase().includes('submit') ? 'Submitted' : (
                      String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1)
                    );
                    const idToShow = row._id || row.applicationId || '—';

                    return (
                      <tr key={row._id || row.applicationId} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          {collegeIdStr ? (
                            <button
                              onClick={() => navigate(`/college/${collegeIdStr}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                            >
                              {displayName}
                            </button>
                          ) : (
                            <span>{displayName}</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={status.toLowerCase().includes('accept') ? 'text-green-700' : status.toLowerCase().includes('reject') ? 'text-red-600' : 'text-amber-600'}>
                            {status}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{idToShow}</td>
                        <td className="py-2 pr-4">
                          {collegeIdStr && (
                            <button
                              type="button"
                              onClick={() => navigate(`/college/${collegeIdStr}`)}
                              className="inline-flex items-center bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 mr-2"
                            >
                              View college
                            </button>
                          )}
   {/* View PDF */}
{(() => {
  const studentId = extractStudentId(row, currentUser);
  const applicationId = extractApplicationId(row);

  if (!studentId || !applicationId) return null;

  const handleOpenPdfClick = async () => {
    const toastId = toast.loading("Opening PDF...");
    try {
      const pdfData = await fetchStudentPDF(studentId, applicationId);
      if (!pdfData || !pdfData.blob) {
        throw new Error("Failed to get PDF blob");
      }
      toast.update(toastId, { render: "PDF ready!", type: "success", isLoading: false, autoClose: 2000 });
      window.open(pdfData.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Unable to open PDF. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <button
      onClick={handleOpenPdfClick}
      className="inline-flex items-center bg-white text-gray-700 font-semibold px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 mr-2"
    >
      <Eye size={16} className="mr-1.5" />
      View PDF
    </button>
  );
})()}



                          {/* Download PDF */}
                          {(() => {
  const studentId = extractStudentId(row, currentUser);
  const applicationId = extractApplicationId(row);

  if (!studentId || !applicationId) {
    console.warn('❌ Missing IDs for PDF download', {
      studentId,
      applicationId,
      row
    });
    return null;
  }

  const handleDownloadPdfClick = async () => {
    const toastId = toast.loading("Downloading PDF...");
    try {
      const pdfData = await fetchStudentPDF(studentId, applicationId);
      if (!pdfData || !pdfData.blob) {
        throw new Error("Failed to get PDF blob");
      }
      
      // Use displayName if available, fallback to 'Details'
      const safeDisplayName = displayName ? displayName.replace(/[^a-zA-Z0-9]/g, '_') : 'Details';
      const link = document.createElement("a");
      link.href = pdfData.url;
      link.download = `College-${safeDisplayName}-Details.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfData.url);

      toast.update(toastId, { render: "PDF downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Unable to download college PDF. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <button
      onClick={handleDownloadPdfClick}
      className="inline-flex items-center bg-green-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-green-700"
    >
      <Download size={16} className="mr-1.5" />
      Download PDF
    </button>
  );
})()}

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div>
        {isEditingProfile ? (
          <UserProfileForm currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
        ) : (
          <ProfileSummary />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
