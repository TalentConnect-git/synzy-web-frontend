// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { loginAdmin as apiLoginAdmin } from '../api/adminService';
import { loginUser as apiLoginUser } from '../api/authService';
import { getUserProfile, getUserPreferences } from '../api/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const safeParseJSON = (value) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
      return JSON.parse(value);
    } catch (_) {
      return null;
    }
  };

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('userData');
    const parsed = safeParseJSON(raw);
    if (!parsed && raw) {
      // Clean up corrupted value
      localStorage.removeItem('userData');
    }
    return parsed;
  });

  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem('authToken');
    return raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const updateUserContext = useCallback((newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);
  const setAuthSession = useCallback((userData, token) => {
  console.log('🔐 Setting auth session directly (signup / oauth)');

  setUser(userData);
  setToken(token);

  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('authToken', token);
}, []);


  const login = async (credentials, userType = 'user') => {
    try {
      console.log('🔐 Starting login process for userType:', userType);
      // Clear any existing user state first to prevent conflicts
      setUser(null);
      setToken(null);

      let response;

      if (userType === 'admin') {
        try {
          response = await apiLoginAdmin(credentials);
          console.log('Full admin response:', response);
          
          // Handle different response structures
          let token, adminData;
          
          // Check if response has nested data structure (response.data.data)
          if (response?.data?.data) {
            token = response.data.data.token;
            adminData = response.data.data.admin || response.data.data.user || response.data.data.auth;
          } 
          // Check if response has flat structure (response.data)
          else if (response?.data) {
            token = response.data.token;
            adminData = response.data.admin || response.data.user || response.data.auth;
            
            // If still no adminData, create minimal admin object
            if (!adminData) {
              console.log('Creating minimal admin data from response');
              adminData = {
                email: credentials.email,
                userType: 'admin',
                isAdmin: true
              };
            }
          }

          // Validate token exists
          if (!token) {
            console.error('No token in response:', response.data);
            throw new Error('No authentication token received');
          }

          // Create complete admin user object
          const adminUser = {
            ...adminData,
            userType: 'admin',
            isAdmin: true,
            email: credentials.email
          };

          console.log('Setting admin user:', adminUser);

          setToken(token);
          localStorage.setItem('authToken', token);
          setUser(adminUser);
          localStorage.setItem('userData', JSON.stringify(adminUser));
          // Keep lastCreatedcollegeId for admin/college users, but remove for other account types
          if (adminUser.userType !== 'college' && !adminUser.isAdmin) {
            try { localStorage.removeItem('lastCreatedcollegeId'); } catch (_) {}
          }
          
          toast.success('Admin login successful!');
          return;
        } catch (error) {
          const message = error.response?.data?.message || error.message;
          console.error('Admin login error:', message);
          throw new Error(`Admin login failed: ${message}`);
        }
      }

      // --- Normal user login ---
      response = await apiLoginUser(credentials);
      const { token, auth: basicAuthData } = response.data.data;

      setToken(token);
      localStorage.setItem('authToken', token);

      const userId = basicAuthData?._id;

      // Special handling for college accounts
      if (basicAuthData.userType === 'college') {
        console.log('🏫 College account login detected');
        
        // For college accounts, we don't fetch the college profile here
        // because college accounts don't have permission to use admin endpoints
        // The RegistrationPage will handle finding the college profile
        const collegeUserData = {
          ...basicAuthData,
          userType: 'college',
          // authId is already in basicAuthData, which will be used to match the college
        };
        
        setUser(collegeUserData);
        localStorage.setItem('userData', JSON.stringify(collegeUserData));
        toast.success('college login successful!');
        return;
      }
      
      if (!userId) {
        setUser(basicAuthData);
        localStorage.setItem('userData', JSON.stringify(basicAuthData));
        // If this is not a college account, clear any last-created-college id to avoid leaking another user's college
        if (basicAuthData.userType !== 'college') {
          try { localStorage.removeItem('lastCreatedcollegeId'); } catch (_) {}
        }
        toast.success('Login successful!');
        return;
      }

      // Fetch full profile and preferences
      const profileResponse = await getUserProfile(basicAuthData.authId || userId);
      const profileData = profileResponse.data?.data || profileResponse.data;
      const studentId = profileData?._id;

      let preferences = null;
      try {
        if (studentId) {
          console.log('Fetching preferences for studentId during login:', studentId);
          const prefResponse = await getUserPreferences(studentId);
          console.log('Preferences response during login:', prefResponse);
          
          // Handle different response structures
          if (prefResponse?.data?.data) {
            preferences = prefResponse.data.data;
          } else if (prefResponse?.data && prefResponse.status !== 'Not Found') {
            preferences = prefResponse.data;
          } else if (prefResponse && !prefResponse.status) {
            preferences = prefResponse;
          }
          
          console.log('Parsed preferences during login:', preferences);
        }
      } catch (error) {
        console.log('Error fetching preferences during login:', error.message);
        // Preferences are optional, continue without them
      }

      const fullUserData = {
        ...basicAuthData,
        ...profileData,
        studentId: studentId, // Store the student profile ID for consistent use
        ...(preferences ? { preferences } : {})
      };

      setUser(fullUserData);
      localStorage.setItem('userData', JSON.stringify(fullUserData));
      // Clear lastCreatedcollegeId for non-college/non-admin users to prevent stale college visibility
      if (fullUserData.userType !== 'college' && !fullUserData.isAdmin) {
        try { localStorage.removeItem('lastCreatedcollegeId'); } catch (_) {}
      }
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Starting logout process...');

    // Clear state
    setUser(null);
    setToken(null);

    // Clear ALL localStorage items to prevent session conflicts
    // EXCEPT remember-me preferences which are login-page specific
    const keysToRemove = [
      'authToken',
      'userData',
      'lastCreatedcollegeId',
      'comparisonList',
      'collegeRegDraft', // Contains userType and college data
      'lastAppliedcollegeId', // Navigation - from ApplicationStatusPage
      'redirectPath', // Navigation
      'lastInterviewNotification', // Features
      'guestSearchCriteria', // Features
      'shortlist', // User data
      'collegeName', // Dynamic college entries (base key)
      'adminRedirectPath', // Admin navigation
    ];

    // Remove specific keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors for missing keys
      }
    });

    // Clear all dynamic entries that might contain user-specific data
    try {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (
          key.startsWith('collegeName:') || // college name cache
          key.startsWith('collegeInfo:') || // college info cache from ApplicationStatusPage
          key.startsWith('adminRedirectPath') // Admin navigation
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore errors when accessing localStorage
    }

    console.log('✅ Complete logout - all session data cleared (remember-me preferences preserved)');
    toast.success('Logged out successfully');
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    updateUserContext,
    setAuthSession,
    isAuthenticated: !!token,
    loading
  }), [user, token, loading, updateUserContext,setAuthSession]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading application...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};