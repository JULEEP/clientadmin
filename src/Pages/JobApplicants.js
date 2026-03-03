import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    FaUserGraduate, FaPhone, FaCalendarAlt, FaStar, FaEye, FaDownload,
    FaEnvelope, FaBriefcase, FaBuilding, FaMoneyBillWave,
    FaCalendarCheck, FaMapMarkerAlt, FaTimesCircle
} from "react-icons/fa";
import {
    FaUserTie,
    FaTimes,
    FaSync
} from "react-icons/fa";

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

    const clientId = localStorage.getItem("clientId");

    useEffect(() => {
        if (!clientId) {
            alert("Please login first!");
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
            const res = await axios.get(`${API_BASE_URL}/roles/all`);
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
            // ✅ ONLY THIS API HAS clientId IN URL
            const res = await axios.get(`${API_BASE_URL}/applications/all/${clientId}`);
            if (res.data.success) {
                setApplications(res.data.applications);
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

    const handleUpdateScore = async (id, field, value) => {
        const numericValue = (field === "status") ? value : Number(value);

        try {
            // ✅ NO clientId IN THIS API (as per your requirement)
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
            // ✅ NO clientId IN THIS API (as per your requirement)
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
            <p className={`text-sm font-semibold ${score >= 80
                ? "text-green-600"
                : score >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                {score || 0}
            </p>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-2 md:p-3 lg:p-4 ml-4 md:ml-6 lg:ml-8">
            {/* Header Section */}
            <div className="flex flex-col gap-3 mb-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-shrink-0">
                    <h2 className="text-sm font-bold text-gray-800">Job Applicants</h2>
                </div>

                <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 w-full xl:w-auto">
                    {/* Date Filter */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="date"
                            className="w-full appearance-none bg-white py-1.5 px-3 pr-8 text-xs text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-36"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => setDateFilter("")}
                                title="Clear date filter"
                            >
                                <FaTimes className="text-[10px]" />
                            </div>
                        )}
                    </div>

                    {/* Searchable Dept Filter */}
                    <div className="relative w-full sm:w-48" ref={roleDropdownRef}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-400 z-10">
                            <FaBriefcase className="text-xs" />
                        </div>
                        <div
                            className="w-full bg-white py-1.5 pl-8 pr-8 text-xs text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        >
                            {roleFilter || "Select Dept"}
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-10">
                            {roleFilter ? (
                                <FaTimes
                                    className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                                    title="Clear role filter"
                                />
                            ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                            )}
                        </div>

                        {isRoleDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1.5 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <FaUserTie className="absolute left-2 top-2 text-gray-400 text-[10px]" />
                                        <input
                                            type="text"
                                            className="w-full py-1 pl-7 pr-3 text-[10px] bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search dept..."
                                            value={roleSearchQuery}
                                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto py-0.5">
                                    <div
                                        className={`px-3 py-1.5 text-[10px] font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                        onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                    >
                                        All Depts
                                    </div>
                                    {roles
                                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                                        .map((r) => (
                                            <div
                                                key={r._id}
                                                className={`px-3 py-1.5 text-[10px] font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`}
                                                onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                                            >
                                                {r.name}
                                            </div>
                                        ))
                                    }
                                    {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-[10px] text-gray-400 text-center font-medium italic">
                                            No depts found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Score Filter */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            className="w-full appearance-none bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-36"
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(Number(e.target.value))}
                        >
                            <option value="0">All Scores</option>
                            <option value="60">60% & Above</option>
                            <option value="70">70% & Above</option>
                            <option value="80">80% & Above</option>
                            <option value="90">90% & Above</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {scoreFilter > 0 ? (
                                <FaTimes
                                    className="text-[8px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setScoreFilter(0)}
                                    title="Clear score filter"
                                />
                            ) : (
                                <FaStar className="text-[8px] text-gray-400 pointer-events-none" />
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[250px]">
                        <input
                            type="text"
                            className="w-full py-1.5 pl-8 pr-8 text-xs text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            placeholder="Search name, mobile, role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-400">
                            <FaUserGraduate className="text-xs" />
                        </div>
                        {searchQuery && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <FaTimes
                                    className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                />
                            </div>
                        )}
                    </div>

                    {/* Reset All Filters Button */}
                    {(searchQuery || scoreFilter > 0 || roleFilter || dateFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setScoreFilter(0);
                                setRoleFilter("");
                                setDateFilter("");
                                setRoleSearchQuery("");
                            }}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
                            title="Reset all filters"
                        >
                            <FaSync className="text-[10px]" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs">{error}</div>}

            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                {loading ? (
                    <div className="p-6 text-center text-gray-500 text-sm">Loading Applicants...</div>
                ) : filteredApplications.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="text-left text-xs text-white bg-gradient-to-r from-purple-500 to-blue-600">
                            <tr>
                                <th className="py-2 px-3 text-center">Candidate Name</th>
                                <th className="py-2 px-3 text-center">Applied Role</th>
                                <th className="py-2 px-3 text-center">Contact</th>
                                <th className="py-2 px-3 text-center">Assement Score (100)</th>
                                <th className="py-2 px-3 text-center">Status</th>
                                <th className="py-2 px-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-xs font-medium text-center">
                                        <div className="font-bold text-gray-800">{app.firstName} {app.lastName}</div>
                                        <div className="text-[8px] text-gray-400">{new Date(app.appliedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-3 text-xs font-medium text-center">
                                        <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded-full">
                                            {app.jobId?.role || "System Specialist"}
                                        </span>
                                    </td>
                                    <td className="p-3 text-xs font-medium text-center text-gray-600">
                                        <div className="flex flex-col items-center">
                                            <span>{app.mobile}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-16 p-1 border rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-gray-50"
                                            value={app.technicalScore || 0}
                                            onChange={(e) => handleUpdateScore(app._id, "technicalScore", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3 text-xs font-medium text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'Resigned' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {(app.status || "Applied").toUpperCase()}
                                            </span>
                                            {app.status === 'Resigned' && app.resignationStatus === 'Pending' && (
                                                <span className="text-[6px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                                    Resignation Requested
                                                </span>
                                            )}
                                            {(app.interviewStatus === 'Invited' || app.interviewStatus === 'Rescheduled') && app.candidateInterviewStatus && app.candidateInterviewStatus !== 'Pending' && (
                                                <span className={`text-[6px] font-black uppercase tracking-tighter ${app.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                    Interview {app.candidateInterviewStatus}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs font-medium text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(app)}
                                                className="text-blue-600 hover:text-blue-800 transition flex items-center gap-0.5 font-bold text-[10px]"
                                                title="View Details"
                                            >
                                                <FaEye size={10} /> View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (app.resume) {
                                                        window.open(formatDocumentUrl(app.resume), '_blank');
                                                    }
                                                }}
                                                className="text-gray-600 hover:text-blue-600 transition flex items-center gap-0.5 font-bold text-[10px]"
                                                title="View Resume"
                                            >
                                                <FaDownload size={10} /> Resume
                                            </button>
                                            <button
                                                onClick={() => window.location.href = "/score"}
                                                className="text-purple-600 hover:text-purple-800 transition flex items-center gap-0.5 font-bold text-[10px]"
                                                title="Score Board"
                                            >
                                                <FaStar size={10} /> Score
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                            <FaUserGraduate size={24} />
                        </div>
                        <h3 className="text-sm font-medium text-gray-800">No applicants yet</h3>
                        <p className="text-xs text-gray-500">New job applications will appear here once candidates apply.</p>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {isModalOpen && selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative overflow-hidden">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        >
                            <FaTimesCircle size={16} />
                        </button>

                        {/* Header */}
                        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">
                                    {selectedApplicant.firstName} {selectedApplicant.lastName}
                                </h2>
                                <p className="text-[10px] text-gray-500">
                                    {selectedApplicant.role || "Applicant"}
                                </p>
                            </div>

                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full
          ${selectedApplicant.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : selectedApplicant.status === "Selected"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"}`}>
                                {selectedApplicant.status}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-5 text-xs text-gray-700 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                    <Info label="Email" value={selectedApplicant.email} />
                                    <Info label="Mobile" value={selectedApplicant.mobile} />
                                    <Info label="Location" value={selectedApplicant.currentLocation} />
                                    <Info label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
                                    Education
                                </h3>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                    <Info label="Qualification" value={selectedApplicant.highestQualification} />
                                    <Info label="Institution" value={selectedApplicant.institution} />
                                    <Info label="Department" value={selectedApplicant.department} />
                                    <Info label="Percentage" value={selectedApplicant.percentage ? `${selectedApplicant.percentage}%` : "N/A"} />
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
                                    Experience
                                </h3>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                    <Info label="Total Exp" value={`${selectedApplicant.experience || 0} Years`} />
                                    <Info label="Company" value={selectedApplicant.companyName} />
                                    <Info label="Current CTC" value={selectedApplicant.currentCTC} />
                                    <Info label="Expected CTC" value={selectedApplicant.expectedCTC} />
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedApplicant.skills && (
                                <div>
                                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
                                        Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedApplicant.skills.split(",").map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9px] rounded-md"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
                                    Assessment Scores
                                </h3>

                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <ScoreMini label="Tech" score={selectedApplicant.technicalScore} />
                                    <ScoreMini label="Appear" score={selectedApplicant.appearanceScore} />
                                    <ScoreMini label="Knowledge" score={selectedApplicant.workKnowledge} />
                                    <ScoreMini label="Overall" score={selectedApplicant.overallRating} />
                                </div>
                            </div>

                            {/* Interview Confirmation */}
                            {(selectedApplicant.interviewStatus === 'Invited' || selectedApplicant.interviewStatus === 'Rescheduled') && (
                                <div className={`p-3 rounded-xl border ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-50 border-indigo-100' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-[10px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                            <FaCalendarCheck size={10} className={selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-500' : 'text-gray-400'} /> Interview Confirmation
                                        </h3>
                                        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-100 text-indigo-700' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedApplicant.candidateInterviewStatus || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Info label="Scheduled Time" value={selectedApplicant.interviewTime} />
                                        <Info label="Interview Mode" value={selectedApplicant.interviewMode || "Online"} />
                                    </div>
                                    {selectedApplicant.candidateInterviewNote && (
                                        <div className="mt-2 p-2 bg-white rounded-lg border border-gray-100 text-[9px] text-gray-600 italic">
                                            "{selectedApplicant.candidateInterviewNote}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comment */}
                            {selectedApplicant.comment && (
                                <div className="text-[9px] bg-gray-50 p-2 rounded-md border text-gray-600">
                                    {selectedApplicant.comment}
                                </div>
                            )}

                            {/* Resignation Details */}
                            {selectedApplicant.status === "Resigned" && (
                                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-red-800 flex items-center gap-1">
                                            <FaUserTie size={12} className="text-red-500" /> Resignation Request
                                        </h3>
                                        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                            selectedApplicant.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {selectedApplicant.resignationStatus || 'Pending'}
                                        </span>
                                    </div>

                                    {selectedApplicant.resignationLetter && (
                                        <div className="bg-white p-3 rounded-lg border border-red-100 text-[9px] text-gray-700 italic leading-relaxed max-h-32 overflow-y-auto">
                                            "{selectedApplicant.resignationLetter}"
                                        </div>
                                    )}

                                    {selectedApplicant.resignationStatus === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Approved")}
                                                className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[8px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Rejected")}
                                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    if (selectedApplicant?.resume) {
                                        window.open(formatDocumentUrl(selectedApplicant.resume), "_blank");
                                    }
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] rounded-md hover:bg-blue-700"
                            >
                                View Resume
                            </button>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-1.5 bg-gray-800 text-white text-[10px] rounded-md hover:bg-black"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApplicants;