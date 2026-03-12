import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    FaBriefcase,
    FaEye,
    FaStar,
    FaTimes,
    FaUserGraduate,
    FaUserTie,
    FaPaperPlane,
    FaEnvelope,
    FaSave
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api'

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-blue-500">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const Score = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [scoreFilter, setScoreFilter] = useState(0);
    const [roleFilter, setRoleFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [roles, setRoles] = useState([]);
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        subject: "Interview Invitation - VEGIFFY",
        time: "",
        interviewMode: "Online",
    });
    
    const [locations, setLocations] = useState([]);
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);
    const [docsForm, setDocsForm] = useState({
        agreementsContent: "Please read, sign, and re-upload this agreement for next steps.",
    });

    const [quizzes, setQuizzes] = useState([]);
    
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
        fetchCandidates();
        fetchQuizzes();
        fetchLocations();
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
                setRoles(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/location/alllocation?clientId=${clientId}`);
            if (res.data?.locations) setLocations(res.data.locations);
        } catch (err) {
            console.error("Failed to fetch locations:", err);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/getallquizes?clientId=${clientId}`);
            if (res.data?.quizzes) setQuizzes(res.data.quizzes);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        }
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(`${API_BASE_URL}/applications/all/${clientId}`);
            if (res.data.success) {
                setCandidates(res.data.applications);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (id, field, value) => {
        const numericValue = (field === "status") ? value : Number(value);

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/update-score`, {
                applicationId: id,
                [field]: numericValue,
                clientId
            });
            if (res.data.success) {
                setCandidates((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, [field]: numericValue } : c))
                );
            }
        } catch (err) {
            console.error("Update score error:", err);
        }
    };

    const handleOpenInviteModal = (candidate) => {
        setSelectedCandidate(candidate);
        setIsInviteModalOpen(true);
    };

    const handleSendInvite = async () => {
        if (!inviteForm.time || !inviteForm.subject) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/send-invitation`, {
                applicationId: selectedCandidate._id,
                interviewSubject: inviteForm.subject,
                interviewTime: inviteForm.time,
                interviewMode: inviteForm.interviewMode,
                clientId
            });

            if (res.data.success) {
                alert("Interview invitation sent successfully!");
                setIsInviteModalOpen(false);
                fetchCandidates();
            }
        } catch (err) {
            console.error("Send invite error:", err);
            alert("Failed to send invitation");
        }
    };

    const handleOpenOfferModal = (candidate) => {
        navigate(`/sendoffer?id=${candidate._id}&email=${candidate.email}&clientId=${clientId}`);
    };

    const handleOpenDocsModal = (candidate) => {
        setSelectedCandidate(candidate);
        setDocsForm({ agreementsContent: candidate.adminAgreements || "Please read, sign, and re-upload this agreement for next steps." });
        setIsDocsModalOpen(true);
    };

    const handleOpenAssessmentDetails = (candidate) => {
        if (!candidate.assessmentResults || candidate.assessmentResults.length === 0) {
            alert("No assessment data available for this candidate.");
            return;
        }

        const latest = candidate.assessmentResults[candidate.assessmentResults.length - 1];

        let matchedQuiz = null;

        if (latest.quizId && typeof latest.quizId === 'object' && latest.quizId.questions) {
            matchedQuiz = latest.quizId;
        } else {
            const quizId = typeof latest.quizId === 'object' ? latest.quizId?._id : latest.quizId;
            matchedQuiz = quizzes.find(q => String(q._id) === String(quizId));

            if (!matchedQuiz && candidate.comment) {
                const titleMatch = candidate.comment.match(/"([^"]+)"/);
                if (titleMatch?.[1]) {
                    matchedQuiz = quizzes.find(q => q.title === titleMatch[1]);
                }
            }
        }

        let enrichedAnswers = [];

        if (matchedQuiz && matchedQuiz.questions && matchedQuiz.questions.length > 0) {
            enrichedAnswers = matchedQuiz.questions.map((q, idx) => {
                const storedByText = latest.answers?.find(a => a.questionText === q.questionText);
                const storedByIndex = latest.answers?.[idx];
                const storedAns = storedByText || storedByIndex;

                const selected = storedAns?.selectedOption || "Not Answered";
                const correct = q.correctAnswer || "";

                return {
                    questionText: q.questionText,
                    options: q.options || [],
                    correctAnswer: correct,
                    selectedOption: selected,
                    isCorrect: String(selected).trim() === String(correct).trim(),
                    marks: q.marks || 1,
                };
            });
        } else if (latest.answers && latest.answers.length > 0) {
            enrichedAnswers = latest.answers.map(ans => ({
                questionText: ans.questionText || "Question",
                options: ans.options?.length > 0
                    ? ans.options
                    : [ans.selectedOption, ans.correctAnswer].filter(Boolean),
                correctAnswer: ans.correctAnswer || "",
                selectedOption: ans.selectedOption || "Not Answered",
                isCorrect: ans.isCorrect !== undefined
                    ? ans.isCorrect
                    : String(ans.selectedOption).trim() === String(ans.correctAnswer).trim(),
                marks: ans.marks || 1
            }));
        }

        setSelectedAssessmentData({
            ...latest,
            answers: enrichedAnswers,
            quizTitle: matchedQuiz?.title || "Assessment"
        });
        setSelectedCandidate(candidate);
        setIsAssessmentModalOpen(true);
    };

    const [docsFile, setDocsFile] = useState(null);

    const handleSendAgreements = async () => {
        const formData = new FormData();
        formData.append("applicationId", selectedCandidate._id);
        formData.append("agreementsContent", docsForm.agreementsContent);
        formData.append("clientId", clientId);
        if (docsFile) {
            formData.append("adminAttachment", docsFile);
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/applications/send-agreements`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                alert("Agreements sent successfully!");
                setDocsFile(null);
                fetchCandidates();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send agreements");
        }
    };

    const handleReviewDocs = async (status) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/applications/review-documents`, {
                applicationId: selectedCandidate._id,
                status,
                clientId
            });
            if (res.data.success) {
                alert(`Documents ${status}`);
                setIsDocsModalOpen(false);
                fetchCandidates();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
            (c.jobId?.role || "").toLowerCase().includes(query);

        const matchesScore = (c.technicalScore || 0) >= scoreFilter;
        const matchesRole = roleFilter ? (c.jobId?.role === roleFilter) : true;

        const matchesDate = dateFilter
            ? new Date(c.appliedAt).toISOString().slice(0, 10) === dateFilter
            : true;

        return matchesSearch && matchesScore && matchesRole && matchesDate;
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
    }, [filteredCandidates.length, searchQuery, scoreFilter, roleFilter, dateFilter]);

    // Calculate pagination
    const indexOfLastItem = pagination.currentPage * pagination.limit;
    const indexOfFirstItem = indexOfLastItem - pagination.limit;
    const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);

    const resetFilters = () => {
        setSearchQuery("");
        setScoreFilter(0);
        setRoleFilter("");
        setRoleSearchQuery("");
        setDateFilter("");
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-bold animate-pulse">Loading Score Board...</p>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
            {/* Filters Section */}
            <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap items-center gap-2">

                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[180px]">
                        <FaUserGraduate className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search name or role..."
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
                        {scoreFilter > 0 && (
                            <button
                                onClick={() => setScoreFilter(0)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <FaTimes className="text-[8px]" />
                            </button>
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

                    {/* Reset Filters Button */}
                    {(searchQuery || scoreFilter > 0 || roleFilter || dateFilter) && (
                        <button
                            onClick={resetFilters}
                            className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition flex items-center gap-1"
                        >
                            <FaTimes className="text-xs" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message - Show above table but don't hide table */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* Table - Always show header, even with error or no data */}
            <div className="p-0 mb-0 bg-white border shadow-lg rounded-2xl">
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                    <table className="min-w-full">
                        {/* Table Header - Always visible */}
                        <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                            <tr>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">CANDIDATE</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">ROLE</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">APPEARANCE (10)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">KNOWLEDGE (10)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">ASSESSMENT SCORE (100)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">RATING (10)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">STATUS</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.length > 0 ? (
                                currentItems.map((c) => (
                                    <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{c.firstName} {c.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-1 rounded uppercase font-bold">
                                                {c.jobId?.role?.toUpperCase() || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                                value={c.appearanceScore || 0}
                                                onChange={(e) => handleUpdateScore(c._id, "appearanceScore", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                                value={c.workKnowledge || 0}
                                                onChange={(e) => handleUpdateScore(c._id, "workKnowledge", e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-16 p-1 border rounded text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={c.technicalScore || 0}
                                                    onChange={(e) => handleUpdateScore(c._id, "technicalScore", e.target.value)}
                                                />
                                                {c.assessmentResults && c.assessmentResults.length > 0 && (
                                                    <button
                                                        onClick={() => handleOpenAssessmentDetails(c)}
                                                        className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-100"
                                                        title="View Detailed Answers"
                                                    >
                                                        <FaEye size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <select
                                                className="p-1 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={c.overallRating || 0}
                                                onChange={(e) => handleUpdateScore(c._id, "overallRating", e.target.value)}
                                            >
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                c.status === "Selected" ? "bg-green-100 text-green-700" :
                                                c.status === "Interview" ? "bg-blue-100 text-blue-700" :
                                                c.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {c.status || "PENDING"}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                {c.status === "Interview" && (
                                                    <button
                                                        onClick={() => handleOpenInviteModal(c)}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-[10px] font-bold flex items-center gap-1"
                                                    >
                                                        <FaPaperPlane size={10} /> INVITE
                                                    </button>
                                                )}

                                                {c.status === "Selected" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenOfferModal(c)}
                                                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-lg hover:from-purple-600 hover:to-fuchsia-700 transition-all text-[10px] font-bold flex items-center gap-1"
                                                        >
                                                            <FaEnvelope size={10} /> OFFER
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDocsModal(c)}
                                                            className={`px-3 py-1.5 text-white rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 ${
                                                                c.docReviewStatus === "Accepted"
                                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                                                    : c.docReviewStatus === "Pending"
                                                                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                                                        : "bg-gradient-to-r from-slate-700 to-slate-800"
                                                            }`}
                                                        >
                                                            <FaSave size={10} /> DOCS
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // No Data Message inside table body
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FaUserGraduate className="text-4xl text-gray-300 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-800">No candidates found</h3>
                                            <p className="text-sm text-gray-500">No candidates matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Pagination - Only show if there are results */}
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
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaPaperPlane className="text-blue-600" /> Send Interview Invite
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Candidate: <span className="font-semibold text-gray-800">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={inviteForm.subject}
                                    onChange={(e) => setInviteForm({ ...inviteForm, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Time & Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    value={inviteForm.time}
                                    onChange={(e) => setInviteForm({ ...inviteForm, time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode / Location</label>
                                <select
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                                    value={inviteForm.interviewMode}
                                    onChange={(e) => setInviteForm({ ...inviteForm, interviewMode: e.target.value })}
                                >
                                    <option value="Online">🌐 Online (Google Meet / Zoom)</option>
                                    {locations.map(loc => (
                                        <option key={loc._id} value={loc.fullAddress}>
                                            📍 {loc.name} - {loc.fullAddress}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                onClick={() => setIsInviteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-lg"
                                onClick={handleSendInvite}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Management Modal */}
            {isDocsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FaSave className="text-indigo-600" /> Document Management
                            </h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                selectedCandidate?.docReviewStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                                selectedCandidate?.docReviewStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                Review Status: {selectedCandidate?.docReviewStatus}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* Step 1: Send Agreements */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-black uppercase text-slate-700 mb-3 tracking-wider">Step 1: Agreements for Candidate</h3>
                                <textarea
                                    className="w-full p-3 border rounded-md text-sm min-h-[150px] focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter agreement terms or instructions..."
                                    value={docsForm.agreementsContent}
                                    onChange={(e) => setDocsForm({ ...docsForm, agreementsContent: e.target.value })}
                                />
                                <div className="mt-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Attach Agreement Check (PDF/Doc)</label>
                                    <input
                                        type="file"
                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        onChange={(e) => setDocsFile(e.target.files[0])}
                                    />
                                </div>
                                <button
                                    onClick={handleSendAgreements}
                                    className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-indigo-700"
                                >
                                    Send / Update Agreements
                                </button>
                            </div>

                            {/* Step 2: Review Candidate Upload */}
                            {selectedCandidate?.candidateAgreementsUpload && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-sm font-black uppercase text-blue-800 mb-3 tracking-wider">Step 2: Review Uploaded Document</h3>
                                    <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-100 mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaPaperPlane className="text-blue-500" />
                                            <span className="text-xs font-bold text-slate-700">Signed_Agreement.pdf</span>
                                        </div>
                                        <button
                                            onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedCandidate.candidateAgreementsUpload}`, '_blank')}
                                            className="text-[10px] font-black uppercase text-blue-600 hover:underline"
                                        >
                                            View Upload
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReviewDocs("Accepted")}
                                            className="flex-1 py-2 bg-green-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-green-700 shadow-md"
                                        >
                                            Accept Documents
                                        </button>
                                        <button
                                            onClick={() => handleReviewDocs("Rejected")}
                                            className="flex-1 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-red-700 shadow-md"
                                        >
                                            Reject & Resubmit
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!selectedCandidate?.candidateAgreementsUpload && (
                                <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Awaiting candidate upload...</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                className="px-6 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded"
                                onClick={() => setIsDocsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assessment Detail Modal */}
            {isAssessmentModalOpen && selectedAssessmentData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 max-h-[90vh] flex flex-col">

                        <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                                        Assessment Answer Sheet
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5 text-gray-500">
                                        {selectedAssessmentData.quizTitle && `Quiz: ${selectedAssessmentData.quizTitle} • `}Candidate: <span className="text-indigo-600">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAssessmentModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <FaTimes className="text-lg" />
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Final Score:</span>
                                    <span className="text-sm font-black text-indigo-600">
                                        {selectedAssessmentData.score}<span className="text-xs text-gray-400 font-bold">/100</span>
                                    </span>
                                </div>

                                <div className="h-4 w-[1px] bg-gray-200"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Questions:</span>
                                    <span className="text-sm font-black text-gray-700">
                                        {selectedAssessmentData.answers?.length || selectedAssessmentData.totalQuestions || 0}
                                    </span>
                                </div>

                                <div className="h-4 w-[1px] bg-gray-200"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">Status:</span>
                                    <span className={`text-xs font-black uppercase tracking-wider ${selectedAssessmentData.score >= 70 ? 'text-emerald-600' :
                                        selectedAssessmentData.score >= 50 ? 'text-amber-600' :
                                            'text-rose-600'
                                        }`}>
                                        {selectedAssessmentData.score >= 70 ? "Excellent" : selectedAssessmentData.score >= 50 ? "Average" : "Poor"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6 flex-grow bg-white">
                            {selectedAssessmentData.answers && selectedAssessmentData.answers.length > 0 ? (
                                selectedAssessmentData.answers.map((ans, idx) => {
                                    const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
                                    const options = ans.options && ans.options.length > 0
                                        ? ans.options
                                        : [ans.selectedOption, ans.correctAnswer].filter(Boolean);

                                    return (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
                                            <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${ans.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    Q{idx + 1}
                                                </div>
                                                <div className="flex-grow pt-1">
                                                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{ans.questionText}</p>
                                                </div>
                                                <div className="shrink-0 pt-1.5 flex items-center gap-1.5">
                                                    {ans.isCorrect ? (
                                                        <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">✓ Correct</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1">✗ Incorrect</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-2.5">
                                                {options.map((opt, oIdx) => {
                                                    const isCorrectOpt = String(opt).trim() === String(ans.correctAnswer).trim();
                                                    const isCandidateOpt = String(opt).trim() === String(ans.selectedOption).trim();
                                                    const label = optionLabels[oIdx] || String(oIdx + 1);

                                                    let optStyle = "bg-white border-gray-200 text-gray-600";
                                                    let radioStyle = "border-gray-200 border-2";
                                                    let badge = null;

                                                    if (isCorrectOpt && isCandidateOpt) {
                                                        optStyle = "bg-emerald-50/50 border-emerald-300 text-emerald-800";
                                                        radioStyle = "border-emerald-500 bg-emerald-500";
                                                        badge = <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✓ Selected Correctly</span>;
                                                    } else if (isCorrectOpt) {
                                                        optStyle = "bg-emerald-50/30 border-emerald-200 text-emerald-700 border-dashed";
                                                        radioStyle = "border-emerald-400 border-2";
                                                        badge = <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✓ Correct Answer</span>;
                                                    } else if (isCandidateOpt) {
                                                        optStyle = "bg-rose-50/50 border-rose-300 text-rose-800";
                                                        radioStyle = "border-rose-500 bg-rose-500";
                                                        badge = <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded text-right uppercase tracking-wider">✗ Selected Incorrectly</span>;
                                                    }

                                                    return (
                                                        <div key={oIdx} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${optStyle}`}>
                                                            <div className="shrink-0">
                                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase">{label}</span>
                                                            </div>

                                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${radioStyle}`}>
                                                                {(isCandidateOpt || isCorrectOpt) && (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isCorrectOpt && !isCandidateOpt ? 'bg-emerald-400' : 'bg-white'}`} />
                                                                )}
                                                            </div>

                                                            <p className="text-xs font-semibold flex-grow">{opt}</p>

                                                            {badge && (
                                                                <div className="shrink-0 flex items-center justify-end min-w-[120px]">
                                                                    {badge}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white text-gray-300 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                                        <FaEye className="text-3xl" />
                                    </div>
                                    <p className="text-gray-800 font-bold mb-1">No detailed analysis available</p>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest max-w-xs">Old assessment record without question tracking</p>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
                            <button
                                onClick={() => setIsAssessmentModalOpen(false)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Score;