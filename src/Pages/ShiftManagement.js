import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateShift() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const [formData, setFormData] = useState({
    clientId: "",
    employeeId: "",
    employeeName: "",
    shiftType: "",
    startTime: "",
    endTime: "",
  });

  // ✅ Updated Shifts with New Timings
  const shifts = {
    A: { startTime: "10:00", endTime: "19:00" },
    B: { startTime: "09:00", endTime: "19:00" },
    C: { startTime: "07:00", endTime: "17:00" },
    D: { startTime: "06:30", endTime: "16:00" },
    E: { startTime: "14:00", endTime: "23:00" },
    F: { startTime: "08:00", endTime: "18:00" },
    G: { startTime: "10:30", endTime: "21:00" },
    H: { startTime: "07:00 - 13:00", endTime: "17:00 - 21:30" },
    I: { startTime: "11:00", endTime: "20:00" },
  };

  // ✅ Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";

  // ✅ Set clientId in formData on component mount
  useEffect(() => {
    if (clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId
      }));
    }
  }, [clientId]);

  // ✅ Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        searchRef.current && 
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Fetch employees when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!clientId) {
        console.error("Client ID not found in localStorage");
        alert("Please login first!");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/employees/get-employees/${clientId}`
        );
        console.log("Employees API Response:", response.data);

        let employeesData = [];
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data?.employees && Array.isArray(response.data.employees)) {
          employeesData = response.data.employees;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        }

        setEmployees(employeesData || []);
        setFilteredEmployees(employeesData || []);
      } catch (error) {
        console.error("❌ Error fetching employees:", error);
        alert("Failed to load employees list!");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchEmployees();
    }
  }, [clientId, navigate]);

  // ✅ Filter employees based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((emp) =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
    
    // Show dropdown when searching
    if (searchTerm && !formData.employeeId) {
      setShowDropdown(true);
    }
  }, [searchTerm, employees, formData.employeeId]);

  // ✅ Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setFormData({
      ...formData,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      clientId: clientId // Ensure clientId is set
    });
    setSearchTerm(employee.name); // Show selected name in search box
    setShowDropdown(false);
  };

  // ✅ Handle search input focus
  const handleSearchFocus = () => {
    if (!formData.employeeId && employees.length > 0) {
      setShowDropdown(true);
    }
  };

  // ✅ Clear selected employee
  const handleClearSelection = () => {
    setFormData({
      ...formData,
      employeeId: "",
      employeeName: "",
    });
    setSearchTerm("");
    setShowDropdown(true);
    searchRef.current?.focus();
  };

  const handleShiftChange = (shift) => {
    setFormData({
      ...formData,
      shiftType: shift,
      startTime: shifts[shift].startTime,
      endTime: shifts[shift].endTime,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate all required fields as per backend
    if (!formData.clientId || !formData.employeeId || !formData.employeeName || !formData.shiftType || !formData.startTime || !formData.endTime) {
      alert("Please select an employee and a shift type");
      return;
    }

    // ✅ Validate shift type format (A-Z single letter)
    if (!/^[A-Z]$/.test(formData.shiftType)) {
      alert("Shift type should be a single letter from A to Z");
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Create payload matching backend structure
      const payload = {
        clientId: formData.clientId,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        shiftType: formData.shiftType,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      console.log("Sending payload to backend:", payload);

      const res = await axios.post(
        "http://localhost:5000/api/shifts/assign",
        payload
      );

      if (res.status === 200 || res.status === 201) {
        alert("✅ Shift assigned successfully!");

        // ✅ Update employee's shift in local state
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.employeeId === formData.employeeId 
              ? { ...emp, shiftType: formData.shiftType }
              : emp
          )
        );

        // ✅ Save shift locally
        localStorage.setItem(
          "employeeShift",
          JSON.stringify({
            employeeId: formData.employeeId,
            employeeName: formData.employeeName,
            shiftType: formData.shiftType,
            startTime: formData.startTime,
            endTime: formData.endTime,
            clientId: formData.clientId
          })
        );

        // ✅ Clear form
        setFormData({
          clientId: clientId,
          employeeId: "",
          employeeName: "",
          shiftType: "",
          startTime: "",
          endTime: "",
        });
        setSearchTerm("");

        // ✅ Navigate to shift list page
        navigate("/shiftlist");
      }
    } catch (err) {
      console.error("❌ Error assigning shift:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to assign shift: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
          Assign Shift to Employee
        </h1>

        {!clientId && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
            Client ID not found. Please login again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client ID Display (Read-only) */}
          {clientId && (
            <div className="p-3 mb-2 text-sm bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium">Client ID:</p>
              <p className="font-mono text-xs">{clientId}</p>
            </div>
          )}

          {/* Employee Search and Selection */}
          <div className="relative" ref={searchRef}>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Employee *
            </label>
            
            {/* Search Input with Clear Button */}
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Search or select employee..."
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              
              {/* Clear Button */}
              {searchTerm && !loading && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
              
              {/* Loading Indicator */}
              {loading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Selected Employee Badge */}
            {formData.employeeId && (
              <div className="p-3 mt-2 text-sm bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">✓ Selected: {formData.employeeName}</p>
                    <p className="text-gray-600">ID: {formData.employeeId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                    disabled={loading}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Employees Dropdown */}
            {showDropdown && !formData.employeeId && filteredEmployees.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                  Found {filteredEmployees.length} employee(s)
                </div>
                
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="p-3 border-b cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{employee.name}</p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-16">ID:</span> {employee.employeeId || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-16">Dept:</span> {employee.department || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-block w-16">Email:</span> {employee.email || "N/A"}
                        </p>
                      </div>
                      {employee.shiftType && (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                          Shift {employee.shiftType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showDropdown && !formData.employeeId && searchTerm && filteredEmployees.length === 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-10 w-full p-3 mt-1 text-sm text-gray-500 bg-white border rounded-lg shadow-lg"
              >
                No employees found matching "<span className="font-medium">"{searchTerm}"</span>"
              </div>
            )}

            {/* Hint when dropdown is not visible */}
            {!showDropdown && !formData.employeeId && employees.length > 0 && (
              <div className="p-2 mt-1 text-xs text-gray-500 bg-gray-50 rounded">
                <p>Type to search employees or click to browse</p>
                <p className="mt-1">Total employees: {employees.length}</p>
              </div>
            )}
          </div>

          {/* Shift Type */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Shift *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(shifts).map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => handleShiftChange(shift)}
                  disabled={loading || !formData.employeeId}
                  className={`py-2 rounded-lg border text-center text-sm font-semibold transition-colors ${
                    formData.shiftType === shift
                      ? "bg-blue-600 text-white border-blue-600"
                      : formData.employeeId
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                      : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  }`}
                >
                  Shift {shift}
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="text"
                value={formData.startTime}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="text"
                value={formData.endTime}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Shift Details Preview */}
          {formData.shiftType && (
            <div className="p-3 text-sm bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800">Shift {formData.shiftType} Details:</p>
              <p className="mt-1">Timing: {formData.startTime} to {formData.endTime}</p>
              <p className="mt-1">
                Duration: {
                  formData.shiftType === 'H' 
                    ? '7 hours (Morning) + 4.5 hours (Evening)' 
                    : '9 hours (including break)'
                }
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.employeeId || !formData.shiftType}
            className={`w-full py-2 font-semibold text-white rounded-lg transition-colors ${
              loading || !formData.employeeId || !formData.shiftType
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Assigning Shift..." : "Assign Shift"}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate("/shiftlist")}
            disabled={loading}
            className={`w-full py-2 mt-2 border rounded-lg transition-colors ${
              loading
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
        </form>

        {/* Client Info */}
        {clientId && (
          <div className="p-3 mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg">
            <p>Client ID: <span className="font-mono">{clientId.substring(0, 8)}...</span></p>
            <p>Total Employees: <span className="font-semibold">{employees.length}</span></p>
            {formData.employeeId && (
              <p className="mt-1">Selected Employee ID: <span className="font-mono">{formData.employeeId}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}