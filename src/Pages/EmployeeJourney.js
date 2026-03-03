import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaUserGraduate, FaPhone, FaCalendarAlt, FaStar, FaEye, FaDownload,
  FaEnvelope, FaBriefcase, FaBuilding, FaMoneyBillWave,
  FaCalendarCheck, FaMapMarkerAlt, FaTimesCircle, FaUserTie,
  FaTimes, FaSync, FaChevronDown, FaFilePdf, FaSearch
} from "react-icons/fa";


const API_BASE_URL = 'http://localhost:5000/api';
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

  useEffect(() => {
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
      const res = await axios.get(`${API_BASE_URL}/roles/all`);
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
      const res = await axios.get(`${API_BASE_URL}/candidate/all-experiences`);
      if (res.data.success) {
        setExperiences(res.data.data);
      }
    } catch (err) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleOpenModal = (candidateItem) => {
    setSelectedCandidate(candidateItem);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 font-sans">
      {/* Main container with left padding */}
      <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
        {/* Header Section (Replicated from JobApplicants) */}
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <FaBriefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Employee Journeys</h2>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            {/* Date Filter */}
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500"
                  onClick={() => setDateFilter("")}
                >
                  <FaTimes className="text-[12px]" />
                </div>
              )}
            </div>

            {/* Role Filter (Dropdown Pattern from JobApplicants) */}
            <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                <FaUserTie className="text-sm" />
              </div>
              <div
                className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              >
                {roleFilter || "Filter by Role"}
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 text-gray-400">
                <FaChevronDown className={`text-[10px] transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isRoleDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      className="w-full py-1.5 px-3 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search roles..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    <div
                      className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                      onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); }}
                    >
                      All Roles
                    </div>
                    {roles
                      .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                      .map((r, i) => (
                        <div
                          key={i}
                          className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-blue-50 transition-colors ${roleFilter === r.name ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                          onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); }}
                        >
                          {r.name}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FaSearch className="text-sm" />
              </div>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            {/* Reset Button */}
            {(searchQuery || roleFilter || dateFilter) && (
              <button
                onClick={() => { setSearchQuery(""); setRoleFilter(""); setDateFilter(""); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FaSync className="text-xs" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Table Section (Mirroring JobApplicants) */}
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-100">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading records...</p>
            </div>
          ) : filteredCandidates.length > 0 ? (
            <table className="min-w-full">
              <thead className="text-left text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                <tr>
                  <th className="py-4 px-6 font-black text-center">Employee Name</th>
                  <th className="py-4 px-6 font-black text-center">Latest Role</th>
                  <th className="py-4 px-6 font-black text-center">Contact Details</th>
                  <th className="py-4 px-6 font-black text-center">Roles Logged</th>
                  <th className="py-4 px-6 font-black text-center">System Status</th>
                  <th className="py-4 px-6 font-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCandidates.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-bold text-gray-800 text-sm">{item.candidate?.name || "Unknown"}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {item.lastUpdated ? `Last updated ${new Date(item.lastUpdated).toLocaleDateString()}` : "No updates"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-white border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {item.latestRole}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-medium italic">{item.latestCompany}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-0.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FaPhone className="text-[10px] text-blue-400" /> {item.candidate?.phone || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-400">
                          <FaEnvelope className="text-[10px]" /> {item.candidate?.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-800 font-black text-xs border border-gray-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.experiences.length}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                        Verified
                      </span>
                    </td>
                    <td className="p-4 text-center">
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
      </div>

      {/* Professional Journey Modal (Timeline View) */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {selectedCandidate.candidate?.name?.[0].toUpperCase()}
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 no-scrollbar">
              <div className="relative pl-8 border-l-[3px] border-dashed border-gray-200/60 ml-4 space-y-12">
                {selectedCandidate.experiences.map((exp, eIdx) => (
                  <div key={eIdx} className="relative">
                    {/* Timeline Dot */}
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
                          {
                            exp.payslip ? (
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
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
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

      {/* Inline Styles for no-scrollbar */}
      <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
    </div>
  );
};

export default EmployeeJourney;