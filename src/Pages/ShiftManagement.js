import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { FaBuilding, FaClock, FaEdit, FaEye, FaPlus, FaSearch, FaClock as FaShift, FaTimes, FaTrash, FaUserTag } from 'react-icons/fa';
import { isEmployeeHidden } from '../utils/employeeStatus';

const API_BASE_URL = 'http://localhost:5000/api';

const ShiftManagement = () => {
  const [masterShifts, setMasterShifts] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get clientId from localStorage
  const getClientId = () => localStorage.getItem("clientId") || "";
  const clientId = getClientId();

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCustomCreateModal, setShowCustomCreateModal] = useState(false);
  const [showBrakeShiftModal, setShowBrakeShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [showShiftTypeFilter, setShowShiftTypeFilter] = useState(false);

  // Data
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingShiftType, setViewingShiftType] = useState('');
  const [viewEmployees, setViewEmployees] = useState([]);
  const [viewShiftInfo, setViewShiftInfo] = useState({});

  // Forms
  const [createForm, setCreateForm] = useState({
    shiftType: '',
    shiftName: '',
    timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
    isBrakeShift: false
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    employeeName: '',
    shiftType: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterShiftType, setFilterShiftType] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  // Unique departments and designations for filter dropdowns
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination states for tables
  const [currentPageAssignments, setCurrentPageAssignments] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const shiftTypeFilterRef = useRef(null);

  const filterInactiveAssignments = (assignments) => {
    if (!Array.isArray(assignments) || !allEmployees.length) return assignments;

    return assignments.filter(assignment => {
      const employeeId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
      if (!employeeId) return true;

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (!employee) return true;

      return !isEmployeeHidden(employee);
    });
  };

  // Apply filters to assignments
  const applyFilters = () => {
    let filtered = [...employeeAssignments];

    // Filter by search term (ID or Name)
    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const employeeId = getEmployeeId(assignment).toLowerCase();
        const employeeName = getEmployeeName(assignment).toLowerCase();
        const term = searchTerm.toLowerCase();
        return employeeId.includes(term) || employeeName.includes(term);
      });
    }

    // Filter by department
    if (filterDepartment) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return employee?.department === filterDepartment;
      });
    }

    // Filter by designation
    if (filterDesignation) {
      filtered = filtered.filter(assignment => {
        const employee = allEmployees.find(emp => 
          emp.employeeId === getEmployeeId(assignment) || emp._id === getEmployeeId(assignment)
        );
        return (employee?.role || employee?.designation) === filterDesignation;
      });
    }

    // Filter by shift type
    if (filterShiftType) {
      filtered = filtered.filter(assignment => assignment.shiftType === filterShiftType);
    }

    setFilteredAssignments(filtered);
    setCurrentPageAssignments(1); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterDesignation('');
    setFilterShiftType('');
    setFilteredAssignments(employeeAssignments);
    setCurrentPageAssignments(1);
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
      if (shiftTypeFilterRef.current && !shiftTypeFilterRef.current.contains(event.target)) {
        setShowShiftTypeFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract unique departments and designations from employees
  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  const fetchData = async () => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log("🔄 Fetching data for client:", clientId);

      try {
        const employeesRes = await axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`);
        let employeesData = [];
        if (Array.isArray(employeesRes.data)) {
          employeesData = employeesRes.data;
        } else if (employeesRes.data?.employees && Array.isArray(employeesRes.data.employees)) {
          employeesData = employeesRes.data.employees;
        } else if (employeesRes.data?.data && Array.isArray(employeesRes.data.data)) {
          employeesData = employeesRes.data.data;
        }
        setAllEmployees(employeesData);
        extractUniqueValues(employeesData);
      } catch (e) {
        console.error('❌ Error fetching employees:', e);
      }

      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master/${clientId}`);

      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data);
      } else {
        setError(shiftsRes.data.message);
      }

      const assignedRes = await axios.get(`${API_BASE_URL}/shifts/assignments/${clientId}`);

      if (assignedRes.data.success) {
        const filteredAssignments = filterInactiveAssignments(assignedRes.data.data);
        setEmployeeAssignments(filteredAssignments);
        setFilteredAssignments(filteredAssignments);
      }

      const countRes = await axios.get(`${API_BASE_URL}/shifts/employee-count/${clientId}`);

      if (countRes.data.success) {
        setEmployeeCounts(countRes.data.data);
      }

    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDepartment, filterDesignation, filterShiftType, employeeAssignments]);

  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      const slot = createForm.timeSlots[0];
      if (!slot.timeRange.trim() || !slot.description.trim()) {
        setError('Please fill time slot details');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create/${clientId}`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        timeSlots: [slot],
        isBrakeShift: false
      });

      if (response.data.success) {
        setSuccess(`✅ Custom Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowCustomCreateModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setError(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  const handleCreateBrakeShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!createForm.shiftType || !createForm.shiftName) {
        setError('Please enter shift type and name');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create/${clientId}`, {
        shiftType: createForm.shiftType,
        shiftName: createForm.shiftName,
        isBrakeShift: true
      });

      if (response.data.success) {
        setSuccess(`✅ Brake Shift ${createForm.shiftType} created successfully!`);
        fetchData();
        setShowBrakeShiftModal(false);
        setCreateForm({
          shiftType: '',
          shiftName: '',
          timeSlots: [{ slotId: `${Date.now()}_1`, timeRange: '', description: '' }],
          isBrakeShift: false
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Create brake shift error:', error);
      setError(error.response?.data?.message || 'Failed to create brake shift');
    }
  };

  const updateTimeSlot = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      timeSlots: [{ ...prev.timeSlots[0], [field]: value }]
    }));
  };

  const getShiftTimeSlot = (shiftType) => {
    const shift = masterShifts.find(s => s.shiftType === shiftType);
    return shift?.timeSlots?.[0] || null;
  };

  const getBrakeShiftTimeDisplay = (shift) => {
    if (shift.isBrakeShift && shift.timeSlots.length > 1) {
      return `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
    }
    return shift.timeSlots?.[0]?.timeRange || "Not set";
  };

  const getEmployeesCount = (shiftType) => {
    return employeeAssignments.filter(a => a.shiftType === shiftType).length;
  };

  // Professional color mapping
  const getShiftColor = (type) => {
    const colorMap = {
      "A": "bg-[#DC2626]", // Red 600
      "B": "bg-[#2563EB]", // Blue 600
      "C": "bg-[#16A34A]", // Green 600
      "D": "bg-[#CA8A04]", // Yellow 600
      "E": "bg-[#000000]", // Black
      "F": "bg-[#4B5563]", // Grey 600
      "G": "bg-[#A16207]", // Brown 600
      "H": "bg-[#EA580C]", // Orange 600
      "I": "bg-[#DB2777]", // Pink 600
      "J": "bg-[#9333EA]", // Purple 600
      "K": "bg-[#FFFFFF]"  // White
    };
    return colorMap[type] || "bg-[#2563EB]";
  };

  const getShiftRowColor = (type) => {
    const colorMap = {
      "A": "bg-[#DC2626]/10 hover:bg-[#DC2626]/20",
      "B": "bg-[#2563EB]/10 hover:bg-[#2563EB]/20",
      "C": "bg-[#16A34A]/10 hover:bg-[#16A34A]/20",
      "D": "bg-[#CA8A04]/10 hover:bg-[#CA8A04]/20",
      "E": "bg-black/10 hover:bg-black/20",
      "F": "bg-[#4B5563]/10 hover:bg-[#4B5563]/20",
      "G": "bg-[#A16207]/10 hover:bg-[#A16207]/20",
      "H": "bg-[#EA580C]/10 hover:bg-[#EA580C]/20",
      "I": "bg-[#DB2777]/10 hover:bg-[#DB2777]/20",
      "J": "bg-[#9333EA]/10 hover:bg-[#9333EA]/20",
      "K": "bg-gray-100 hover:bg-gray-200"
    };
    return colorMap[type] || "bg-[#2563EB]/10";
  };

  const getShiftTextColor = (type) => {
    const whiteText = ["A","B","C","E","F","H","I","J"];
    return whiteText.includes(type) ? "text-white" : "text-gray-900";
  };

  const getShiftBorderColor = (type) => {
    const colorMap = {
      "A": "border-[#DC2626]",
      "B": "border-[#2563EB]",
      "C": "border-[#16A34A]",
      "D": "border-[#CA8A04]",
      "E": "border-black",
      "F": "border-[#4B5563]",
      "G": "border-[#A16207]",
      "H": "border-[#EA580C]",
      "I": "border-[#DB2777]",
      "J": "border-[#9333EA]",
      "K": "border-gray-300"
    };
    return colorMap[type] || "border-[#2563EB]";
  };

  const getBadgeColor = (type) => {
    const colorMap = {
      "A": "bg-[#DC2626]/20 text-[#B91C1C] border border-[#DC2626]",
      "B": "bg-[#2563EB]/20 text-[#1D4ED8] border border-[#2563EB]",
      "C": "bg-[#16A34A]/20 text-[#15803D] border border-[#16A34A]",
      "D": "bg-[#CA8A04]/20 text-[#A16207] border border-[#CA8A04]",
      "E": "bg-black/20 text-black border border-black",
      "F": "bg-[#4B5563]/20 text-[#374151] border border-[#4B5563]",
      "G": "bg-[#A16207]/20 text-[#78350F] border border-[#A16207]",
      "H": "bg-[#EA580C]/20 text-[#C2410C] border border-[#EA580C]",
      "I": "bg-[#DB2777]/20 text-[#BE185D] border border-[#DB2777]",
      "J": "bg-[#9333EA]/20 text-[#7E22CE] border border-[#9333EA]",
      "K": "bg-gray-200 text-gray-800 border border-gray-300"
    };
    return colorMap[type] || "bg-[#2563EB]/20 text-[#1D4ED8] border border-[#2563EB]";
  };

  const getEmployeeTimeRange = (assignment) => {
    if (assignment.employeeAssignment?.selectedTimeRange) {
      return assignment.employeeAssignment.selectedTimeRange;
    } else if (assignment.startTime && assignment.endTime) {
      return `${assignment.startTime} - ${assignment.endTime}`;
    }
    return "Not specified";
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.department || '-';
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = allEmployees.find(emp => 
      emp.employeeId === employeeId || emp._id === employeeId
    );
    return employee?.role || employee?.designation || '-';
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeId, employeeName, shiftType } = assignForm;

      if (!employeeId || !employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      const employee = allEmployees.find(emp =>
        emp.employeeId === employeeId || emp._id === employeeId
      );

      if (employee && isEmployeeHidden(employee)) {
        setError(`Cannot assign shift to inactive employee: ${employeeName}`);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/assign/${clientId}`, {
        employeeId,
        employeeName,
        shiftType,
        clientId
      });

      if (response.data.success) {
        setSuccess(`✅ Shift assigned to ${employeeName} successfully!`);
        fetchData();
        setShowAssignModal(false);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: ''
        });
      } else {
        setError(response.data.message || 'Failed to assign shift');
      }
    } catch (error) {
      console.error('❌ Assign error:', error);
      setError(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { employeeName, shiftType } = assignForm;

      if (!employeeName || !shiftType) {
        setError('Please fill all required fields');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/shifts/assignments/${editingAssignment._id}/${clientId}`,
        {
          employeeName,
          shiftType
        }
      );

      if (response.data.success) {
        setSuccess('✅ Assignment updated successfully!');
        fetchData();
        setShowAssignModal(false);
        setEditingAssignment(null);
        setAssignForm({
          employeeId: '',
          employeeName: '',
          shiftType: ''
        });
      } else {
        setError(response.data.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/assignments/${id}/${clientId}`);
        if (response.data.success) {
          setSuccess('Shift assignment removed successfully');
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete assignment');
      }
    }
  };

  const handleDeleteMasterShift = async (id, shiftName) => {
    if (window.confirm(`Delete ${shiftName}? This will remove all assignments.`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/shifts/master/${id}/${clientId}`);
        if (response.data.success) {
          setSuccess(response.data.message);
          fetchData();
        }
      } catch (error) {
        setError('Failed to delete shift');
      }
    }
  };

  const handleViewEmployees = async (shiftType, shiftName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shifts/type/${shiftType}/employees/${clientId}`);
      if (response.data.success) {
        const employees = response.data.data.employees || [];
        const filteredEmployees = filterInactiveAssignments(employees);

        setViewShiftInfo({
          shiftType,
          shiftName,
          isBrakeShift: response.data.data.isBrakeShift || false
        });
        setViewEmployees(filteredEmployees);
        setViewingShiftType(shiftType);
        setShowViewModal(true);
      }
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  const handleCreateDefaultShifts = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shifts/create-defaults/${clientId}`);
      if (response.data.success) {
        setSuccess(`✅ Created ${response.data.createdCount} default shifts (A-D + Brake Shift)`);
        fetchData();
      }
    } catch (error) {
      setError('Failed to create default shifts');
    }
  };

  const getEmployeeName = (assignment) => {
    return assignment.employeeAssignment?.employeeName || assignment.employeeName || "Unknown";
  };

  const getEmployeeId = (assignment) => {
    return assignment.employeeAssignment?.employeeId || assignment.employeeId || "Unknown";
  };

  // ✅ Stat Box component matching LeavesList
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </div>
  );

  // Pagination handlers
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPageAssignments(1);
  };

  const handlePrevPage = () => {
    if (currentPageAssignments > 1) setCurrentPageAssignments(currentPageAssignments - 1);
  };

  const handleNextPage = () => {
    if (currentPageAssignments < totalPages) setCurrentPageAssignments(currentPageAssignments + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPageAssignments(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPageAssignments - 2 && i <= currentPageAssignments + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPageAssignments - 3 || i === currentPageAssignments + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Calculate pagination for filtered assignments
  const indexOfLastItem = currentPageAssignments * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  // Client Info Banner
  const ClientInfoBanner = () => (
    <div className="p-3 mb-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Managing shifts for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Total Shifts: {masterShifts.length}
        </span>
      </div>
    </div>
  );

  // Check if clientId is missing
  if (!clientId && !loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-green-50 to-blue-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-red-600">Client ID not found. Please login again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen matching LeavesList
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading shift management...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-green-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Client Info Banner */}
        <ClientInfoBanner />
        
        {/* ✅ Stats Section */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-4">
          <StatCard
            label={`Total Shifts: ${masterShifts.length}`}
            color="border-green-500"
          />
          <StatCard
            label={`Assigned: ${employeeAssignments.length}`}
            color="border-blue-500"
          />
          <StatCard
            label={`Regular: ${masterShifts.filter(s => !s.isBrakeShift).length}`}
            color="border-green-500"
          />
          <StatCard
            label={`Brake: ${masterShifts.filter(s => s.isBrakeShift).length}`}
            color="border-yellow-500"
          />
        </div>

        {/* ✅ All Buttons in One Row */}
        <div className="p-2 mb-3 bg-white border border-gray-200 shadow-md rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
           
           {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
            {/* Divider */}
            <div className="w-px h-6 mx-1 bg-gray-300"></div>

            {/* Filter Buttons */}
            <div className="relative">
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
                <div ref={departmentFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
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

            <div className="relative">
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
                <div ref={designationFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
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

            <div className="relative">
              <button
                onClick={() => setShowShiftTypeFilter(!showShiftTypeFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterShiftType 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaShift className="text-xs" /> Shift {filterShiftType && `: ${filterShiftType}`}
              </button>
              
              {/* Shift Type Filter Dropdown */}
              {showShiftTypeFilter && (
                <div ref={shiftTypeFilterRef} className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterShiftType('');
                      setShowShiftTypeFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Shifts
                  </div>
                  {masterShifts.map(shift => (
                    <div 
                      key={shift._id}
                      onClick={() => {
                        setFilterShiftType(shift.shiftType);
                        setShowShiftTypeFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterShiftType === shift.shiftType ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      Shift {shift.shiftType} {shift.isBrakeShift && '(Brake)'}
                    </div>
                  ))}
                </div>
              )}
            </div>

           

             {/* Create Buttons */}
            {masterShifts.length === 0 && (
              <button
                onClick={handleCreateDefaultShifts}
                className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
              >
                <FaPlus className="text-xs" /> Create Defaults
              </button>
            )}
            <button
              onClick={() => setShowCustomCreateModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              <FaPlus className="text-xs" /> Regular Shift
            </button>
            <button
              onClick={() => setShowBrakeShiftModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition rounded-md bg-gradient-to-r from-green-600 to-pink-600 hover:from-green-700 hover:to-pink-700"
            >
              <FaPlus className="text-xs" /> Brake Shift
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center h-8 gap-1 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaClock className="text-xs" /> Assign
            </button>

            {/* Clear Filters Button */}
            {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* ✅ 1. AVAILABLE SHIFTS SECTION */}
        <div className="mb-6">
          {masterShifts.length === 0 ? (
            <div className="py-8 text-center bg-white border border-gray-200 rounded-lg">
              <div className="mb-3 text-4xl text-gray-400">⏰</div>
              <h3 className="mb-1 text-base font-semibold text-gray-600">No shifts created yet</h3>
              <p className="mb-3 text-sm text-gray-500">Create your first shift to get started</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowCustomCreateModal(true)}
                  className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Create Regular Shift
                </button>
                <button
                  onClick={() => setShowBrakeShiftModal(true)}
                  className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
                >
                  Create Brake Shift
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {masterShifts.map((shift) => {
                const timeSlot = shift.timeSlots?.[0];
                const employeeCount = getEmployeesCount(shift.shiftType);
                const shiftColor = getShiftColor(shift.shiftType);
                const textColor = getShiftTextColor(shift.shiftType);
                const borderColor = getShiftBorderColor(shift.shiftType);
                const isBrakeShift = shift.isBrakeShift;

                return (
                  <div
                    key={shift._id}
                    className={`p-3 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${shiftColor} ${borderColor} ${textColor}`}
                  >
                    {/* Shift Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-1.5">
                        <div className="p-1 rounded-md bg-white/20 backdrop-blur-sm">
                          <FaClock className="text-xs" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold">
                            Shift {shift.shiftType} {isBrakeShift && '(Brake)'}
                          </span>
                          <div className="text-xs text-white/90">
                            {shift.shiftName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold">{employeeCount}</div>
                        <div className="text-[10px] text-white/80">employees</div>
                      </div>
                    </div>

                    {/* Time Slot */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-medium">
                          {isBrakeShift ? getBrakeShiftTimeDisplay(shift) : (timeSlot?.timeRange || "Not set")}
                        </span>
                        {isBrakeShift && (
                          <span className="px-1 py-0.5 text-[10px] bg-white/20 rounded-full">
                            Brake
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        {isBrakeShift ?
                          "07:00-13:00 & 17:00-21:30" :
                          (timeSlot?.description || "No description")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleViewEmployees(shift.shiftType, shift.shiftName)}
                        disabled={employeeCount === 0}
                        className={`flex-1 px-1.5 py-1 text-[10px] rounded flex items-center justify-center gap-0.5 ${
                          employeeCount > 0
                            ? 'bg-white/20 text-white hover:bg-white/30 transition-colors'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        <FaEye className="text-[8px]" /> View
                      </button>
                      <button
                        onClick={() => {
                          setAssignForm({
                            employeeId: '',
                            employeeName: '',
                            shiftType: shift.shiftType
                          });
                          setEditingAssignment(null);
                          setShowAssignModal(true);
                        }}
                        className="flex-1 px-1.5 py-1 text-[10px] text-white bg-white/30 rounded hover:bg-white/40 transition-colors flex items-center justify-center gap-0.5"
                      >
                        <FaPlus className="text-[8px]" /> Assign
                      </button>
                      <button
                        onClick={() => handleDeleteMasterShift(shift._id, shift.shiftName)}
                        className="px-1.5 py-1 text-[10px] text-white bg-white/20 rounded hover:bg-white/30 transition-colors"
                      >
                        <FaTimes className="text-[8px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ 2. ALL ASSIGNED EMPLOYEES TABLE */}
        {employeeAssignments.length > 0 && (
          <div className="mb-6">
            {/* Results count */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600">
                Showing {filteredAssignments.length} of {employeeAssignments.length} assignments
              </div>
              {(filterDepartment || filterDesignation || filterShiftType || searchTerm) && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {searchTerm && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Search</span>}
                  {filterDepartment && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Dept</span>}
                  {filterDesignation && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Desig</span>}
                  {filterShiftType && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px]">Shift</span>}
                </div>
              )}
            </div>
            
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-2 text-center">Employee ID</th>
                      <th className="px-2 py-2 text-center">Employee Name</th>
                      <th className="px-2 py-2 text-center">Department</th>
                      <th className="px-2 py-2 text-center">Designation</th>
                      <th className="px-2 py-2 text-center">Shift</th>
                      <th className="px-2 py-2 text-center">Time Slot</th>
                      <th className="px-2 py-2 text-center">Description</th>
                      <th className="px-2 py-2 text-center rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.length > 0 ? (
                      currentAssignments.map((assignment) => {
                        const timeSlot = getShiftTimeSlot(assignment.shiftType);
                        const employeeName = getEmployeeName(assignment);
                        const employeeId = getEmployeeId(assignment);
                        const department = getEmployeeDepartment(employeeId);
                        const designation = getEmployeeDesignation(employeeId);
                        const shift = masterShifts.find(s => s.shiftType === assignment.shiftType);
                        const isBrakeShift = shift?.isBrakeShift || false;
                        const rowColor = getShiftRowColor(assignment.shiftType);

                        return (
                          <tr key={assignment._id} className={`${rowColor} transition border-b hover:bg-gray-50`}>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {employeeId}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <div className="font-semibold">{employeeName}</div>
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {department}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {designation}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${getBadgeColor(assignment.shiftType)}`}>
                                Shift {assignment.shiftType} {isBrakeShift && '(Brake)'}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(assignment)}
                            </td>
                            <td className="max-w-xs px-2 py-2 text-xs font-medium text-center text-gray-500 truncate whitespace-nowrap">
                              {isBrakeShift ? "Brake shift with afternoon break" : (assignment.employeeAssignment?.selectedDescription || timeSlot?.description || "Shift timing")}
                            </td>
                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-900 whitespace-nowrap">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingAssignment(assignment);
                                    setAssignForm({
                                      employeeId: assignment.employeeAssignment?.employeeId || assignment.employeeId,
                                      employeeName: assignment.employeeAssignment?.employeeName || assignment.employeeName,
                                      shiftType: assignment.shiftType
                                    });
                                    setShowAssignModal(true);
                                  }}
                                  className="px-2 py-1 text-[10px] bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-0.5"
                                >
                                  <FaEdit className="text-[8px]" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                  className="px-2 py-1 text-[10px] bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-0.5"
                                >
                                  <FaTrash className="text-[8px]" /> Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-4 text-xs text-center text-gray-500">
                          No assignments found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Pagination Section */}
            {filteredAssignments.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
                {/* Show entries dropdown */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
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
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPageAssignments === 1}
                    className={`px-3 py-1 text-xs border rounded-lg ${
                      currentPageAssignments === 1
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
                      className={`px-3 py-1 text-xs border rounded-lg ${
                        page === "..."
                          ? "text-gray-500 bg-gray-50 cursor-default"
                          : currentPageAssignments === page
                          ? "text-white bg-blue-600 border-blue-600"
                          : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPageAssignments === totalPages}
                    className={`px-3 py-1 text-xs border rounded-lg ${
                      currentPageAssignments === totalPages
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
        )}

        {/* No assignments message */}
        {employeeAssignments.length === 0 && (
          <div className="py-6 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs">No shift assignments yet</p>
          </div>
        )}

        {/* REGULAR SHIFT CREATE MODAL */}
        {showCustomCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Create Regular Shift</h3>
                <button onClick={() => setShowCustomCreateModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateCustomShift} className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Type *
                      </label>
                      <input
                        type="text"
                        maxLength="1"
                        value={createForm.shiftType}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                        }))}
                        className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        placeholder="E"
                        required
                      />
                      <p className="mt-1 text-[10px] text-gray-500">Single letter (A-Z)</p>
                    </div>

                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.shiftName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        placeholder="Extended Shift E"
                        required
                      />
                    </div>
                  </div>

                  {/* Time Slot Configuration */}
                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Time Slot *
                    </label>
                    <div className="p-2 space-y-2 border border-gray-200 rounded-md bg-gray-50">
                      <div>
                        <label className="block mb-0.5 text-[10px] text-gray-600">Time Range</label>
                        <input
                          type="text"
                          value={createForm.timeSlots[0].timeRange}
                          onChange={(e) => updateTimeSlot('timeRange', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="10:00 - 19:00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-0.5 text-[10px] text-gray-600">Description</label>
                        <input
                          type="text"
                          value={createForm.timeSlots[0].description}
                          onChange={(e) => updateTimeSlot('description', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="Morning 10 to 7"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {createForm.shiftType && createForm.timeSlots[0].timeRange && (
                    <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                      <h4 className="mb-0.5 text-xs text-gray-800">Preview:</h4>
                      <p className="text-[10px] text-gray-700">
                        Shift {createForm.shiftType}: {createForm.shiftName}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        Time: {createForm.timeSlots[0].timeRange}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCustomCreateModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Create Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BRAKE SHIFT CREATE MODAL */}
        {showBrakeShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Create Brake Shift</h3>
                <button onClick={() => setShowBrakeShiftModal(false)} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateBrakeShift} className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Type *
                      </label>
                      <input
                        type="text"
                        maxLength="2"
                        value={createForm.shiftType}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                        }))}
                        className="w-full px-2 py-1.5 text-xs uppercase border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
                        placeholder="BR"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs text-gray-700">
                        Shift Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.shiftName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, shiftName: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500"
                        placeholder="Brake Shift"
                        required
                      />
                    </div>
                  </div>

                  {/* Brake Shift Info */}
                  <div className="p-2 border border-green-200 rounded-md bg-gradient-to-r from-green-50 to-pink-50">
                    <h4 className="mb-1 text-xs text-green-800">Brake Shift Details</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                          <FaClock className="text-[8px] text-green-600" />
                        </div>
                        <span className="text-[10px] text-gray-800">07:00 - 13:00</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center w-5 h-5 bg-pink-100 rounded-full">
                          <FaClock className="text-[8px] text-pink-600" />
                        </div>
                        <span className="text-[10px] text-gray-800">17:00 - 21:30</span>
                      </div>
                      <p className="text-[9px] text-gray-600">Total: 10.5 hours with break</p>
                    </div>
                  </div>

                  {/* Preview */}
                  {createForm.shiftType && (
                    <div className="p-2 border border-green-200 rounded-md bg-green-50">
                      <p className="text-xs text-green-700">
                        Shift {createForm.shiftType} (Brake): {createForm.shiftName}
                      </p>
                      <p className="text-[10px] text-green-600">
                        07:00-13:00 & 17:00-21:30
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowBrakeShiftModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-green-600 to-pink-600 rounded-md hover:from-green-700 hover:to-pink-700"
                  >
                    Create Brake Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ASSIGN SHIFT MODAL */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">
                  {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
                </h3>
                <button onClick={() => {
                  setShowAssignModal(false);
                  setEditingAssignment(null);
                  setAssignForm({
                    employeeId: '',
                    employeeName: '',
                    shiftType: ''
                  });
                }} className="text-lg text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift} className="p-3">
                <div className="space-y-2">
                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Employee ID {editingAssignment && '(Cannot change)'}
                    </label>
                    <input
                      type="text"
                      value={assignForm.employeeId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      placeholder="EMP001"
                      required
                      readOnly={!!editingAssignment}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={assignForm.employeeName}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeName: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs text-gray-700">
                      Select Shift Type *
                    </label>
                    <select
                      value={assignForm.shiftType}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, shiftType: e.target.value }))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Shift Type</option>
                      {masterShifts.map(shift => (
                        <option key={shift._id} value={shift.shiftType}>
                          Shift {shift.shiftType}: {shift.shiftName} {shift.isBrakeShift && '(Brake)'}
                        </option>
                      ))}
                    </select>

                    {assignForm.shiftType && masterShifts.find(s => s.shiftType === assignForm.shiftType) && (
                      <div className="p-1.5 mt-1 text-[10px] rounded bg-blue-50 border border-blue-100">
                        <p className="text-blue-700">
                          Time: {
                            masterShifts.find(s => s.shiftType === assignForm.shiftType)?.isBrakeShift ?
                              "07:00-13:00 & 17:00-21:30" :
                              getShiftTimeSlot(assignForm.shiftType)?.timeRange || "Not specified"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setEditingAssignment(null);
                      setAssignForm({
                        employeeId: '',
                        employeeName: '',
                        shiftType: ''
                      });
                    }}
                    className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingAssignment ? 'Update' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW EMPLOYEES MODAL */}
        {showViewModal && viewEmployees.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {viewShiftInfo.shiftName} Employees
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    Shift {viewShiftInfo.shiftType} • {viewEmployees.length} active employees
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-lg text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee ID</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Employee Name</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Department</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Designation</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Time Slot</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Description</th>
                      <th className="px-2 py-2 text-[10px] font-semibold tracking-wider text-left text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewEmployees.map((emp) => {
                      const rowColor = getShiftRowColor(emp.shiftType);
                      const shift = masterShifts.find(s => s.shiftType === emp.shiftType);
                      const isBrakeShift = shift?.isBrakeShift || false;
                      const employeeId = emp.employeeAssignment?.employeeId || emp.employeeId;
                      const department = getEmployeeDepartment(employeeId);
                      const designation = getEmployeeDesignation(employeeId);

                      return (
                        <tr key={emp._id} className={`${rowColor} transition-colors`}>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{employeeId}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{emp.employeeAssignment?.employeeName || emp.employeeName}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{department}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">{designation}</td>
                          <td className="px-2 py-2 text-[10px] text-gray-900">
                            {isBrakeShift ? "07:00-13:00 & 17:00-21:30" : getEmployeeTimeRange(emp)}
                          </td>
                          <td className="px-2 py-2 text-[10px] text-gray-600">
                            {isBrakeShift ? "Brake shift" : (emp.employeeAssignment?.selectedDescription || "Legacy shift")}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setShowViewModal(false);
                                  setEditingAssignment(emp);
                                  setAssignForm({
                                    employeeId: emp.employeeAssignment?.employeeId || emp.employeeId,
                                    employeeName: emp.employeeAssignment?.employeeName || emp.employeeName,
                                    shiftType: emp.shiftType
                                  });
                                  setShowAssignModal(true);
                                }}
                                className="px-2 py-1 text-[8px] bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
                              >
                                <FaEdit className="text-[6px]" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteAssignment(emp._id);
                                  setShowViewModal(false);
                                }}
                                className="px-2 py-1 text-[8px] bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                              >
                                <FaTrash className="text-[6px]" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2 text-[10px] bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;