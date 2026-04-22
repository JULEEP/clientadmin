// // src/pages/LateToday.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";

// const BASE_URL = "https://api.timelyhealth.in/";

// const LateToday = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchLateAttendance();
//   }, []);

//   // Fetch Late Attendance (shift-wise already filtered from backend)
//   const fetchLateAttendance = async () => {
//     try {
//       setLoading(true);

//       const resp = await axios.get(`${BASE_URL}/api/attendance/lateattendance`);
//       let data = resp.data.records || [];

//       // ⭐ FIX: Missing name? → Fetch from employee table
//       const updatedData = await Promise.all(
//         data.map(async (rec) => {
//           if (!rec.employeeName) {
//             try {
//               const emp = await axios.get(
//                 `${BASE_URL}/api/employees/${rec.employeeId}`
//               );
//               rec.employeeName = emp.data?.name || "-";
//             } catch (err) {
//               rec.employeeName = "-";
//             }
//           }
//           return rec;
//         })
//       );

//       setRecords(updatedData);
//     } catch (err) {
//       console.error("Late fetch error:", err);
//       setError("Failed to fetch late attendance records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format Time
//   const formatTime = (time) => {
//     if (!time) return "-";
//     return new Date(time).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md mt-6">
//       <h2 className="text-2xl font-bold mb-4 text-center">Late Comers Today</h2>

//       {loading ? (
//         <p className="text-center text-gray-600">Loading late attendance...</p>
//       ) : error ? (
//         <p className="text-center text-red-600">{error}</p>
//       ) : records.length === 0 ? (
//         <p className="text-center text-gray-500">No late comers today.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border border-gray-300 text-sm">
//             <thead className="bg-gray-100 text-gray-700">
//               <tr>
//                 <th className="px-4 py-2 border">Employee ID</th>
//                 <th className="px-4 py-2 border">Name</th>
//                 <th className="px-4 py-2 border">Email</th>
//                 <th className="px-4 py-2 border">Shift Start</th>
//                 <th className="px-4 py-2 border">Check In</th>
//                 <th className="px-4 py-2 border">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {records.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-2">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>

//                   <td className="px-4 py-2 font-semibold text-blue-600">
//                     {rec.shiftStart || "-"}
//                   </td>

//                   <td className="px-4 py-2 font-semibold text-red-600">
//                     {formatTime(rec.checkInTime)}
//                   </td>

//                   <td className="px-4 py-2">
//                     <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
//                       Late
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LateToday;

// src/pages/LateToday.jsx
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = "https://api.timelyhealth.in/api";

// DUMMY DATA FOR FALLBACK
const DUMMY_EMPLOYEES = [
  { _id: "dummy_emp_001", employeeId: "EMP001", name: "Rajesh Kumar", department: "IT", role: "Senior Software Engineer", status: "active", email: "rajesh@example.com", joinDate: "2023-01-15", shiftHours: 9, shiftStart: "09:00 AM" },
  { _id: "dummy_emp_002", employeeId: "EMP002", name: "Priya Sharma", department: "HR", role: "HR Manager", status: "active", email: "priya@example.com", joinDate: "2023-02-20", shiftHours: 8, shiftStart: "09:30 AM" },
  { _id: "dummy_emp_003", employeeId: "EMP003", name: "Amit Patel", department: "Sales", role: "Sales Executive", status: "active", email: "amit@example.com", joinDate: "2023-03-10", shiftHours: 8, shiftStart: "09:30 AM" },
  { _id: "dummy_emp_004", employeeId: "EMP004", name: "Neha Gupta", department: "Marketing", role: "Marketing Specialist", status: "inactive", email: "neha@example.com", joinDate: "2023-04-05", shiftHours: 8, shiftStart: "09:30 AM" },
  { _id: "dummy_emp_005", employeeId: "EMP005", name: "Suresh Reddy", department: "Operations", role: "Operations Manager", status: "active", email: "suresh@example.com", joinDate: "2023-05-12", shiftHours: 9, shiftStart: "09:00 AM" },
];

const DUMMY_LATE_RECORDS = [
  { 
    _id: "dummy_late_001", 
    employeeId: "EMP001", 
    checkInTime: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
    shiftStart: "09:00 AM",
    lateByMinutes: 45,
    status: "late"
  },
  { 
    _id: "dummy_late_002", 
    employeeId: "EMP002", 
    checkInTime: new Date(new Date().setHours(10, 15, 0, 0)).toISOString(),
    shiftStart: "09:30 AM",
    lateByMinutes: 45,
    status: "late"
  },
  { 
    _id: "dummy_late_003", 
    employeeId: "EMP003", 
    checkInTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    shiftStart: "09:30 AM",
    lateByMinutes: 30,
    status: "late"
  },
  { 
    _id: "dummy_late_004", 
    employeeId: "EMP005", 
    checkInTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    shiftStart: "09:00 AM",
    lateByMinutes: 30,
    status: "late"
  },
];

const LateToday = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const navigate = useNavigate();
  
  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';
  const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
  
  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Load dummy data function
  const loadDummyData = () => {
    console.log("Loading dummy late attendance data as fallback");
    setIsUsingDummyData(true);
    
    // Filter active employees from dummy data
    const activeEmps = DUMMY_EMPLOYEES.filter(emp => emp.status === 'active');
    setEmployees(activeEmps);
    
    // Extract unique departments and designations
    const depts = new Set();
    const designations = new Set();
    activeEmps.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
    
    // Map dummy late records with employee details
    const merged = DUMMY_LATE_RECORDS
      .map((rec) => {
        const employee = activeEmps.find(
          (e) => e.employeeId === rec.employeeId
        );
        if (!employee) return null;
        return {
          ...rec,
          employeeName: employee?.name || "N/A",
          employeeId: rec.employeeId,
          department: employee?.department || "N/A",
          designation: employee?.role || "N/A",
          shiftStart: rec.shiftStart || employee?.shiftStart || "09:30 AM",
          employeeEmail: employee?.email || "-",
          checkInTime: rec.checkInTime,
          lateByMinutes: rec.lateByMinutes,
          status: rec.status
        };
      })
      .filter(rec => rec !== null);
    
    setRecords(merged);
    setFilteredRecords(merged);
    setPagination(prev => ({
      ...prev,
      totalCount: merged.length,
      totalPages: Math.ceil(merged.length / prev.limit)
    }));
    setLoading(false);
  };

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!clientId) {
      loadDummyData();
      return;
    }
    
    fetchLateAttendance();
  }, [clientId]);

  useEffect(() => {
    // Apply filters whenever data or filters change
    filterRecords();
  }, [records, searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const fetchLateAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      setIsUsingDummyData(false);

      // 1️⃣ Fetch late attendance with clientId
      const lateResp = await axios.get(
        `${BASE_URL}/attendance/lateattendance/${clientId}`
      );

      // Handle different response structures
      let rawRecords = [];
      if (lateResp.data?.records && Array.isArray(lateResp.data.records)) {
        rawRecords = lateResp.data.records;
      } else if (Array.isArray(lateResp.data)) {
        rawRecords = lateResp.data;
      } else if (lateResp.data?.data && Array.isArray(lateResp.data.data)) {
        rawRecords = lateResp.data.data;
      }

      // If no late data, use dummy
      if (!rawRecords || rawRecords.length === 0) {
        console.log("No late attendance data from API, using dummy data");
        loadDummyData();
        return;
      }

      // 2️⃣ Fetch employee list with clientId
      const empResp = await axios.get(
        `${BASE_URL}/employees/get-employees/${clientId}`
      );

      // Handle different response structures for employees
      let employeesData = [];
      if (Array.isArray(empResp.data)) {
        employeesData = empResp.data;
      } else if (empResp.data?.employees && Array.isArray(empResp.data.employees)) {
        employeesData = empResp.data.employees;
      } else if (empResp.data?.data && Array.isArray(empResp.data.data)) {
        employeesData = empResp.data.data;
      }
      
      // If no employees data, use dummy
      if (!employeesData || employeesData.length === 0) {
        console.log("No employees data from API, using dummy data");
        loadDummyData();
        return;
      }
      
      // Filter active employees
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      // 3️⃣ Map employee details into late records
      const merged = rawRecords
        .map((rec) => {
          const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";

          const employee = employeesData.find(
            (e) => e.employeeId === empId || e._id === empId || e.empId === empId
          );

          // Skip if employee is hidden
          if (isEmployeeHidden(employee)) return null;

          return {
            ...rec,
            employeeName: employee?.name || employee?.fullName || "N/A",
            employeeId: empId,
            department: employee?.department || employee?.departmentName || "N/A",
            designation: employee?.designation || employee?.role || "N/A",
            shiftStart: rec.shiftStart || employee?.shiftStart || "09:30 AM",
            employeeEmail: employee?.email || rec.employeeEmail || "-"
          };
        })
        .filter(rec => rec !== null);

      // If merged records is empty, use dummy
      if (!merged || merged.length === 0) {
        console.log("No valid late records after filtering, using dummy data");
        loadDummyData();
        return;
      }

      setRecords(merged);
      setFilteredRecords(merged);
      setIsUsingDummyData(false);
    } catch (err) {
      console.error("Error fetching late attendance:", err);
      setError(err.response?.data?.message || "Failed to fetch late attendance records");
      // Use dummy data on error
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];
    
    // Filter by Employee ID or Name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.employeeName?.toLowerCase().includes(term)
      );
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    // Filter by Date Range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (fromDate && !toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(fromDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate >= from && recDate <= to;
      });
    } else if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(rec => {
        const recDate = new Date(rec.checkInTime);
        return recDate.getFullYear() === year && recDate.getMonth() + 1 === month;
      });
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  // Pagination calculations
  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading late attendance records...</span>
            </div>
          </div>
        </div>
      </div>
    );
    
  if (error && !isUsingDummyData)
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchLateAttendance}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Demo Mode Banner */}
        {isUsingDummyData && (
          <div className="mb-3 p-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample late attendance data. API connection may be unavailable.
          </div>
        )}
        
        {/* Client Info Banner - Only show when not in dummy mode */}
        {clientData && !isUsingDummyData && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">LT</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Welcome, {clientData.name || clientData.companyName || 'Client'}!</p>
                  <p className="text-xs text-gray-500">ID: {clientId.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Late Comers: {filteredRecords.length}
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Employees: {employees.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-lg text-gray-500">No late attendance records found</p>
              <p className="mt-1 text-sm text-gray-400">
                {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing filters"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Late Attendance Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="py-2 text-center">Employee ID</th>
                      <th className="py-2 text-center">Name</th>
                      <th className="py-2 text-center">Department</th>
                      <th className="py-2 text-center">Designation</th>
                      <th className="py-2 text-center">Shift Start</th>
                      <th className="py-2 text-center">Check In</th>
                      <th className="py-2 text-center">Late By</th>
                      <th className="py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec, idx) => (
                      <motion.tr
                        key={rec._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`transition-colors border-t cursor-pointer hover:bg-orange-50 ${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                        onClick={() =>
                          navigate(`/employee-details/${rec.employeeId}`)
                        }
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {rec.employeeId || "-"}
                        </td>

                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div>{rec.employeeName}</div>
                          <div className="text-[10px] text-gray-500">{rec.employeeEmail}</div>
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.department}
                        </td>

                        <td className="px-2 py-2 text-center text-gray-600">
                          {rec.designation}
                        </td>

                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            {rec.shiftStart || "-"}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                            {formatTime(rec.checkInTime)}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                            {rec.lateByMinutes ? `${rec.lateByMinutes} mins` : "-"}
                          </span>
                        </td>

                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full border border-yellow-300">
                            Late
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRecords.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {indexOfFirstRow + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(indexOfLastRow, filteredRecords.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {filteredRecords.length}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-0.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-red-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-xs text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LateToday;