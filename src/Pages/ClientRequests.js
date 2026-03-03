import axios from "axios";
import { useEffect, useState } from "react";
import { FaBuilding, FaCheck, FaMapMarkerAlt, FaTimes, FaUsers } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const ClientRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/client-requests/requests`);
            if (response.data.success) {
                setRequests(response.data.requests);
            } else {
                setError("Failed to fetch requests");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status === 'Approved' ? 'Accept' : 'Reject'} this request?`)) return;

        try {
            const response = await axios.put(`${API_BASE_URL}/client-requests/request/${id}`, { status });
            if (response.data.success) {
                alert(response.data.message);
                fetchRequests(); // Refresh list
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pending Client Requests</h1>
                <p className="text-gray-600">Review and manage client registration requests</p>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Client Details
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Company Info
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    No pending requests found.
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="text-center">
                                            <p className="text-gray-900 font-medium">
                                                {new Date(req.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(req.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex flex-col">
                                            <p className="text-gray-900 font-semibold text-base mb-1">
                                                {req.fullName}
                                            </p>
                                            <div className="flex items-center text-gray-600 text-sm mb-1">
                                                <span className="mr-2">📧</span>
                                                <span>{req.email}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <span className="mr-2">📱</span>
                                                <span>{req.mobileNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex flex-col">
                                            <div className="flex items-center mb-2">
                                                <FaBuilding className="text-blue-500 mr-2" />
                                                <span className="font-medium text-gray-800">{req.companyName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaUsers className="text-green-500 mr-2" />
                                                <span className="text-gray-600 text-sm">
                                                    {req.numberOfEmployees} employees
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex flex-col">
                                            <div className="flex items-center mb-1">
                                                <FaMapMarkerAlt className="text-red-500 mr-2" />
                                                <span className="font-medium text-gray-800">{req.country}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm truncate max-w-xs">
                                                {req.address}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex justify-center space-x-3">
                                            <button
                                                onClick={() => handleStatusUpdate(req._id, "Approved")}
                                                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition duration-200"
                                                title="Accept Request"
                                            >
                                                <FaCheck className="mr-2" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req._id, "Rejected")}
                                                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition duration-200"
                                                title="Reject Request"
                                            >
                                                <FaTimes className="mr-2" />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {requests.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                    Total Pending Requests: <span className="font-semibold">{requests.length}</span>
                </div>
            )}
        </div>
    );
};

export default ClientRequests;