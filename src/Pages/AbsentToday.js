import axios from "axios";
import { useEffect, useState } from "react";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = "http://localhost:5000"; // or your actual base URL

const AbsentToday = () => {
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  
  // Get clientId from localStorage (same as TodayAttendance)
  const clientId = localStorage.getItem('clientId') || '';
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  useEffect(() => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }
    
    fetchAbsentEmployees();
  }, [clientId]);

  const fetchAbsentEmployees = async () => {
    try {
      setLoading(true);
      
      // Get client data from localStorage
      const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
      setClientInfo(clientData);

      // Fetch all employees with clientId (same as TodayAttendance)
      const empResp = await axios.get(
        `${BASE_URL}/api/employees/get-employees/${clientId}`
      );

      // Handle different response structures for employees (same as TodayAttendance)
      let employees = [];
      if (Array.isArray(empResp.data)) {
        employees = empResp.data;
      } else if (empResp.data?.employees && Array.isArray(empResp.data.employees)) {
        employees = empResp.data.employees;
      } else if (empResp.data?.data && Array.isArray(empResp.data.data)) {
        employees = empResp.data.data;
      }

      // Fetch today's attendance with clientId (same as TodayAttendance)
      const attendanceResp = await axios.get(
        `${BASE_URL}/api/attendance/today/${clientId}`
      );

      // Handle different response structures for attendance (same as TodayAttendance)
      let attendance = [];
      if (attendanceResp.data?.records && Array.isArray(attendanceResp.data.records)) {
        attendance = attendanceResp.data.records;
      } else if (Array.isArray(attendanceResp.data)) {
        attendance = attendanceResp.data;
      } else if (attendanceResp.data?.data && Array.isArray(attendanceResp.data.data)) {
        attendance = attendanceResp.data.data;
      }

      // Extract unique present employee IDs (handling different ID formats)
      const presentIds = new Set();
      
      attendance.forEach((rec) => {
        // Handle various possible employee ID structures
        let empId = null;
        
        if (typeof rec.employeeId === "object") {
          empId = rec.employeeId?.employeeId || rec.employeeId?._id || "";
        } else {
          empId = rec.employeeId || rec.empId || "";
        }
        
        if (empId) {
          presentIds.add(empId.toString());
        }
      });

      console.log("✅ Present IDs:", Array.from(presentIds));

      // Filter employees who are not present and are active
      const absents = employees.filter((emp) => {
        // Get employee ID (handling different field names)
        const empId = emp.employeeId || emp._id || emp.empId || "";
        
        // Skip if no ID
        if (!empId) return false;

        // Check if employee is inactive (hidden) using utility
        if (isEmployeeHidden(emp)) return false;

        // Employee is absent if their ID is NOT in presentIds
        return !presentIds.has(empId.toString());
      });

      console.log("🚨 Absent Employees:", absents);

      // Format for table
      const formatted = absents.map((emp) => ({
        employeeId: emp.employeeId || emp._id || emp.empId || "N/A",
        name: emp.name || emp.fullName || emp.employeeName || "N/A",
        date: today,
        // Include additional fields if needed
        department: emp.department || emp.departments || "N/A",
        email: emp.email || emp.employeeEmail || "",
        phone: emp.phone || emp.mobile || "",
      }));

      setAbsentEmployees(formatted);
    } catch (err) {
      console.error("❌ Error fetching absent employees:", err);
      setError(err.response?.data?.message || "Failed to fetch absent employees");
    } finally {
      setLoading(false);
    }
  };

  // Check if clientId is missing
  if (!clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">🔒</div>
          <p className="mb-4 text-lg font-semibold text-red-600">Client ID not found!</p>
          <p className="text-sm text-gray-600 mb-4">Please login again to continue.</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading absent employees for today...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchAbsentEmployees}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Client Info Banner (matching TodayAttendance style) */}
        {clientInfo && (
          <div className="mb-6 p-4 bg-white border border-blue-200 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">TH</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Welcome, {clientInfo.name || 'Client'}!</p>
                  <p className="text-xs text-gray-500">ID: {clientId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  {clientInfo.companyName || 'Company'}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
                  {clientInfo.location || 'Location'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Absent Employees Today
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchAbsentEmployees}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Total Absent Today</p>
            <p className="text-xl font-bold text-red-600">{absentEmployees.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Total Employees</p>
            <p className="text-xl font-bold text-blue-600">
              {/* This would need total employees count - you could add this */}
              {absentEmployees.length + " (present + absent)"}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-xl font-bold text-purple-600">{today}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {absentEmployees.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <p className="mb-2 text-lg font-semibold text-gray-600">
                No absent employees today!
              </p>
              <p className="text-sm text-gray-500">
                All employees are present
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Employee ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Department</th>
                      <th className="px-6 py-4 text-left font-semibold">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absentEmployees.map((emp, index) => (
                      <tr
                        key={emp.employeeId}
                        className={`border-t hover:bg-red-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {emp.employeeId}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{emp.name}</div>
                            {emp.email && <div className="text-xs text-gray-500">{emp.email}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {emp.date}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {emp.phone || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{absentEmployees.length}</span> absent employee(s) for today
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsentToday;