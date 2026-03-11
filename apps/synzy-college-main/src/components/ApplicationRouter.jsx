import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkApplicationExists } from '../api/applicationService';
import { Loader2 } from 'lucide-react';

const ApplicationRouter = () => {
  const navigate = useNavigate();
  const { collegeId } = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id && collegeId) {
      determineFlow();
    }
  }, [currentUser, collegeId]);

  const determineFlow = async () => {
    try {
      const existingApplication = await checkApplicationExists(currentUser._id);
      
      if (existingApplication) {
        // Application exists - go to flow handler
        navigate(`/application-flow/${collegeId}`);
      } else {
        // No application - go directly to form
        navigate(`/student-application?collegeId=${collegeId}`);
      }
    } catch (error) {
      console.error('Error determining flow:', error);
      // Default to form if there's an error
      navigate(`/student-application?collegeId=${collegeId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Determining application flow...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ApplicationRouter;
