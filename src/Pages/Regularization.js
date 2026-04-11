import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { FaBuilding, FaSearch, FaUserTag } from "react-icons/fa";
import { FiCalendar, FiCheckCircle, FiClock, FiList, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Components/config";
import { isEmployeeHidden } from "../utils/employeeStatus";

// DUMMY DATA FOR FALLBACK
const DUMMY_EMPLOYEES = [
  { _id: "dummy_emp_001", employeeId: "EMP001", name: "Rajesh Kumar", department: "IT", role: "Senior Software Engineer", status: "active", email: "rajesh@example.com", profilePicture: null },
  { _id: "dummy_emp_002", employeeId: "EMP002", name: "Priya Sharma", department: "HR", role: "HR Manager", status: "active", email: "priya@example.com", profilePicture: null },
  { _id: "dummy_emp_003", employeeId: "EMP003", name: "Amit Patel", department: "Sales", role: "Sales Executive", status: "active", email: "amit@example.com", profilePicture: null },
  { _id: "dummy_emp_004", employeeId: "EMP004", name: "Neha Gupta", department: "Marketing", role: "Marketing Specialist", status: "inactive", email: "neha@example.com", profilePicture: null },
  { _id: "dummy_emp_005", employeeId: "EMP005", name: "Suresh Reddy", department: "Operations", role: "Operations Manager", status: "active", email: "suresh@example.com", profilePicture: null },
];

const DUMMY_EDITED_RECORDS = [
  { _id: "dummy_edit_001", employeeId: "EMP001", checkInTime: "2024-01-15T09:15:00.000Z", checkOutTime: "2024-01-15T18:30:00.000Z", totalHours: 9.25, reason: "Onsite", comment: "Admin updated hours", editedAt: "2024-01-15T20:00:00.000Z" },
  { _id: "dummy_edit_002", employeeId: "EMP001", checkInTime: "2024-01-16T09:45:00.000Z", checkOutTime: "2024-01-16T18:15:00.000Z", totalHours: 8.5, reason: "Work From Home", comment: "Changed reason", editedAt: "2024-01-16T19:30:00.000Z" },
  { _id: "dummy_edit_003", employeeId: "EMP002", checkInTime: "2024-01-15T09:30:00.000Z", checkOutTime: "2024-01-15T18:00:00.000Z", totalHours: 8.5, reason: "Onsite", comment: "Updated check-out time", editedAt: "2024-01-15T18:45:00.000Z" },
  { _id: "dummy_edit_004", employeeId: "EMP003", checkInTime: "2024-01-16T09:20:00.000Z", checkOutTime: "2024-01-16T18:45:00.000Z", totalHours: 9.42, reason: "Field Work", comment: "Added reason", editedAt: "2024-01-16T19:00:00.000Z" },
  { _id: "dummy_edit_005", employeeId: "EMP005", checkInTime: "2024-01-15T09:10:00.000Z", checkOutTime: "2024-01-15T18:20:00.000Z", totalHours: 9.17, reason: "Operations", comment: "Updated hours", editedAt: "2024-01-15T19:15:00.000Z" },
];

const Regularization = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [error, setError] = useState("");

  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";

  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

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

  // Load dummy data function
  const loadDummyData = () => {
    console.log("Loading dummy regularization data as fallback");
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
    
    // Filter dummy records for active employees
    const activeEmpIds = new Set(activeEmps.map(emp => emp.employeeId));
    const filteredDummyRecords = DUMMY_EDITED_RECORDS.filter(rec => activeEmpIds.has(rec.employeeId));
    
    const grouped = groupRecordsByEmployee(filteredDummyRecords);
    setRequests(grouped);
    setFilteredRequests(grouped);
    setLoading(false);
  };

  // Group records by Employee
  const groupRecordsByEmployee = (records) => {
    const grouped = new Map();
    
    records.forEach(rec => {
      if (!grouped.has(rec.employeeId)) {
        grouped.set(rec.employeeId, {
          employeeId: rec.employeeId,
          records: []
        });
      }
      grouped.get(rec.employeeId).records.push(rec);
    });
    
    return Array.from(grouped.values());
  };

  // Fetch all edited records and employees
  const fetchEditedRecords = async () => {
    try {
      setLoading(true);
      setError("");
      setIsUsingDummyData(false);
      
      // If no clientId, use dummy data
      if (!clientId) {
        loadDummyData();
        return;
      }
      
      const recordsUrl = selectedDate 
        ? `${API_BASE_URL}/attendancesummary/edited-records/${clientId}?date=${selectedDate}`
        : `${API_BASE_URL}/attendancesummary/edited-records/${clientId}?month=${selectedMonth}`;

      const [recordsRes, empRes] = await Promise.all([
        axios.get(recordsUrl),
        axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`)
      ]);

      let employeesData = [];
      if (Array.isArray(empRes.data)) {
        employeesData = empRes.data;
      } else if (empRes.data?.employees) {
        employeesData = empRes.data.employees;
      } else if (empRes.data?.data) {
        employeesData = empRes.data.data;
      }
      
      // If no employees data, use dummy
      if (!employeesData || employeesData.length === 0) {
        loadDummyData();
        return;
      }
      
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

      let editedRecords = [];
      if (recordsRes.data?.data && Array.isArray(recordsRes.data.data)) {
        editedRecords = recordsRes.data.data;
      } else if (Array.isArray(recordsRes.data)) {
        editedRecords = recordsRes.data;
      }
      
      // If no edited records, use dummy
      if (!editedRecords || editedRecords.length === 0) {
        loadDummyData();
        return;
      }
      
      // Filter out records from hidden employees
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId));
      const filteredRecords = editedRecords.filter(rec => activeEmployeeIds.has(rec.employeeId));

      const grouped = groupRecordsByEmployee(filteredRecords);
      
      setRequests(grouped);
      setFilteredRequests(grouped);
      setCurrentPage(1);
      setIsUsingDummyData(false);
    } catch (err) {
      console.error("Failed to fetch edited records:", err);
      // Use dummy data on error
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditedRecords();
  }, [selectedMonth, selectedDate, clientId]);

  // Get employee department and designation
  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    return {
      name: emp?.name || "N/A",
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A",
      profilePicture: emp?.profilePicture
    };
  };

  // Apply Filters
  useEffect(() => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter((group) => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return (
          empDetails.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(group => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(group => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    filterDepartment,
    filterDesignation,
    requests,
  ]);

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedDate("");
  };

  const navigate = useNavigate();

  // Pagination Handlers
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Stat Box - Matching the Dashboard design
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        <CountUp end={value} duration={2} separator="," />
      </div>
    </div>
  );

  // Formatting functions
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // View Details Handler
  const handleViewDetails = (group) => {
    const empDetails = getEmployeeDetails(group.employeeId);
    setSelectedEmployeeData({
      ...empDetails,
      employeeId: group.employeeId,
      records: group.records.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
    });
    setShowDetailsModal(true);
  };

  // Loading Screen
  if (loading && requests.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading edited records...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Demo Mode Banner */}
        {isUsingDummyData && (
          <div className="mb-3 p-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample regularization data. API connection may be unavailable.
          </div>
        )}
        
        {/* Client Info Banner */}
        {clientId && !isUsingDummyData && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-xs text-gray-500">Edits: {requests.reduce((acc, curr) => acc + curr.records.length, 0)}</p></div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            icon={FiList}
            label="Employees Edited"
            value={requests.length}
            color="border-purple-500"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Total Edits"
            value={requests.reduce((acc, curr) => acc + curr.records.length, 0)}
            color="border-green-500"
          />
          <StatCard
            icon={FiCalendar}
            label="Selected Month"
            value={selectedMonth ? 1 : 0}
            color="border-blue-500"
          />
          <StatCard
            icon={FiClock}
            label="Filter Active"
            value={searchTerm || filterDepartment || filterDesignation ? 1 : 0}
            color="border-yellow-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Month Filter */}
            <div className="relative w-[150px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedDate("");
                }}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative w-[150px]">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment
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
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
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
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation
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
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || selectedMonth !== new Date().toISOString().slice(0, 7) || selectedDate) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Employee Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">Employee ID</th>
                  <th className="py-2 text-center">Name</th>
                  <th className="py-2 text-center">Department</th>
                  <th className="py-2 text-center">Designation</th>
                  <th className="py-2 text-center">Edit Count</th>
                  <th className="py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((group) => {
                    const empDetails = getEmployeeDetails(group.employeeId);
                    return (
                      <tr
                        key={group.employeeId}
                        className="transition border-b hover:bg-gray-50"
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {group.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {empDetails.profilePicture ? (
                              <img src={empDetails.profilePicture} className="w-6 h-6 rounded-full" alt="profile" />
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 text-[10px] bg-purple-100 text-purple-600 rounded-full">
                                {empDetails.name.charAt(0)}
                              </div>
                            )}
                            <div className="font-medium text-xs">{empDetails.name}</div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-gray-600">
                          {empDetails.department}
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-gray-600">
                          {empDetails.designation}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                            {group.records.length} edits
                          </span>
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewDetails(group)}
                            className="px-3 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">
                      {loading ? "Loading..." : "No edited records found for this month."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Date-wise Details */}
        {showDetailsModal && selectedEmployeeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full">
                    <FaUserTag className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">{selectedEmployeeData.name} ({selectedEmployeeData.employeeId})</h3>
                    <p className="text-xs text-blue-100">{selectedEmployeeData.department} • {selectedEmployeeData.designation}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
                >
                  <FiXCircle className="text-2xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-700 uppercase tracking-wider">Times (In / Out)</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-700 uppercase tracking-wider">Hours</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-700 uppercase tracking-wider">Admin Comment</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-700 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedEmployeeData.records.map((rec) => (
                        <tr key={rec._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-4 text-xs font-medium text-center text-gray-900">
                            {new Date(rec.checkInTime).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex flex-col gap-1 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 shadow-inner">
                              <span className="text-[11px] font-bold text-green-600 flex items-center justify-center gap-1">
                                <FiClock className="inline" /> {formatTime(rec.checkInTime)}
                              </span>
                              <span className="text-[11px] font-bold text-indigo-600 flex items-center justify-center gap-1">
                                <FiClock className="inline" /> {formatTime(rec.checkOutTime)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-md border border-blue-100">
                              {rec.totalHours?.toFixed(2) || "0.00"}h
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-center text-gray-600 italic">
                            {rec.comment || <span className="text-gray-300">No comment</span>}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full bg-indigo-500 shadow-sm">
                              {rec.reason || "Edited"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Section */}
        {filteredRequests.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                  }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                  disabled={page === "..."}
                  className={`px-4 py-1 text-sm border rounded-lg ${page === "..."
                      ? "text-gray-500 bg-gray-50 cursor-default"
                      : currentPage === page
                        ? "text-white bg-blue-600 border-blue-600"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Regularization;