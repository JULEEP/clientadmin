import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { FiFilter, FiMapPin, FiUserCheck, FiUsers } from "react-icons/fi";
import { filterActiveRecords, isEmployeeHidden } from "../utils/employeeStatus";
import StatCard from "../Components/StatCard";

const BASE_URL = "https://api.timelyhealth.in/api";

// DUMMY DATA FOR FALLBACK
const DUMMY_EMPLOYEES = [
  { _id: "dummy_emp_001", employeeId: "EMP001", name: "Rajesh Kumar", department: "IT", role: "Senior Software Engineer", status: "active", email: "rajesh@example.com" },
  { _id: "dummy_emp_002", employeeId: "EMP002", name: "Priya Sharma", department: "HR", role: "HR Manager", status: "active", email: "priya@example.com" },
  { _id: "dummy_emp_003", employeeId: "EMP003", name: "Amit Patel", department: "Sales", role: "Sales Executive", status: "active", email: "amit@example.com" },
  { _id: "dummy_emp_004", employeeId: "EMP004", name: "Neha Gupta", department: "Marketing", role: "Marketing Specialist", status: "inactive", email: "neha@example.com" },
  { _id: "dummy_emp_005", employeeId: "EMP005", name: "Suresh Reddy", department: "Operations", role: "Operations Manager", status: "active", email: "suresh@example.com" },
  { _id: "dummy_emp_006", employeeId: "EMP006", name: "Anjali Desai", department: "IT", role: "Frontend Developer", status: "active", email: "anjali@example.com" },
  { _id: "dummy_emp_007", employeeId: "EMP007", name: "Vikram Singh", department: "Finance", role: "Finance Analyst", status: "inactive", email: "vikram@example.com" },
  { _id: "dummy_emp_008", employeeId: "EMP008", name: "Divya Mehta", department: "Customer Support", role: "Support Lead", status: "active", email: "divya@example.com" },
];

const DUMMY_ATTENDANCE_RECORDS = [
  { _id: "dummy_att_001", employeeId: "EMP001", checkInTime: "2024-01-15T09:15:00.000Z", checkOutTime: "2024-01-15T18:30:00.000Z", totalHours: 9.25, onsite: true, reason: "Office Work", status: "checked-out", distance: 1250, employeeEmail: "rajesh@example.com" },
  { _id: "dummy_att_002", employeeId: "EMP001", checkInTime: "2024-01-16T09:45:00.000Z", checkOutTime: "2024-01-16T18:15:00.000Z", totalHours: 8.5, onsite: true, reason: "Client Meeting", status: "checked-out", distance: 850, employeeEmail: "rajesh@example.com" },
  { _id: "dummy_att_003", employeeId: "EMP001", checkInTime: "2024-01-17T10:30:00.000Z", checkOutTime: null, totalHours: 5.5, onsite: false, reason: "Work From Home", status: "checked-in", distance: 0, employeeEmail: "rajesh@example.com" },
  { _id: "dummy_att_004", employeeId: "EMP002", checkInTime: "2024-01-15T09:30:00.000Z", checkOutTime: "2024-01-15T18:00:00.000Z", totalHours: 8.5, onsite: true, reason: "Office Work", status: "checked-out", distance: 550, employeeEmail: "priya@example.com" },
  { _id: "dummy_att_005", employeeId: "EMP002", checkInTime: "2024-01-16T09:00:00.000Z", checkOutTime: "2024-01-16T17:30:00.000Z", totalHours: 8.5, onsite: true, reason: "HR Meeting", status: "checked-out", distance: 520, employeeEmail: "priya@example.com" },
  { _id: "dummy_att_006", employeeId: "EMP003", checkInTime: "2024-01-15T09:20:00.000Z", checkOutTime: "2024-01-15T18:45:00.000Z", totalHours: 9.42, onsite: true, reason: "Field Work", status: "checked-out", distance: 3200, employeeEmail: "amit@example.com" },
  { _id: "dummy_att_007", employeeId: "EMP003", checkInTime: "2024-01-16T09:50:00.000Z", checkOutTime: "2024-01-16T18:30:00.000Z", totalHours: 8.67, onsite: false, reason: "Work From Home", status: "checked-out", distance: 0, employeeEmail: "amit@example.com" },
  { _id: "dummy_att_008", employeeId: "EMP005", checkInTime: "2024-01-15T09:10:00.000Z", checkOutTime: "2024-01-15T18:20:00.000Z", totalHours: 9.17, onsite: true, reason: "Operations", status: "checked-out", distance: 980, employeeEmail: "suresh@example.com" },
  { _id: "dummy_att_009", employeeId: "EMP006", checkInTime: "2024-01-15T10:00:00.000Z", checkOutTime: null, totalHours: 4.0, onsite: false, reason: "Work From Home", status: "checked-in", distance: 0, employeeEmail: "anjali@example.com" },
  { _id: "dummy_att_010", employeeId: "EMP008", checkInTime: "2024-01-15T09:25:00.000Z", checkOutTime: "2024-01-15T18:15:00.000Z", totalHours: 8.83, onsite: true, reason: "Support Work", status: "checked-out", distance: 450, employeeEmail: "divya@example.com" },
];

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  const clientId = localStorage.getItem("clientId") || "";

  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadDummyData = () => {
    console.log("Loading dummy attendance data as fallback");
    setIsUsingDummyData(true);
    const activeEmps = DUMMY_EMPLOYEES.filter(emp => emp.status === 'active');
    setEmployees(activeEmps);
    const depts = new Set();
    const designations = new Set();
    activeEmps.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
    const sortedRecords = [...DUMMY_ATTENDANCE_RECORDS].sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
    setRecords(sortedRecords);
    setFilteredRecords(sortedRecords);
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) setShowDepartmentFilter(false);
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) setShowDesignationFilter(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        setLoading(true);
        setError("");
        if (!clientId) { loadDummyData(); return; }

        const empRes = await fetch(`${BASE_URL}/employees/get-employees/${clientId}`);
        const contentType = empRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) { loadDummyData(); return; }
        
        const employeesData = empRes.ok ? await empRes.json() : [];
        let employeesList = [];
        if (Array.isArray(employeesData)) employeesList = employeesData;
        else if (employeesData?.employees) employeesList = employeesData.employees;
        else if (employeesData?.data) employeesList = employeesData.data;
        
        if (!employeesList || employeesList.length === 0) { loadDummyData(); return; }
        
        const activeEmployees = employeesList.filter(emp => !isEmployeeHidden(emp));
        setEmployees(activeEmployees);

        const depts = new Set();
        const designations = new Set();
        activeEmployees.forEach(emp => {
          if (emp.department) depts.add(emp.department);
          if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
        });
        setUniqueDepartments(Array.from(depts).sort());
        setUniqueDesignations(Array.from(designations).sort());

        const res = await fetch(`${BASE_URL}/attendance/allattendance/${clientId}`);
        const attContentType = res.headers.get("content-type");
        if (!attContentType || !attContentType.includes("application/json")) { loadDummyData(); return; }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        let attendanceRecords = [];
        if (Array.isArray(data)) attendanceRecords = data;
        else if (data?.records) attendanceRecords = data.records;
        else if (data?.allAttendance) attendanceRecords = data.allAttendance;
        
        if (!attendanceRecords || attendanceRecords.length === 0) {
          const activeEmpIds = new Set(activeEmployees.map(emp => emp.employeeId));
          setRecords(DUMMY_ATTENDANCE_RECORDS.filter(rec => activeEmpIds.has(rec.employeeId)));
          setFilteredRecords(DUMMY_ATTENDANCE_RECORDS.filter(rec => activeEmpIds.has(rec.employeeId)));
          setIsUsingDummyData(true);
          setLoading(false);
          return;
        }

        const sortedRecords = attendanceRecords.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
        const activeRecords = filterActiveRecords(sortedRecords, employeesList);
        setRecords(activeRecords);
        setFilteredRecords(activeRecords);
        setIsUsingDummyData(false);
      } catch (err) {
        console.error(err);
        loadDummyData();
      } finally {
        setLoading(false);
      }
    };
    fetchAllAttendance();
  }, [clientId]);

  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return { name: "Unknown", department: "N/A", designation: "N/A", email: "" };
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      name: emp ? emp.name : "Unknown",
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A",
      email: emp?.email || ""
    };
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");
  };

  const applyFilters = () => {
    let filtered = [...records];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.name.toLowerCase().includes(term) || (rec.employeeId || "").toString().toLowerCase().includes(term);
      });
    }
    if (selectedDate) {
      filtered = filtered.filter(rec => new Date(rec.checkInTime).toISOString().split("T")[0] === selectedDate);
    }
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(rec => {
        const d = new Date(rec.checkInTime);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }
    if (filterDepartment) {
      filtered = filtered.filter(rec => getEmployeeDetails(rec.employeeId).department === filterDepartment);
    }
    if (filterDesignation) {
      filtered = filtered.filter(rec => getEmployeeDetails(rec.employeeId).designation === filterDesignation);
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDate, selectedMonth, filterDepartment, filterDesignation, records]);

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFilteredRecords(records);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const downloadCSV = () => {
    if (filteredRecords.length === 0) { alert("No data available!"); return; }
    const headers = ["Employee ID", "Employee Name", "Department", "Designation", "Email", "Check-In Time", "Check-Out Time", "Total Hours", "Distance (m)", "Onsite", "Reason", "Status"];
    const csvRows = [headers.join(","), ...filteredRecords.map(rec => {
      const empDetails = getEmployeeDetails(rec.employeeId);
      return [
        `"${rec.employeeId}"`, `"${empDetails.name}"`, `"${empDetails.department}"`, `"${empDetails.designation}"`, `"${rec.employeeEmail || empDetails.email || ""}"`,
        `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`, `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
        rec.totalHours?.toFixed(2) || "0.00", rec.distance?.toFixed(2) || "0.00", rec.onsite ? "Yes" : "No", `"${rec.reason || "Not specified"}"`, rec.status
      ].join(",");
    })];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimeWithStatus = (checkInTime, checkOutTime) => {
    const checkIn = checkInTime ? new Date(checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;
    const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;
    if (checkIn && !checkOut) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
          </span>
          <span className="font-semibold text-green-600 text-xs">{checkIn}</span>
          <span className="text-[10px] text-gray-400">/ --:--</span>
        </div>
      );
    } else if (checkIn && checkOut) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="font-semibold text-gray-700 text-xs">{checkIn}</span>
          <span className="text-[10px] text-gray-400">/</span>
          <span className="font-semibold text-red-600 text-xs">{checkOut}</span>
        </div>
      );
    } else {
      return <span className="text-gray-400 text-xs">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-gray-700">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error && !isUsingDummyData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-6 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-3 text-3xl text-red-500">❌</div>
          <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-1.5 text-xs font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700">🔄 Retry</button>
        </div>
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pages.push("...");
    }
    return pages;
  };

  return (
    <div className="min-h-screen px-2 py-0 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">

        {/* Demo Mode Banner */}
        {isUsingDummyData && (
          <div className="mb-2 p-1.5 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample attendance data. API connection may be unavailable.
          </div>
        )}

        {/* Client Info Banner */}
        {clientId && !isUsingDummyData && (
          <div className="mb-2 p-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-xs text-gray-500">Records: {records.length}</p></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FiUsers}
            label="Total Records"
            value={records.length}
            color="indigo"
          />
          <StatCard
            icon={FiMapPin}
            label="Onsite Entries"
            value={records.filter((r) => r.onsite).length}
            color="emerald"
          />
          <StatCard
            icon={FiUserCheck}
            label="Checked In"
            value={records.filter((r) => r.status === "checked-in").length}
            color="amber"
          />
          <StatCard
            icon={FiFilter}
            label="Filtered Records"
            value={filteredRecords.length}
            color="rose"
          />
        </div>

        {/* Filters Section */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-1.5">

            {/* Search Name / ID */}
            <div className="relative flex-1 min-w-[160px]">
              <FaSearch className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-7 px-2.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>

              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-44 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
                  <div
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-2 py-1.5 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
                      className={`px-2 py-1.5 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
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
                className={`h-7 px-2.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>

              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-44 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-56">
                  <div
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-2 py-1.5 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
                      className={`px-2 py-1.5 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="relative w-[120px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-7 pr-1 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month */}
            <div className="relative w-[120px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-7 pr-1 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* CSV Button */}
            <button
              onClick={downloadCSV}
              className="h-7 px-2.5 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              📥 CSV
            </button>

            {/* Clear Button */}
            {(searchTerm || filterDepartment || filterDesignation || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-7 px-2.5 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 text-5xl">📭</div>
              <p className="mb-3 text-sm font-semibold text-gray-600">
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-1.5 text-xs font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 overflow-hidden bg-white rounded-lg shadow-lg">
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                  <table className="min-w-full">
                    <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                      <tr>
                        <th className="py-1.5 px-2 text-center">Employee ID</th>
                        <th className="py-1.5 px-2 text-center">Name</th>
                        <th className="py-1.5 px-2 text-center">Department</th>
                        <th className="py-1.5 px-2 text-center">Designation</th>
                        <th className="py-1.5 px-2 text-center">Check-In/Out</th>
                        <th className="py-1.5 px-2 text-center">Hours</th>
                        <th className="py-1.5 px-2 text-center">Distance</th>
                        <th className="py-1.5 px-2 text-center">Onsite</th>
                        <th className="py-1.5 px-2 text-center">Reason</th>
                        <th className="py-1.5 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((rec, idx) => {
                        const empDetails = getEmployeeDetails(rec.employeeId);
                        return (
                          <tr
                            key={rec._id}
                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 hover:shadow-sm`}
                          >
                            <td className="px-2 py-1.5 font-medium text-center text-gray-900 whitespace-nowrap text-xs">
                              {rec.employeeId}
                            </td>
                            <td className="px-2 py-1.5 text-center text-xs">
                              <div className="font-medium text-gray-900 whitespace-nowrap">
                                {empDetails.name}
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-center text-gray-600 text-xs">
                              {empDetails.department}
                            </td>
                            <td className="px-2 py-1.5 text-center text-gray-600 text-xs">
                              {empDetails.designation}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {formatTimeWithStatus(rec.checkInTime, rec.checkOutTime)}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={`font-medium text-sm ${rec.totalHours >= 8 ? 'text-green-600' :
                                rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                {rec.totalHours ? rec.totalHours.toFixed(1) : "0.0"}h
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="px-1.5 py-0.5 font-mono text-gray-700 bg-gray-100 rounded text-xs">
                                {rec.distance?.toFixed(0) || "0"}m
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rec.onsite
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                                  }`}
                              >
                                {rec.onsite ? "🏢 Yes" : "🏠 No"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded max-w-[100px] truncate block">
                                {rec.reason || "Not specified"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rec.status === "checked-in"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                                  : "bg-green-100 text-green-800 border border-green-300"
                                  }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Section */}
              {filteredRecords.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 p-4 border-t sm:flex-row bg-gray-50">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Show:
                      </label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-1 text-xs border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                      <strong>{filteredRecords.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                        }`}
                    >
                      ← Previous
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${page === "..."
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}