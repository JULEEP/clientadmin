import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { isEmployeeHidden } from "../utils/employeeStatus";

const PendingAttendance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);

      // Fetch leaves AND employees to check status
      const [leavesRes, empRes] = await Promise.all([
        axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/pendingleaves"),
        axios.get("https://api.timelyhealth.in/api/employees/get-employees")
      ]);

      const rawData = leavesRes.data.records || leavesRes.data;
      const employees = empRes.data || [];

      if (Array.isArray(rawData)) {
        const activeRequests = rawData.filter(record => {
          // Find employee object
          const empId = record.employeeId || record.employee;
          const emp = employees.find(e => e.employeeId === empId || e._id === empId);

          return !isEmployeeHidden(emp || { employeeId: empId });
        });
        setRequests(activeRequests);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const updateRequestStatus = async (id, newStatus) => {
    try {
      // Assuming attendance update is used for these requests as per original comments
      await axios.put(`https://attendancebackend-5cgn.onrender.com/api/leaves/updateleaves/${id}`, { status: newStatus.toLowerCase() });
      alert(`✅ Request ${newStatus} successfully!`);
      fetchPendingRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      alert("❌ Failed to update request");
    }
  };

  if (loading) return <div className="p-10 text-center font-medium text-blue-600 animate-pulse">Loading Pending Requests...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pending Approval Queue</h2>
          <p className="text-sm text-gray-500">Review and action employee leave & attendance requests</p>
        </div>
        <div className="px-4 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-widest">
          {requests.length} Pending
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Request Type</th>
              <th className="px-6 py-4">Date Range</th>
              <th className="px-6 py-4 text-center">Days</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.length > 0 ? (
              requests.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">{rec.employeeName}</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter">{rec.employeeId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded border border-indigo-100">
                      {rec.leaveType || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-col">
                      <span>{new Date(rec.startDate).toLocaleDateString()}</span>
                      <span className="text-[10px] text-gray-300">to {new Date(rec.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-blue-600">{rec.days}</td>
                  <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate" title={rec.reason}>
                    {rec.reason}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        title="Approve"
                        onClick={() => updateRequestStatus(rec._id, "Approved")}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        title="Reject"
                        onClick={() => updateRequestStatus(rec._id, "Rejected")}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <FaTimesCircle />
                      </button>
                      <button
                        title="View Details"
                        onClick={() => alert(`Full Reason:\n${rec.reason}\n\nApplied On: ${new Date(rec.createdAt).toLocaleString()}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <FaInfoCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                  No pending requests found in the queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingAttendance;