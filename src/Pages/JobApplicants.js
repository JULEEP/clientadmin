import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaUserGraduate,
  FaPhone,
  FaStar,
  FaEye,
  FaDownload,
  FaBriefcase,
  FaTimes,
  FaSync,
  FaBuilding,
  FaMoneyBillWave,
} from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api';

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-500">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const JobApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const navigate = useNavigate();
  const clientId = localStorage.getItem("clientId");

  useEffect(() => {
    if (!clientId) {
      alert("Please login first!");
      navigate("/login");
      return;
    }
    fetchApplications();
    fetchRoles();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/roles/all?clientId=${clientId}`);
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous error
      const res = await axios.get(`${API_BASE_URL}/applications/all/${clientId}`);
      if (res.data.success) {
        setApplications(res.data.applications);
      } else {
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDocumentUrl = (filePath) => {
    if (!filePath) return "";
    const relativePath = filePath.includes("uploads")
      ? "uploads/" + filePath.split(/uploads[\\/]/).pop().replace(/\\/g, "/")
      : filePath.replace(/\\/g, "/");
    return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
  };

  const handleOpenModal = (app) => {
    setSelectedApplicant(app);
    setIsModalOpen(true);
  };

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
      (app.jobId?.role || "").toLowerCase().includes(query) ||
      (app.mobile || "").toLowerCase().includes(query);

    const matchesScore = (app.technicalScore || 0) >= scoreFilter;
    const matchesRole = roleFilter ? (app.jobId?.role === roleFilter) : true;

    let matchesDate = true;
    if (dateFilter) {
      const appDate = new Date(app.appliedAt).toISOString().split('T')[0];
      matchesDate = appDate === dateFilter;
    }

    return matchesSearch && matchesScore && matchesRole && matchesDate;
  });

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredApplications.length,
      totalPages: Math.ceil(filteredApplications.length / limit)
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
      totalCount: filteredApplications.length,
      totalPages: Math.ceil(filteredApplications.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredApplications.length, searchQuery, scoreFilter, roleFilter, dateFilter]);

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setScoreFilter(0);
    setRoleFilter("");
    setDateFilter("");
    setRoleSearchQuery("");
  };

  const handleUpdateScore = async (id, field, value) => {
    const numericValue = (field === "status") ? value : Number(value);

    try {
      const res = await axios.post(`${API_BASE_URL}/applications/update-score`, {
        applicationId: id,
        [field]: numericValue,
      });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, [field]: numericValue } : app))
        );
      }
    } catch (err) {
      console.error("Update score error:", err);
    }
  };

  const handleResignationStatusUpdate = async (id, status) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/applications/resignation-approval`, {
        applicationId: id,
        status
      });
      if (res.data.success) {
        alert(`Resignation ${status} successfully!`);
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, resignationStatus: status } : app))
        );
        if (selectedApplicant && selectedApplicant._id === id) {
          setSelectedApplicant({ ...selectedApplicant, resignationStatus: status });
        }
      }
    } catch (err) {
      console.error("Resignation approval error:", err);
      alert("Failed to update resignation status.");
    } finally {
      setLoading(false);
    }
  };

  const Info = ({ label, value }) => (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">
        {value || "N/A"}
      </span>
    </div>
  );

  const ScoreMini = ({ label, score }) => (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold ${
        score >= 80 ? "text-green-600" :
        score >= 50 ? "text-yellow-600" :
        "text-red-600"
      }`}>
        {score || 0}
      </p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Filters Section - Exact match from image */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaUserGraduate className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search name, mobile, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <FaBriefcase className="text-gray-500" />
              <span>Role</span>
            </button>
            {isRoleDropdownOpen && (
              <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    className="w-full px-3 py-1 text-sm border rounded-md"
                    autoFocus
                  />
                </div>
                <div
                  onClick={() => {
                    setRoleFilter('');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
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
                      }}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    >
                      {r.name}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Score Filter */}
          <div className="relative">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(Number(e.target.value))}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white appearance-none pr-8"
            >
              <option value="0">All Scores</option>
              <option value="60">60% & Above</option>
              <option value="70">70% & Above</option>
              <option value="80">80% & Above</option>
              <option value="90">90% & Above</option>
            </select>
            <FaStar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-14 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || scoreFilter > 0 || roleFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FaSync className="text-xs" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message - Show above table but don't hide table */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button 
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Table - Always show header, even with error or no data */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header - Always visible */}
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">CANDIDATE NAME</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">APPLIED ROLE</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">CONTACT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ASSESSMENT SCORE (100)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">STATUS</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  currentItems.map((app, index) => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{app.firstName} {app.lastName}</div>
                        <div className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {app.jobId?.role || "System Specialist"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 text-xs" />
                          <span className="text-sm">{app.mobile}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={app.technicalScore || 0}
                          onChange={(e) => handleUpdateScore(app._id, "technicalScore", e.target.value)}
                          className="w-20 px-2 py-1 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          app.status === 'RESIGNED' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenModal(app)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FaEye size={14} /> View
                          </button>
                          <button
                            onClick={() => app.resume && window.open(formatDocumentUrl(app.resume), '_blank')}
                            className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                          >
                            <FaDownload size={14} /> Resume
                          </button>
                          <button
                            onClick={() => navigate("/score")}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FaStar size={14} /> Score
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No Data Message inside table body
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaUserGraduate className="text-4xl text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-800">No applicants yet</h3>
                        <p className="text-sm text-gray-500">Applications will appear here once candidates apply.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination - Only show if there are results */}
            {filteredApplications.length > 0 && (
              <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} results
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="ml-3 px-2 py-1 border rounded-lg text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                      pagination.currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' && handlePageClick(page)}
                      disabled={page === '...'}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                        page === '...' ? 'text-gray-500' :
                        pagination.currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {isModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedApplicant.firstName} {selectedApplicant.lastName}</h2>
                  <p className="text-sm text-gray-500">Applied {new Date(selectedApplicant.appliedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<FaUserGraduate />} label="Full Name" value={`${selectedApplicant.firstName} ${selectedApplicant.lastName}`} />
                    <DetailItem icon={<FaPhone />} label="Mobile" value={selectedApplicant.mobile} />
                    <DetailItem icon={<FaBriefcase />} label="Role" value={selectedApplicant.jobId?.role} />
                    <DetailItem icon={<FaUserTie />} label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                  </div>
                </div>

                {/* Education */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Education</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<FaUserGraduate />} label="Qualification" value={selectedApplicant.highestQualification} />
                    <DetailItem icon={<FaUserGraduate />} label="Institution" value={selectedApplicant.institution} />
                    <DetailItem icon={<FaUserGraduate />} label="Department" value={selectedApplicant.department} />
                    <DetailItem icon={<FaUserGraduate />} label="Percentage" value={selectedApplicant.percentage ? `${selectedApplicant.percentage}%` : "N/A"} />
                  </div>
                </div>

                {/* Experience */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Experience</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<FaBriefcase />} label="Total Experience" value={`${selectedApplicant.experience || 0} Years`} />
                    <DetailItem icon={<FaBuilding />} label="Current Company" value={selectedApplicant.companyName} />
                    <DetailItem icon={<FaMoneyBillWave />} label="Current CTC" value={selectedApplicant.currentCTC} />
                    <DetailItem icon={<FaMoneyBillWave />} label="Expected CTC" value={selectedApplicant.expectedCTC} />
                  </div>
                </div>

                {/* Skills */}
                {selectedApplicant.skills && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scores */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Assessment Scores</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <ScoreMini label="Technical" score={selectedApplicant.technicalScore} />
                    <ScoreMini label="Appearance" score={selectedApplicant.appearanceScore} />
                    <ScoreMini label="Knowledge" score={selectedApplicant.workKnowledge} />
                    <ScoreMini label="Overall" score={selectedApplicant.overallRating} />
                  </div>
                </div>

                {/* Interview Confirmation */}
                {(selectedApplicant.interviewStatus === 'Invited' || selectedApplicant.interviewStatus === 'Rescheduled') && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Interview Confirmation</h3>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <Info label="Status" value={selectedApplicant.candidateInterviewStatus || 'Pending'} />
                        <Info label="Time" value={selectedApplicant.interviewTime} />
                        <Info label="Mode" value={selectedApplicant.interviewMode || 'Online'} />
                      </div>
                      {selectedApplicant.candidateInterviewNote && (
                        <div className="mt-3 p-3 bg-white rounded-lg text-sm italic">
                          "{selectedApplicant.candidateInterviewNote}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resignation Details */}
                {selectedApplicant.status === 'RESIGNED' && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Resignation Request</h3>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <Info label="Status" value={selectedApplicant.resignationStatus || 'Pending'} />
                      </div>
                      {selectedApplicant.resignationLetter && (
                        <div className="p-3 bg-white rounded-lg text-sm italic mb-3">
                          "{selectedApplicant.resignationLetter}"
                        </div>
                      )}
                      {selectedApplicant.resignationStatus === 'Pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResignationStatusUpdate(selectedApplicant._id, 'Approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleResignationStatusUpdate(selectedApplicant._id, 'Rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {selectedApplicant.comment && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Comments</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {selectedApplicant.comment}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => selectedApplicant.resume && window.open(formatDocumentUrl(selectedApplicant.resume), '_blank')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  View Resume
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;