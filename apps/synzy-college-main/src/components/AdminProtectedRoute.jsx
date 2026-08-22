import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading: isLoading } = useAuth();
  const location = useLocation();

  console.log("AdminProtectedRoute -> isLoading:", isLoading);
  console.log("AdminProtectedRoute -> user:", user);
  console.log("Admin token in localStorage:", localStorage.getItem("authToken"));
  console.log("Admin user in localStorage:", localStorage.getItem("userData"));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.userType !== 'admin') {
    // Redirect to regular login if not an admin
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SEO title="Admin Portal | Synzy" noindex={true} />
      {children}
    </>
  );
};

export default AdminProtectedRoute;


