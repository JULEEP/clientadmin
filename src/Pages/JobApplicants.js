import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    FaBriefcase,
    FaCalendarCheck,
    FaDownload,
    FaEye,
    FaStar,
    FaTimesCircle,
    FaUserGraduate,
    FaUserTie
} from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

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

    // Get clientId from localStorage
    const clientId = localStorage.getItem('clientId');

    useEffect(() => {
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
                const rolesData = res.data.data || [];
                const formattedRoles = rolesData.map((role, index) => ({
                    _id: role._id || index,
                    name: role.roleName || role.name || role
                }));
                // Filter out duplicates and ensure valid names
                const uniqueRoles = Array.from(new Set(formattedRoles.map(r => r.name)))
                    .filter(name => name)
                    .map(name => formattedRoles.find(r => r.name === name));
                setRoles(uniqueRoles);
            }
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/applications/all`, { clientId });
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (err) {
            setError("Failed to fetch applications");
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

    const handleOpenAssessmentModal = (app) => {
        window.location.href = `/score?search=${app.firstName}`;
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
        <div className="w-full min-h-screen p-2">
            {/* Filters Section */}
            <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap items-center gap-2">

                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[180px]">
                        <FaUserGraduate className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search name, mobile, role..."
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
                            <FaBriefcase className="text-xs" /> Role {roleFilter && `: ${roleFilter}`}
                        </button>
                        
                        {/* Role Filter Dropdown */}
                        {isRoleDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                <div className="p-2 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <FaUserTie className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
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

                    {/* Score Filter */}
                    <div className="relative w-[130px]">
                        <select
                            className="w-full pl-2 pr-6 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(Number(e.target.value))}
                        >
                            <option value="0">All Scores</option>
                            <option value="60">60% & Above</option>
                            <option value="70">70% & Above</option>
                            <option value="80">80% & Above</option>
                            <option value="90">90% & Above</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                            <FaStar className="text-[8px] text-gray-400" />
                        </div>
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

                    {/* Clear Filters Button */}
                    {(searchQuery || scoreFilter > 0 || roleFilter || dateFilter) && (
                        <button
                            onClick={clearFilters}
                            className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="p-0 mb-0 bg-white border shadow-lg rounded-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-wider">Loading Applicants...</p>
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                        <table className="min-w-full">
                            <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                                <tr>
                                    <th className="py-2 text-center">Candidate Name</th>
                                    <th className="py-2 text-center">Applied Role</th>
                                    <th className="py-2 text-center">Contact</th>
                                    <th className="py-2 text-center">Assement Score (100)</th>
                                    <th className="py-2 text-center">Status</th>
                                    <th className="py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((app) => (
                                    <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-2 font-medium text-center">
                                            <div className="text-gray-900 whitespace-nowrap">{app.firstName} {app.lastName}</div>
                                            <div className="text-[10px] text-gray-600">{new Date(app.appliedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full">
                                                {app.jobId?.role || "System Specialist"}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-center text-gray-600">
                                            <div className="flex flex-col items-center">
                                                <span>{app.mobile}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="w-20 p-1.5 border rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                value={app.technicalScore || 0}
                                                onChange={(e) => handleUpdateScore(app._id, "technicalScore", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-2 py-1 rounded-full text-[10px] ${app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        app.status === 'Resigned' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {(app.status || "Applied").toUpperCase()}
                                                </span>
                                                {app.status === 'Resigned' && app.resignationStatus === 'Pending' && (
                                                    <span className="text-[8px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                                                        Resignation Requested
                                                    </span>
                                                )}
                                                {(app.interviewStatus === 'Invited' || app.interviewStatus === 'Rescheduled') && app.candidateInterviewStatus && app.candidateInterviewStatus !== 'Pending' && (
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${app.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                        Interview {app.candidateInterviewStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(app)}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-indigo-100 flex items-center justify-center gap-1.5 text-[10px] font-bold"
                                                >
                                                    <FaEye className="text-xs" /> View
                                                </button>
                                                <button
                                                    onClick={() => handleOpenAssessmentModal(app)}
                                                    className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] font-black tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                >
                                                    <FaStar className="text-xs" /> Score
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (app.resume) {
                                                            window.open(formatDocumentUrl(app.resume), '_blank');
                                                        }
                                                    }}
                                                    className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1 text-[10px]"
                                                    title="View Resume"
                                                >
                                                    <FaDownload className="text-xs" /> Resume
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {filteredApplications.length > 0 && (
                            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                    <span>Showing</span>
                                    <span className="font-medium">
                                        {indexOfFirstItem + 1}
                                    </span>
                                    <span>to</span>
                                    <span className="font-medium">
                                        {Math.min(indexOfLastItem, filteredApplications.length)}
                                    </span>
                                    <span>of</span>
                                    <span className="font-medium">
                                        {filteredApplications.length}
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
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FaUserGraduate size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No applicants yet</h3>
                        <p className="text-gray-500">New job applications will appear here once candidates apply.</p>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {isModalOpen && selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl relative overflow-hidden">

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                        >
                            <FaTimesCircle size={18} />
                        </button>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {selectedApplicant.firstName} {selectedApplicant.lastName}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {selectedApplicant.jobId?.role || selectedApplicant.role || "Applicant"} 
                                    {selectedApplicant.jobId?.department && ` • ${selectedApplicant.jobId.department}`}
                                </p>
                            </div>

                            <span className={`px-3 py-1 text-xs font-semibold rounded-full
                                ${selectedApplicant.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : selectedApplicant.status === "Selected"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"}`}>
                                {selectedApplicant.status}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-sm text-gray-700 space-y-6 max-h-[75vh] overflow-y-auto">

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Email" value={selectedApplicant.email} />
                                    <Info label="Mobile" value={selectedApplicant.mobile} />
                                    <Info label="Location" value={selectedApplicant.currentLocation} />
                                    <Info label="Notice Period" value={selectedApplicant.noticePeriod || "Immediate"} />
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Education
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Qualification" value={selectedApplicant.highestQualification} />
                                    <Info label="Institution" value={selectedApplicant.institution} />
                                    <Info label="Department" value={selectedApplicant.department} />
                                    <Info label="Percentage" value={selectedApplicant.percentage ? `${selectedApplicant.percentage}%` : "N/A"} />
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Experience
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    <Info label="Total Exp" value={`${selectedApplicant.experience || 0} Years`} />
                                    <Info label="Company" value={selectedApplicant.companyName} />
                                    <Info label="Current CTC" value={selectedApplicant.currentCTC} />
                                    <Info label="Expected CTC" value={selectedApplicant.expectedCTC} />
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedApplicant.skills && (
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                        Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.skills.split(",").map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                                    Assessment Scores
                                </h3>

                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <ScoreMini label="Tech" score={selectedApplicant.technicalScore} />
                                    <ScoreMini label="Appear" score={selectedApplicant.appearanceScore} />
                                    <ScoreMini label="Knowledge" score={selectedApplicant.workKnowledge} />
                                    <ScoreMini label="Overall" score={selectedApplicant.overallRating} />
                                </div>
                            </div>

                            {/* Interview Confirmation */}
                            {(selectedApplicant.interviewStatus === 'Invited' || selectedApplicant.interviewStatus === 'Rescheduled') && (
                                <div className={`p-4 rounded-xl border ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-50 border-indigo-100' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-2">
                                            <FaCalendarCheck className={selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'text-indigo-500' : 'text-gray-400'} /> Interview Confirmation
                                        </h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.candidateInterviewStatus === 'Confirmed' ? 'bg-indigo-100 text-indigo-700' : selectedApplicant.candidateInterviewStatus === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedApplicant.candidateInterviewStatus || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <Info label="Scheduled Time" value={selectedApplicant.interviewTime} />
                                        <Info label="Interview Mode" value={selectedApplicant.interviewMode || "Online"} />
                                    </div>
                                    {selectedApplicant.candidateInterviewNote && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 text-xs text-gray-600 italic">
                                            "{selectedApplicant.candidateInterviewNote}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Comment */}
                            {selectedApplicant.comment && (
                                <div className="text-xs bg-gray-50 p-3 rounded-md border text-gray-600">
                                    {selectedApplicant.comment}
                                </div>
                            )}

                            {/* Resignation Details */}
                            {selectedApplicant.status === "Resigned" && (
                                <div className="mt-6 p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
                                            <FaUserTie className="text-red-500" /> Resignation Request
                                        </h3>
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${selectedApplicant.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                            selectedApplicant.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {selectedApplicant.resignationStatus || 'Pending'}
                                        </span>
                                    </div>

                                    {selectedApplicant.resignationLetter && (
                                        <div className="bg-white p-4 rounded-xl border border-red-100 text-xs text-gray-700 italic leading-relaxed max-h-40 overflow-y-auto">
                                            "{selectedApplicant.resignationLetter}"
                                        </div>
                                    )}

                                    {selectedApplicant.resignationStatus === 'Pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Approved")}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Approve Resignation
                                            </button>
                                            <button
                                                onClick={() => handleResignationStatusUpdate(selectedApplicant._id, "Rejected")}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                                            >
                                                Reject Resignation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (selectedApplicant?.resume) {
                                        window.open(formatDocumentUrl(selectedApplicant.resume), "_blank");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                            >
                                View Resume
                            </button>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-black"
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