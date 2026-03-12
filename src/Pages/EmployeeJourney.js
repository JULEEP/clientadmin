import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaBriefcase, FaBuilding,
  FaCalendarAlt,
  FaEnvelope,
  FaEye,
  FaFilePdf,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaSearch,
  FaTimes,
  FaUserTie,
  FaChevronDown,
  FaSync
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api'
const API_DOMAIN = 'http://localhost:5000'

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-500">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const EmployeeJourney = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
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
    fetchExperiences();
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

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/candidate/all-experiences?clientId=${clientId}`);
      if (res.data.success) {
        setExperiences(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch journey data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Grouping logic
  const groupedData = experiences.reduce((acc, exp) => {
    const candidateId = exp.candidateId?._id || "unknown";
    if (!acc[candidateId]) {
      acc[candidateId] = {
        candidate: exp.candidateId,
        experiences: [],
        latestRole: "",
        latestCompany: ""
      };
    }
    acc[candidateId].experiences.push(exp);
    return acc;
  }, {});

  // Sort experiences for each candidate and pick latest info
  const candidates = Object.values(groupedData).map(item => {
    const sortedExp = [...item.experiences].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return {
      ...item,
      experiences: sortedExp,
      latestRole: sortedExp[0]?.role || "Unknown",
      latestCompany: sortedExp[0]?.companyName || "Unknown",
      lastUpdated: sortedExp[0]?.createdAt || null
    };
  });

  const filteredCandidates = candidates.filter(item => {
    const query = searchQuery.toLowerCase();
    const candidate = item.candidate || {};
    const matchesSearch =
      (candidate.name || "").toLowerCase().includes(query) ||
      (candidate.email || "").toLowerCase().includes(query) ||
      (item.latestRole || "").toLowerCase().includes(query);

    const matchesRole = roleFilter ? (item.latestRole === roleFilter) : true;

    let matchesDate = true;
    if (dateFilter) {
      const updateDate = item.lastUpdated ? new Date(item.lastUpdated).toISOString().split('T')[0] : "";
      matchesDate = updateDate === dateFilter;
    }

    return matchesSearch && matchesRole && matchesDate;
  });

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredCandidates.length,
      totalPages: Math.ceil(filteredCandidates.length / limit)
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
      totalCount: filteredCandidates.length,
      totalPages: Math.ceil(filteredCandidates.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredCandidates.length, searchQuery, roleFilter, dateFilter]);

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleOpenModal = (candidateItem) => {
    setSelectedCandidate(candidateItem);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setDateFilter("");
    setRoleSearchQuery("");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Filters Section */}
      <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search name, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
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
              <FaUserTie className="text-xs" /> Role {roleFilter && `: ${roleFilter}`}
            </button>
            
            {/* Role Filter Dropdown */}
            {isRoleDropdownOpen && (
              <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
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
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={fetchExperiences} 
              className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition flex items-center gap-1"
            >
              <FaSync className="text-xs" /> Refresh
            </button>

            {/* Reset Filters Button */}
            {(searchQuery || roleFilter || dateFilter) && (
              <button
                onClick={resetFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
        <span>{error}</span>
        <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
          <FaTimes />
        </button>
      </div>}

      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-100">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading records...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Employee Name</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Latest Role</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Contact Details</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Roles Logged</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">System Status</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-gray-900 whitespace-nowrap font-bold text-sm">{item.candidate?.name || "Unknown"}</div>
                        <div className="text-[10px] text-gray-400 uppercase mt-0.5">
                          {item.lastUpdated ? `Last updated ${new Date(item.lastUpdated).toLocaleDateString()}` : "No updates"}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-3 py-1 bg-white border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {item.latestRole}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-medium">{item.latestCompany}</div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-0.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FaPhone className="text-[10px] text-blue-400" /> {item.candidate?.phone || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-400">
                          <FaEnvelope className="text-[10px]" /> {item.candidate?.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-800 font-black text-xs border border-gray-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.experiences.length}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                        Verified
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest group/btn shadow-sm"
                        >
                          <FaEye className="group-hover/btn:scale-110" /> View History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {filteredCandidates.length > 0 && (
              <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <span>Showing</span>
                  <span className="font-medium">
                    {indexOfFirstItem + 1}
                  </span>
                  <span>to</span>
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredCandidates.length)}
                  </span>
                  <span>of</span>
                  <span className="font-medium">
                    {filteredCandidates.length}
                  </span>
                  <span>results</span>

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
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
              <FaBriefcase size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Journey Records Found</h3>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto text-sm font-medium">No candidate has documented their work professional history for this criteria.</p>
          </div>
        )}
      </div>

      {/* Professional Journey Modal (Timeline View) */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {selectedCandidate.candidate?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                    {selectedCandidate.candidate?.name}'s Journey
                  </h2>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Professional History Timeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 hover:border-red-100"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 no-scrollbar">
              <div className="relative pl-8 border-l-[3px] border-dashed border-gray-200/60 ml-4 space-y-12">
                {selectedCandidate.experiences.map((exp, eIdx) => (
                  <div key={eIdx} className="relative">
                    <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full border-[5px] border-white bg-blue-600 shadow-md" />

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-6 flex-1">
                          <div>
                            <div className="flex items-center gap-4">
                              <h5 className="text-lg font-black text-gray-900 tracking-tight">{exp.role}</h5>
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100/50">Record {selectedCandidate.experiences.length - eIdx}</span>
                            </div>
                            <p className="text-gray-600 font-bold text-sm mt-1.5 flex items-center gap-2">
                              <FaBuilding size={12} className="text-gray-400" />
                              {exp.companyName}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <DetailItem icon={<FaCalendarAlt size={12} />} label="Duration" value={`${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`} />
                            <DetailItem icon={<FaMapMarkerAlt size={12} />} label="Location" value={exp.location} />
                            <DetailItem icon={<FaMoneyBillWave size={12} />} label="Annual CTC" value={exp.salary} />
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2.5 pt-6 lg:pt-0 border-t lg:border-0 border-gray-50">
                          {exp.offerLetter ? (
                            <a
                              href={`${API_DOMAIN}/${exp.offerLetter.replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-gray-100 hover:border-blue-600 shadow-sm"
                            >
                              <FaFilePdf size={12} /> Offer Letter
                            </a>
                          ) : (
                            <div className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-4 py-2 bg-gray-50/50 text-gray-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200">
                              No Letter
                            </div>
                          )}
                          {exp.payslip ? (
                            <a
                              href={`${API_DOMAIN}/${exp.payslip.replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-gray-100 hover:border-blue-600 shadow-sm"
                            >
                              <FaFilePdf size={12} /> Salary Payslip
                            </a>
                          ) : (
                            <div className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-4 py-2 bg-gray-50/50 text-gray-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed border-gray-200">
                              No Payslip
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
              >
                Close Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeJourney;