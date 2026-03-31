import axios from "axios";
import { useEffect, useState, useRef } from "react";
import {
    FaGripVertical,
    FaPlusCircle,
    FaRegClock,
    FaTimes,
} from "react-icons/fa";
import { Reorder } from "framer-motion";
import { FiCheck, FiInfo, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/config";

const NewAssessment = () => {
    const navigate = useNavigate();
    const roleRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        role: "",
        experienceLevel: "Fresher",
        duration: 30,
        questions: [
            { id: Date.now(), questionType: "mcq", questionText: "", options: ["", "", "", "", ""], correctAnswer: "", marks: 5 }
        ]
    });

    // Get clientId from localStorage
    const clientId = localStorage.getItem('clientId');

    useEffect(() => {
        fetchRoles();
        const handleClickOutside = (event) => {
            if (roleRef.current && !roleRef.current.contains(event.target)) {
                setShowRoleDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/roles/all`);
            if (res.data.success) {
                // Roles API likely returns array of { _id, roleName }
                const rolesData = res.data.data || [];
                const formattedRoles = rolesData.map((role, index) => ({
                    _id: role._id || index,
                    name: role.roleName || role.name || role
                }));
                setRoles(formattedRoles);
            }
        } catch (err) {
            console.error("Fetch roles error:", err);
        }
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

    const addOption = (qIndex) => {
        const newQuestions = [...formData.questions];
        if (newQuestions[qIndex].options.length >= 6) return;
        newQuestions[qIndex].options.push("");
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...formData.questions];
        if (newQuestions[qIndex].options.length <= 2) return; // Keep at least 2 options
        
        const removedValue = newQuestions[qIndex].options[oIndex];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        
        if (newQuestions[qIndex].correctAnswer === removedValue) {
            newQuestions[qIndex].correctAnswer = "";
        }
        
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { id: Date.now(), questionType: "mcq", questionText: "", options: ["", "", "", "", ""], correctAnswer: "", marks: 5 }]
        }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleReorder = (newOrder) => {
        setFormData(prev => ({ ...prev, questions: newOrder }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: "", type: "" });

        // Sanitize question data: Remove temporary 'id' and ensure 'correctAnswer' is valid
        const sanitizedQuestions = formData.questions.map(q => {
            const { id, ...sanitizedQ } = q;
            return {
                ...sanitizedQ,
                correctAnswer: q.questionType === "mcq" 
                    ? (q.correctAnswer || q.options[0] || "Option A") // Fallback for MCQ
                    : (q.correctAnswer || "Answer required") // Fallback for Short Answer
            };
        });

        const submissionData = {
            ...formData,
            questions: sanitizedQuestions,
            clientId
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/admin/assessments`, submissionData);
            if (res.data.success) {
                setMessage({ text: "Created successfully!", type: "success" });
                setTimeout(() => {
                    navigate("/assessment-manager");
                }, 1500);
            }
        } catch (err) {
            console.error("Submit error:", err);
            setMessage({ text: err.response?.data?.message || "Something went wrong", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen p-4 lg:p-6 bg-gray-50/50">
            {/* Header */}
            {/* <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <FiArrowLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        Back
                    </button>
                    <div className="h-4 w-px bg-gray-300" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Build New Assessment</h1>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                            Configure assessment parameters
                        </p>
                    </div>
                </div>
            </div> */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                        {message.type === "success" ? <FiCheck className="text-lg shrink-0" /> : <FiInfo className="text-lg shrink-0" />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-5 border-b border-gray-100 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Assessment Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        required
                                        data-gramm="false"
                                        spellcheck="false"
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                                        placeholder="e.g., Software Engineer - Logic & DSA"
                                    />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Job Role</label>
                                <div className="relative group" ref={roleRef}>
                                    <input
                                        type="text"
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => {
                                            handleFormChange(e);
                                            setShowRoleDropdown(true);
                                        }}
                                        onFocus={() => setShowRoleDropdown(true)}
                                        required
                                        autoComplete="off"
                                        data-gramm="false"
                                        spellcheck="false"
                                        className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                        placeholder="Enter or search target role..."
                                    />
                                    {showRoleDropdown && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto no-scrollbar">
                                            {roles.filter(r => r.name.toLowerCase().includes(formData.role.toLowerCase())).length === 0 && !formData.role.toLowerCase().includes("general") ? (
                                                <div className="p-3 text-xs text-gray-500 text-center">No existing roles match</div>
                                            ) : (
                                                <>
                                                    {roles.filter(r => r.name.toLowerCase().includes(formData.role.toLowerCase())).map((role) => (
                                                        <div
                                                            key={role._id}
                                                            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, role: role.name }));
                                                                setShowRoleDropdown(false);
                                                            }}
                                                        >
                                                            {role.name}
                                                        </div>
                                                    ))}
                                                    {"general / other".includes(formData.role.toLowerCase()) && (
                                                        <div
                                                            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer border-t border-gray-50"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, role: "General" }));
                                                                setShowRoleDropdown(false);
                                                            }}
                                                        >
                                                            General / Other
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
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
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm  placeholder:text-gray-300 resize-none"
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

                        <Reorder.Group axis="y" values={formData.questions} onReorder={handleReorder} className="space-y-6">
                            {(formData.questions || []).map((q, qIdx) => (
                                <Reorder.Item 
                                    key={q.id} 
                                    value={q}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-gray-50 border border-gray-100 relative group transition-shadow hover:shadow-md"
                                >
                                    <div className="absolute -top-3 -left-3 flex items-center gap-1">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md text-xs">
                                            {qIdx + 1}
                                        </div>
                                        <div className="w-6 h-8 bg-white  rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing border border-gray-100 shadow-sm hover:text-blue-600 transition-colors">
                                            <FaGripVertical size={12} />
                                        </div>
                                    </div>

                                    {formData.questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIdx)}
                                            className="absolute -top-2.5 -right-2.5 p-2 bg-white  hover:text-red-600 border border-gray-100 rounded-lg transition-all shadow-sm"
                                        >
                                            <FaTimes className="text-[10px]" />
                                        </button>
                                    )}

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="space-y-1.5 flex-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest">
                                                    Question
                                                </label>
                                                <input
                                                    type="text"
                                                    value={q.questionText}
                                                    onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800"
                                                    placeholder="Please describe your question..."
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 shrink-0">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-center">Type</label>
                                                <div className="flex p-1 bg-white border border-gray-200 rounded-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionChange(qIdx, "questionType", "mcq")}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${q.questionType === "mcq" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                    >
                                                        MCQ
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuestionChange(qIdx, "questionType", "short_answer")}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${q.questionType === "short_answer" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                    >
                                                        Short Answer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {(q.options || []).map((opt, oIdx) => (
                                                <div key={oIdx} className="space-y-1.5 relative group/opt">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[9px] font-bold uppercase tracking-wide">Option {String.fromCharCode(65 + oIdx)}</label>
                                                        <div className="flex items-center gap-2">
                                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIdx}`}
                                                                    checked={q.correctAnswer === opt && opt !== ""}
                                                                    onChange={() => handleQuestionChange(qIdx, "correctAnswer", opt)}
                                                                    className="hidden"
                                                                />
                                                                <div
                                                                    className={`w-4 h-4 rounded-full border-2 border-purple-600 flex items-center justify-center transition-all
                                                                        ${q.correctAnswer === opt && opt !== ""
                                                                            ? "bg-emerald-500 shadow-sm border-emerald-500"
                                                                            : "bg-white"
                                                                        }`}
                                                                >
                                                                    {q.correctAnswer === opt && opt !== "" && (
                                                                        <FiCheck className="text-white text-[8px] font-bold" />
                                                                    )}
                                                                </div>
                                                                <span className={`text-[8px] font-bold uppercase tracking-tight ${q.correctAnswer === opt && opt !== "" ? "text-emerald-600" : "text-gray-400"}`}>Correct</span>
                                                            </label>
                                                            {q.options.length > 2 && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => removeOption(qIdx, oIdx)}
                                                                    className="text-gray-300 hover:text-rose-500 transition-colors"
                                                                >
                                                                    <FaTimes size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                        required
                                                        data-gramm="false"
                                                        spellcheck="false"
                                                        className={`w-full px-3 py-2.5 rounded-xl border transition-all outline-none text-xs font-medium ${q.correctAnswer === opt && opt !== ""
                                                            ? "border-emerald-400 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-400/20"
                                                            : "border-gray-300 bg-white text-gray-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                                                            }`}
                                                        placeholder={`Choice ${String.fromCharCode(65 + oIdx)}...`}
                                                    />
                                                </div>
                                            ))}

                                            <div className="flex flex-col gap-2">
                                                {q.options.length < 6 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => addOption(qIdx)}
                                                        className="w-full h-10 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-500 transition-all font-bold text-[9px] uppercase tracking-wider"
                                                    >
                                                        <FaPlusCircle className="text-xs" />
                                                        Add New Option
                                                    </button>
                                                )}

                                                {q.questionType !== "short_answer" ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            handleQuestionChange(qIdx, "questionType", "short_answer");
                                                            handleQuestionChange(qIdx, "correctAnswer", ""); 
                                                        }}
                                                        className="w-full h-10 border-2 border-dashed border-indigo-100 rounded-xl flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-bold text-[9px] uppercase tracking-wider"
                                                    >
                                                        <FaPlusCircle className="text-xs" />
                                                        Add Short Answer
                                                    </button>
                                                ) : null}
                                            </div>

                                            {q.questionType === "short_answer" && (
                                                <div className="col-span-1 md:col-span-2 space-y-1.5 animate-in slide-in-from-right-4 duration-300">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">Short Answer Component</label>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleQuestionChange(qIdx, "questionType", "mcq")}
                                                            className="text-rose-500 hover:text-rose-700 transition-colors"
                                                            title="Remove Short Answer"
                                                        >
                                                            <FaTimes className="text-sm" />
                                                        </button>
                                                    </div>
                                                    <textarea 
                                                        value={q.correctAnswer}
                                                        onChange={(e) => handleQuestionChange(qIdx, "correctAnswer", e.target.value)}
                                                        required
                                                        rows="2"
                                                        data-gramm="false"
                                                        spellcheck="false"
                                                        className="w-full px-4 py-2 rounded-xl border-2 border-indigo-100 bg-indigo-50/10 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-xs text-gray-800 resize-none shadow-sm"
                                                        placeholder="Type the expected answer here..."
                                                    ></textarea>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <div className="w-24 space-y-1.5">
                                                <label className="text-[9px] font-bold uppercase tracking-widest  flex items-center gap-1.5 justify-end">
                                                    Points
                                                </label>
                                                <input
                                                    type="number"
                                                    value={q.marks}
                                                    onChange={(e) => handleQuestionChange(qIdx, "marks", e.target.value)}
                                                    required
                                                    min="1"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 text-center focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 mt-4"
                    >
                        <FaPlusCircle /> Add Question
                    </button>

                    {/* Footer Actions */}
                    <div className="pt-8 mt-4 border-t border-gray-100 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            Cancel
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
                                "ADD ASSESSMENT"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewAssessment;