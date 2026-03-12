import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiCode,
  FiCopy,
  FiDollarSign,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiList,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api'


const API_BASE = API_BASE_URL;

function JobPost() {
  const [formData, setFormData] = useState({
    role: "",
    description: "",
    skills: "",
    experience: "",
    location: "",
    salary: "",
    assessmentIds: [],
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
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  
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

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      description: "",
      skills: "",
      salary: "",
      experience: "",
      location: "",
      assessmentIds: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (job) => {
    setIsEditing(true);
    setCurrentJobId(job._id);
    setFormData({
      role: job.role,
      description: job.description,
      skills: job.skills,
      salary: job.salary,
      location: job.location,
      experience: job.experience,
      assessmentIds: job.assessmentIds ? job.assessmentIds.map(a => a._id || a) : [],
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
        data: { clientId }
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
        setMessage({ type: "success", text: isEditing ? "Job post updated successfully!" : "Job post created successfully!" });
        setFormData({
          role: "",
          description: "",
          skills: "",
          salary: "",
          experience: "",
          location: "",
          assessmentIds: [],
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

  const copyToClipboard = (job) => {
    const fullLink = window.location.origin + job.link;
    const experienceLabel = job.experience ? (job.experience === "Fresher" ? "Fresher" : `${job.experience} Years`) : "Not Specified";
    const jobDesc = job.description || job.responsibilities || "";

    const template = `🚀 Hiring: ${job.role}

📍 Location: ${job.location || "Not Specified"}
💰 Salary / Package: ${job.salary || "Competitive"}
⏳ Experience: ${experienceLabel}

📌 Job Description:
${jobDesc ? jobDesc.split('\n').filter(l => l.trim()).map(l => `• ${l.trim()}`).join('\n') : "• Information available on request"}

🛠 Required Skills:
${job.skills ? job.skills.split(',').filter(s => s.trim()).map(s => `• ${s.trim()}`).join('\n') : "• Relevant skills required"}

📩 Interested candidates can share their resume.
Direct Apply Link: ${fullLink}`;

    navigator.clipboard.writeText(template);
    setCopiedId(job._id);
    setTimeout(() => setCopiedId(""), 2200);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? job.role === roleFilter : true;
    const matchesDate = dateFilter
      ? new Date(job.createdAt || job.appliedAt).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchesSearch && matchesRole && matchesDate;
  });

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalCount: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredJobs.length, searchQuery, roleFilter, dateFilter]);

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setRoleSearchQuery("");
    setDateFilter("");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Filters Section */}
      <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search by Role or Skills */}
          <div className="relative flex-1 min-w-[180px]">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by Role or Skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter Button */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                roleFilter 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <FiBriefcase className="text-xs" /> Role {roleFilter && `: ${roleFilter}`}
            </button>
            
            {/* Role Filter Dropdown */}
            {isRoleDropdownOpen && (
              <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      className="w-full py-1 pl-7 pr-2 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Search roles..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>
                <div 
                  onClick={() => {
                    setRoleFilter('');
                    setIsRoleDropdownOpen(false);
                    setRoleSearchQuery('');
                  }}
                  className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 font-medium ${
                    !roleFilter ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  All Roles
                </div>
                {roles
                  .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                  .map((r) => (
                    <div 
                      key={r._id}
                      onClick={() => {
                        setRoleFilter(r.name);
                        setIsRoleDropdownOpen(false);
                        setRoleSearchQuery('');
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        roleFilter === r.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {r.name}
                    </div>
                  ))}
                {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">
                    No roles found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative w-[130px]">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
              Date:
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Post New Job Button */}
          <button
            onClick={openCreateModal}
            className="h-8 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-1 ml-auto"
          >
            <FiPlus className="text-xs" />
            <span>Post New Job</span>
          </button>

          {/* Clear Filters Button */}
          {(searchQuery || roleFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Job Listings Table */}
      <div className="p-0 mb-0 bg-white border shadow-lg rounded-2xl">
        {fetchingJobs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-wider">Syncing listing...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
         
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
              <tr>
                <th className="py-2 text-center">Job Role</th>
                <th className="py-2 text-center">Skills</th>
                <th className="py-2 text-center">Salary</th>
                <th className="py-2 text-center">Assessments</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((job) => (
                <tr key={job._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-2 font-medium text-center">
                    <div className="text-gray-900 whitespace-nowrap">{job.role}</div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="text-gray-600">
                      {job.skills.split(",").map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded uppercase ">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="text-emerald-600 ">{job.salary || "Competitive"}</span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] ">
                      {job.assessmentIds?.length || 0} Linked
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="text-blue-500 hover:text-blue-700"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit Job"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Job"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        onClick={() => copyToClipboard(job)}
                        className={`text-sm ${copiedId === job._id ? "text-emerald-600" : "text-gray-400 hover:text-indigo-600"}`}
                        title="Copy Formatted Share Template"
                      >
                        {copiedId === job._id ? <FiCheckCircle /> : <FiCopy />}
                      </button>
                      <button
                        onClick={() => window.open(`${window.location.origin}${job.link}`, "_blank")}
                        className="text-gray-400 hover:text-blue-600"
                        title="Open Job Page"
                      >
                        <FiExternalLink />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
              {/* Left Side - Showing Info + Select */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">
                  {indexOfFirstItem + 1}
                </span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredJobs.length)}
                </span>
                <span>of</span>
                <span className="font-medium">
                  {filteredJobs.length}
                </span>
                <span>results</span>

                {/* Select Dropdown */}
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="p-1 ml-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === "..."
                          ? "text-gray-500 cursor-default"
                          : pagination.currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-2xl text-gray-200" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">No jobs found</h2>
            <p className="text-xs text-gray-400 mt-1">Try refined search parameters</p>
          </div>
    
        )}
      </div>
  

      {/* Create Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl  text-gray-800">
                  {isEditing ? "Update Job Opening" : "Post New Opening"}
                </h2>
                <p className="text-[10px] font-bold  uppercase tracking-widest mt-1">
                  {isEditing ? "Modify recruitment details" : "Configure recruitment details"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                  {message.type === "success" ? <FiCheckCircle className="text-lg" /> : <FiX className="text-lg" />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Job Role Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Job Position
                    </label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm  text-gray-800 bg-white appearance-none"
                      >
                        <option value="">Select Position</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-gray-600 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-1.5">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Salary / Package
                    </label>
                    <div className="relative group">
                      <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                        placeholder="5 - 12 LPA"
                      />
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Experience Dropdown */}
                  <div>
                    <label className="text-sm font-medium">Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="">Select Experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="0-1">0-1 Years</option>
                      <option value="1-2">1-2 Years</option>
                      <option value="2-3">2-3 Years</option>
                      <option value="3-4">3-4 Years</option>
                      <option value="5+">5+ Years</option>
                    </select>
                  </div>


                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-xl"
                      placeholder="Hyderabad / Remote"
                    />
                  </div>

                </div>



                {/* Skills */}
                <div className="space-y-1.5">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Required Skills
                  </label>
                  <div className="relative group">
                    <FiCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm  text-gray-800"
                      placeholder="Communications skills , Positive Attitude, Ready to learn"
                    />
                  </div>
                </div>

                {/* Assessments (Multiple Selection) */}
                <div className="space-y-1.5">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Link Assessments (Multiple selection supported)
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-gray-200 bg-gray-50/30">
                    {quizzes
                      .slice() // Clone before sort
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
                            className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${formData.assessmentIds.includes(quiz._id)
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
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.assessmentIds.includes(quiz._id)
                              ? "bg-indigo-600 border-indigo-600 shadow-sm"
                              : "bg-white border-gray-200"
                              }`}>
                              {formData.assessmentIds.includes(quiz._id) && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>
                              )}
                            </div>
                            <div className="flex flex-col flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">{quiz.topic || quiz.title}</span>
                                {isSuggested && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Matched</span>
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                {quiz.role || quiz.category || "General"} • {quiz.experienceLevel || "All Levels"}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    {quizzes.length === 0 && (
                      <div className="text-center py-6">
                        <FiClipboard className="mx-auto text-3xl text-gray-200 mb-2" />
                        <p className="text-[10px]  text-gray-400 uppercase tracking-[0.2em]">No Assessments Available</p>
                        <p className="text-[9px] text-gray-400 mt-1">Please create an assessment in the manager first.</p>
                      </div>
                    )}
                  </div>
                  {fetchingQuizzes && <p className="text-[9px] text-indigo-500 font-bold ml-1 animate-pulse tracking-tighter">Syncing question banks...</p>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <div className="relative group">
                    <FiList className="absolute left-4 top-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300 resize-none"
                      placeholder="Outline core responsibilities..."
                    ></textarea>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-6 border-t border-gray-50 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white shadow-sm transition-all transform active:scale-95 ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100"
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Deploying...</span>
                      </div>
                    ) : (
                      isEditing ? "Update Position" : "Publish Position"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">

            {/* Header — SAME STYLE AS CREATE MODAL */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-800">
                  {selectedJob.role}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-400">
                  Detailed Job Specifications
                </p>
              </div>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Body — SAME SPACING SYSTEM */}
            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar space-y-6">

              {/* Salary */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Salary / Package
                </label>
                <div className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
                  {selectedJob.salary || "Competitive Salary"}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <div className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
                  {selectedJob.experience || "Not Specified"}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
                  {selectedJob.location || "Not Specified"}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Required Skills
                </label>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  {selectedJob.skills.split(",").map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg text-gray-700"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assessments */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Linked Assessments
                </label>

                <div className="space-y-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  {selectedJob.assessmentIds &&
                    selectedJob.assessmentIds.length > 0 ? (
                    selectedJob.assessmentIds.map((assessment, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-800"
                      >
                        {assessment.topic ||
                          assessment.title ||
                          "Untitled Assessment"}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">
                      No Assessment Linked
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <div className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 whitespace-pre-line">
                  {selectedJob.description || selectedJob.responsibilities}
                </div>
              </div>

              {/* Public Link */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Public Access Link
                </label>

                <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-800 truncate">
                    {window.location.origin + selectedJob.link}
                  </span>

                  <button
                    onClick={() => copyToClipboard(selectedJob.link, selectedJob._id)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>

              {/* Footer — SAME BUTTON STYLE AS CREATE MODAL */}
              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEdit(selectedJob);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Edit Position
                </button>

                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  Close View
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPost;