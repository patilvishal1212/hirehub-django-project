import api from "./api";

// --- COMPANY ENDPOINTS ---
export const getMyCompany = async () => {
  const response = await api.get("/companies/");
  // Assuming the view returns a list of companies owned by the user (which should be at most 1)
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await api.post("/companies/", companyData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// --- JOB POST ENDPOINTS ---
export const getActiveJobs = async () => {
  const response = await api.get("/jobs/");
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}/`);
  return response.data;
};

export const getMyJobs = async () => {
  const response = await api.get("/jobs/my_jobs/");
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post("/jobs/", jobData);
  return response.data;
};

// --- APPLICATION ENDPOINTS ---

// Seeker applies to a job
export const applyToJob = async (jobId, formData) => {
  // Using multipart/form-data because formData contains a File (resume)
  const response = await api.post(`/jobs/${jobId}/apply/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Seeker gets their own applications, OR Employer gets applications for their company's jobs
export const getMyApplications = async () => {
  const response = await api.get("/applications/");
  return response.data;
};

// Employer gets applications for a specific job they own
export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applications/`);
  return response.data;
};

// Employer updates application status
export const updateApplicationStatus = async (appId, status) => {
  const response = await api.patch(`/applications/${appId}/`, { status });
  return response.data;
};