import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Phone, Mail, Calendar, User, XCircle, Building, BookOpen, Users, Award, Sun, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { getcollegesByStatus, updatecollegeStatus } from '../api/adminService';
import { Link } from 'react-router-dom';

const PendingCollegesSectionfixed = () => {
  const [pendingcolleges, setPendingcolleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadPendingcolleges();
  }, []);

  const loadPendingcolleges = async () => {
    try {
      setIsLoading(true);
      const response = await getcollegesByStatus('pending');
      const raw = response?.data;
      const normalized = Array.isArray(raw?.data)
        ? raw.data
        : (Array.isArray(raw)
            ? raw
            : (Array.isArray(raw?.colleges) ? raw.colleges : []));
      
      // Debug: Log the complete response structure
      console.log('🔍 Full API Response:', response);
      console.log('🔍 Raw data:', raw);
      console.log('🔍 Normalized colleges:', normalized);
      
      if (normalized.length > 0) {
        console.log('🔍 First college object:', normalized[0]);
        console.log('🔍 Available ID fields:', {
          _id: normalized[0]._id,
          collegeId: normalized[0].collegeId,
          id: normalized[0].id,
          allKeys: Object.keys(normalized[0])
        });
      }
      
      // Deduplicate colleges by authId - keep only the most recent one per authId
      const deduplicatedcolleges = [];
      const seencolleges = new Map(); // Track by authId or _id
      
      // Sort by createdAt (most recent first) to keep the latest entry
      const sortedcolleges = [...normalized].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Most recent first
      });
      
      for (const college of sortedcolleges) {
        // Use authId as primary identifier, fallback to email (for legacy colleges), then _id
        const identifier = college.authId || (college.email ? `email:${college.email.toLowerCase()}` : college._id);
        
        if (!identifier) {
          // If no identifier at all, include it (shouldn't happen but safe)
          deduplicatedcolleges.push(college);
          console.warn('⚠️ college without authId, email, or _id:', college.name);
          continue;
        }
        
        // If we haven't seen this identifier yet, add it
        if (!seencolleges.has(identifier)) {
          seencolleges.set(identifier, college);
          deduplicatedcolleges.push(college);
        } else {
          console.log('🗑️ Removing duplicate college:', {
            name: college.name,
            _id: college._id,
            authId: college.authId,
            email: college.email,
            createdAt: college.createdAt,
            identifier: identifier,
            kept: seencolleges.get(identifier).name
          });
        }
      }
      
      console.log(`📊 Deduplication: ${normalized.length} colleges → ${deduplicatedcolleges.length} unique colleges`);
      console.log(`📊 Unique identifiers found: ${seencolleges.size}`);
      
      setPendingcolleges(deduplicatedcolleges);
    } catch (error) {
      console.error('Failed to load pending colleges:', error);
      toast.error('Failed to load pending colleges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptcollege = async (collegeId) => {
    console.log('🔍 handleAcceptcollege called with collegeId:', collegeId);
    console.log('🔍 collegeId type:', typeof collegeId);
    console.log('🔍 collegeId value:', collegeId);
    
    if (!collegeId) {
      console.error('college ID is missing');
      toast.error('college ID is missing');
      return;
    }
    try {
      setAcceptingId(collegeId);
      await updatecollegeStatus(collegeId, 'accepted');

      // Refresh pending list from server to reflect accurate state
      await loadPendingcolleges();
    } catch (error) {
      console.error('Failed to accept college:', error);
      toast.error('Failed to accept college');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectcollege = async (collegeId) => {
    console.log('🔍 handleRejectcollege called with collegeId:', collegeId);
    console.log('🔍 collegeId type:', typeof collegeId);
    console.log('🔍 collegeId value:', collegeId);
    
    if (!collegeId) {
      console.error('college ID is missing');
      toast.error('college ID is missing');
      return;
    }
    try {
      setRejectingId(collegeId);
      await updatecollegeStatus(collegeId, 'rejected');
      await loadPendingcolleges();
      toast.success('college rejected successfully!');
    } catch (error) {
      console.error('Failed to reject college:', error);
      toast.error('Failed to reject college');
    } finally {
      setRejectingId(null);
    }
  };


  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pending colleges...</span>
        </div>
      </div>
    );
  }
  

  if (pendingcolleges.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending colleges</h3>
          <p className="text-gray-500">All colleges have been reviewed and processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Pending colleges ({pendingcolleges.length})
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pendingcolleges.map((college, index) => {
          // Extract college ID from any possible field
          const collegeId = college._id || college.collegeId || college.id || college.userId || college.authId;
          console.log(`🔍 college ${index} ID extraction:`, {
            _id: college._id,
            collegeId: college.collegeId,
            id: college.id,
            userId: college.userId,
            authId: college.authId,
            extractedId: collegeId,
            allKeys: Object.keys(college)
          });
          
          return (
        <div key={collegeId || index} className="p-6 border-b border-gray-200 last:border-b-0">
          {/* college Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h4 className="text-xl font-bold text-gray-900">{college.name}</h4>
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending Approval
                </span>
              </div>
            </div>
          </div>

          {/* Essential college Information Only */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Location */}
            {college.address && (
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block">Location</span>
                  <span className="text-gray-900 font-medium">{college.address}</span>
                </div>
              </div>
            )}
            
            {/* Board */}
            {college.board && (
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Board</span>
                  <span className="text-gray-900 font-medium">{college.board}</span>
                </div>
              </div>
            )}
            
            {/* Gender */}
            {college.genderType && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Gender</span>
                  <span className="text-gray-900 font-medium">{college.genderType}</span>
                </div>
              </div>
            )}
            
            {/* Shifts */}
            {college.shifts && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Shifts</span>
                  <span className="text-gray-900 font-medium">{college.shifts}</span>
                </div>
              </div>
            )}
            
            {/* college Type */}
            {college.collegeType && (
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Type</span>
                  <span className="text-gray-900 font-medium">{college.collegeType}</span>
                </div>
              </div>
            )}
          </div>

            {/* Admin Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleAcceptcollege(collegeId)}
                disabled={acceptingId === collegeId}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {acceptingId === collegeId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept college
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleRejectcollege(collegeId)}
                disabled={rejectingId === collegeId}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectingId === collegeId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject college
                  </>
                )}
              </button>
              
            <button
              onClick={() => {
                console.log('🔍 View Details clicked for collegeId:', collegeId);
                console.log('🔍 Full college object:', college);
                if (!collegeId) {
                  toast.error('college ID is missing - cannot view details');
                  return;
                }
                // Navigate to admin college details page
                window.open(`/admin/college/${collegeId}`, '_blank');
              }}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Complete Details
            </button>
            </div>
          </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default PendingCollegesSectionfixed;
