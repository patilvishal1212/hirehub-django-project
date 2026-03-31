import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createCompany } from '../../services/jobService';

const CreateCompany = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
  });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('location', formData.location);
    if (formData.website) {
      data.append('website', formData.website);
    }
    if (logo) {
      data.append('logo', logo);
    }

    try {
      await createCompany(data);
      navigate('/employer/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create company profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Create Company Profile</h2>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea 
              name="description" 
              required 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
              <input 
                type="text" 
                name="location" 
                required 
                value={formData.location} 
                onChange={handleChange} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website URL (Optional)</label>
              <input 
                type="url" 
                name="website" 
                value={formData.website} 
                onChange={handleChange} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Logo (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-800 file:text-amber-500 hover:file:bg-slate-700" 
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateCompany;