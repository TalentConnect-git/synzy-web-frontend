import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFormsByStudent, generateStudentPdf } from '../api/userService';
import { getcollegeById } from '../api/adminService';

const ApplicationStatusPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [displayForms, setDisplayForms] = useState([]);
  const [error, setError] = useState('');
  const [collegeNameById, setcollegeNameById] = useState({});
  const [cachedAppliedcolleges, setCachedAppliedcolleges] = useState([]);

 const handleViewPdf = async (studId, applicationId) => {
  if (!studId || !applicationId) return;

  try {
    await generateStudentPdf(studId, applicationId);
  } catch {}

  // 🔥 FORCE absolute URL
  const pdfUrl = `https://api.synzy.in/api/users/pdf/view/${studId}/${applicationId}`;

  console.log("OPENING (FORCED):", pdfUrl);

  window.open(pdfUrl, "_blank", "noopener,noreferrer");
};





  useEffect(() => {
    const run = async () => {
      if (!currentUser?._id) return;
      try {
        setIsLoading(true);
        // Use student profile ID if available, otherwise auth ID
        const studentId = currentUser.studentId || currentUser._id;
        console.log('🔍 Fetching applications for student ID:', studentId, 'from user:', currentUser);
        const res = await getFormsByStudent(studentId);
        const data = res?.data || [];
        console.log('📊 Applications data received:', data);
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error fetching applications:', err);
        setError(err?.message || 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [currentUser]);

  // Resolve college names for any ids returned in forms
  useEffect(() => {
    // Load any locally cached college info saved during apply flow
    try {
      const userId = currentUser?._id;
      if (typeof localStorage !== 'undefined' && userId) {
        const cached = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`collegeInfo:${userId}:`)) {
            const raw = localStorage.getItem(k);
            try {
              const parsed = JSON.parse(raw || '{}');
              if (parsed && (parsed.collegeId || parsed.collegeName)) {
                cached.push(parsed);
              }
            } catch (_) {}
          }
        }
        setCachedAppliedcolleges(cached);
      }
    } catch (_) {}

    const fetchNames = async () => {
      const ids = forms
        .map(f => {
          const ref = f.collegeId || f.college;
          return typeof ref === 'object' ? (ref?._id || ref?.id) : ref;
        })
        .filter(Boolean);
      const unique = Array.from(new Set(ids)).filter(id => !collegeNameById[id]);
      if (!unique.length) return;
      try {
        const results = await Promise.allSettled(unique.map(id => getcollegeById(id)));
        const map = {};
        results.forEach((res, i) => {
          const id = unique[i];
          if (res.status === 'fulfilled') {
            const collegeData = res.value?.data?.data || res.value?.data;
            map[id] = collegeData?.name || collegeData?.collegeName || `college ID: ${id.slice(-8)}...`;
          } else {
            console.warn(`Failed to fetch college name for ID: ${id}`, res.reason);
            map[id] = `college ID: ${id.slice(-8)}...`;
          }
        });
        setcollegeNameById(prev => ({ ...prev, ...map }));
      } catch (error) {
        console.error('Error fetching college names:', error);
        // Set fallback names for all IDs
        const map = {};
        unique.forEach(id => {
          map[id] = `college ID: ${id.slice(-8)}...`;
        });
        setcollegeNameById(prev => ({ ...prev, ...map }));
      }
    };
    if (forms?.length) fetchNames();
  }, [forms, collegeNameById, currentUser]);

  // Merge API forms with locally cached applications to ensure all applied colleges appear
  useEffect(() => {
    try {
      const userId = currentUser?._id;
      const cached = [];
      if (typeof localStorage !== 'undefined' && userId) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`collegeInfo:${userId}:`)) {
            const raw = localStorage.getItem(k);
            try {
              const parsed = JSON.parse(raw || '{}');
              if (parsed && (parsed.collegeId || parsed.collegeName)) {
                cached.push(parsed);
              }
            } catch (_) {}
          }
        }
      }

      const synthesizedFromCache = cached.map((c) => ({
        _synthetic: true,
        collegeName: c.collegeName,
        collegeId: c.collegeId,
        status: 'Submitted',
        createdAt: c.createdAt || null,
      }));

      // Dedupe by strong id or collegeId+createdAt+collegeName
      const map = new Map();
      [...forms, ...synthesizedFromCache].forEach((item, idx) => {
        const strong = item?._id || item?.id;
        const sId = typeof item?.collegeId === 'object' ? (item?.collegeId?._id || item?.collegeId?.id) : item?.collegeId;
        const sName = item?.collegeName || item?.college?.name || '';
        const when = item?.createdAt || item?.updatedAt || '';
        const key = strong || `${sId || 'noid'}-${when || 'notime'}-${sName || 'noname'}-${idx}`;
        map.set(String(key), item);
      });
      setDisplayForms(Array.from(map.values()));
    } catch (e) {
      setDisplayForms(forms);
    }
  }, [forms, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/login')} className="px-4 py-2 rounded bg-blue-600 text-white">Sign in</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Applied Forms</h1>
          <p className="text-gray-600 text-sm mt-1">All colleges you have applied to and their current status.</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-4">{error}</div>
        ) : displayForms.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {displayForms.map((f) => {
              const submitted = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-';

              // Comprehensive debug logging to see full application structure
              console.log('Full application data:', f);
              console.log('Application keys:', Object.keys(f));
              console.log('Application values:', Object.values(f));

              const collegeRef = f.collegeId || f.college;
              const idStr = typeof collegeRef === 'object' ? (collegeRef?._id || collegeRef?.id) : collegeRef;

              // Enhanced college name resolution - includes local cache fallbacks when ids are missing
              let collegeName = 'Loading...';

              if (f.collegeName) {
                collegeName = f.collegeName;
              } else if (idStr && typeof localStorage !== 'undefined' && localStorage.getItem(`collegeName:${idStr}`)) {
                collegeName = localStorage.getItem(`collegeName:${idStr}`);
              } else if (typeof collegeRef === 'object' && (collegeRef?.name || collegeRef?.collegeName)) {
                collegeName = collegeRef.name || collegeRef.collegeName;
              } else if (idStr && collegeNameById[idStr] && collegeNameById[idStr] !== 'college') {
                collegeName = collegeNameById[idStr];
              } else if (f.college && typeof f.college === 'object' && f.college.name) {
                collegeName = f.college.name;
              } else if (idStr && collegeNameById[idStr]) {
                collegeName = collegeNameById[idStr];
              } else {
                // No IDs present → try last applied and cached mappings
                let fallbackName = null;
                try {
                  if (typeof localStorage !== 'undefined') {
                    const lastId = localStorage.getItem('lastAppliedcollegeId');
                    if (lastId) {
                      const n = localStorage.getItem(`collegeName:${lastId}`);
                      if (n) fallbackName = n;
                    }
                    if (!fallbackName && cachedAppliedcolleges?.length) {
                      fallbackName = cachedAppliedcolleges[0]?.collegeName || null;
                    }
                  }
                } catch (_) {}
                collegeName = fallbackName || 'Unknown college';
              }

              // Debug logging for college name resolution
              console.log('college name resolution for application:', f._id, {
                fcollegeName: f.collegeName,
                collegeRef: collegeRef,
                idStr: idStr,
                collegeNameById: collegeNameById[idStr],
                localStorageName: typeof localStorage !== 'undefined' ? localStorage.getItem(`collegeName:${idStr}`) : undefined,
                fcollege: f.college,
                finalcollegeName: collegeName
              });
              const rawStatus = (f.status || f.applicationStatus || f.formStatus || f.decision || 'pending');
              const status = String(rawStatus).toLowerCase().includes('submit') ? 'submitted' : (String(rawStatus).toLowerCase());

              return (
                <div key={f._id || f.id} className="bg-white rounded-xl shadow border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      {idStr ? (
                        <button 
                          onClick={() => navigate(`/college/${idStr}`)}
                          className="font-semibold text-gray-900 hover:text-blue-600 hover:underline truncate text-left block w-full"
                        >
                          {collegeName}
                        </button>
                      ) : (
                        <div className="font-semibold text-gray-900 truncate">{collegeName}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Status: <span className={status.includes('accept') ? 'text-green-700' : status.includes('reject') ? 'text-red-600' : 'text-amber-600'}>{status}</span></div>
                      <div className="text-xs text-gray-400 mt-1">Submitted: {submitted}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                     <button
  onClick={() =>
    handleViewPdf(
      f.studId?._id || f.studId,
      f.applicationId?._id || f.applicationId
    )
  }
  className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
>
  View PDF
</button>

                      <button onClick={() => navigate('/my-applications')} className="px-2 py-1 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">Open</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusPage;


