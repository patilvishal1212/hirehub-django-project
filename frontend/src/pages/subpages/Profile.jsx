import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <p className="text-slate-400 italic">Profile management coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile