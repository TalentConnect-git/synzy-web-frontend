import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import CollegesPage from "./pages/CollegesPage";
import CollegeDetailsPage from "./pages/CollegeDetailsPage";
import LoginPage from "./pages/LoginPage";
import ComparePage from "./pages/ComparePage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ShortlistPage from "./pages/ShortlistPage";
import CollegePortalPage from "./pages/CollegePortalPage";
import StudentApplicationPage from "./pages/StudentApplicationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPage from "./pages/RegistrationPage";
import AdvancedSearchPage from "./pages/AdvancedSearchPage";
import PredictorPage from "./pages/PredictorPage";
import ChatbotPage from "./pages/ChatbotPage";
import SearchPage from "./pages/SearchPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCollegeDetailsPage from "./pages/AdminCollegeDetailsPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import BlogPage from "./pages/BlogPage";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ApplicationSummaryPage from "./pages/ApplicationSummaryPage";
import ApplicationConfirmationPage from "./pages/ApplicationConfirmationPage";
import CompareSelectPage from "./pages/CompareSelectPage";
import ApplicationFlowPage from "./pages/ApplicationFlowPage";
import ForgotPassword from "./pages/ForgotPassword";
import StudentApplicationTrackingPage from "./pages/StudentApplicationTrackingPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import {
  getShortlist,
  addToShortlist,
  removeFromShortlist,
} from "./api/userService";
import UserDashboard from "./components/UserDashboard";
import ChatbotFab from "./components/ChatbotFab";
import InterviewNotificationModal from "./components/InterviewNotificationModal";
import { useInterviewNotifications } from "./hooks/useInterviewNotifications";


function App() {
  const { user: currentUser, logout } = useAuth();
  const { interviewNotification, dismissNotification } = useInterviewNotifications();

  const navigate = useNavigate();

  const location = useLocation();

  const [shortlist, setShortlist] = useState([]);

  const [comparisonList, setComparisonList] = useState(() => {
    const saved = localStorage.getItem("comparisonList");

    return saved ? JSON.parse(saved) : [];
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("comparisonList", JSON.stringify(comparisonList));
  }, [comparisonList]);

  // Keep comparison count in sync when other pages update localStorage
  useEffect(() => {
    const onComparisonListUpdated = (e) => {
      try {
        if (e?.detail && Array.isArray(e.detail)) {
          setComparisonList(e.detail);
        } else {
          const saved = localStorage.getItem("comparisonList");
          setComparisonList(saved ? JSON.parse(saved) : []);
        }
      } catch (_) {}
    };
    window.addEventListener('comparisonListUpdated', onComparisonListUpdated);
    return () => window.removeEventListener('comparisonListUpdated', onComparisonListUpdated);
  }, []);

  // Clear comparison list when user logs out
  useEffect(() => {
    if (!currentUser) {
      setComparisonList([]);
    }
  }, [currentUser]);


useEffect(() => {
    const fetchShortlistAndProfile = async () => {
      // Agar user login nahi hai, to kuch mat karo
      if (!currentUser) {
        setShortlist([]);
        return;
      }

      // Skip shortlist/profile fetch for college and admin users
      if (currentUser.userType === 'college' || currentUser.userType === 'admin') {
        setShortlist([]);
        return;
      }

      try {
        // Yeh API call naye user ke liye fail hogi
        const authIdForApis = currentUser.authId || currentUser._id;
        const responseData = await getShortlist(authIdForApis);
        console.log("Fetched shortlist data:", responseData);
        const shortlistData = responseData.data || [];
        console.log("Setting shortlist to:", shortlistData);
        setShortlist(shortlistData);
      } catch (error) {
        // Yahan hum error ko handle karenge
        const errorMessage = error.response?.data?.message;

        // Check karo ki kya error "Student not found" hai
        if (errorMessage === "Student not found" || errorMessage === "Student Not Found") {
          console.log("Student profile not found. User needs to create profile first.");
          setShortlist([]); // Set empty shortlist instead of redirecting
          // Don't redirect automatically - let user decide when to create profile
        } else {
          // Agar koi aur error hai, to use console mein dikhao
          console.error("Could not load shortlisted colleges:", error.response?.data || error.message);
          setShortlist([]);
        }
      }
    };

    fetchShortlistAndProfile();
  }, [currentUser, navigate]); // navigate ko dependency array mein add karna zaroori hai


  const handleLogout = () => {
    logout();

    navigate("/");

   
  };

  const handleShortlistToggle = async (college) => {
    if (!currentUser) {
      toast.info("Please log in to shortlist colleges.");
      return;
    }
    // More robust ID extraction
    const collegeId = college.collegeId || college._id || college.id;
    const authId = currentUser.authId || currentUser._id || currentUser.id;
    
    // Check if the college is shortlisted with multiple ID field combinations
    const isShortlisted = shortlist.some(
      (item) => {
        const itemId = item.collegeId || item._id || item.id;
        return itemId === collegeId || 
               itemId === college.collegeId || 
               itemId === college._id || 
               itemId === college.id;
      }
    );

    console.log('Shortlist toggle:', {
      collegeName: college.name,
      collegeId,
      authId,
      isShortlisted,
      college,
      currentUser
    });

    if (isShortlisted) {
      // Optimistic remove
      const prevShortlist = shortlist;
      setShortlist((prev) =>
        prev.filter((item) => {
          const itemId = item.collegeId || item._id || item.id;
          return itemId !== collegeId && 
                 itemId !== college.collegeId && 
                 itemId !== college._id && 
                 itemId !== college.id;
        })
      );
      try {
        await removeFromShortlist(authId, collegeId);
        toast.success(`${college.name} removed from shortlist.`);
      } catch (error) {
        // Revert on failure
        setShortlist(prevShortlist);
        console.error('Failed to remove from shortlist:', {
          error: error.response?.data || error.message,
          collegeName: college.name,
          collegeId,
          authId
        });
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        toast.error(`Failed to remove ${college.name}: ${errorMessage}`);
      }
    } else {
      // Optimistic add
      const prevShortlist = shortlist;
      setShortlist((prev) => [...prev, college]);
      try {
        await addToShortlist(authId, collegeId);
        // Optionally refresh in background to sync with server shape
        try {
          const responseData = await getShortlist(authId);
          if (responseData && Array.isArray(responseData.data)) {
            setShortlist(responseData.data);
          }
        } catch (_) {}
        toast.success(`${college.name} added to shortlist!`);
      } catch (error) {
        // Revert on failure
        setShortlist(prevShortlist);
        console.error('Failed to add to shortlist:', {
          error: error.response?.data || error.message,
          collegeName: college.name,
          collegeId,
          authId
        });
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        toast.error(`Failed to shortlist ${college.name}: ${errorMessage}`);
      }
    }
  };

  const handleCompareToggle = (college) => {
    setComparisonList((prevList) => {
      const isInList = prevList.some(
        (item) =>
          (item.collegeId || item._id) === (college.collegeId || college._id)
      );

      return isInList
        ? prevList.filter(
            (item) =>
              (item.collegeId || item._id) !== (college.collegeId || college._id)
          )
        : [...prevList, college];
    });
  };

  // Calculate valid shortlist count (filter out invalid entries)
  const validShortlistCount = Array.isArray(shortlist) 
    ? shortlist.filter(college => college && (college._id || college.collegeId)).length 
    : 0;

  return (
    <>
      <Header
        isMobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        compareCount={comparisonList.length}
        shortlistCount={validShortlistCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
         {/* Public Routes */}
         <Route 
           path="/" 
           element={
             <HomePage 
               onCompareToggle={handleCompareToggle}
               comparisonList={comparisonList}
               shortlist={shortlist}
               onShortlistToggle={handleShortlistToggle}
             />
           } 
         />
         <Route path="/landing" element={<LandingPage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} />
         <Route path="/admin/login" element={<AdminLoginPage />} />
         <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route path="/create-profile" element={<CreateProfilePage shortlist={shortlist}/>} />
          <Route
            path="/signup-college"
            element={<SignUpPage iscollegeSignUp={true} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route
            path="/colleges"
            element={
              <CollegesPage
                onCompareToggle={handleCompareToggle}
                comparisonList={comparisonList}
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
              />
            }
          />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/search-colleges" element={<SearchPage />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailsPage />} />
          <Route path="/application-status" element={<ApplicationStatusPage />} />
          <Route path="/application-summary" element={<ApplicationSummaryPage />} />
          <Route path="/application-confirmation" element={<ApplicationConfirmationPage />} />
          <Route path="/compare/select" element={<CompareSelectPage />} />
          <Route
            path="/college/:id"
            element={
              <collegeDetailsPage
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
              />
            }
          />
          <Route
            path="/compare"
            element={
              <ComparePage
                comparisonList={comparisonList}
                onCompareToggle={handleCompareToggle}
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
              />
            }
          />
          <Route
            path="/shortlist"
            element={
              <ShortlistPage
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
                comparisonList={comparisonList}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
     {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  shortlist={shortlist}
                  onShortlistToggle={handleShortlistToggle}
                  comparisonList={comparisonList}
                  onCompareToggle={handleCompareToggle}
                />
              }
            />
            <Route path="/college-registration" element={<RegistrationPage />} />
            <Route
              path="/college-portal/*"
            element={<CollegePortalPage currentUser={currentUser} onLogout={handleLogout} />}
            />
            <Route
              path="/apply/:collegeId"
              element={<ApplicationFlowPage />}
            />
            <Route
              path="/student-application/:collegeId"
              element={<StudentApplicationPage />}
            />
            <Route
              path="/my-applications"
              element={
                currentUser?.userType === 'student' || currentUser?.userType === 'parent' ? (
                  <StudentApplicationTrackingPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
          </Route>
          {/* Admin routes guarded separately so they aren't blocked by user onboarding */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/college/:id"
            element={
              <AdminProtectedRoute>
                <AdminCollegeDetailsPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
      <ChatbotFab />
      
      {/* Interview Notification Modal */}
      {interviewNotification && (
        <InterviewNotificationModal
          isOpen={!!interviewNotification}
          onClose={dismissNotification}
          interviewData={interviewNotification.interviewData}
          collegeName={interviewNotification.collegeName}
          notificationType={interviewNotification.notificationType}
        />
      )}
      
      <ToastContainer position="top-right" autoClose={3000} theme="colored" /> 
    </>
  );
}

export default App;
