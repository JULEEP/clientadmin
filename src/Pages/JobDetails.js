import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaBriefcase, FaListUl, FaCode, FaMoneyBillWave,
    FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle,
    FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap,
    FaFileUpload, FaTimes, FaMapMarkerAlt, FaHistory, FaFilePdf
} from "react-icons/fa";
import {
    FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiDollarSign,
    FiCheckCircle, FiX, FiArrowRight, FiFileText, FiMapPin, FiAward
} from "react-icons/fi";

import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCheckingExistence, setIsCheckingExistence] = useState(false);
    const [candidateExists, setCandidateExists] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // New state
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "", // New Field
        currentCompany: "",
        currentCTC: "",
        expectedCTC: "",
        resume: null
    });

    useEffect(() => {
        // Check if already logged in as candidate
        const token = localStorage.getItem("candidateToken");
        if (token) {
            setEmailChecked(true);
            setCandidateExists(true);
            setIsLoggedIn(true); // Set isLoggedIn if token exists
            // We could fetch profile here if we wanted to pre-fill
        }

        const fetchJobDetails = async () => {
            try {
                // If logged in, check if already applied to this job
                const token = localStorage.getItem("candidateToken");
                if (token) {
                    try {
                        const appRes = await axios.get(`${API_BASE}/candidate/applications`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const alreadyApplied = appRes.data.some(app =>
                            (app.jobId?._id || app.jobId) === id
                        );
                        setHasApplied(alreadyApplied);
                    } catch (err) {
                        console.error("Failed to fetch applications for duplicate check", err);
                    }
                }

                const response = await axios.get(`${API_BASE}/jobs/view/${id}`);
                if (response.data.success) {
                    setJob(response.data.jobPost);
                } else {
                    setError("Job post not found.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id]);

    const handleEmailCheck = async () => {
        if (!formData.email) return;
        setIsCheckingExistence(true);
        setMessage({ type: "", text: "" });
        setIsLoggedIn(false); // Reset isLoggedIn on new email check
        try {
            const res = await axios.post(`${API_BASE}/candidate/check-existence`, { email: formData.email });
            if (res.data.exists) {
                setCandidateExists(true);
                setShowPassword(true);
                setEmailChecked(true); // Allow them to see password field
                setMessage({ type: "info", text: "Existing candidate found. Please enter your password to apply." });
            } else {
                setCandidateExists(false);
                setShowPassword(true);
                setEmailChecked(true);
                setMessage({ type: "info", text: "New candidate! Please fill in your details and create a password." });
            }
        } catch (err) {
            console.error("Existence check failed", err);
            setMessage({ type: "error", text: "Authentication server unreachable. Please try again." });
        } finally {
            setIsCheckingExistence(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleLogin = async () => {
        setSubmitting(true);
        try {
            const loginRes = await axios.post(`${API_BASE}/candidate/login`, {
                email: formData.email,
                password: formData.password
            });
            const token = loginRes.data.token;
            // Get candidate ID and details
            const profileRes = await axios.get(`${API_BASE}/candidate/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Pre-fill
            const [fname, ...lname] = profileRes.data.name.split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: fname,
                lastName: lname.join(' '),
                mobile: profileRes.data.phone || prev.mobile,
                currentCompany: profileRes.data.currentCompany || prev.currentCompany,
                currentCTC: profileRes.data.currentCTC || prev.currentCTC,
                expectedCTC: profileRes.data.expectedCTC || prev.expectedCTC
            }));

            localStorage.setItem("candidateToken", token);
            localStorage.setItem("candidateId", profileRes.data._id);
            setIsLoggedIn(true);

            // Check if already applied after login
            try {
                const appRes = await axios.get(`${API_BASE}/candidate/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const alreadyApplied = appRes.data.some(app =>
                    (app.jobId?._id || app.jobId) === id
                );
                setHasApplied(alreadyApplied);
                if (alreadyApplied) {
                    setMessage({ type: "info", text: "You have already applied for this position." });
                } else {
                    setMessage({ type: "success", text: "Details auto-filled! Please review and click Apply." });
                }
            } catch (err) {
                setMessage({ type: "success", text: "Details auto-filled! Please review and click Apply." });
            }

        } catch (err) {
            setMessage({ type: "error", text: "Invalid password. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            let candidateId = localStorage.getItem("candidateId");
            let token = localStorage.getItem("candidateToken");

            // Handle Registration login if not already active
            if (!token && !candidateExists) {
                // Register
                const regRes = await axios.post(`${API_BASE}/candidate/register`, {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.mobile,
                    currentCompany: formData.currentCompany,
                    currentCTC: formData.currentCTC,
                    expectedCTC: formData.expectedCTC,
                });
                token = regRes.data.token;
                // Get candidate ID
                const profileRes = await axios.get(`${API_BASE}/candidate/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                candidateId = profileRes.data._id;
                localStorage.setItem("candidateToken", token);
                localStorage.setItem("candidateId", candidateId);
            }

            // Now Submit Application
            const data = new FormData();
            data.append("jobId", job._id);
            data.append("candidateId", candidateId);

            Object.keys(formData).forEach(key => {
                if (key === 'resume') {
                    if (formData[key]) data.append("resume", formData[key]);
                } else if (key !== 'password') { // Don't send password to application endpoint
                    data.append(key, formData[key]);
                }
            });

            const res = await axios.post(`${API_BASE}/applications/submit`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setMessage({ type: "success", text: "Application submitted successfully!" });

                if ((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId) {
                    setTimeout(() => {
                        const firstQuizId = job.assessmentIds?.[0]?._id || job.assessmentIds?.[0] || job.assessmentId?._id || job.assessmentId;
                        navigate(`/assessment/${job._id}/${res.data.application._id}${firstQuizId ? '/' + (firstQuizId._id || firstQuizId) : ''}`);
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setIsModalOpen(false);
                        setEmailChecked(false);
                        setShowPassword(false);
                    }, 3000);
                }
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to process application. Please check your credentials."
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-2xl animate-pulse"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin"></div>
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-lg w-full bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-950/5 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <FaExclamationTriangle size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Post Not Found</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed font-medium">{error || "This job posting may have been archived or the link might be incorrect."}</p>
                    <a href="/" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all hover:shadow-xl shadow-indigo-100 transform active:scale-95 uppercase tracking-widest">
                        Return to Careers
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Odoo-Inspired Premium Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B] text-white pt-24 pb-32 px-4">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <span className="bg-white/10 backdrop-blur-md text-indigo-100 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                            Remote Potential
                        </span>
                        <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                            <FaCheckCircle className="text-xs" /> Accepting Applications
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-left-6 duration-700 max-w-4xl">
                        {job.role}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-slate-300 font-bold animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-sm border border-white/5">
                            <FaMoneyBillWave className="text-emerald-400 text-xl" />
                            <span className="text-white font-black">{job.salary || "Competitive Market Rate"}</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-60">
                            <FaClock className="text-indigo-400" />
                            <span className="text-[10px] uppercase tracking-[0.2em]">Posted {new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Integration */}
            <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/5 overflow-hidden border border-slate-100 p-8 md:p-16">
                            <div className="space-y-16">
                                {/* Responsibilities Card */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                            <FaListUl className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Core Responsibilities</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">What the role involves on a daily basis</p>
                                        </div>
                                    </div>
                                    <div className="text-slate-600 leading-[2] whitespace-pre-wrap pl-8 border-l-4 border-indigo-500/10 text-base font-medium">
                                        {job.responsibilities}
                                    </div>
                                </section>

                                {/* Skills Card */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                            <FaCode className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Required Expertise</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Key skills and technologies preferred</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {job.skills.split(',').map((skill, idx) => (
                                            <span key={idx} className="bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl text-[10px] font-black border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all cursor-default uppercase tracking-widest">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Action Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100 p-10 text-center group">
                                <div className="w-24 h-24 flex items-center justify-center bg-indigo-50 rounded-[2rem] mx-auto mb-8 transition-transform group-hover:scale-110 duration-500">
                                    <FaBriefcase className="text-5xl text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-4">Start your journey here</h3>

                                {((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId) && (
                                    <div className="mb-6 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-amber-100/50">
                                        <FaClock className="animate-pulse" /> Skill Assessment Included
                                    </div>
                                )}

                                <p className="text-slate-500 mb-10 leading-relaxed text-sm font-medium">
                                    {((job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId)
                                        ? "Apply today to unlock the technical skill assessment phase."
                                        : "Join the Timely Health team. Submit your profile for review."}
                                </p>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={hasApplied}
                                    className={`w-full px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${hasApplied
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-100"
                                        }`}
                                >
                                    {hasApplied ? "Already Applied" : "Apply Now"}
                                    {!hasApplied && <FaArrowRight className="transition-transform group-hover:translate-x-1" />}
                                </button>

                                <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Registration takes <span className="text-indigo-600">under 2 mins</span>
                                </p>
                            </div>

                            {/* Trust Analytics */}
                            <div className="bg-slate-800/5 rounded-3xl p-8 flex items-center justify-around border border-slate-200/50">
                                <div className="text-center">
                                    <span className="block text-xl font-black text-slate-800">24h</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Response</span>
                                </div>
                                <div className="w-px h-10 bg-slate-200"></div>
                                <div className="text-center">
                                    <span className="block text-xl font-black text-slate-800">4.8/5</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <div className="inline-block px-10 py-4 bg-white rounded-full border border-slate-100 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 shadow-sm">
                        Timely Health Recruitment Platform
                    </div>
                </div>
            </div>

            {/* Redesigned Application Modal - Styled to match JobPost exactly */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl text-gray-800">
                                    Apply for {job.role}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {emailChecked ? "Complete your profile details" : "Start your recruitment journey"}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEmailChecked(false);
                                    setCandidateExists(false);
                                    setMessage({ type: "", text: "" });
                                }}
                                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <FiX className="text-lg" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar">
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    message.type === "info" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                        "bg-rose-50 text-rose-600 border border-rose-100"
                                    }`}>
                                    {message.type === "success" ? <FiCheckCircle className="text-lg shrink-0" /> : <FiX className="text-lg shrink-0" />}
                                    <span className="text-sm font-bold">{message.text}</span>
                                </div>
                            )}

                            {!emailChecked ? (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    <div className="space-y-1.5">
                                        <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                            <input
                                                type="email" name="email" required
                                                value={formData.email} onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                placeholder="e.g. candidate@domain.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleEmailCheck}
                                            disabled={isCheckingExistence || !formData.email}
                                            className="w-full py-4 px-8 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100 transition-all transform active:scale-95 disabled:bg-indigo-300 disabled:shadow-none flex items-center justify-center gap-3"
                                        >
                                            {isCheckingExistence ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Validating...</>
                                            ) : (
                                                <>Continue to Form <FiArrowRight /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                                    {candidateExists && !isLoggedIn ? (
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Existing Account Password</label>
                                                <div className="relative group">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                    <input
                                                        type="password" name="password" required
                                                        value={formData.password} onChange={handleChange}
                                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={handleLogin}
                                                    disabled={submitting || !formData.password}
                                                    className="w-full py-4 px-8 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                                                >
                                                    {submitting ? "Authenticating..." : "Login & Auto-fill"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {!isLoggedIn && (
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Create Security Password</label>
                                                    <div className="relative group">
                                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <input
                                                            type="password" name="password" required
                                                            value={formData.password} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                                                    <input
                                                        type="text" name="firstName" required
                                                        value={formData.firstName} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="John"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                                                    <input
                                                        type="text" name="lastName" required
                                                        value={formData.lastName} onChange={handleChange}
                                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Mobile</label>
                                                    <div className="relative group">
                                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <input
                                                            type="tel" name="mobile" required
                                                            value={formData.mobile} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="+91..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                                                    <div className="relative group">
                                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCompany"
                                                            value={formData.currentCompany} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="Current Org"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Current CTC</label>
                                                    <div className="relative group">
                                                        <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="currentCTC"
                                                            value={formData.currentCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 12 LPA"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">Expected CTC</label>
                                                    <div className="relative group">
                                                        <FiAward className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                        <input
                                                            type="text" name="expectedCTC"
                                                            value={formData.expectedCTC} onChange={handleChange}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                            placeholder="e.g. 15 LPA"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Qualification</label>
                                                <div className="relative group">
                                                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                    <input
                                                        type="text" name="highestQualification"
                                                        value={formData.highestQualification} onChange={handleChange}
                                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none text-sm text-gray-800 bg-white"
                                                        placeholder="Highest Degree"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Resume Upload (PDF)</label>
                                                <input
                                                    type="file" accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-100 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all font-bold text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                                />
                                            </div>

                                            <div className="pt-4 flex flex-col md:flex-row gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all border border-transparent"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="flex-[1.5] py-3.5 px-8 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg shadow-indigo-100 transition-all transform active:scale-95 disabled:bg-indigo-300 flex items-center justify-center gap-3"
                                                >
                                                    {submitting ? (
                                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                                                    ) : (
                                                        <>{candidateExists ? "Confirm & Apply" : "Register & Apply"} <FiArrowRight /></>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetails;