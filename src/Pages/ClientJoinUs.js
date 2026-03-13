import axios from "axios";
import { Send, User, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ClientJoinUs = () => {
    const location = useLocation();
    const campData = location.state; // Get camp data from navigation

    // Get clientId from localStorage
    const clientId = localStorage.getItem('clientId') || '';

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        location: "",
        type: campData ? "camp" : "volunteer", // Set to camp if coming from camps page
        message: "",
        campName: campData?.campName || "",
    });

    // Pre-fill message when camp data is available
    useEffect(() => {
        if (campData) {
            setFormData(prev => ({
                ...prev,
                message: `I want to participate in ${campData.campName} at ${campData.campLocation}`,
                campName: campData.campName
            }));
        }
    }, [campData]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get logged in user ID if available
            const userData = JSON.parse(localStorage.getItem("userData") || "{}");
            const userId = userData.id || null;

            const payload = { 
                ...formData, 
                userId,
                clientId // Add clientId to payload
            };

            await axios.post("http://localhost:5001/api/applications", payload);

            alert("Application submitted successfully! We will contact you soon.");
            setFormData({ name: "", mobile: "", location: "", type: "volunteer", message: "", campName: "" });
        } catch (err) {
            console.error(err);
            alert("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4">
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <UserPlus className="text-cyan-300" size={32} />
                        Join Our Mission
                    </h1>
                    <p className="text-indigo-100 mt-2">
                        Apply to Organize a Camp or Volunteer with us.
                    </p>
                    
                    {/* Client ID badge */}
                    {clientId && (
                        <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-xs">
                            Client ID: {clientId.slice(0, 8)}...
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none"
                                placeholder="+91 98765 43210"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none"
                                placeholder="City, State"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I want to... <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none bg-white"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="volunteer">Become a Volunteer</option>
                            <option value="camp">Participate in Medical Camp</option>
                            <option value="organize">Organize a Medical Camp</option>
                        </select>
                    </div>

                    {/* Camp Name (if type is camp) */}
                    {formData.type === "camp" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Camp Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none"
                                placeholder="Enter camp name"
                                value={formData.campName}
                                onChange={(e) => setFormData({ ...formData, campName: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message / Details (Optional)
                        </label>
                        <textarea 
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none h-32 resize-none"
                            placeholder="Tell us more about your interest..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={18} /> Submit Application
                            </>
                        )}
                    </button>
                </form>

                {/* Note */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    We'll get back to you within 24-48 hours.
                </p>
            </div>
        </div>
    );
};

export default ClientJoinUs;