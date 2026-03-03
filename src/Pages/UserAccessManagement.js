import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiSettings,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5000/api";

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const roleDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const globalSearchRef = useRef(null);

  // Get clientId from localStorage
  const getClientId = () => localStorage.getItem("clientId") || "";

  const permissionGroups = [
    {
      title: "Standard Employee Features",
      type: "immutable",
      items: [
        { id: "std_dashboard", name: "Employee Dashboard" },
        { id: "std_leave", name: "My Leaves & Application" },
        { id: "std_attendance", name: "My Attendance" },
        { id: "std_shift", name: "My Shift & Location" },
        { id: "std_salary", name: "My Salary Support" },
        { id: "std_profile", name: "My Profile" },
      ]
    },
    {
      title: "Admin: Dashboard & Monitoring",
      type: "toggleable",
      items: [
        { id: "dashboard_view", name: "Admin Dashboard" },
        { id: "user_activity_view", name: "User Activity Logs" },
      ]
    },
    {
      title: "Admin: Employee Management",
      type: "toggleable",
      items: [
        { id: "employee_view_all", name: "View All Employees" },
        { id: "employee_add", name: "Add New Employee" },
      ]
    },
    {
      title: "Admin: Operations",
      type: "toggleable",
      items: [
        { id: "attendance_view_all", name: "Manage Attendance" },
        { id: "leave_approve", name: "Leave Approval" },
        { id: "shifts_manage", name: "Shift Management" },
        { id: "locations_manage", name: "Location Management" },
      ]
    },
    {
      title: "Admin: Financials & Reports",
      type: "toggleable",
      items: [
        { id: "payroll_manage", name: "Payroll Management" },
        { id: "reports_view", name: "View Reports" },
      ]
    },
    {
      title: "Super Admin: System Control",
      type: "toggleable",
      items: [
        { id: "user_access_manage", name: "Manage User Access" },
      ]
    }
  ];

  useEffect(() => {
    fetchEmployees();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
      if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
        setIsGlobalSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const clientId = getClientId();
      // ✅ clientId path mein
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees/${clientId}`);

      // ✅ Array aur Object dono handle
      const raw = response.data;
      const data = Array.isArray(raw)
        ? raw
        : (raw.employees || raw.data || raw.result || []);

      setEmployees(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const roleStats = employees.reduce((acc, emp) => {
    const role = emp.role || "No Role";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const availableRoles = Object.keys(roleStats).sort();

  const filteredEmployees = employees.filter((e) => {
    const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  const filteredGlobalEmployees = employees.filter((e) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();
    return (
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term)
    );
  });

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
    setSelectedEmployee(null);
    setSearchTerm("");
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsEmployeeDropdownOpen(false);
  };

  const handleGlobalSelectEmployee = (emp) => {
    setSelectedRole(emp.role || "");
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsGlobalSearchOpen(false);
    setGlobalSearchTerm("");
  };

  const handleTogglePermission = (permId) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;
    try {
      const clientId = getClientId();
      // ✅ clientId query param mein bhi bheja (backend ko chahiye ho toh)
      const response = await axios.put(
        `${API_BASE_URL}/employees/update/${selectedEmployee._id}`,
        { permissions, clientId }
      );

      if (response.status === 200) {
        toast.success(`Access updated for ${selectedEmployee.name}`);
        setEmployees((prev) =>
          prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
        );
      } else {
        toast.error("Failed to update access");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating permissions");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800 flex justify-center">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-8xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <FiSettings className="text-gray-400" />
            <h1 className="text-lg font-bold text-gray-800">User Access Management</h1>
          </div>

          {/* Global Search */}
          <div className="relative w-full md:w-80" ref={globalSearchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Quick Search Employee (Name or ID)..."
                value={globalSearchTerm}
                onChange={(e) => {
                  setGlobalSearchTerm(e.target.value);
                  setIsGlobalSearchOpen(true);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {isGlobalSearchOpen && globalSearchTerm && (
              <div className="absolute right-0 z-30 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredGlobalEmployees.length > 0 ? (
                  filteredGlobalEmployees.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() => handleGlobalSelectEmployee(emp)}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{emp.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-white bg-[#a55eea] px-2 py-0.5 rounded-full">
                          {emp.employeeId}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-sm text-gray-400">No employees found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6">

            {/* Role Selector */}
            <div className="flex-1 space-y-1.5 relative" ref={roleDropdownRef}>
              <label className="block text-gray-700 font-bold text-sm">Select Role</label>
              <div
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full p-3 flex justify-between items-center text-sm font-medium border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400 bg-white transition-all text-gray-700"
              >
                <span>
                  {selectedRole ? (
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{selectedRole}</span>
                      <span className="text-gray-400 text-xs">({roleStats[selectedRole]} Users)</span>
                    </span>
                  ) : "All Roles"}
                </span>
                <FiChevronDown className={`text-gray-400 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
              </div>

              {isRoleDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleSelectRole("")}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm font-medium text-gray-700">All Roles</span>
                    {!selectedRole && <FiCheck className="text-blue-600" />}
                  </div>
                  {availableRoles.map(role => (
                    <div
                      key={role}
                      onClick={() => handleSelectRole(role)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{role}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
                      </div>
                      {selectedRole === role && <FiCheck className="text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Employee Selector */}
            <div className="flex-[2] space-y-1.5 relative" ref={employeeDropdownRef}>
              <label className="block text-gray-700 font-bold text-sm">Select Employee</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsEmployeeDropdownOpen(true);
                    if (!e.target.value) setSelectedEmployee(null);
                  }}
                  onClick={() => setIsEmployeeDropdownOpen(true)}
                  placeholder={selectedRole ? `Search in ${selectedRole} (${roleStats[selectedRole] || 0} Users)...` : `Search Employee Name or ID (${employees.length} Users)...`}
                  className="w-full p-3 pl-4 pr-10 text-sm font-medium border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {loading
                    ? <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    : <FiUser />
                  }
                </div>
              </div>

              {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp._id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{emp.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-white bg-[#a55eea] px-2 py-0.5 rounded-full">
                            {emp.employeeId}
                          </span>
                          {!selectedRole && (
                            <>
                              <span className="text-[10px] text-gray-400">•</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.role}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedEmployee?._id === emp._id && <FiCheck className="text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Permissions Grid */}
          {selectedEmployee ? (
            <div className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {permissionGroups.flatMap(group =>
                  group.items.map(item => ({ ...item, type: group.type }))
                ).map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors ${item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={item.type === "immutable" ? true : permissions.includes(item.id)}
                        onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
                        disabled={item.type === "immutable"}
                        className="peer sr-only"
                      />
                      <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                        item.type === "immutable"
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white group-hover:border-blue-400"
                      }`}>
                        <FiCheck size={10} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={savePermissions}
                  className="px-8 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                  Update
                </button>
                <button
                  onClick={() => { setSelectedEmployee(null); setSearchTerm(""); }}
                  className="px-8 py-2.5 bg-[#a55eea] hover:bg-[#9a52d8] text-white font-bold text-lg rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <FiFilter size={32} className="mb-3 opacity-50 text-blue-300" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Select Role & Employee to Configure</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserAccessManagement;
