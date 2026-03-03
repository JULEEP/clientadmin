import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaBriefcase, FaStar, FaPaperPlane, FaSave } from "react-icons/fa";

const API_BASE_URL = 'http://localhost:5000/api';

const Score = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [scoreFilter, setScoreFilter] = useState(0);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        subject: "Interview Invitation - Timely Health",
        time: "",
    });

    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [docsForm, setDocsForm] = useState({
        agreementsContent: "Please read, sign, and re-upload this agreement for next steps.",
    });

    const [quizzes, setQuizzes] = useState([]);
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
    }, []);

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
        // Cast to number for score fields
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
                setDocsFile(null); // Reset file
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
        const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.jobId?.role || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesScore = (c.technicalScore || 0) >= scoreFilter;
        return matchesSearch && matchesScore;
    });

    if (loading) return <div className="p-8 text-center">Loading Score Board...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 font-sans">
            {/* Main container with left padding */}
            <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Scoring & Selection
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Score Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-white py-2 pl-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm"
                                value={scoreFilter}
                                onChange={(e) => setScoreFilter(Number(e.target.value))}
                            >
                                <option value="0">All Scores</option>
                                <option value="60">60% & Above</option>
                                <option value="70">70% & Above</option>
                                <option value="80">80% & Above</option>
                                <option value="90">90% & Above</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <FaStar className="text-[10px]" />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search name or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <FaUser size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                    <table className="min-w-full">
                        <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                            <tr>
                                <th className="py-3 px-4 text-center">Candidate</th>
                                <th className="py-3 px-4 text-center">Role</th>
                                <th className="py-3 px-4 text-center">Appearance (10)</th>
                                <th className="py-3 px-4 text-center">Knowledge (10)</th>
                                <th className="py-3 px-4 text-center">Assessment Score (100)</th>
                                <th className="py-3 px-4 text-center">Rating (10)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.map((c) => (
                                <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{c.firstName} {c.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold">
                                            {c.jobId?.role || "N/A"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={c.appearanceScore || 0}
                                            onChange={(e) => handleUpdateScore(c._id, "appearanceScore", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={c.workKnowledge || 0}
                                            onChange={(e) => handleUpdateScore(c._id, "workKnowledge", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-16 p-1 border rounded text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={c.technicalScore || 0}
                                            onChange={(e) => handleUpdateScore(c._id, "technicalScore", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <select
                                            className="p-1 border rounded text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={c.overallRating || 0}
                                            onChange={(e) => handleUpdateScore(c._id, "overallRating", e.target.value)}
                                        >
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <select
                                            className={`p-1 border rounded text-[10px] font-bold ${c.status === "Selected" ? "text-green-600 bg-green-50" :
                                                c.status === "Interview" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                                                }`}
                                            value={c.status || "Pending"}
                                            onChange={(e) => handleUpdateScore(c._id, "status", e.target.value)}
                                        >
                                            <option value="Pending">PENDING</option>
                                            <option value="Shortlisted">SHORTLISTED</option>
                                            <option value="Interview">INTERVIEW</option>
                                            <option value="Selected">SELECTED</option>
                                            <option value="Rejected">REJECTED</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-center">
                                        <div className="flex justify-center gap-2">
                                            {c.status === "Selected" && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenInviteModal(c)}
                                                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm"
                                                        title="Send Interview Invite"
                                                    >
                                                        <FaPaperPlane /> INVITE
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenOfferModal(c)}
                                                        className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm"
                                                        title="Send Offer Letter"
                                                    >
                                                        <FaEnvelope /> OFFER
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDocsModal(c)}
                                                        className={`p-1.5 text-white rounded transition flex items-center justify-center gap-1 text-[10px] font-bold shadow-sm ${c.docReviewStatus === "Accepted" ? "bg-green-600 hover:bg-green-700" :
                                                            c.docReviewStatus === "Pending" ? "bg-orange-500 hover:bg-orange-600" :
                                                                "bg-indigo-600 hover:bg-indigo-700"
                                                            }`}
                                                    >
                                                        DOCS
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCandidates.length === 0 && <div className="p-8 text-center text-gray-500 font-bold">No candidates found matching filters.</div>}
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
        </div>
    );
};

export default Score;