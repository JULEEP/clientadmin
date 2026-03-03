import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FaTasks, FaPlus, FaCheckDouble, FaTrash, FaEdit,
    FaPlusCircle, FaTimes, FaQuestionCircle, FaSave,
    FaRegClock, FaLayerGroup, FaAward
} from "react-icons/fa";
import { FiX, FiCheck, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:5000/api';

const AssessmentManager = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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
    }, []);

    const fetchQuizzes = async () => {
        try {
            // ✅ ONLY THIS API HAS clientId IN URL
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
            // ✅ NO clientId IN THIS API
            const res = await axios.get(`${API_BASE_URL}/roles/all`);
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
            // ✅ NO clientId IN THIS API
            const res = await axios.delete(`${API_BASE_URL}/admin/assessments/${id}`);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: "", type: "" });

        try {
            let res;
            const data = { ...formData, clientId }; // Add clientId to request body
            
            if (isEditing) {
                // ✅ NO clientId IN UPDATE API
                res = await axios.put(`${API_BASE_URL}/admin/assessments/${formData._id}`, formData);
            } else {
                // ✅ CREATE API HAS clientId IN BODY
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Syncing assessments...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 font-sans">
            {/* Main container with left padding */}
            <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Assessments
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => window.location.href = "/add-bulk-quiz"}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Bulk Upload
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                        >
                            <FaPlus /> New Assessment
                        </button>
                    </div>
                </div>

                {/* Quizzes Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-wider">Syncing assessments...</p>
                        </div>
                    ) : quizzes.length > 0 ? (
                        <table className="min-w-full">
                            <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                                <tr>
                                    <th className="py-3 px-4 text-center">Title</th>
                                    <th className="py-3 px-4 text-center">Role / Category</th>
                                    <th className="py-3 px-4 text-center">Questions</th>
                                    <th className="py-3 px-4 text-center">Duration</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzes.map((quiz) => (
                                    <tr key={quiz._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-medium text-center">
                                            <div className="font-bold text-gray-800">{quiz.title || quiz.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-xs mx-auto">{quiz.description || "No description"}</div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-center">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                {quiz.role || quiz.category || "General"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-center text-gray-600">
                                            <div className="flex items-center justify-center gap-1">
                                                <FaLayerGroup className="text-indigo-400" />
                                                <span>{quiz.questionsCount || quiz.questions?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-center">
                                            <div className="flex flex-col items-center gap-1 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <FaRegClock className="text-indigo-400" />
                                                    <span>{quiz.duration || 30}m</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaAward className="text-yellow-500 text-[10px]" />
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        100 Scaled Marks
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-center">
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
                                                    <option value="Junior">Junior (3-4 yrs)</option>
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