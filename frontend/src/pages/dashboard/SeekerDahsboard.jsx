import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getActiveJobs, getMyApplications } from '../../services/jobService';
import ApplyJobModal from '../../components/ApplyJobModal';

const SeekerDahsboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        getActiveJobs(),
        getMyApplications()
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if user already applied to a specific job
  const hasApplied = (jobId) => {
    return applications.some(app => app.job === jobId);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Applied Jobs</p>
          <h3 className="text-3xl font-bold text-amber-500 mt-2">{applications.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Interviews</p>
          <h3 className="text-3xl font-bold text-blue-500 mt-2">
            {applications.filter(a => a.status === 'ACCEPTED').length}
          </h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Active Opportunities</p>
          <h3 className="text-3xl font-bold text-green-500 mt-2">{jobs.length}</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100">Latest Job Opportunities</h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No active jobs available right now. Check back later!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-200">{job.title}</h3>
                  <p className="text-amber-500 font-medium text-sm mt-1">{job.company_name}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      {job.job_type === 'FT' ? 'Full-time' : job.job_type === 'PT' ? 'Part-time' : job.job_type === 'RM' ? 'Remote' : 'Contract'}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary_range}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-300 line-clamp-2">{job.description}</p>
                </div>
                
                <div className="flex md:flex-col justify-end min-w-[120px]">
                  {hasApplied(job.id) ? (
                    <span className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium text-center border border-green-500/20">
                      Applied ✓
                    </span>
                  ) : (
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium shadow-md transition-all"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplyJobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onApplied={fetchData} 
        />
      )}
    </DashboardLayout>
  );
};

export default SeekerDahsboard;