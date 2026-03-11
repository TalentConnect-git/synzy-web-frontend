import React, { useState } from 'react';
import { getcollegesByStatus } from '../api/adminService';
import { Bug, RefreshCw } from 'lucide-react';

/**
 * Debug component to help identify duplicate colleges
 * Add this to AdminDashboardPage temporarily to diagnose the issue
 */
const CollegeDebugger = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzecolleges = async () => {
    setLoading(true);
    try {
      const response = await getcollegesByStatus('pending');
      const colleges = response?.data?.data || response?.data || [];
      
      // Group by authId
      const byAuthId = {};
      const byId = {};
      const duplicates = [];
      
      colleges.forEach(college => {
        // Track by authId
        if (college.authId) {
          if (!byAuthId[college.authId]) {
            byAuthId[college.authId] = [];
          }
          byAuthId[college.authId].push(college);
        }
        
        // Track by _id
        if (college._id) {
          if (byId[college._id]) {
            duplicates.push({ type: '_id', value: college._id, college });
          }
          byId[college._id] = college;
        }
      });
      
      // Find authIds with multiple colleges
      const authIdDuplicates = Object.entries(byAuthId)
        .filter(([authId, colleges]) => colleges.length > 1)
        .map(([authId, colleges]) => ({
          authId,
          count: colleges.length,
          colleges: colleges.map(s => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            createdAt: s.createdAt,
            status: s.status
          }))
        }));
      
      setDebugData({
        total: colleges.length,
        uniqueAuthIds: Object.keys(byAuthId).length,
        uniqueIds: Object.keys(byId).length,
        collegesWithoutAuthId: colleges.filter(s => !s.authId).length,
        authIdDuplicates,
        idDuplicates: duplicates,
        samplecolleges: colleges.slice(0, 3).map(s => ({
          _id: s._id,
          name: s.name,
          authId: s.authId,
          email: s.email,
          createdAt: s.createdAt,
          status: s.status
        }))
      });
    } catch (error) {
      console.error('Debug analysis failed:', error);
      setDebugData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bug className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-900">
            college Duplicate Debugger
          </h3>
        </div>
        <button
          onClick={analyzecolleges}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Analyze colleges'}
        </button>
      </div>

      {debugData && (
        <div className="mt-4 space-y-4">
          {debugData.error ? (
            <div className="text-red-600">Error: {debugData.error}</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Total colleges</div>
                  <div className="text-2xl font-bold">{debugData.total}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Unique AuthIDs</div>
                  <div className="text-2xl font-bold">{debugData.uniqueAuthIds}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Unique IDs</div>
                  <div className="text-2xl font-bold">{debugData.uniqueIds}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Without AuthID</div>
                  <div className="text-2xl font-bold">{debugData.collegesWithoutAuthId}</div>
                </div>
              </div>

              {/* Duplicates by AuthID */}
              {debugData.authIdDuplicates.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    ⚠️ Found {debugData.authIdDuplicates.length} AuthIDs with Multiple colleges
                  </h4>
                  {debugData.authIdDuplicates.map((dup, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-white rounded border">
                      <div className="font-mono text-sm text-gray-600 mb-2">
                        AuthID: {dup.authId}
                      </div>
                      <div className="text-sm font-semibold mb-1">
                        {dup.count} colleges found:
                      </div>
                      <ul className="space-y-1">
                        {dup.colleges.map((college, sidx) => (
                          <li key={sidx} className="text-sm pl-4 border-l-2 border-gray-300">
                            <div><strong>{college.name}</strong></div>
                            <div className="text-gray-600">ID: {college._id}</div>
                            <div className="text-gray-600">Email: {college.email}</div>
                            <div className="text-gray-600">
                              Created: {new Date(college.createdAt).toLocaleString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample colleges */}
              <div className="bg-white border rounded p-4">
                <h4 className="font-semibold mb-2">Sample colleges (first 3)</h4>
                <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
                  {JSON.stringify(debugData.samplecolleges, null, 2)}
                </pre>
              </div>

              {/* Recommendation */}
              {debugData.total > debugData.uniqueAuthIds && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendation</h4>
                  <p className="text-sm text-blue-800">
                    You have {debugData.total} total colleges but only {debugData.uniqueAuthIds} unique authIDs.
                    This means there are duplicate college entries. The deduplication logic should be removing
                    these duplicates from the display.
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Check the browser console for logs showing which duplicates are being removed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CollegeDebugger;
