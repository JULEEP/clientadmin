import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  FaBriefcase, FaBuilding, FaCalendar, FaCheck,
  FaCity, FaClock, FaDollarSign, FaEnvelope,
  FaEye, FaEyeSlash, FaGlobeAsia,
  FaLock, FaMapMarkerAlt, FaMapPin, FaPhone,
  FaSpinner,
  FaUser,
  FaUserTie
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Components/config";

// ✅ Pin Code Utility Functions
const PINCODE_DATA = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "800001": { city: "Patna", state: "Bihar" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "847301": { city: "Samastipur", state: "Bihar" },
};

const getCityStateFromPincode = async (pincode) => {
  try {
    if (PINCODE_DATA[pincode]) {
      return PINCODE_DATA[pincode];
    }
    
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        return {
          city: postOffice.District || postOffice.Name,
          state: postOffice.State,
          country: "India"
        };
      }
    } catch (apiError) {
      console.warn("External API failed, using local data");
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    return null;
  }
};

const formatFullAddress = (addressData) => {
  const { addressLine1, addressLine2, city, state, pinCode, country } = addressData;
  let address = addressLine1 || '';
  if (addressLine2) address += `, ${addressLine2}`;
  if (city) address += `, ${city}`;
  if (state) address += `, ${state}`;
  if (pinCode) address += ` - ${pinCode}`;
  if (country) address += `, ${country}`;
  return address;
};

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEmployee = location.state?.employee || null;
  const searchTimeoutRef = useRef(null);

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || localStorage.getItem('clientCustomId') || '';

  // ✅ PERSONAL INFO
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [parentsName, setParentsName] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");

  // ✅ DEPARTMENT & ROLE
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  
  // Custom field states
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [customDepartment, setCustomDepartment] = useState("");
  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [isAddingNewShift, setIsAddingNewShift] = useState(false);
  const [customShiftType, setCustomShiftType] = useState("");
  const [customShiftStartTime, setCustomShiftStartTime] = useState("09:00");
  const [customShiftEndTime, setCustomShiftEndTime] = useState("18:00");
  const [customShiftName, setCustomShiftName] = useState("");

  // ✅ ADDRESS
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("India");

  // ✅ LOCATION
  const [locationId, setLocationId] = useState("");

  // ✅ WEEK OFF
  const [weekOffPerMonth, setWeekOffPerMonth] = useState("0");

  // ✅ SHIFT
  const [shiftType, setShiftType] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("18:00");
  const [shiftHours, setShiftHours] = useState("8");
  const [showShiftDetails, setShowShiftDetails] = useState(false);

  // ✅ SALARY
  const [salaryPerMonth, setSalaryPerMonth] = useState("");

  // ✅ EXISTING STATES
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal states
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Employee found status
  const [employeeFound, setEmployeeFound] = useState(false);
  const [searchedPhone, setSearchedPhone] = useState("");
  
  // Shift Creation Form
  const [createShiftForm, setCreateShiftForm] = useState({
    shiftType: '',
    shiftName: '',
    timeRange: '',
    description: ''
  });
  
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [locationForm, setLocationForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    fullAddress: ''
  });

  // Fetch functions with clientId
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/department/all/${clientId}`);
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/all/${clientId}`);
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  const fetchLocationsByClient = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/location/alllocation/${clientId}`);
      if (response.data?.locations) {
        setLocations(response.data.locations);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  };

  const fetchAllShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/master/${clientId}`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const shifts = res.data.data;
        const shiftOptions = shifts.map(shift => ({
          type: shift.shiftType,
          name: shift.shiftName || `Shift ${shift.shiftType}`,
          timeSlots: shift.timeSlots || []
        }));
        setShiftList(shiftOptions);
      }
    } catch (err) {
      console.log("Error fetching shifts:", err.message);
      setShiftList([]);
    }
  };

  const fetchEmployeeShift = async (empId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shifts/employee/${empId}/${clientId}`);
      if (response.data && !response.data.message) {
        setShiftType(response.data.shiftType);
        setShiftStartTime(response.data.startTime || "09:00");
        setShiftEndTime(response.data.endTime || "18:00");
      }
    } catch (err) {
      console.log("No shift assigned yet");
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchDepartments();
      fetchRoles();
      fetchAllShifts();
      fetchLocationsByClient();
    } else {
      console.error("Client ID not found. Please login again.");
      setErrorMessage("Client ID not found. Please login again.");
    }
  }, [clientId]);

  useEffect(() => {
    if (editingEmployee) {
      loadEmployeeData(editingEmployee);
    }
  }, [editingEmployee, shiftList]);

  // Auto-search when phone number is entered
  useEffect(() => {
    if (!editingEmployee && phone.length === 10 && phone !== searchedPhone) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchEmployeeByPhone();
      }, 500);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [phone, editingEmployee]);

  // Load employee data
  const loadEmployeeData = (employee) => {
    const nameParts = employee.name ? employee.name.trim().split(' ') : ['', ''];
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(' ') || "");
    
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setDob(employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "");
    setEmployeeId(employee.employeeId || "");
    setJoinDate(employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : "");
    setDepartment(employee.department || "");
    setRole(employee.role || "");
    setAddressLine1(employee.addressLine1 || "");
    setAddressLine2(employee.addressLine2 || "");
    setCity(employee.city || "");
    setState(employee.state || "");
    setPinCode(employee.pinCode || "");
    setCountry(employee.country || "India");
    setLocationId(employee.location?._id || employee.location || "");
    setWeekOffPerMonth(employee.weekOffPerMonth?.toString() || "0");
    setParentsName(employee.parentsName || "");
    setAlternateNumber(employee.alternateNumber || "");
    setShiftType(employee.shiftType || "");
    setShiftHours(employee.shiftHours?.toString() || "8");
    setSalaryPerMonth(employee.salaryPerMonth?.toString() || "");
    setPassword("");

    if (employee.shiftType) {
      setShowShiftDetails(true);
    }

    // Fetch employee's shift if editing
    if (employee.employeeId) {
      fetchEmployeeShift(employee.employeeId);
    }
  };

  // Search employee by phone number
  const searchEmployeeByPhone = async () => {
    if (!phone || phone.length !== 10 || phone === searchedPhone || editingEmployee) {
      return;
    }

    setSearching(true);
    setErrorMessage("");
    setSuccessMessage("");
    setEmployeeFound(false);
    setSearchedPhone(phone);

    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, {
        params: { phone, clientId }
      });

      if (response.data.success) {
        const employee = response.data.data;
        loadEmployeeData(employee);
        setEmployeeFound(true);
        setSuccessMessage(`Employee "${employee.name}" found! Data loaded successfully.`);
      } else {
        resetFormForNewEntry();
        setEmployeeFound(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      if (error.response?.status === 404) {
        resetFormForNewEntry();
        setEmployeeFound(false);
      } else {
        setErrorMessage("Failed to search employee. Please try again.");
        setEmployeeFound(false);
      }
    } finally {
      setSearching(false);
    }
  };

  // Reset form for new entry
  const resetFormForNewEntry = () => {
    if (!editingEmployee) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setDob("");
      setEmployeeId(generateEmployeeId());
      setJoinDate("");
      setDepartment("");
      setRole("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPinCode("");
      setCountry("India");
      setLocationId("");
      setWeekOffPerMonth("0");
      setParentsName("");
      setAlternateNumber("");
      setShiftType("");
      setShiftHours("8");
      setSalaryPerMonth("");
      setIsAddingNewDept(false);
      setIsAddingNewRole(false);
      setIsAddingNewShift(false);
      setCustomDepartment("");
      setCustomRole("");
      setCustomShiftType("");
      setCustomShiftName("");
    }
  };

  // Generate new employee ID
  const generateEmployeeId = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `EMP${randomNum}`;
  };

  const handlePinCodeChange = async (e) => {
    const value = e.target.value;
    setPinCode(value);
    
    if (value.length === 6) {
      try {
        const locationData = await getCityStateFromPincode(value);
        if (locationData) {
          setCity(locationData.city || "");
          setState(locationData.state || "");
          setCountry(locationData.country || "India");
        } else {
          setErrorMessage("Invalid pin code or not found. Please enter manually.");
        }
      } catch (error) {
        console.error("Error fetching pin code data:", error);
      }
    } else if (value.length > 6) {
      setPinCode(value.slice(0, 6));
    }
  };

  const handleShiftChange = (selectedShift) => {
    if (selectedShift === "ADD_NEW") {
      setIsAddingNewShift(true);
      setShowShiftModal(true);
    } else {
      setIsAddingNewShift(false);
      setShiftType(selectedShift);
      setShowShiftDetails(true);
      
      if (selectedShift) {
        const selectedShiftData = shiftList.find(shift => shift.type === selectedShift);
        if (selectedShiftData && selectedShiftData.timeSlots && selectedShiftData.timeSlots.length > 0) {
          const firstSlot = selectedShiftData.timeSlots[0];
          const timeRange = firstSlot.timeRange;
          const times = timeRange.split('-').map(t => t.trim());
          if (times.length === 2) {
            setShiftStartTime(times[0]);
            setShiftEndTime(times[1]);
          }
        }
      }
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const assignShiftToEmployee = async (empId, empName, shift, startTime, endTime) => {
    try {
      const shiftData = {
        employeeId: empId,
        employeeName: empName,
        shiftType: shift.toUpperCase(),
        startTime: startTime,
        endTime: endTime,
        clientId: clientId
      };
      const response = await axios.post(`${API_BASE_URL}/shifts/assign`, shiftData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Shift assignment error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validation
      if (!clientId) {
        throw new Error("Client ID not found. Please login again.");
      }

      if (!phone || phone.length !== 10) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      if (dob) {
        const dobDate = new Date(dob);
        const today = new Date();
        if (dobDate > today) {
          throw new Error("Date of Birth cannot be in the future");
        }
      }

      if (pinCode && pinCode.length !== 6) {
        throw new Error("Pin code must be 6 digits");
      }

      if (!employeeId) {
        setEmployeeId(generateEmployeeId());
      }

      // Handle custom fields
      let finalDept = department;
      if (isAddingNewDept && customDepartment) {
        // Create new department first
        try {
          const deptResponse = await axios.post(`${API_BASE_URL}/department/create/${clientId}`, {
            name: customDepartment,
            description: `Auto-created department ${customDepartment}`
          });
          if (deptResponse.data.success) {
            finalDept = customDepartment;
            await fetchDepartments(); // Refresh departments list
          } else {
            throw new Error("Failed to create department");
          }
        } catch (deptError) {
          throw new Error(`Failed to create department: ${deptError.message}`);
        }
      }

      let finalRole = role;
      if (isAddingNewRole && customRole) {
        try {
          const roleResponse = await axios.post(`${API_BASE_URL}/roles/create/${clientId}`, {
            name: customRole,
            description: `Auto-created role ${customRole}`
          });
          if (roleResponse.data.success) {
            finalRole = customRole;
            await fetchRoles(); // Refresh roles list
          } else {
            throw new Error("Failed to create role");
          }
        } catch (roleError) {
          throw new Error(`Failed to create role: ${roleError.message}`);
        }
      }

      let finalShift = shiftType;
      let finalStartTime = shiftStartTime;
      let finalEndTime = shiftEndTime;
      
      if (isAddingNewShift && customShiftType) {
        finalShift = customShiftType;
        finalStartTime = customShiftStartTime;
        finalEndTime = customShiftEndTime;
        
        // Create new shift master entry
        try {
          const shiftResponse = await axios.post(`${API_BASE_URL}/shifts/create/${clientId}`, {
            shiftType: customShiftType.toUpperCase(),
            shiftName: customShiftName || `Shift ${customShiftType}`,
            timeSlots: [{
              timeRange: `${customShiftStartTime} - ${customShiftEndTime}`,
              description: `Auto-created shift ${customShiftType}`
            }]
          });
          if (!shiftResponse.data.success) {
            throw new Error("Failed to create shift");
          }
          await fetchAllShifts(); // Refresh shifts list
        } catch (shiftError) {
          throw new Error(`Failed to create shift: ${shiftError.message}`);
        }
      }

      if (!finalDept) throw new Error("Please select or enter department");
      if (!finalRole) throw new Error("Please select or enter role");
      if (!finalShift) throw new Error("Please select or enter shift type");

      finalShift = finalShift.toUpperCase().trim();
      if (finalShift.length !== 1 || !/^[A-Z]$/.test(finalShift)) {
        throw new Error("Shift type should be a single letter from A to Z");
      }

      if (finalStartTime >= finalEndTime) {
        throw new Error("End time must be after start time");
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const fullAddress = formatFullAddress({ addressLine1, addressLine2, city, state, pinCode, country });

      const payload = {
        name: fullName,
        firstName,
        lastName,
        email,
        phone,
        dob: dob || null,
        department: finalDept,
        role: finalRole,
        addressLine1,
        addressLine2,
        city,
        state,
        pinCode,
        country,
        address: fullAddress,
        employeeId,
        joinDate,
        locationId,
        shiftType: finalShift,
        shiftHours: Number(shiftHours) || 8,
        weekOffPerMonth: Number(weekOffPerMonth) || 0,
        salaryPerMonth: Number(salaryPerMonth) || 0,
        parentsName,
        alternateNumber,
        clientId
      };

      if (password) payload.password = password;

      if (editingEmployee || employeeFound) {
        // Update existing employee
        let empIdToUpdate = editingEmployee ? editingEmployee._id : null;
        
        if (!empIdToUpdate && employeeFound) {
          const response = await axios.get(`${API_BASE_URL}/employees/get-employee-by-phone`, {
            params: { phone, clientId }
          });
          if (response.data.success) {
            const employee = response.data.data;
            await axios.put(`${API_BASE_URL}/employees/update/${employee._id}/${clientId}`, payload);
            await assignShiftToEmployee(employee.employeeId, fullName, finalShift, finalStartTime, finalEndTime);
            await axios.put(`${API_BASE_URL}/salary/update-salary/${employee.employeeId}/${clientId}`, {
              employeeId: employee.employeeId,
              salaryPerMonth: Number(salaryPerMonth) || 0,
              shiftHours: Number(shiftHours) || 8,
              weekOffPerMonth: Number(weekOffPerMonth) || 0,
              clientId
            });
          }
        } else {
          await axios.put(`${API_BASE_URL}/employees/update/${empIdToUpdate}/${clientId}`, payload);
          await assignShiftToEmployee(editingEmployee.employeeId, fullName, finalShift, finalStartTime, finalEndTime);
          await axios.put(`${API_BASE_URL}/salary/update-salary/${editingEmployee.employeeId}/${clientId}`, {
            employeeId: editingEmployee.employeeId,
            salaryPerMonth: Number(salaryPerMonth) || 0,
            shiftHours: Number(shiftHours) || 8,
            weekOffPerMonth: Number(weekOffPerMonth) || 0,
            clientId
          });
        }

        setSuccessMessage("Employee updated successfully!");
      } else {
        // Add new employee
        await axios.post(`${API_BASE_URL}/employees/add-employee/${clientId}`, payload);
        await assignShiftToEmployee(employeeId, fullName, finalShift, finalStartTime, finalEndTime);
        await axios.post(`${API_BASE_URL}/salary/set-salary/${clientId}`, {
          employeeId,
          name: fullName,
          salaryPerMonth: Number(salaryPerMonth),
          shiftHours: Number(shiftHours),
          weekOffPerMonth: Number(weekOffPerMonth),
          clientId
        });

        setSuccessMessage("Employee added successfully!");
      }

      setTimeout(() => navigate("/employeelist"), 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    
    if (value.length < 10) {
      setSearchedPhone("");
      setEmployeeFound(false);
    }
  };

  // Create custom shift
  const handleCreateCustomShift = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!createShiftForm.shiftType || !createShiftForm.shiftName || !createShiftForm.timeRange) {
        setErrorMessage('Please fill all required fields');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/shifts/create/${clientId}`, {
        shiftType: createShiftForm.shiftType.toUpperCase(),
        shiftName: createShiftForm.shiftName,
        timeSlots: [{
          timeRange: createShiftForm.timeRange,
          description: createShiftForm.description || `Shift ${createShiftForm.shiftType}`
        }]
      });
      
      if (response.data.success) {
        setSuccessMessage(`Shift ${createShiftForm.shiftType.toUpperCase()} created successfully!`);
        await fetchAllShifts();
        setCustomShiftType(createShiftForm.shiftType.toUpperCase());
        const times = createShiftForm.timeRange.split('-').map(t => t.trim());
        if (times.length === 2) {
          setCustomShiftStartTime(times[0]);
          setCustomShiftEndTime(times[1]);
        }
        setCustomShiftName(createShiftForm.shiftName);
        setShowShiftModal(false);
        setCreateShiftForm({
          shiftType: '',
          shiftName: '',
          timeRange: '',
          description: ''
        });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create custom error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create custom shift');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!deptForm.name.trim()) {
        setErrorMessage('Please enter department name');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/department/create/${clientId}`, {
        name: deptForm.name,
        description: deptForm.description
      });
      if (response.data.success) {
        setSuccessMessage(`Department "${deptForm.name}" created successfully!`);
        await fetchDepartments();
        setDepartment(deptForm.name);
        setShowDeptModal(false);
        setDeptForm({ name: '', description: '' });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create department error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!roleForm.name.trim()) {
        setErrorMessage('Please enter role name');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/roles/create/${clientId}`, {
        name: roleForm.name,
        description: roleForm.description
      });
      if (response.data.success) {
        setSuccessMessage(`Role "${roleForm.name}" created successfully!`);
        await fetchRoles();
        setRole(roleForm.name);
        setShowRoleModal(false);
        setRoleForm({ name: '', description: '' });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Create role error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create role');
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationForm(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          if (data.display_name) {
            setLocationForm(prev => ({
              ...prev,
              fullAddress: data.display_name
            }));
          } else {
            setErrorMessage("Could not fetch full address.");
          }
        } catch {
          setErrorMessage("Failed to fetch address from coordinates.");
        }
      },
      (err) => {
        setErrorMessage("Location access denied. Please enter manually.");
      }
    );
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!locationForm.name.trim() || !locationForm.latitude || !locationForm.longitude) {
        setErrorMessage('Please fill all required fields');
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/location/add-location/${clientId}`, {
        name: locationForm.name,
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
        fullAddress: locationForm.fullAddress
      });
      if (response.data.success || response.data.location) {
        setSuccessMessage(`Location "${locationForm.name}" added successfully!`);
        await fetchLocationsByClient();
        const newLocation = response.data.location || response.data.data;
        if (newLocation && newLocation._id) {
          setLocationId(newLocation._id);
        }
        setShowLocationModal(false);
        setLocationForm({ name: '', latitude: '', longitude: '', fullAddress: '' });
      } else {
        setErrorMessage(response.data.message || 'Failed to add location');
      }
    } catch (error) {
      console.error('Create location error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add location');
    }
  };

  // Handle department selection with custom option
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_DEPT") {
      setIsAddingNewDept(true);
      setShowDeptModal(true);
    } else {
      setIsAddingNewDept(false);
      setDepartment(value);
      setCustomDepartment("");
    }
  };

  // Handle role selection with custom option
  const handleRoleChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_ROLE") {
      setIsAddingNewRole(true);
      setShowRoleModal(true);
    } else {
      setIsAddingNewRole(false);
      setRole(value);
      setCustomRole("");
    }
  };

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingEmployee ? "Edit Employee" : "Add New Employee"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {editingEmployee 
              ? "Update employee details" 
              : "Search existing employee by phone number or add new"}
          </p>
          {clientId && (
            <p className="mt-1 text-xs text-blue-600">
              Client ID: {clientId.substring(0, 8)}...
            </p>
          )}
        </div>

        {/* Single Message Display */}
        {successMessage && (
          <div className="p-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ROW 1: Phone Search */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaPhone className="inline mr-1 text-blue-500" /> Phone Number *
              </label>
              <div className="relative">
                <input 
                  value={phone} 
                  onChange={handlePhoneChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="10-digit phone"
                  required 
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaSpinner className="text-blue-500 animate-spin" />
                  </div>
                )}
                {employeeFound && !searching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {employeeFound 
                  ? "Employee found - data loaded" 
                  : "Enter 10 digits to search"}
              </p>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Alternate Number
              </label>
              <input 
                value={alternateNumber} 
                onChange={(e) => setAlternateNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Alternate phone"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Parents Name
              </label>
              <input 
                value={parentsName} 
                onChange={(e) => setParentsName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Parents' full name"
              />
            </div>
          </div>

          {/* ROW 2: Email & Password */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaEnvelope className="inline mr-1 text-blue-500" /> Email *
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="john@example.com"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaLock className="inline mr-1 text-blue-500" /> Password {!editingEmployee && !employeeFound && "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder={editingEmployee || employeeFound ? "Keep blank for no change" : "Enter password"}
                  required={!editingEmployee && !employeeFound}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Date of Birth
              </label>
              <input 
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                max={getCurrentDate()}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* ROW 3: First Name, Last Name, Employee ID */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUser className="inline mr-1 text-blue-500" /> First Name *
              </label>
              <input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="John"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUser className="inline mr-1 text-blue-500" /> Last Name
              </label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaBriefcase className="inline mr-1 text-blue-500" /> Employee ID *
              </label>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  editingEmployee || employeeFound ? 'bg-gray-50' : ''
                }`}
                placeholder="EMP001"
                required
                readOnly={!!editingEmployee || employeeFound}
              />
            </div>
          </div>

          {/* ROW 4: Join Date, Location, Department */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Join Date *
              </label>
              <input 
                type="date" 
                value={joinDate} 
                onChange={(e) => setJoinDate(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="inline mr-1 text-blue-500" /> Location *
              </label>
              <select
                value={locationId}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === "ADD_NEW_LOCATION") {
                    setShowLocationModal(true);
                    return;
                  }
                  setLocationId(selectedValue);
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>{loc.name}</option>
                ))}
                <option value="ADD_NEW_LOCATION" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaBuilding className="inline mr-1 text-blue-500" /> Department *
              </label>
              <select
                value={isAddingNewDept ? "ADD_NEW_DEPT" : department}
                onChange={handleDepartmentChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name} {dept.employeeCount > 0 ? `(${dept.employeeCount})` : ''}
                  </option>
                ))}
                <option value="ADD_NEW_DEPT" className="font-medium text-blue-600">+ Add New</option>
              </select>
              {isAddingNewDept && (
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="Enter new department name"
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              )}
            </div>
          </div>

          {/* ROW 5: Role & Week Offs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaUserTie className="inline mr-1 text-blue-500" /> Role *
              </label>
              <select
                value={isAddingNewRole ? "ADD_NEW_ROLE" : role}
                onChange={handleRoleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Role</option>
                {roles.map((roleItem) => (
                  <option key={roleItem.name} value={roleItem.name}>
                    {roleItem.name} {roleItem.employeeCount > 0 ? `(${roleItem.employeeCount})` : ''}
                  </option>
                ))}
                <option value="ADD_NEW_ROLE" className="font-medium text-blue-600">+ Add New</option>
              </select>
              {isAddingNewRole && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter new role name"
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-1 text-blue-500" /> Week Offs per Month *
              </label>
              <input
                type="number"
                value={weekOffPerMonth}
                onChange={(e) => setWeekOffPerMonth(e.target.value)}
                min="0"
                max="30"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter number of week offs"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Total number of week offs per month</p>
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              <FaMapMarkerAlt className="inline mr-2 text-blue-500" /> Address Details
            </h3>
            
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input 
                  value={addressLine1} 
                  onChange={(e) => setAddressLine1(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="House no, Street, Area"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input 
                  value={addressLine2} 
                  onChange={(e) => setAddressLine2(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Landmark, Building name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaMapPin className="inline mr-1 text-gray-400" /> Pin Code *
                </label>
                <input 
                  type="text" 
                  value={pinCode} 
                  onChange={handlePinCodeChange}
                  maxLength="6"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="110001"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaCity className="inline mr-1 text-gray-400" /> City *
                </label>
                <input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaGlobeAsia className="inline mr-1 text-gray-400" /> State *
                </label>
                <input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  <FaGlobeAsia className="inline mr-1 text-gray-400" /> Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SHIFT SECTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaClock className="inline mr-1 text-blue-500" /> Shift Type *
              </label>
              <select
                value={isAddingNewShift ? "ADD_NEW" : shiftType}
                onChange={(e) => handleShiftChange(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Select Shift</option>
                {shiftList && shiftList.length > 0 ? (
                  shiftList.map((shift) => (
                    <option key={shift.type} value={shift.type}>
                      Shift {shift.type}: {shift.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading shifts...</option>
                )}
                <option value="ADD_NEW" className="font-medium text-blue-600">+ Add New</option>
              </select>
            </div>

            {showShiftDetails && !isAddingNewShift && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Shift Hours/Day *
                  </label>
                  <input 
                    type="number" 
                    value={shiftHours} 
                    onChange={(e) => setShiftHours(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    min="1"
                    max="24"
                    required 
                  />
                </div>
              </>
            )}

            {isAddingNewShift && (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Custom Shift Type (A-Z) *
                  </label>
                  <input
                    type="text"
                    maxLength="1"
                    value={customShiftType}
                    onChange={(e) => setCustomShiftType(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="E"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={customShiftStartTime}
                    onChange={(e) => setCustomShiftStartTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={customShiftEndTime}
                    onChange={(e) => setCustomShiftEndTime(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Shift Hours/Day *
                  </label>
                  <input 
                    type="number" 
                    value={shiftHours} 
                    onChange={(e) => setShiftHours(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    min="1"
                    max="24"
                    required 
                  />
                </div>
              </>
            )}
          </div>

          {/* SALARY SECTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <FaDollarSign className="inline mr-1 text-blue-500" /> Salary/Month *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-sm text-gray-500">₹</span>
                </div>
                <input 
                  type="number" 
                  value={salaryPerMonth} 
                  onChange={(e) => setSalaryPerMonth(e.target.value)} 
                  className="pl-8 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="0.00"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Week Offs/Month *
              </label>
              <input 
                type="number" 
                value={weekOffPerMonth} 
                readOnly
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                placeholder="0"
                required 
              />
              <p className="mt-1 text-xs text-gray-500">From week off selection</p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : editingEmployee || employeeFound ? (
                "Update Employee"
              ) : (
                "Add New Employee"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CREATE SHIFT MODAL */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Create New Shift</h3>
              <button onClick={() => setShowShiftModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustomShift} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Shift Type (Letter A-Z) *
                    </label>
                    <input
                      type="text"
                      maxLength="1"
                      value={createShiftForm.shiftType}
                      onChange={(e) => setCreateShiftForm(prev => ({ 
                        ...prev, 
                        shiftType: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                      }))}
                      className="w-full px-4 py-2 text-sm uppercase border border-gray-300 rounded-lg"
                      placeholder="E"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter a single letter (A-Z)</p>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Shift Name *
                    </label>
                    <input
                      type="text"
                      value={createShiftForm.shiftName}
                      onChange={(e) => setCreateShiftForm(prev => ({ ...prev, shiftName: e.target.value }))}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="e.g., Extended Shift E"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    Time Slot Configuration *
                  </label>
                  
                  <div className="p-3 space-y-3 border rounded-lg bg-gray-50">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Time Range *</label>
                      <input
                        type="text"
                        value={createShiftForm.timeRange}
                        onChange={(e) => setCreateShiftForm(prev => ({ ...prev, timeRange: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                        placeholder="e.g., 10:00 - 19:00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Description *</label>
                      <input
                        type="text"
                        value={createShiftForm.description}
                        onChange={(e) => setCreateShiftForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                        placeholder="e.g., Morning 10 to 7"
                        required
                      />
                    </div>
                  </div>
                </div>

                {createShiftForm.shiftType && createShiftForm.timeRange && (
                  <div className="p-3 border border-blue-200 rounded bg-blue-50">
                    <h4 className="mb-2 text-sm font-medium text-blue-800">Preview:</h4>
                    <p className="text-sm text-blue-700">
                      Shift {createShiftForm.shiftType}: {createShiftForm.shiftName}
                    </p>
                    <p className="mt-1 text-sm text-blue-600">
                      Time: {createShiftForm.timeRange}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateDepartment} className="p-6">
              <div className="space-y-4">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Department Name *</label><input type="text" value={deptForm.name} onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Sales, Development" required /></div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={deptForm.description} onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the department..." /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6">
              <div className="space-y-4">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Role Name *</label><input type="text" value={roleForm.name} onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Manager, Developer" required /></div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Description</label><textarea value={roleForm.description} onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Describe the role..." /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Add Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Add New Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateLocation} className="p-6">
              <div className="space-y-6">
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Location Name *</label><input type="text" value={locationForm.name} onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Main Office, Branch Office" required /></div>
                <div className="flex items-center justify-between mb-3"><label className="block text-sm font-medium text-gray-700">Location Coordinates</label><button type="button" onClick={handleGetCurrentLocation} className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">📍 Get Current Location</button></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block mb-2 text-sm font-medium text-gray-700">Latitude *</label><input type="text" value={locationForm.latitude} onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 28.6139" required /></div>
                  <div><label className="block mb-2 text-sm font-medium text-gray-700">Longitude *</label><input type="text" value={locationForm.longitude} onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 77.2090" required /></div>
                </div>
                <div><label className="block mb-2 text-sm font-medium text-gray-700">Full Address *</label><textarea value={locationForm.fullAddress} onChange={(e) => setLocationForm(prev => ({ ...prev, fullAddress: e.target.value }))} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Enter full address" required /></div>
              </div>
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <button type="button" onClick={() => setShowLocationModal(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700">Add Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeePage;