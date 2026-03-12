import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api'


const API_BASE = API_BASE_URL;

// ─── Icon helpers (inline SVG to avoid dependency issues) ─────────────────────
const Icon = ({ d, size = 20, color = "currentColor", className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d={d} />
    </svg>
);

const icons = {
    briefcase: "M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8M16 2v4M8 2v4M3 10h18",
    location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
    money: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l4 2",
    check: "M20 6L9 17l-5-5",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    code: "M10 20l4-16M18 4l4 4-4 4M6 4L2 8l4 4",
    award: "M12 15l-2 5L6 2l6 3 6-3-4 18-2-5z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    arrow: "M5 12h14M12 5l7 7-7 7",
    warn: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
};

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const token = localStorage.getItem("candidateToken");
                if (token) {
                    try {
                        const appRes = await axios.get(`${API_BASE}/candidate/applications`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const alreadyApplied = appRes.data.some(app => {
                            const appId = app.jobId?._id || app.jobId;
                            return appId && appId.toString() === id.toString();
                        });
                        setHasApplied(alreadyApplied);
                    } catch (e) { /* silent */ }
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-2xl border-4 border-violet-900 animate-pulse" />
                        <div className="absolute inset-0 rounded-2xl border-4 border-t-violet-400 border-transparent animate-spin" />
                    </div>
                    <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 800, letterSpacing: "0.35em", textTransform: "uppercase" }}>
                        Loading Job Details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8fafc" }}>
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center border border-red-50">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icon d={icons.warn} color="#ef4444" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Job Not Found</h2>
                    <p className="text-gray-500 text-sm mb-8">{error || "This post may have been archived."}</p>
                    <button onClick={() => navigate(-1)}
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}
                        className="px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const hasAssessment = (job.assessmentIds && job.assessmentIds.length > 0) || job.assessmentId;
    const postedDate = job.createdAt && !isNaN(new Date(job.createdAt).getTime())
        ? new Date(job.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
        : "Recently";

    const skills = job.skills
        ? job.skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    return (
        <div className="font-sans text-slate-800" style={{ minHeight: "100vh", background: "#f1f5f9" }}>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
                position: "relative",
                overflow: "hidden",
                paddingTop: 64,
                paddingBottom: 80,
            }}>
                {/* decorative blobs */}
                <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,0.1)", filter: "blur(50px)", pointerEvents: "none" }} />

                <div className="max-w-6xl mx-auto px-4 relative z-10">

                    {/* back link */}
                    <button onClick={() => navigate(-1)}
                        style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 28, background: "none", border: "none", cursor: "pointer" }}>
                        ← Back to Jobs
                    </button>

                    {/* badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <span style={{ background: "rgba(99,102,241,0.25)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            Career Opportunity
                        </span>
                        <span style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                            <Icon d={icons.check} size={12} color="#6ee7b7" />
                            Now Hiring
                        </span>
                        {hasAssessment && (
                            <span style={{ background: "rgba(251,191,36,0.2)", color: "#fde68a", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "4px 14px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                                <Icon d={icons.star} size={12} color="#fde68a" />
                                Assessment Included
                            </span>
                        )}
                    </div>

                    {/* role title */}
                    <h1 style={{ color: "#fff", fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 24, maxWidth: 700 }}>
                        {job.role}
                    </h1>

                    {/* meta pills */}
                    <div className="flex flex-wrap gap-3">
                        {job.location && (
                            <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon d={icons.location} size={15} color="#a78bfa" />
                                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{job.location}</span>
                            </div>
                        )}
                        {job.salary && (
                            <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon d={icons.money} size={15} color="#34d399" />
                                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{job.salary}</span>
                            </div>
                        )}
                        {job.experience && (
                            <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon d={icons.award} size={15} color="#60a5fa" />
                                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{job.experience} Experience</span>
                            </div>
                        )}
                        <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon d={icons.clock} size={15} color="#f9a8d4" />
                            <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>Posted {postedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4" style={{ marginTop: -40, position: "relative", zIndex: 10, paddingBottom: 80 }}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                    {/* ── Left Column ── */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Description Card */}
                        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                            <div style={{ padding: "20px 32px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon d={icons.list} size={18} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", margin: 0 }}>Job Description</h2>
                                    <p style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>What you'll be doing</p>
                                </div>
                            </div>
                            <div style={{ padding: "24px 32px" }}>
                                <div style={{ color: "#475569", lineHeight: 1.9, fontSize: 15, fontWeight: 500, whiteSpace: "pre-wrap", borderLeft: "3px solid #e0e7ff", paddingLeft: 20 }}>
                                    {job.description || job.responsibilities || "No description provided."}
                                </div>
                            </div>
                        </div>

                        {/* Skills Card */}
                        {skills.length > 0 && (
                            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                                <div style={{ padding: "20px 32px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#8b5cf6,#d946ef)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Icon d={icons.code} size={18} color="#fff" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", margin: 0 }}>Required Skills</h2>
                                        <p style={{ fontSize: 10, color: "#9333ea", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Key qualifications we're looking for</p>
                                    </div>
                                </div>
                                <div style={{ padding: "24px 32px" }}>
                                    <div className="flex flex-wrap gap-3">
                                        {skills.map((skill, idx) => (
                                            <span key={idx} style={{
                                                background: "linear-gradient(135deg,#eef2ff,#f3e8ff)",
                                                color: "#7c3aed",
                                                border: "1px solid #ddd6fe",
                                                borderRadius: 10,
                                                padding: "8px 16px",
                                                fontSize: 12,
                                                fontWeight: 800,
                                                letterSpacing: "0.05em",
                                                cursor: "default",
                                                transition: "all 0.2s",
                                            }}
                                                onMouseOver={e => { e.currentTarget.style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "transparent"; }}
                                                onMouseOut={e => { e.currentTarget.style.background = "linear-gradient(135deg,#eef2ff,#f3e8ff)"; e.currentTarget.style.color = "#7c3aed"; e.currentTarget.style.borderColor = "#ddd6fe"; }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location + Experience Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {job.location && (
                                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: 28, boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                                    <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#ef4444,#f97316)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                        <Icon d={icons.location} size={20} color="#fff" />
                                    </div>
                                    <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Work Location</h3>
                                    <p style={{ fontSize: 15, color: "#475569", fontWeight: 600 }}>{job.location}</p>
                                </div>
                            )}
                            {job.experience && (
                                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: 28, boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                                    <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                        <Icon d={icons.user} size={20} color="#fff" />
                                    </div>
                                    <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Experience Required</h3>
                                    <p style={{ fontSize: 15, color: "#475569", fontWeight: 600 }}>{job.experience}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column (Sticky Apply) ── */}
                    <div className="lg:col-span-1">
                        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* Apply Card */}
                            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 8px 40px rgba(99,102,241,0.12)" }}>
                                {/* card gradient top bar */}
                                <div style={{ height: 6, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)" }} />
                                <div style={{ padding: 28, textAlign: "center" }}>
                                    <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#eef2ff,#f3e8ff)", borderRadius: 20, border: "1px solid #e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                        <Icon d={icons.briefcase} size={32} color="#6366f1" />
                                    </div>

                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>Join Our Team</h3>
                                    <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500, lineHeight: 1.7, marginBottom: 20 }}>
                                        {hasAssessment
                                            ? "Apply and complete a short assessment to start your journey."
                                            : "Submit your application and our team will be in touch soon."}
                                    </p>

                                    {hasAssessment && (
                                        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 20 }}>
                                            <Icon d={icons.star} size={13} color="#f59e0b" />
                                            <span style={{ fontSize: 10, fontWeight: 800, color: "#92400e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Assessment Enclosed</span>
                                        </div>
                                    )}

                                    {hasApplied ? (
                                        <div style={{ background: "#f1f5f9", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                            <Icon d={icons.check} size={16} color="#22c55e" />
                                            <span style={{ fontSize: 14, fontWeight: 800, color: "#22c55e" }}>Already Applied</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/applying-job/${id}`)}
                                            style={{
                                                width: "100%",
                                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 14,
                                                padding: "15px 24px",
                                                fontSize: 14,
                                                fontWeight: 900,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 10,
                                                transition: "all 0.25s",
                                                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                                                letterSpacing: "0.02em",
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.45)"; }}
                                            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)"; }}>
                                            Apply Now
                                            <Icon d={icons.arrow} size={16} color="#fff" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "20px 24px", display: "flex", justifyContent: "space-around", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#6366f1" }}>24h</div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Response</div>
                                </div>
                                <div style={{ width: 1, background: "#f1f5f9" }} />
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#8b5cf6" }}>Fast</div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Review</div>
                                </div>
                                <div style={{ width: 1, background: "#f1f5f9" }} />
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#d946ef" }}>100%</div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Free</div>
                                </div>
                            </div>

                            {/* Company note */}
                            <div style={{ textAlign: "center", padding: "8px 0" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                    Timely Health Recruitment
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default JobDetails;