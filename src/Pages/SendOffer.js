import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFileSignature, FaUserCheck, FaFileAlt, FaCheckCircle, FaChevronLeft } from "react-icons/fa";



const API_BASE_URL = 'http://localhost:5000'

const SendOffer = () => {
    const query = new URLSearchParams(useLocation().search);
    const applicationId = query.get("id");
    const candidateEmail = query.get("email");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [candidate, setCandidate] = useState(null);
    const [offerContent, setOfferContent] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    const [logoUrl, setLogoUrl] = useState("https://placehold.co/200x60/6366f1/ffffff?text=Timely+Health");

    const [docsVerified, setDocsVerified] = useState({
        resume: true,
        idProof: false,
        academicCertificates: false,
        experienceLetter: false,
    });

    useEffect(() => {
        if (applicationId || candidateEmail) {
            fetchApplicationDetails();
        } else {
            setFetching(false); // Stop loading if no params
        }
    }, [applicationId, candidateEmail]);

    const fetchApplicationDetails = async () => {
        try {
            setFetching(true);
            let app = null;

            // 1. Try fetching by ID first
            if (applicationId && applicationId !== "undefined") {
                try {
                    const res = await axios.get(`${API_BASE_URL}/applications/get/${applicationId}`);
                    if (res.data.success) {
                        app = res.data.application;
                    }
                } catch (err) {
                    console.warn("Fetch by ID failed, trying email fallback...", err);
                }
            }

            // 2. If ID fetch failed or no ID, try finding by email
            if (!app && candidateEmail) {
                const res = await axios.get(`${API_BASE_URL}/applications/all`);
                if (res.data.success) {
                    app = res.data.applications.find(a => a.email === candidateEmail);
                }
            }

            if (app) {
                setCandidate(app);

                // Populate verified documents from application if they exist
                if (app.documentsVerified) {
                    setDocsVerified({
                        resume: app.documentsVerified.resume || false,
                        idProof: app.documentsVerified.idProof || false,
                        academicCertificates: app.documentsVerified.academicCertificates || app.documentsVerified.educationalDocs || false,
                        experienceLetter: app.documentsVerified.experienceLetter || false,
                    });
                }

                // Generate Professional Template with Dynamic Data
                const name = `${app.firstName} ${app.lastName}`;
                const email = app.email || "[Candidate Email]";
                const phone = app.mobile || "[Candidate Phone]";
                const address = app.address || "[Candidate Address]";
                const role = app.jobId?.role || "Team Member";
                const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                const joiningDate = app.dateOfJoining ? new Date(app.dateOfJoining).toLocaleDateString() : "[To be discussed]";
                const salary = app.expectedCTC ? `INR ${app.expectedCTC} per annum (Subject to verification)` : "As per agreed terms";
                const location = app.currentLocation || "[Office/Remote]";

                const template = `
# EMPLOYMENT OFFER LETTER

**Date:** ${date}

**To:**
**${name}**
**Address:** ${address}
**Email:** ${email}
**Phone:** ${phone}

**Subject: Offer of Employment - ${role}**

**Dear ${name},**

Following our recent interview and evaluation process, we are pleased to offer you the position of **${role}** at **Timely Health**. We were highly impressed by your qualifications and professional background, and we believe your expertise will be a significant asset to our organization.

### 💼 Key Terms of Employment:
- **Designation:** ${role}
- **Joining Date:** ${joiningDate}
- **Salary (CTC):** ${salary}
- **Location:** ${location}
- **Reporting Manager:** [To be assigned]

### 📜 Documents Required:
Please ensure you have all mandatory documents (Identity Proof, Educational Certificates, and Experience Letters) ready for final verification.

At Timely Health, we pride ourselves on building a collaborative and innovation-driven environment. We look forward to having you on board as we continue to grow.

Please review this offer and confirm your acceptance by replying to this email or signing below.

We await your positive response.

Best Regards,

**Director - Human Resources**
Timely Health PVT LTD
      `;
                setOfferContent(template.trim());
            } else {
                throw new Error("Candidate data not found. Please verify the link or candidate details.");
            }
        } catch (err) {
            console.error("Fetch application error:", err);
            const errMsg = err.response?.data?.message || err.message;
            // alert(`Error loading candidate: ${errMsg}`); // Optional: Check if we want to alert on load
            setFetching(false);
        } finally {
            setFetching(false);
        }
    };

    const handleVerifyChange = (key) => {
        setDocsVerified({ ...docsVerified, [key]: !docsVerified[key] });
    };

    const handleSendOffer = async () => {
        const appId = applicationId || candidate?._id;

        if (!appId) {
            alert("Error: No Application ID found. Cannot send offer.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/applications/send-offer`, {
                applicationId: appId,
                email: candidateEmail || candidate?.email,
                offerLetterContent: offerContent,
                documentsVerified: docsVerified,
            });

            if (res.data.success) {
                alert("✅ Offer letter sent successfully!");
                navigate("/score");
            }
        } catch (err) {
            console.error("Send offer error:", err);
            const errMsg = err.response?.data?.message || err.message || "Unknown error";
            alert(`❌ Failed to send offer letter: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-gray-500">Preparing Professional Offer...</p>
        </div>
    </div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition font-bold"
                    >
                        <FaChevronLeft /> Back to Score Board
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="block text-xs font-black text-gray-800 uppercase tracking-widest">{candidate?.firstName} {candidate?.lastName}</span>
                            <span className="block text-[10px] font-bold text-gray-400">{candidateEmail || candidate?.email}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{candidate?.jobId?.role}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Verification & Config (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-purple-600 uppercase tracking-widest">
                                <FaUserCheck /> Checklist
                            </h2>
                            <div className="space-y-4">
                                {Object.keys(docsVerified).map((key) => (
                                    <label key={key} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${docsVerified[key] ? "bg-emerald-500 border-emerald-500 text-white scale-110" : "border-gray-200 group-hover:border-purple-300"}`}>
                                            {docsVerified[key] && <FaCheckCircle className="text-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={docsVerified[key]}
                                            onChange={() => handleVerifyChange(key)}
                                        />
                                        <span className={`text-sm font-bold capitalize ${docsVerified[key] ? "text-gray-900" : "text-gray-400"}`}>
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-blue-600 uppercase tracking-widest">
                                Branding
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Logo URL</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all text-xs font-bold"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        placeholder="Paste logo URL here..."
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex justify-center items-center h-24">
                                    <img src={logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Logo'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editor & Preview (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">
                            {/* Editor Tabs */}
                            <div className="flex border-b border-gray-50">
                                <button
                                    onClick={() => setIsPreview(false)}
                                    className={`flex-1 py-6 px-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${!isPreview ? "bg-white text-purple-600 border-b-2 border-purple-600" : "bg-gray-50 text-gray-400"}`}
                                >
                                    Edit Template
                                </button>
                                <button
                                    onClick={() => setIsPreview(true)}
                                    className={`flex-1 py-6 px-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${isPreview ? "bg-white text-blue-600 border-b-2 border-blue-600" : "bg-gray-50 text-gray-400"}`}
                                >
                                    Live Preview
                                </button>
                            </div>

                            <div className="flex-1 p-8 flex flex-col">
                                {isPreview ? (
                                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-12 shadow-inner overflow-y-auto max-h-[600px] font-serif offer-letter-print animate-in fade-in duration-300">
                                        <div className="flex justify-between items-start mb-12">
                                            <img src={logoUrl} alt="Company Logo" className="h-16 object-contain" />
                                            <div className="text-right">
                                                <h1 className="text-xl font-black text-gray-900 leading-none">OFFER LETTER</h1>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{candidate?.jobId?.role}</p>
                                            </div>
                                        </div>

                                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                                            {/* We process some markdown-like formatting for the preview */}
                                            {offerContent}
                                        </div>

                                        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end">
                                            <div className="space-y-4">
                                                <div className="w-32 h-px bg-gray-300"></div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Signature</p>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-300 italic">Generated by Timely Health HR System</div>
                                        </div>
                                    </div>
                                ) : (
                                    <textarea
                                        className="flex-1 w-full p-8 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 outline-none transition-all font-mono text-xs leading-relaxed resize-none bg-gray-50 text-gray-700 shadow-inner"
                                        value={offerContent}
                                        onChange={(e) => setOfferContent(e.target.value)}
                                        placeholder="Draft your professional offer letter here..."
                                    />
                                )}

                                <div className="mt-8 flex justify-between items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FaFileAlt className="text-purple-600" /> Professional Grade Template
                                    </p>
                                    <button
                                        className={`px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:from-purple-700 hover:to-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none uppercase text-xs tracking-widest`}
                                        disabled={loading}
                                        onClick={handleSendOffer}
                                    >
                                        {loading ? "Processing..." : <><FaPaperPlane /> Dispatch Offer</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaPaperPlane = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407.9l.5 83c0 16.4 20 24.6 31.5 12.9l72.8-74.6 118.8 98.7c16.1 13.5 41.4 2 41.4-19V47.5c0-18.3-20.1-28.8-34.5-19.1z"></path></svg>;

export default SendOffer;