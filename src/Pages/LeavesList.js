import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { FaBuilding, FaExchangeAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiList, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";
import StatCard from "../Components/StatCard";

const API_BASE_URL = "https://api.timelyhealth.in/api";

// DUMMY DATA FOR FALLBACK
const DUMMY_EMPLOYEES = [
  { _id: "dummy_emp_001", employeeId: "EMP001", name: "Rajesh Kumar", department: "IT", role: "Senior Software Engineer", status: "active", email: "rajesh@example.com" },
  { _id: "dummy_emp_002", employeeId: "EMP002", name: "Priya Sharma", department: "HR", role: "HR Manager", status: "active", email: "priya@example.com" },
  { _id: "dummy_emp_003", employeeId: "EMP003", name: "Amit Patel", department: "Sales", role: "Sales Executive", status: "active", email: "amit@example.com" },
  { _id: "dummy_emp_004", employeeId: "EMP004", name: "Neha Gupta", department: "Marketing", role: "Marketing Specialist", status: "inactive", email: "neha@example.com" },
  { _id: "dummy_emp_005", employeeId: "EMP005", name: "Suresh Reddy", department: "Operations", role: "Operations Manager", status: "active", email: "suresh@example.com" },
];

const DUMMY_LEAVES = [
  { _id: "dummy_leave_001", employeeId: "EMP001", employeeName: "Rajesh Kumar", startDate: "2024-03-10T00:00:00.000Z", endDate: "2024-03-12T00:00:00.000Z", days: 3, leaveType: "sick", reason: "Fever and cold", status: "pending", createdAt: "2024-03-05T00:00:00.000Z", approvedBy: null, approvedByRole: null },
  { _id: "dummy_leave_002", employeeId: "EMP002", employeeName: "Priya Sharma", startDate: "2024-03-15T00:00:00.000Z", endDate: "2024-03-15T00:00:00.000Z", days: 1, leaveType: "casual", reason: "Personal work", status: "approved", createdAt: "2024-03-10T00:00:00.000Z", approvedBy: "Admin", approvedByRole: "Admin" },
  { _id: "dummy_leave_003", employeeId: "EMP003", employeeName: "Amit Patel", startDate: "2024-03-20T00:00:00.000Z", endDate: "2024-03-22T00:00:00.000Z", days: 3, leaveType: "earned", reason: "Family function", status: "manager_approved", createdAt: "2024-03-15T00:00:00.000Z", approvedBy: "Manager", approvedByRole: "Manager" },
  { _id: "dummy_leave_004", employeeId: "EMP005", employeeName: "Suresh Reddy", startDate: "2024-03-05T00:00:00.000Z", endDate: "2024-03-07T00:00:00.000Z", days: 3, leaveType: "sick", reason: "Medical checkup", status: "rejected", createdAt: "2024-03-01T00:00:00.000Z", approvedBy: "Admin", approvedByRole: "Admin" },
];

const DUMMY_COMP_OFFS = [
  { _id: "dummy_co_001", employeeId: "EMP001", employeeName: "Rajesh Kumar", workDate: "2024-03-20T00:00:00.000Z", count: 1, reason: "Worked on holiday", status: "approved" },
];

const DUMMY_COMP_OFF_REQUESTS = [
  { _id: "dummy_co_req_001", employeeId: "EMP002", employeeName: "Priya Sharma", workDate: "2024-03-25T00:00:00.000Z", count: 1, reason: "Worked extra hours", status: "pending" },
];

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  const clientId = localStorage.getItem("clientId") || "";

  if (!localStorage.getItem("userRole") && isUsingDummyData) {
    localStorage.setItem("userRole", "admin");
  }

  const [employees, setEmployees] = useState([]);
  const [compOffRequests, setCompOffRequests] = useState([]);
  const [showCompOffRequests, setShowCompOffRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [approvedCompOffs, setApprovedCompOffs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  const [showCompOffPopup, setShowCompOffPopup] = useState(false);
  const [selectedCompOffRequest, setSelectedCompOffRequest] = useState(null);
  const [showEditCompOffPopup, setShowEditCompOffPopup] = useState(false);
  const [selectedCompOffForEdit, setSelectedCompOffForEdit] = useState(null);
  const [editCompOffData, setEditCompOffData] = useState({ count: 1, reason: "" });

  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const compOffPopupRef = useRef(null);
  const editCompOffPopupRef = useRef(null);

  const loadDummyData = () => {
    console.log("Loading dummy leaves data as fallback");
    setIsUsingDummyData(true);
    localStorage.setItem("userRole", "admin");
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
    setLeaves(DUMMY_LEAVES);
    setFilteredLeaves(DUMMY_LEAVES);
    setApprovedCompOffs(DUMMY_COMP_OFFS);
    setCompOffRequests(DUMMY_COMP_OFF_REQUESTS);
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) setShowDepartmentFilter(false);
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) setShowDesignationFilter(false);
      if (compOffPopupRef.current && !compOffPopupRef.current.contains(event.target)) setShowCompOffPopup(false);
      if (editCompOffPopupRef.current && !editCompOffPopupRef.current.contains(event.target)) setShowEditCompOffPopup(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setIsUsingDummyData(false);
      if (!clientId) { loadDummyData(); return; }
      
      const [leavesRes, empRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/leaves/leaves/${clientId}`),
        axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`)
      ]);

      let employeesData = [];
      if (Array.isArray(empRes.data)) employeesData = empRes.data;
      else if (empRes.data?.employees) employeesData = empRes.data.employees;
      else if (empRes.data?.data) employeesData = empRes.data.data;
      
      if (!employeesData || employeesData.length === 0) { loadDummyData(); return; }
      
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);

      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      let leavesData = [];
      if (leavesRes.data?.records) leavesData = leavesRes.data.records;
      else if (Array.isArray(leavesRes.data)) leavesData = leavesRes.data;
      
      if (!leavesData || leavesData.length === 0) { loadDummyData(); return; }

      let compOffMap = new Map();
      try {
        const compOffsRes = await axios.get(`${API_BASE_URL}/leaves/comp-offs/${clientId}`);
        const compOffs = compOffsRes.data || [];
        setApprovedCompOffs(compOffs);
        compOffs.forEach(co => {
          if (co.originalLeaveId) {
            compOffMap.set(co.originalLeaveId.toString(), {
              id: co._id, status: co.status, count: co.count || 1, reason: co.reason, workDate: co.workDate
            });
          }
        });
      } catch (error) { console.log("Comp-offs not available yet"); }

      const leavesWithStatus = leavesData.map(leave => ({ ...leave, compOffStatus: compOffMap.get(leave._id?.toString()) || null }));
      const sorted = leavesWithStatus.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      let filteredLeavesData = sorted.filter(leave => activeEmployeeIds.has(leave.employeeId));

      setLeaves(filteredLeavesData);
      setFilteredLeaves(filteredLeavesData);
      setCurrentPage(1);
      setIsUsingDummyData(false);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const fetchCompOffRequests = async () => {
    if (isUsingDummyData) { setCompOffRequests(DUMMY_COMP_OFF_REQUESTS); return; }
    setLoadingRequests(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/${clientId}?status=pending`);
      setCompOffRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching comp-off requests:", error);
      setCompOffRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchCompOffRequests();
  }, [clientId]);

  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A"
    };
  };

  const updateLeaveStatus = async (id, status) => {
    if (isUsingDummyData) {
      setLeaves(leaves.map(leave => leave._id === id ? { ...leave, status: status, approvedBy: "Admin", approvedByRole: "Admin" } : leave));
      alert(`Leave ${status} successfully (Demo Mode)`);
      return;
    }
    try {
      const userRoleStr = localStorage.getItem("userRole");
      let approverName = "Admin", approverRole = "Admin", approverEmail = "";
      if (userRoleStr === "employee") {
        const empData = JSON.parse(localStorage.getItem("employeeData") || "{}");
        approverName = localStorage.getItem("employeeName") || empData.name;
        approverRole = empData.designation || empData.role || "Manager";
      } else {
        approverName = localStorage.getItem("adminName") || "Admin";
      }
      const res = await axios.put(`${API_BASE_URL}/leaves/updateleaves/${clientId}/${id}`, { status, adminName: approverName, adminEmail: approverEmail, adminRole: approverRole });
      if (res.status === 200) { alert(`Leave ${status} successfully`); fetchLeaves(); }
    } catch (error) { console.error("Error updating status:", error); alert("Failed to update leave status"); }
  };

  const approveCompOffRequest = async () => {
    if (!selectedCompOffRequest) return;
    if (isUsingDummyData) {
      setCompOffRequests(compOffRequests.filter(req => req._id !== selectedCompOffRequest._id));
      setApprovedCompOffs([...approvedCompOffs, { ...selectedCompOffRequest, status: "approved" }]);
      alert("✅ Comp-off request approved (Demo Mode)");
      setShowCompOffPopup(false);
      setSelectedCompOffRequest(null);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/leaves/comp-off-requests/${clientId}/${selectedCompOffRequest._id}/approve`, {
        approvedBy: localStorage.getItem("adminName") || "Admin"
      });
      alert("✅ Comp-off request approved!");
      setShowCompOffPopup(false);
      setSelectedCompOffRequest(null);
      fetchCompOffRequests();
      fetchLeaves();
    } catch (error) { alert(error.response?.data?.error || "Failed to approve request"); }
  };

  const rejectCompOffRequest = async () => {
    if (!selectedCompOffRequest) return;
    if (isUsingDummyData) {
      setCompOffRequests(compOffRequests.filter(req => req._id !== selectedCompOffRequest._id));
      alert("❌ Comp-off request rejected (Demo Mode)");
      setShowCompOffPopup(false);
      setSelectedCompOffRequest(null);
      return;
    }
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await axios.put(`${API_BASE_URL}/leaves/comp-off-requests/${clientId}/${selectedCompOffRequest._id}/reject`, {
        approvedBy: localStorage.getItem("adminName") || "Admin",
        rejectionReason: reason
      });
      alert("❌ Comp-off request rejected!");
      setShowCompOffPopup(false);
      setSelectedCompOffRequest(null);
      fetchCompOffRequests();
      fetchLeaves();
    } catch (error) { alert(error.response?.data?.error || "Failed to reject request"); }
  };

  const editApprovedCompOff = (compOff) => {
    setSelectedCompOffForEdit(compOff);
    setEditCompOffData({ count: compOff.count || 1, reason: compOff.reason || "" });
    setShowEditCompOffPopup(true);
  };

  const saveEditedCompOff = async () => {
    if (!selectedCompOffForEdit) return;
    if (isUsingDummyData) {
      setApprovedCompOffs(approvedCompOffs.map(co => co._id === selectedCompOffForEdit._id ? { ...co, count: editCompOffData.count, reason: editCompOffData.reason } : co));
      alert("✅ Comp-off updated successfully (Demo Mode)");
      setShowEditCompOffPopup(false);
      setSelectedCompOffForEdit(null);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/leaves/comp-offs/update/${clientId}/${selectedCompOffForEdit._id}`, {
        count: editCompOffData.count,
        reason: editCompOffData.reason,
        updatedBy: localStorage.getItem("adminName") || "Admin"
      });
      alert("✅ Comp-off updated successfully!");
      setShowEditCompOffPopup(false);
      setSelectedCompOffForEdit(null);
      fetchLeaves();
    } catch (error) { alert("Failed to update comp-off"); }
  };

  const rejectApprovedCompOff = async () => {
    if (!selectedCompOffForEdit) return;
    if (isUsingDummyData) {
      setApprovedCompOffs(approvedCompOffs.filter(co => co._id !== selectedCompOffForEdit._id));
      alert("❌ Comp-off rejected (Demo Mode)");
      setShowEditCompOffPopup(false);
      setSelectedCompOffForEdit(null);
      return;
    }
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await axios.put(`${API_BASE_URL}/leaves/comp-offs/${clientId}/${selectedCompOffForEdit._id}`, { status: "rejected", approvedBy: localStorage.getItem("adminName") || "Admin" });
      alert("❌ Comp-off rejected successfully!");
      setShowEditCompOffPopup(false);
      setSelectedCompOffForEdit(null);
      fetchLeaves();
    } catch (error) { alert("Failed to reject comp-off"); }
  };

  const deleteApprovedCompOff = async (compOffId) => {
    if (!window.confirm("Are you sure you want to delete this comp-off?")) return;
    if (isUsingDummyData) {
      setApprovedCompOffs(approvedCompOffs.filter(co => co._id !== compOffId));
      alert("✅ Comp-off deleted successfully (Demo Mode)");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/leaves/comp-offs/${clientId}/${compOffId}`);
      alert("✅ Comp-off deleted successfully!");
      fetchLeaves();
    } catch (error) { alert("Failed to delete comp-off"); }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setFilterDepartment("");
    setFilterDesignation("");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (page) => setCurrentPage(page);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pages.push("...");
    }
    return pages;
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-lg p-2 shadow-sm border-t-4 ${color} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-sm" />
        <div className="text-xs font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        <CountUp end={value} duration={2} separator="," />
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="text-center"><div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div><p className="text-sm font-semibold text-gray-600">Loading leave requests...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {isUsingDummyData && (
          <div className="mb-3 p-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample leave data. Approve/Reject buttons are visible for pending leaves.
          </div>
        )}
        
        {clientId && !isUsingDummyData && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p>
              <p className="text-xs text-gray-500">Leaves: {leaves.length}</p>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-5">
          <StatCard icon={FiList} label="Total" value={leaves.length} color="border-purple-500" />
          <StatCard icon={FiClock} label="Pending" value={leaves.filter(l => l.status === "pending").length} color="border-yellow-500" />
          <StatCard icon={FiClock} label="Mgr App" value={leaves.filter(l => l.status === "manager_approved").length} color="border-blue-500" />
          <StatCard icon={FiCheckCircle} label="Approved" value={leaves.filter(l => l.status === "approved").length} color="border-green-500" />
          <StatCard icon={FiXCircle} label="Rejected" value={leaves.filter(l => l.status === "rejected").length} color="border-red-500" />
        </div>

        {/* Filters */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <FaSearch className="absolute text-xs text-gray-400 left-2 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-7 px-2 text-xs border border-gray-300 rounded-lg min-w-[100px]">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="manager_approved">Mgr Approved</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
            <select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)} className="h-7 px-2 text-xs border border-gray-300 rounded-lg min-w-[100px]">
              <option value="all">All Types</option><option value="sick">Sick</option><option value="casual">Casual</option><option value="earned">Earned</option>
            </select>
            
            <div className="relative" ref={departmentFilterRef}>
              <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1 ${filterDepartment ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300'}`}>
                <FaBuilding className="text-xs" /> Dept{filterDepartment && `: ${filterDepartment.substring(0,10)}`}
              </button>
              {showDepartmentFilter && (
                <div className="absolute z-50 w-44 mt-1 bg-white border rounded-md shadow-lg max-h-56 overflow-y-auto">
                  <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50">All Departments</div>
                  {uniqueDepartments.map(dept => (<div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? 'bg-blue-50 text-blue-700' : ''}`}>{dept}</div>))}
                </div>
              )}
            </div>
            
            <div className="relative" ref={designationFilterRef}>
              <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1 ${filterDesignation ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300'}`}>
                <FaUserTag className="text-xs" /> Desig{filterDesignation && `: ${filterDesignation.substring(0,10)}`}
              </button>
              {showDesignationFilter && (
                <div className="absolute z-50 w-44 mt-1 bg-white border rounded-md shadow-lg max-h-56 overflow-y-auto">
                  <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50">All Designations</div>
                  {uniqueDesignations.map(des => (<div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? 'bg-blue-50 text-blue-700' : ''}`}>{des}</div>))}
                </div>
              )}
            </div>
            
            <div className="relative w-[120px]"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">From:</span><input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full pl-9 pr-1 py-1 text-xs border rounded-lg" /></div>
            <div className="relative w-[120px]"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">To:</span><input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full pl-9 pr-1 py-1 text-xs border rounded-lg" /></div>
            
            <button onClick={() => setShowCompOffRequests(!showCompOffRequests)} className={`h-7 px-2.5 text-xs font-medium rounded-md flex items-center gap-1 ${showCompOffRequests ? 'bg-purple-600 text-white' : 'bg-gray-100 border border-gray-300'}`}>
              <FaExchangeAlt className="text-xs" /> {showCompOffRequests ? 'Hide' : `Comp-off (${compOffRequests.length})`}
            </button>
            
            {(searchTerm || filterDepartment || filterDesignation || statusFilter !== "all" || leaveTypeFilter !== "all" || startDateFilter || endDateFilter) && 
              <button onClick={clearFilters} className="h-7 px-2.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Clear</button>}
          </div>
        </div>

        {/* Comp-off Requests Section */}
        {showCompOffRequests && compOffRequests.length > 0 && (
          <div className="mb-3 overflow-hidden bg-white border-2 border-purple-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-1.5 text-white bg-gradient-to-r from-purple-500 to-purple-700">
              <span className="text-xs font-semibold">Comp-off Requests ({compOffRequests.length})</span>
              <button onClick={fetchCompOffRequests} className="px-2 py-0.5 text-[10px] text-purple-700 bg-white rounded">🔄 Refresh</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-purple-100"><tr><th className="py-1 px-2 text-center">Employee</th><th className="py-1 px-2 text-center">Work Date</th><th className="py-1 px-2 text-center">Days</th><th className="py-1 px-2 text-center">Reason</th><th className="py-1 px-2 text-center">Action</th></tr></thead>
                <tbody>{compOffRequests.map(req => (<tr key={req._id} className="border-b hover:bg-purple-50"><td className="py-1 px-2 text-center"><div className="font-medium">{req.employeeName}</div><div className="text-[10px] text-gray-500">{req.employeeId}</div></td><td className="py-1 px-2 text-center">{formatDate(req.workDate)}</td><td className="py-1 px-2 text-center"><span className="px-1.5 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-100 rounded-full">{req.count}d</span></td><td className="py-1 px-2 text-center max-w-[150px] truncate">{req.reason || '-'}</td><td className="py-1 px-2 text-center"><button onClick={() => { setSelectedCompOffRequest(req); setShowCompOffPopup(true); }} className="px-2 py-1 text-[10px] text-white bg-purple-500 rounded">Review</button></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comp-off Review Popup */}
        {showCompOffPopup && selectedCompOffRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={compOffPopupRef} className="w-96 p-4 bg-white rounded-lg shadow-xl">
              <h2 className="mb-3 text-base font-bold text-purple-800">Review Comp-off Request</h2>
              <div className="space-y-3 text-sm">
                <div className="p-2 rounded-lg bg-purple-50"><p className="font-medium">{selectedCompOffRequest.employeeName}</p><p className="text-xs text-gray-500">{selectedCompOffRequest.employeeId}</p></div>
                <div><label className="block text-xs font-medium text-gray-700">Work Date</label><div className="p-1.5 rounded bg-gray-50 text-xs">{formatDate(selectedCompOffRequest.workDate)}</div></div>
                <div><label className="block text-xs font-medium text-gray-700">Days Requested</label><div className="p-1.5 rounded bg-gray-50 text-xs">{selectedCompOffRequest.count || 1} day(s)</div></div>
                <div><label className="block text-xs font-medium text-gray-700">Reason</label><div className="p-1.5 rounded bg-gray-50 text-xs">{selectedCompOffRequest.reason || '-'}</div></div>
                <div className="flex gap-2 pt-3"><button onClick={() => setShowCompOffPopup(false)} className="flex-1 px-3 py-1.5 text-xs bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button><button onClick={rejectCompOffRequest} className="flex-1 px-3 py-1.5 text-xs text-white bg-red-500 rounded-md hover:bg-red-600">Reject</button><button onClick={approveCompOffRequest} className="flex-1 px-3 py-1.5 text-xs text-white bg-green-500 rounded-md hover:bg-green-600">Approve</button></div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Comp-off Popup */}
        {showEditCompOffPopup && selectedCompOffForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div ref={editCompOffPopupRef} className="w-96 p-4 bg-white rounded-md shadow-lg">
              <h2 className="mb-3 text-base font-semibold text-green-700">Edit Comp-off</h2>
              <div className="space-y-3">
                <div className="p-2 rounded bg-green-50"><p className="text-xs text-gray-500">Employee</p><p className="font-medium text-sm">{selectedCompOffForEdit.employeeName}</p><p className="text-[10px] text-gray-400">{selectedCompOffForEdit.employeeId}</p></div>
                <div><label className="block text-xs font-medium text-gray-600">Work Date</label><div className="p-1.5 rounded bg-gray-50 text-sm">{formatDate(selectedCompOffForEdit.workDate)}</div></div>
                <div><label className="block text-xs font-medium text-gray-600">Comp-off Days</label><input type="number" min="0.5" step="0.5" value={editCompOffData.count} onChange={(e) => setEditCompOffData({ ...editCompOffData, count: parseFloat(e.target.value) })} className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-green-500" /></div>
                <div><label className="block text-xs font-medium text-gray-600">Reason</label><textarea rows="2" value={editCompOffData.reason} onChange={(e) => setEditCompOffData({ ...editCompOffData, reason: e.target.value })} className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-green-500" /></div>
                <div className="flex gap-2 pt-2"><button onClick={() => { setShowEditCompOffPopup(false); setSelectedCompOffForEdit(null); }} className="flex-1 px-2 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200">Cancel</button><button onClick={rejectApprovedCompOff} className="flex-1 px-2 py-1.5 text-xs text-white bg-red-500 rounded hover:bg-red-600">Reject</button><button onClick={saveEditedCompOff} className="flex-1 px-2 py-1.5 text-xs text-white bg-green-500 rounded hover:bg-green-600">Save</button></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="mb-3 overflow-hidden bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-1.5 px-2 text-center">ID</th><th className="py-1.5 px-2 text-center">Name</th><th className="py-1.5 px-2 text-center">Dept</th><th className="py-1.5 px-2 text-center">Desig</th>
                  <th className="py-1.5 px-2 text-center">Dates</th><th className="py-1.5 px-2 text-center">Days</th><th className="py-1.5 px-2 text-center">Reason</th>
                  <th className="py-1.5 px-2 text-center">Status</th><th className="py-1.5 px-2 text-center">Approved By</th><th className="py-1.5 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((l) => { 
                  const empDetails = getEmployeeDetails(l.employeeId); 
                  const compOffInfo = l.compOffStatus; 
                  const userRole = localStorage.getItem("userRole") || "admin";
                  const isManager = userRole === "employee" && JSON.parse(localStorage.getItem("employeePermissions") || "[]").includes("leave_approve");
                  const showApproveReject = (userRole === "admin" && (l.status === "pending" || l.status === "manager_approved")) || (isManager && l.status === "pending");
                  const approveAction = (userRole === "admin" && l.status === "manager_approved") ? "approved" : (userRole === "admin" && l.status === "pending") ? "approved" : (isManager && l.status === "pending") ? "manager_approved" : "approved";
                  
                  return (<tr key={l._id} className={`border-b hover:bg-gray-50 ${compOffInfo?.exists && compOffInfo.status === "approved" ? 'bg-purple-50' : ''}`}>
                    <td className="py-1.5 px-2 text-center font-medium">{l.employeeId || "N/A"}</td>
                    <td className="py-1.5 px-2 text-center">{l.employeeName}</td>
                    <td className="py-1.5 px-2 text-center text-gray-600">{empDetails.department}</td>
                    <td className="py-1.5 px-2 text-center text-gray-600">{empDetails.designation}</td>
                    <td className="py-1.5 px-2 text-center text-[10px]">{new Date(l.startDate).toLocaleDateString()}<br/>to<br/>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="py-1.5 px-2 text-center"><span className={`px-1.5 py-0.5 text-[10px] rounded-full ${compOffInfo?.exists && compOffInfo.status === "approved" ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{l.days}d</span></td>
                    <td className="py-1.5 px-2 text-center truncate max-w-[120px]">{l.reason}</td>
                    <td className="py-1.5 px-2 text-center">
                      {l.status === "pending" && <span className="px-1.5 py-0.5 text-[10px] text-yellow-700 bg-yellow-100 rounded-full">⏳ Pending</span>}
                      {l.status === "manager_approved" && <span className="px-1.5 py-0.5 text-[10px] text-blue-700 bg-blue-100 rounded-full">👍 Mgr Approved</span>}
                      {l.status === "approved" && !compOffInfo?.exists && <span className="px-1.5 py-0.5 text-[10px] text-green-700 bg-green-100 rounded-full">✅ Approved</span>}
                      {l.status === "approved" && compOffInfo?.exists && compOffInfo.status === "approved" && <span className="px-1.5 py-0.5 text-[10px] text-purple-700 bg-purple-100 rounded-full">🔄 Converted</span>}
                      {l.status === "rejected" && <span className="px-1.5 py-0.5 text-[10px] text-red-700 bg-red-100 rounded-full">❌ Rejected</span>}
                    </td>
                    <td className="py-1.5 px-2 text-center text-[10px]">{l.approvedBy ? (<div><span className="font-semibold">{l.approvedBy}</span><br/><span className="text-gray-500">({l.approvedByRole || 'Admin'})</span></div>) : '-'}</td>
                    <td className="py-1.5 px-2 text-center">
                      {showApproveReject ? (
                        <div className="flex justify-center gap-1">
                          <button onClick={() => updateLeaveStatus(l._id, approveAction)} className="px-2 py-1 text-[10px] text-white bg-green-500 rounded hover:bg-green-600">Approve</button>
                          <button onClick={() => updateLeaveStatus(l._id, "rejected")} className="px-2 py-1 text-[10px] text-white bg-red-500 rounded hover:bg-red-600">Reject</button>
                        </div>
                      ) : l.status === "approved" && compOffInfo?.exists && compOffInfo.status === "approved" ? (
                        <div className="flex justify-center gap-1">
                          <button onClick={() => editApprovedCompOff(approvedCompOffs.find(co => co._id === compOffInfo.id))} className="px-2 py-1 text-[10px] text-blue-700 bg-blue-100 rounded hover:bg-blue-200">✏️ Edit</button>
                          <button onClick={() => deleteApprovedCompOff(compOffInfo.id)} className="px-2 py-1 text-[10px] text-red-700 bg-red-100 rounded hover:bg-red-200">🗑️ Delete</button>
                        </div>
                      ) : (l.status === "approved" || l.status === "manager_approved") && !compOffInfo?.exists ? (
                        <span className="text-[10px] text-purple-600">Comp-off avail</span>
                      ) : (
                        <span className="text-[10px] italic text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>);
                }) : (
                  <tr><td colSpan="10" className="py-4 text-center text-gray-500 text-xs">No leave records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 mt-3 sm:flex-row">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-gray-700">Show:</label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded-lg">
                  <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                </select>
                <span className="text-xs text-gray-600">entries</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1 text-xs border rounded-lg ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-blue-600 bg-white hover:bg-blue-50"}`}>Prev</button>
              {getPageNumbers().map((page, i) => (<button key={i} onClick={() => typeof page === 'number' && handlePageClick(page)} disabled={page === "..."} className={`px-3 py-1 text-xs border rounded-lg ${page === "..." ? "text-gray-500 bg-gray-50 cursor-default" : currentPage === page ? "text-white bg-blue-600" : "text-blue-600 bg-white hover:bg-blue-50"}`}>{page}</button>))}
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-3 py-1 text-xs border rounded-lg ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-blue-600 bg-white hover:bg-blue-50"}`}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavesList;