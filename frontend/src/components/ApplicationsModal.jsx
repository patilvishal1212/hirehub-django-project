import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getJobApplications, updateApplicationStatus } from '../services/jobService';

const ApplicationsModal = ({ jobId, jobTitle, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const data = await getJobApplications(jobId);
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      toast.success(`Application marked as ${newStatus}`);
      fetchApplications(); // Refresh list
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100">
            Applications for <span className="text-amber-500">{jobTitle}</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-200">{app.applicant_name || 'Applicant'}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-300">Cover Letter:</span> {app.cover_letter}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <a 
                        href={app.resume} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Resume
                      </a>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:min-w-[140px] justify-end">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer
                        ${app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}
                      `}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsModal;