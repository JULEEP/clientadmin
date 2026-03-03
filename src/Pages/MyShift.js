import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import EmployeeSidebar from "../Components/EmployeeSidebar";


const EmployeeShift = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const employeeDataRaw = localStorage.getItem("employeeData");
  let employeeId = null;
  if (employeeDataRaw) {
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      console.error("Invalid employee data in localStorage.");
    }
  }

  useEffect(() => {
    const fetchShift = async () => {
      if (!employeeId) {
        setError("❌ Employee not logged in. Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `https://api.timelyhealth.in/api/shifts/employee/${employeeId}`
        );

        if (res.data) {
          setShift(res.data);
        } else {
          setError("❌ No shift assigned yet. Please contact admin.");
        }
      } catch (err) {
        console.error("Error fetching shift:", err);
        setError("❌ Failed to fetch shift. Please contact admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [employeeId]);

  const determineShiftStatus = (shiftData) => {
    if (!shiftData) return;
    const now = new Date();
    const [startH, startM] = shiftData.startTime.split(":").map(Number);
    const [endH, endM] = shiftData.endTime.split(":").map(Number);

    let startTime = new Date();
    startTime.setHours(startH, startM, 0, 0);

    let endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    let newStatus = "";
    if (now >= startTime && now <= endTime) {
      newStatus = "Ongoing";
    } else if (now < startTime) {
      newStatus = "Upcoming";
    } else {
      newStatus = "Completed";
    }

    setStatus((prev) => (prev !== newStatus ? newStatus : prev));
  };

  useEffect(() => {
    if (!shift) return;

    determineShiftStatus(shift);

    const interval = setInterval(() => {
      determineShiftStatus(shift);
    }, 60000);

    return () => clearInterval(interval);
  }, [shift]);

  return (
    <div className="flex min-h-screen bg-gray-100">
    
      <div className="flex flex-col flex-1">
        

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow-md">
            {/* Header + Back Button */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-2xl font-bold text-blue-900">My Shift</h2>
              {/* <button
                onClick={() => navigate("/employeedashboard")}
                className="w-full px-5 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
              >
                ← Back to Dashboard
              </button> */}
            </div>

            {loading ? (
              <p className="text-gray-600">Loading your shift...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : !shift ? (
              <p className="text-gray-500">
                No shift assigned yet. Please contact admin.
              </p>
            ) : (
              <>
                {/* Desktop/Tablet Table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[500px] text-sm border">
                    <thead className="text-gray-700 bg-gray-200">
                      <tr>
                        <th className="p-2 border">Shift Type</th>
                        <th className="p-2 border">Start Time</th>
                        <th className="p-2 border">End Time</th>
                        <th className="p-2 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{shift.shiftType}</td>
                        <td className="p-2 border">{shift.startTime}</td>
                        <td className="p-2 border">{shift.endTime}</td>
                        <td className="p-2 border">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              status === "Ongoing"
                                ? "bg-green-200 text-green-800"
                                : status === "Upcoming"
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="flex flex-col gap-4 sm:hidden">
                  <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        Shift Type
                      </span>
                      <span className="text-gray-900">{shift.shiftType}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Start</span>
                      <span className="text-gray-900">{shift.startTime}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">End</span>
                      <span className="text-gray-900">{shift.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Status</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          status === "Ongoing"
                            ? "bg-green-200 text-green-800"
                            : status === "Upcoming"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeShift;
