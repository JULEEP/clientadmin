import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiBriefcase, FiList, FiCode, FiDollarSign,
  FiClipboard, FiCopy, FiCheckCircle, FiPlus,
  FiX, FiExternalLink, FiSearch, FiMoreVertical,
  FiEdit2, FiEye, FiTrash2
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost:5000/api';

function JobPost() {
  const [formData, setFormData] = useState({
    role: "",
    responsibilities: "",
    skills: "",
    salary: "",
    assessmentIds: [],
    clientId: localStorage.getItem("clientId") || "", // Add clientId
  });

  const [jobs, setJobs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copiedId, setCopiedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const clientId = localStorage.getItem("clientId");

  // Fetch Jobs, Quizzes and Roles
  useEffect(() => {
    if (!clientId) {
      alert("Please login first!");
      navigate("/login");
      return;
    }
    fetchJobs();
    fetchQuizzes();
    fetchRoles();
  }, []);

  const fetchJobs = async () => {
    setFetchingJobs(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/all/${clientId}`);
      if (res.data.success) {
        setJobs(res.data.jobPosts);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setFetchingJobs(false);
    }
  };

  const fetchQuizzes = async () => {
    setFetchingQuizzes(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/getallquizes?clientId=${clientId}`).catch(() => null);
      if (res && res.data && res.data.quizzes) {
        setQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setFetchingQuizzes(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/roles/all?clientId=${clientId}`);
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentJobId(null);
    setFormData({
      role: "",
      responsibilities: "",
      skills: "",
      salary: "",
      assessmentIds: [],
      clientId: clientId,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (job) => {
    setIsEditing(true);
    setCurrentJobId(job._id);
    setFormData({
      role: job.role,
      responsibilities: job.responsibilities,
      skills: job.skills,
      salary: job.salary,
      assessmentIds: job.assessmentIds ? job.assessmentIds.map(a => a._id || a) : [],
      clientId: clientId,
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/jobs/${id}`, {
        data: { clientId } // Send clientId in body
      });
      if (res.data.success) {
        setMessage({ type: "success", text: "Job post deleted successfully!" });
        fetchJobs();
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
      setMessage({ type: "error", text: "Failed to delete job." });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssessmentToggle = (assessmentId) => {
    setFormData((prev) => {
      const currentAssessments = prev.assessmentIds;
      if (currentAssessments.includes(assessmentId)) {
        return {
          ...prev,
          assessmentIds: currentAssessments.filter((id) => id !== assessmentId),
        };
      } else {
        return {
          ...prev,
          assessmentIds: [...currentAssessments, assessmentId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let response;
      const data = { ...formData, clientId };
      
      if (isEditing) {
        response = await axios.put(`${API_BASE}/jobs/${currentJobId}`, data);
      } else {
        response = await axios.post(`${API_BASE}/jobs/create`, data);
      }

      if (response.data.success) {
        setMessage({ 
          type: "success", 
          text: isEditing ? "Job post updated successfully!" : "Job post created successfully!" 
        });
        setFormData({
          role: "",
          responsibilities: "",
          skills: "",
          salary: "",
          assessmentIds: [],
          clientId: clientId,
        });
        fetchJobs();
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage({ type: "", text: "" });
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create job post.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link, id) => {
    const fullLink = window.location.origin + link;
    navigator.clipboard.writeText(fullLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filteredJobs = jobs.filter(job =>
    job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-2 md:p-3 lg:p-4 ml-4 md:ml-6 lg:ml-8 bg-white rounded-lg shadow-md max-w-9xl min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            className="w-full py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search positions or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-400">
            <FiSearch size={12} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
          >
            <FiPlus size={12} />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Job Listings Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        {fetchingJobs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-3 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-gray-400 animate-pulse uppercase tracking-wider">Syncing listing...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-left text-xs text-white bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="py-2 px-3 text-center">Job Role</th>
                <th className="py-2 px-3 text-center">Skills</th>
                <th className="py-2 px-3 text-center">Salary</th>
                <th className="py-2 px-3 text-center">Assessments</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-xs font-medium text-center">
                    <div className="font-bold text-gray-800">{job.role}</div>
                  </td>
                  <td className="p-3 text-xs font-medium text-center">
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {job.skills.split(",").map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs font-medium text-center">
                    <span className="text-emerald-600 font-bold text-xs">{job.salary || "Competitive"}</span>
                  </td>
                  <td className="p-3 text-xs font-medium text-center">
                    <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                      {job.assessmentIds?.length || 0} Linked
                    </span>
                  </td>
                  <td className="p-3 text-xs font-medium text-center">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="View Details"
                      >
                        <FiEye size={12} />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-yellow-500 hover:text-yellow-700 p-1"
                        title="Edit Job"
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Job"
                      >
                        <FiTrash2 size={12} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(job.link, job._id)}
                        className={`text-xs p-1 ${copiedId === job._id ? "text-emerald-600" : "text-gray-400 hover:text-indigo-600"}`}
                        title="Copy Application Link"
                      >
                        {copiedId === job._id ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiSearch className="text-lg text-gray-200" />
            </div>
            <h2 className="text-sm font-bold text-gray-800">No jobs found</h2>
            <p className="text-[10px] text-gray-400 mt-1">Try refined search parameters</p>
          </div>
        )}
      </div>

      {/* Create/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base text-gray-800">
                  {isEditing ? "Update Job Opening" : "Post New Opening"}
                </h2>
                <p className="text-[8px] font-bold uppercase tracking-widest mt-1">
                  {isEditing ? "Modify recruitment details" : "Configure recruitment details"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pt-2 pb-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {message.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                  {message.type === "success" ? <FiCheckCircle className="text-sm" /> : <FiX className="text-sm" />}
                  <span className="text-xs font-bold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Job Role Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Job Position
                    </label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" size={12} />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-xs text-gray-800 bg-white appearance-none"
                      >
                        <option value="">Select Position</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-gray-600 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Budget / Package
                    </label>
                    <div className="relative group">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={12} />
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-xs text-gray-800"
                        placeholder="5 - 12 LPA"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Required Stack
                  </label>
                  <div className="relative group">
                    <FiCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={12} />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-xs text-gray-800 placeholder:text-gray-300"
                      placeholder="React, AWS, TypeScript"
                    />
                  </div>
                </div>

                {/* Assessments (Multiple Selection) */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Link Assessments
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-lg border border-gray-200 bg-gray-50/30">
                    {quizzes
                      .slice()
                      .sort((a, b) => {
                        const roleA = (a.role || a.category || "").toLowerCase();
                        const roleB = (b.role || b.category || "").toLowerCase();
                        const target = formData.role.toLowerCase();

                        if (target) {
                          const isMatchA = roleA === target;
                          const isMatchB = roleB === target;
                          if (isMatchA && !isMatchB) return -1;
                          if (!isMatchA && isMatchB) return 1;
                        }
                        return 0;
                      })
                      .map((quiz) => {
                        const isSuggested = formData.role && (quiz.role || quiz.category || "").toLowerCase() === formData.role.toLowerCase();
                        return (
                          <label
                            key={quiz._id}
                            htmlFor={`quiz-${quiz._id}`}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${formData.assessmentIds.includes(quiz._id)
                              ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                              : "bg-white border-transparent hover:border-gray-100"
                              }`}
                          >
                            <input
                              id={`quiz-${quiz._id}`}
                              type="checkbox"
                              className="hidden"
                              checked={formData.assessmentIds.includes(quiz._id)}
                              onChange={() => handleAssessmentToggle(quiz._id)}
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.assessmentIds.includes(quiz._id)
                              ? "bg-indigo-600 border-indigo-600 shadow-sm"
                              : "bg-white border-gray-200"
                              }`}>
                              {formData.assessmentIds.includes(quiz._id) && (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                              )}
                            </div>
                            <div className="flex flex-col flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px]">{quiz.topic || quiz.title}</span>
                                {isSuggested && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[6px] px-1 py-0.5 rounded-full uppercase tracking-tighter">Matched</span>
                                )}
                              </div>
                              <span className="text-[6px] font-bold text-gray-400 uppercase tracking-tighter">
                                {quiz.role || quiz.category || "General"} • {quiz.experienceLevel || "All Levels"}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    {quizzes.length === 0 && (
                      <div className="text-center py-4">
                        <FiClipboard className="mx-auto text-2xl text-gray-200 mb-1" />
                        <p className="text-[8px] text-gray-400 uppercase tracking-[0.2em]">No Assessments Available</p>
                        <p className="text-[7px] text-gray-400 mt-1">Please create an assessment first.</p>
                      </div>
                    )}
                  </div>
                  {fetchingQuizzes && <p className="text-[8px] text-indigo-500 font-bold ml-1 animate-pulse tracking-tighter">Syncing question banks...</p>}
                </div>

                {/* Responsibilities */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Role Summary
                  </label>
                  <div className="relative group">
                    <FiList className="absolute left-3 top-3 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={12} />
                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      required
                      rows="2"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-xs font-medium text-gray-800 placeholder:text-gray-300 resize-none"
                      placeholder="Outline core responsibilities..."
                    ></textarea>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 px-4 rounded-lg font-bold text-xs text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-[1.5] py-2 px-6 rounded-lg font-bold text-xs text-white shadow-sm transition-all transform active:scale-95 ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100"
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Deploying...</span>
                      </div>
                    ) : (
                      isEditing ? "Update" : "Publish"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-3 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100">
                  <FiBriefcase className="text-sm" />
                </div>
                <div>
                  <h2 className="text-base text-gray-800">{selectedJob.role}</h2>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Detailed Job Specifications</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">Compensation</h4>
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100/50">
                      <FiDollarSign className="text-emerald-600 text-sm" />
                      <span className="text-xs text-gray-800">{selectedJob.salary || "Competitive Salary"}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">Assessment Hook(s)</h4>
                    <div className="space-y-1.5">
                      {selectedJob.assessmentIds && selectedJob.assessmentIds.length > 0 ? (
                        selectedJob.assessmentIds.map((assessment, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100/50 hover:bg-amber-100/50 transition-colors">
                            <FiClipboard className="text-amber-600 text-sm shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-800">
                                {assessment.topic || assessment.title || "Untitled Assessment"}
                              </span>
                              <span className="text-[6px] font-bold text-gray-400 uppercase tracking-tighter">
                                ID: {assessment._id || assessment}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <FiClipboard className="text-gray-300 text-sm" />
                          <span className="text-xs font-bold text-gray-400">No Assessment Linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">Required Stack</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-600 text-[8px] font-bold px-2 py-1 rounded-lg border border-indigo-100/50 uppercase tracking-wider">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">Core Responsibilities</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed text-xs text-gray-600 whitespace-pre-line">
                    {selectedJob.responsibilities}
                  </div>
                </div>
                <div>
                  <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">Public Access Link</h4>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="flex-1 text-[10px] text-indigo-600 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                      {window.location.origin + selectedJob.link}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedJob.link, selectedJob._id)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleEdit(selectedJob);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-4 rounded-lg font-bold text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
              >
                <FiEdit2 size={10} /> Edit
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex-1 py-2 px-4 rounded-lg font-bold text-xs bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPost;