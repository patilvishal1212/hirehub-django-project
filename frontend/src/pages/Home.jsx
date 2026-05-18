import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const jobs = [
    { title: "Frontend Developer", company: "Google", location: "Remote" },
    { title: "Backend Developer", company: "Amazon", location: "Pune" },
    { title: "UI/UX Designer", company: "Adobe", location: "Mumbai" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-2xl font-bold">
          <span className="bg-yellow-400 text-black px-2 py-1 rounded mr-2">H</span>
          Hire<span className="text-yellow-400">Hub</span>
        </h1>

        <div className="flex gap-6 items-center text-gray-300">
          <Link className="hover:text-yellow-400 transition">Jobs</Link>
          <Link className="hover:text-yellow-400 transition">Companies</Link>

          <Link to="/login" className="hover:text-yellow-400 transition">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/20"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-20 px-4">
        <h2 className="text-5xl font-bold mb-4">
          Find Jobs That Match Your Skills
        </h2>

        <p className="text-gray-400 mb-8">
          Discover opportunities from top companies
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-3 max-w-3xl mx-auto">
          <input type="text" placeholder="Job title" className="input" />
          <input type="text" placeholder="Location" className="input" />

          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/20">
            Search
          </button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-8 py-16">
        <h3 className="text-3xl font-bold mb-10 text-center">
          Explore Categories
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["IT", "Marketing", "Finance", "Design"].map((cat) => (
            <div
              key={cat}
              className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur hover:border-yellow-400 hover:shadow-lg transition text-center cursor-pointer"
            >
              <h4 className="font-semibold text-lg">{cat}</h4>
              <p className="text-sm text-gray-400 mt-1">120+ Jobs</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="px-8 py-16">
        <h3 className="text-3xl font-bold mb-10 text-center">
          Featured Jobs
        </h3>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {jobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 border-t border-white/10 mt-10">
        © 2026 HireHub. All rights reserved.
      </footer>
    </div>
  );
};

/* JOB CARD */
const JobCard = ({ job }) => {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur hover:border-yellow-400 hover:shadow-lg transition">

      <h4 className="font-bold text-lg mb-2">{job.title}</h4>

      <p className="text-gray-400 mb-4">
        {job.company} • {job.location}
      </p>

      <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition">
        Apply
      </button>
    </div>
  );
};

export default Home;