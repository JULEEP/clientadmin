import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    FaAward,
    FaEdit,
    FaLayerGroup,
    FaPlus,
    FaPlusCircle,
    FaRegClock,
    FaTasks,
    FaTimes,
    FaTrash
} from "react-icons/fa";
import { FiBriefcase, FiCheck, FiFilter, FiInfo, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api'


const AssessmentManager = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [experienceFilter, setExperienceFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef(null);

    // Pagination states
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
    });

    const navigate = useNavigate();
    const clientId = localStorage.getItem("clientId");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        role: "",
        experienceLevel: "Fresher",
        duration: 30,
        questions: [
            { questionText: "", options: ["", "", "", ""], correctAnswer: "", marks: 5 }
        ]
    });

    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (!clientId) {
            alert("Please login first!");
            navigate("/login");
            return;
        }
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

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/getallquizes/${clientId}`);
            if (res.data.success) {
                setQuizzes(res.data.quizzes || []);
            }
        } catch (err) {
            console.error("Fetch quizzes error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/roles/all?clientId=${clientId}`);
            if (res.data.success) {
                setRoles(res.data.data || []);
            }
        } catch (err) {
            console.error("Fetch roles error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment?")) return;
        try {
            const res = await axios.delete(`${API_BASE_URL}/admin/assessments/${id}`, {
                data: { clientId }
            });
            if (res.data.success) {
                setQuizzes(quizzes.filter(q => q._id !== id));
            }
        } catch (err) {
            console.error("Delete assessment error:", err);
            alert("Failed to delete assessment");
        }
    };

    const openCreateModal = () => {
        fetchRoles();
        setIsEditing(false);
        setFormData({
            title: "",
            description: "",
            role: "",
            experienceLevel: "Fresher",
            duration: 30,
            questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "", marks: 5 }]
        });
        setModalOpen(true);
    };

    const openEditModal = (quiz) => {
        fetchRoles();
        setIsEditing(true);
        setFormData({
            _id: quiz._id,
            title: quiz.title || quiz.name || "",
            description: quiz.description || "",
            role: quiz.role || quiz.category || "",
            experienceLevel: quiz.experienceLevel || "Fresher",
            duration: Number(quiz.duration) || 30,
            questions: quiz.questions && quiz.questions.length > 0
                ? quiz.questions.map(q => ({
                    questionText: q.questionText || "",
                    options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
                    correctAnswer: q.correctAnswer || "",
                    marks: Number(q.marks) || 5
                }))
                : [{ questionText: "", options: ["", "", "", ""], correctAnswer: "", marks: 5 }]
        });
        setModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "", marks: 5 }]
        }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (quiz.title || quiz.name || "").toLowerCase().includes(query) ||
            (quiz.role || quiz.category || "").toLowerCase().includes(query);

        const matchesRole = roleFilter ? (quiz.role === roleFilter || quiz.category === roleFilter) : true;
        const matchesExperience = experienceFilter ? (quiz.experienceLevel === experienceFilter) : true;

        let matchesDate = true;
        if (dateFilter && quiz.createdAt) {
            const quizDate = new Date(quiz.createdAt).toISOString().split('T')[0];
            matchesDate = quizDate === dateFilter;
        }

        return matchesSearch && matchesRole && matchesExperience && matchesDate;
    });

    // Pagination Handlers
    const handleItemsPerPageChange = (limit) => {
        setPagination({
            currentPage: 1,
            limit: limit,
            totalCount: filteredQuizzes.length,
            totalPages: Math.ceil(filteredQuizzes.length / limit)
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
            totalCount: filteredQuizzes.length,
            totalPages: Math.ceil(filteredQuizzes.length / prev.limit),
            currentPage: 1
        }));
    }, [filteredQuizzes.length, searchQuery, roleFilter, experienceFilter, dateFilter]);

    // Calculate pagination
    const indexOfLastItem = pagination.currentPage * pagination.limit;
    const indexOfFirstItem = indexOfLastItem - pagination.limit;
    const currentItems = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem);

    // Clear all filters
    const resetFilters = () => {
        setSearchQuery("");
        setRoleFilter("");
        setExperienceFilter("");
        setDateFilter("");
        setRoleSearchQuery("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: "", type: "" });

        try {
            let res;
            const data = { ...formData, clientId };
            
            if (isEditing) {
                res = await axios.put(`${API_BASE_URL}/admin/assessments/${formData._id}`, data);
            } else {
                res = await axios.post(`${API_BASE_URL}/admin/assessments`, data);
            }

            if (res.data.success) {
                setMessage({ text: isEditing ? "Updated successfully!" : "Created successfully!", type: "success" });
                setTimeout(() => {
                    setModalOpen(false);
                    fetchQuizzes();
                }, 1500);
            }
        } catch (err) {
            console.error("Submit error:", err);
            setMessage({ text: err.response?.data?.message || "Something went wrong", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Syncing assessments...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
            {/* Filters Section */}
            <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
                <div className="flex flex-wrap items-center gap-2">

                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[180px]">
                        <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search title or role..."
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

                    {/* Experience Filter */}
                    <div className="relative w-[130px]">
                        <select
                            className="w-full pl-2 pr-6 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
                            value={experienceFilter}
                            onChange={(e) => setExperienceFilter(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Junior">Junior</option>
                            <option value="Mid">Mid Level</option>
                            <option value="Senior">Senior</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                            <FiFilter className="text-[8px] text-gray-400" />
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Bulk Upload Button */}
                        <button
                            onClick={() => navigate("/add-bulk-quiz")}
                            className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                        >
                            Bulk Upload
                        </button>

                        {/* New Assessment Button */}
                        <button
                            onClick={openCreateModal}
                            className="h-8 px-3 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                        >
                            <FaPlus className="text-xs" />
                            <span>New Assessment</span>
                        </button>

                        {/* Reset Filters Button */}
                        {(searchQuery || roleFilter || experienceFilter || dateFilter) && (
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

            {/* Quizzes Table */}
            <div className="p-0 mb-0 bg-white border shadow-lg rounded-2xl">
                {filteredQuizzes.length > 0 ? (
                    <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                        <table className="min-w-full">
                            <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                                <tr>
                                    <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Title</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Role / Category</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Questions</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Duration</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((quiz) => (
                                    <tr key={quiz._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-2 py-3 font-medium text-center">
                                            <div className="text-gray-900 whitespace-nowrap">{quiz.title || quiz.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-xs mx-auto">{quiz.description || "No description"}</div>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-center">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                                {quiz.role || quiz.category || "General"}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-center text-gray-600">
                                            <div className="flex items-center justify-center gap-1">
                                                <FaLayerGroup className="text-indigo-400" />
                                                <span>{quiz.questionsCount || quiz.questions?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-center">
                                            <div className="flex flex-col items-center gap-1 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <FaRegClock className="text-indigo-400" />
                                                    <span>{quiz.duration || 30}m</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaAward className="text-yellow-500 text-[10px]" />
                                                    <span className="text-[10px] text-gray-400">
                                                        100 Scaled Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 font-medium text-center">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => openEditModal(quiz)}
                                                    className="text-yellow-500 hover:text-yellow-700"
                                                    title="Edit Assessment"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quiz._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Delete Assessment"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {filteredQuizzes.length > 0 && (
                            <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                    <span>Showing</span>
                                    <span className="font-medium">
                                        {indexOfFirstItem + 1}
                                    </span>
                                    <span>to</span>
                                    <span className="font-medium">
                                        {Math.min(indexOfLastItem, filteredQuizzes.length)}
                                    </span>
                                    <span>of</span>
                                    <span className="font-medium">
                                        {filteredQuizzes.length}
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
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTasks className="text-2xl text-gray-200" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">No assessments found</h2>
                        <p className="text-gray-400 text-xs">Start building your talent pipeline.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl text-gray-800">
                                    {isEditing ? "Update Assessment" : "Build New Assessment"}
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {isEditing ? "Modify assessment parameters" : "Configure assessment parameters"}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-grow overflow-y-auto p-8 pt-4 no-scrollbar">
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                    }`}>
                                    {message.type === "success" ? <FiCheck className="text-lg shrink-0" /> : <FiInfo className="text-lg shrink-0" />}
                                    <span className="text-sm font-bold">{message.text}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info Section */}
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Assessment Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                                                placeholder="e.g., Software Engineer - Logic & DSA"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Job Role</label>
                                            <div className="relative">
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white appearance-none"
                                                >
                                                    <option value="">Select Target Role</option>
                                                    {(roles || []).map(r => (
                                                        <option key={r._id} value={r.name}>{r.name}</option>
                                                    ))}
                                                    <option value="General">General / Other</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Experience Level</label>
                                            <div className="relative">
                                                <select
                                                    name="experienceLevel"
                                                    value={formData.experienceLevel}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white appearance-none"
                                                >
                                                    <option value="Fresher">Fresher (0-1 yrs)</option>
                                                    <option value="Junior">Junior (2-3 yrs)</option>
                                                    <option value="Mid">Mid Level (4-5 yrs)</option>
                                                    <option value="Senior">Senior (5+ yrs)</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Duration (Minutes)</label>
                                            <div className="relative">
                                                <FaRegClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors" />
                                                <input
                                                    type="number"
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleFormChange}
                                                    required
                                                    min="5"
                                                    max="180"
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Summary / Instructions</label>
                                        <div className="relative group">
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleFormChange}
                                                rows="2"
                                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-300 resize-none"
                                                placeholder="Provide context or rules for the candidates..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Questions Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                                            Question Repository
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addQuestion}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <FaPlusCircle /> Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {(formData.questions || []).map((q, qIdx) => (
                                            <div key={qIdx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 relative group animate-in slide-in-from-bottom-2 duration-200">
                                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md text-xs">
                                                    {qIdx + 1}
                                                </div>

                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIdx)}
                                                        className="absolute -top-2.5 -right-2.5 p-2 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                    >
                                                        <FaTimes className="text-[10px]" />
                                                    </button>
                                                )}

                                                <div className="space-y-5">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                            Question Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={q.questionText}
                                                            onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                                                            required
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                                                            placeholder="State the problem clearly..."
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(q.options || ["", "", "", ""]).map((opt, oIdx) => (
                                                            <div key={oIdx} className="space-y-1.5">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <label className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Option {String.fromCharCode(65 + oIdx)}</label>
                                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${qIdx}`}
                                                                            checked={q.correctAnswer === opt && opt !== ""}
                                                                            onChange={() => handleQuestionChange(qIdx, "correctAnswer", opt)}
                                                                            className="hidden"
                                                                        />
                                                                        <div
                                                                            className={`w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center transition-all
                                                                                ${q.correctAnswer === opt && opt !== ""
                                                                                    ? "bg-emerald-500 shadow-sm"
                                                                                    : "bg-white"
                                                                                }`}
                                                                        >
                                                                            {q.correctAnswer === opt && opt !== "" && (
                                                                                <FiCheck className="text-white text-xs font-bold" />
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-[9px] font-bold uppercase tracking-tight ${q.correctAnswer === opt && opt !== "" ? "text-emerald-600" : "text-gray-300"}`}>Correct</span>
                                                                    </label>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                                    required
                                                                    className={`w-full px-3 py-2.5 rounded-xl border transition-all outline-none text-xs font-medium ${q.correctAnswer === opt && opt !== ""
                                                                        ? "border-emerald-100 bg-emerald-50/50 text-emerald-800"
                                                                        : "border-gray-100 bg-white text-gray-800"
                                                                        }`}
                                                                    placeholder={`Choice ${String.fromCharCode(65 + oIdx)}...`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <div className="w-24 space-y-1.5">
                                                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 justify-end">
                                                                Points
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={q.marks}
                                                                onChange={(e) => handleQuestionChange(qIdx, "marks", e.target.value)}
                                                                required
                                                                min="1"
                                                                className="w-full px-3 py-2 rounded-xl border border-gray-100 bg-white text-xs font-bold text-gray-800 text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                                >
                                    <FaPlusCircle /> Add Question
                                </button>

                                {/* Modal Footer */}
                                <div className="pt-6 border-t border-gray-50 flex gap-4 sticky bottom-0 bg-white pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white shadow-sm transition-all transform active:scale-95 ${submitting ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100"
                                            }`}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Publishing...</span>
                                            </div>
                                        ) : (
                                            isEditing ? "Update Assessment" : "ADD"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentManager;