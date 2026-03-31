import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyJobs, getMyCompany } from '../../services/jobService';
import ApplicationsModal from '../../components/ApplicationsModal';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null); // { id, title }
  const [hasCompany, setHasCompany] = useState(true);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const companyData = await getMyCompany();
      if (companyData.length === 0) {
        setHasCompany(false);
        setLoading(false);
        return;
      }
      setHasCompany(true);
      setCompany(companyData[0]);
      const data = await getMyJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = jobs.filter((j) => j.is_active).length;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Active Jobs</p>
          <h3 className="text-3xl font-bold text-amber-500 mt-2">{activeCount}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Total Jobs Posted</p>
          <h3 className="text-3xl font-bold text-blue-500 mt-2">{jobs.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <p className="text-slate-400 text-sm font-medium">Company Profile</p>
          <h3 className="text-xl font-bold text-slate-200 mt-2 truncate" title={company?.name}>
            {company ? company.name : 'Unknown Company'}
          </h3>
          <p className="text-slate-500 text-xs mt-1 truncate">{company?.location}</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100">My Postings</h2>
          {hasCompany && (
            <Link to="/employer/jobs/new" className="text-sm text-amber-500 hover:text-amber-400 font-medium">
              + Post New Job
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasCompany ? (
          <div className="p-12 text-center bg-amber-500/5 rounded-b-2xl">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">Company Profile Required</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">You must register your company profile before you can start posting jobs and managing applications.</p>
            <Link to="/employer/company/new" className="inline-block px-6 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors">
              Create Company Profile
            </Link>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">You haven't posted any jobs yet.</p>
            <Link to="/employer/jobs/new" className="px-6 py-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors">
              Create your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-200">{job.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                      {job.job_type === 'FT' ? 'Full-time' : job.job_type === 'PT' ? 'Part-time' : job.job_type === 'RM' ? 'Remote' : 'Contract'}
                    </span>
                    <span>{job.salary_range || 'Unspecified'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${job.is_active ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      {job.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setSelectedJob({ id: job.id, title: job.title })}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplicationsModal 
          jobId={selectedJob.id} 
          jobTitle={selectedJob.title} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </DashboardLayout>
  );
};

export default EmployerDashboard;
