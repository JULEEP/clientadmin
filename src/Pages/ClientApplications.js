import axios from "axios";
import { CheckCircle, Clock, Mail, Phone, User, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const ClientApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingDummyData, setUsingDummyData] = useState(false);

    // Get clientId from localStorage
    const clientId = localStorage.getItem('clientId') || '';

    // Dummy data
    const dummyApplications = [
        {
            _id: "dummy1",
            name: "Rajesh Kumar",
            mobile: "+91 98765 43210",
            email: "rajesh.k@example.com",
            type: "volunteer",
            message: "I want to volunteer for medical camps. I have experience in healthcare.",
            createdAt: "2024-03-15T10:30:00Z",
            status: "pending"
        },
        {
            _id: "dummy2",
            name: "Priya Sharma",
            mobile: "+91 99887 66554",
            email: "priya.sharma@example.com",
            type: "camp",
            message: "Interested in organizing a diabetes screening camp in my locality.",
            createdAt: "2024-03-14T15:45:00Z",
            status: "pending"
        },
        {
            _id: "dummy3",
            name: "Amit Patel",
            mobile: "+91 97766 55443",
            email: "amit.p@example.com",
            type: "volunteer",
            message: "Medical student here, want to gain experience by volunteering.",
            createdAt: "2024-03-13T09:20:00Z",
            status: "pending"
        },
        {
            _id: "dummy4",
            name: "Sunita Reddy",
            mobile: "+91 96655 44332",
            email: "sunita.r@example.com",
            type: "camp",
            message: "Want to organize a blood donation camp in our society.",
            createdAt: "2024-03-12T11:10:00Z",
            status: "pending"
        },
        {
            _id: "dummy5",
            name: "Vikram Singh",
            mobile: "+91 95544 33221",
            email: "vikram.s@example.com",
            type: "volunteer",
            message: "Retired nurse, want to contribute my time to healthcare camps.",
            createdAt: "2024-03-11T14:30:00Z",
            status: "pending"
        }
    ];

    const fetchApplications = async () => {
        try {
            setLoading(true);
            
            if (!clientId) {
                console.log("No client ID found, showing dummy data");
                setApplications(dummyApplications);
                setUsingDummyData(true);
                setLoading(false);
                return;
            }

            const res = await axios.get(`http://localhost:5001/api/applications?clientId=${clientId}`);
            
            if (res.data && res.data.length > 0) {
                setApplications(res.data);
                setUsingDummyData(false);
            } else {
                // No data from API, show dummy
                setApplications(dummyApplications);
                setUsingDummyData(true);
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            // Show dummy data on error
            setApplications(dummyApplications);
            setUsingDummyData(true);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            if (usingDummyData) {
                // Just update local state for dummy data
                setApplications(prev => 
                    prev.map(app => 
                        app._id === id ? { ...app, status } : app
                    )
                );
                alert(`Application ${status} successfully (Demo mode)`);
                return;
            }

            await axios.patch(`http://localhost:5001/api/applications/${id}`, { status });
            fetchApplications(); // Refresh list
        } catch (err) {
            console.error("Error updating application:", err);
            alert("Failed to update application status");
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <User size={32} className="text-cyan-300" />
                        Applications
                    </h1>
                    <p className="text-indigo-100 mt-2">
                        Review requests to join as Volunteers or Camp Organizers.
                    </p>
                    
                    {/* Client ID badge */}
                    {clientId && !usingDummyData && (
                        <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-xs">
                            Client ID: {clientId.slice(0, 8)}...
                        </div>
                    )}
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl text-center min-w-[150px] w-full md:w-auto">
                    <div className="text-3xl font-bold">{applications.length}</div>
                    <div className="text-xs text-indigo-100 uppercase tracking-widest">
                        Total Requests
                    </div>
                </div>
            </div>

            {/* Dummy data badge */}
            {usingDummyData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-yellow-700">
                        Showing demo data. Connect to backend to see real applications.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#2563EB]"></div>
                    <span className="ml-3 text-gray-500">Loading requests...</span>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border shadow-sm">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-gray-700">No Applications</h3>
                    <p className="text-gray-500">New requests will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div
                            key={app._id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-all relative"
                        >
                            {/* Status indicator */}
                            {app.status && app.status !== 'pending' && (
                                <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                                    app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {app.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                </div>
                            )}

                            {/* Type Badge */}
                            <div className="flex-shrink-0">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                                        app.type === "camp" || app.type === "organize"
                                            ? "bg-indigo-100 text-indigo-600"
                                            : "bg-sky-100 text-sky-600"
                                    }`}
                                >
                                    {app.type === "camp" || app.type === "organize" ? "C" : "V"}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md uppercase font-semibold">
                                        {app.type === "camp" || app.type === "organize" ? "Organizer" : "Volunteer"}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} /> {app.mobile}
                                    </span>
                                    {app.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} /> {app.email}
                                        </span>
                                    )}
                                </div>

                                {app.message && (
                                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        "{app.message}"
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleStatusUpdate(app._id, 'approved')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                    title="Approve"
                                    disabled={app.status === 'approved'}
                                >
                                    <CheckCircle size={20} />
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                    title="Reject"
                                    disabled={app.status === 'rejected'}
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Demo notice footer */}
            {usingDummyData && (
                <div className="text-center text-xs text-gray-400 mt-4">
                    ⚡ Actions in demo mode won't affect the database
                </div>
            )}
        </div>
    );
};

export default ClientApplications;