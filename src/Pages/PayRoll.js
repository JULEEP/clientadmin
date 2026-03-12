import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { isEmployeeHidden } from "../utils/employeeStatus";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [extraWorkData, setExtraWorkData] = useState({
    extraDays: 0,
    extraHours: 0,
    overtimeRate: 0,
    bonus: 0,
    deductions: 0,
    reason: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get clientId from localStorage
  const clientId = localStorage.getItem('clientId') || '';

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30);
  const [weekOffConfig, setWeekOffConfig] = useState({
    weekOffDay: "",
    weekOffType: "0+4",
    manualDays: ""
  });

  // Add items per page state
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // API endpoints with clientId
  const ATTENDANCE_SUMMARY_API_URL = `http://localhost:5000/api/attendancesummary/get/${clientId}`;
  const ATTENDANCE_DETAILS_API_URL = `http://localhost:5000/api/attendance/allattendance/${clientId}`;
  const LEAVES_API_URL = `http://localhost:5000/api/leaves/leaves/${clientId}?status=approved`;
  const EMPLOYEES_API_URL = `http://localhost:5000/api/employees/get-employees/${clientId}`;
  const UPDATE_PAYROLL_API_URL = `http://localhost:5000/api/attendancesummary/updatePayroll/${clientId}`;

  // Dynamic Salary API URL with month parameter
  const getSalaryApiUrl = (month) => {
    return month
      ? `http://localhost:5000/api/attendancesummary/getsalaries/${clientId}?month=${month}`
      : `http://localhost:5000/api/attendancesummary/getsalaries/${clientId}`;
  };

  // Get days in month (handles February correctly)
  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return new Date().getDate();
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // Check if employee was employed during selected month
  const wasEmployeeEmployedInMonth = (employee, monthStr) => {
    if (!monthStr || !employee.joiningDate) return true;

    const [year, month] = monthStr.split('-').map(Number);
    const joiningDate = new Date(employee.joiningDate);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth() + 1;

    // Employee joined after this month
    if (joiningYear > year || (joiningYear === year && joiningMonth > month)) {
      return false;
    }

    return true;
  };

  // Check if selected month is current month
  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    return year === currentYear && monthNum === currentMonth;
  };

  // Check if month is in the past (historical month)
  const isHistoricalMonth = (month) => {
    if (!month) return false;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    if (year < currentYear) return true;
    if (year === currentYear && monthNum < currentMonth) return true;
    return false;
  };

  // Function to check if week-off should be included in salary calculation
  const shouldIncludeWeekOffInSalary = (month) => {
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      return currentDay >= 26;
    }
    return true;
  };

  // Function to check if payslip download is allowed (handles February correctly)
  const isPayslipDownloadAllowed = (month) => {
    if (!month) return false;

    if (isHistoricalMonth(month)) return true;

    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = getDaysInMonth(month);

      // Allow download on or after the last day of month
      return currentDay >= daysInMonth;
    }

    return true;
  };

  // Process leaves data - ONLY FOR SELECTED MONTH
  const processLeavesData = useCallback((leavesData, selectedMonth) => {
    const leavesMap = {};
    const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      // Check if leave overlaps with selected month
      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));

      if (overlapStart <= overlapEnd) {
        if (!leavesMap[employeeId]) {
          leavesMap[employeeId] = {
            CL: 0,
            EL: 0,
            COFF: 0,
            LOP: 0,
            Other: 0,
            leaveDetails: []
          };
        }

        const leaveType = leave.leaveType || 'Other';
        const diffTime = Math.abs(overlapEnd - overlapStart);
        const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (leavesMap[employeeId][leaveType] !== undefined) {
          leavesMap[employeeId][leaveType] += duration;
        } else if (["Casual Leave", "Earned Leave", "Comp Off"].includes(leaveType)) {
          const typeMap = { "Casual Leave": "CL", "Earned Leave": "EL", "Comp Off": "COFF" };
          leavesMap[employeeId][typeMap[leaveType]] += duration;
        } else {
          leavesMap[employeeId].Other += duration;
        }

        leavesMap[employeeId].leaveDetails.push({
          type: leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: duration,
          reason: leave.reason || '',
          status: leave.status || 'pending'
        });
      }
    });

    setEmployeeLeaves(leavesMap);
    console.log("🍃 Processed leaves for month:", selectedMonth, Object.keys(leavesMap).length, "employees");
  }, []);

  // ✅ Filter inactive employees from payroll data
  const filterInactiveEmployees = useCallback((payrollData, employeesMap) => {
    if (!Array.isArray(payrollData)) return [];
    return payrollData.filter(item => {
      const employeeData = employeesMap[item.employeeId];
      if (!employeeData) return false;
      return !isEmployeeHidden(employeeData);
    });
  }, []);

  // Filter employees who were employed during selected month
  const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
    if (!monthStr || !employees.length) return employees;

    return employees.filter(emp => {
      return wasEmployeeEmployedInMonth(emp, monthStr);
    });
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

  // Fetch data with cleanup
  const fetchData = useCallback(async (month = "") => {
    if (!clientId) {
      setError("Client ID not found. Please login again.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    try {
      setLoading(true);
      setError("");
      console.log("📥 Fetching payroll data for month:", month || "Current Month");

      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const daysInMonthValue = getDaysInMonth(month || new Date().toISOString().slice(0, 7));

      console.log(`📅 Month analysis: ${month || "current"} | Historical: ${isHistorical} | Current: ${isCurrent} | Days in month: ${daysInMonthValue}`);

      // STEP 0 → Fetch Attendance Summary Data First (with month filter)
      let summaryData = [];
      let summaryUrl = ATTENDANCE_SUMMARY_API_URL;
      if (month) {
        summaryUrl += `?month=${month}`;
      }

      try {
        const summaryRes = await fetch(summaryUrl);
        if (summaryRes.ok && isMounted) {
          const json = await summaryRes.json();
          summaryData = json.summary || [];
          console.log(`📘 Summary API for ${month || "current month"}:`, summaryData.length, "records");
        }
      } catch (e) {
        console.warn("⚠️ Summary API Error:", e.message);
      }

      // STEP 1 → Salary API (with month filter)
      let salaryData = { success: false, salaries: [], monthDays: daysInMonthValue };
      try {
        const salaryUrl = getSalaryApiUrl(month);
        console.log("💰 Fetching salary from:", salaryUrl);
        const salaryRes = await fetch(salaryUrl);
        if (salaryRes.ok && isMounted) {
          salaryData = await salaryRes.json();
          console.log(`💰 Salary API for ${month || "current month"}:`, salaryData.salaries?.length || 0, "salaries");

          const apiMonthDays = salaryData.monthDays || daysInMonthValue;
          if (isMounted) {
            setMonthDays(apiMonthDays);
            console.log(`📅 Month Days set to: ${apiMonthDays}`);
          }
        }
      } catch (err) {
        console.warn("⚠️ Salary API error:", err.message);
      }

      // STEP 2 → Fetch employees + APPROVED LEAVES
      const [employeesRes, leavesRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL).catch(() => ({ ok: false })),
        fetch(LEAVES_API_URL).catch(() => ({ ok: false }))
      ]);

      let employeesData = employeesRes.ok ? await employeesRes.json() : [];
      let leavesData = leavesRes.ok ? await leavesRes.json() : [];

      // Handle employees data structure
      if (!Array.isArray(employeesData)) {
        employeesData = employeesData.employees || employeesData.data || employeesData.result || [];
      }

      // Handle leaves data structure
      if (!Array.isArray(leavesData)) {
        leavesData = leavesData.leaves || leavesData.data || leavesData.result || [];
      }

      console.log("✅ Approved Leaves from API:", leavesData.length);

      // Filter employees by joining date for the selected month
      const employeesForMonth = filterEmployeesByJoiningDate(employeesData, month);

      // EMPLOYEES MAP
      const employeesMap = {};

      // ✅ Store all employees
      if (isMounted) {
        setAllEmployees(employeesData);
      }

      // ✅ Filter out inactive employees for display
      const activeEmployees = employeesForMonth.filter(emp => !isEmployeeHidden(emp));

      // Extract unique departments and designations
      extractUniqueValues(activeEmployees);

      activeEmployees.forEach(emp => {
        employeesMap[emp.employeeId] = {
          salaryPerMonth: emp.salaryPerMonth || 0,
          shiftHours: emp.shiftHours || 8,
          weekOffPerMonth: emp.weekOffPerMonth || 0,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || '',
          designation: emp.role || emp.designation || '',
          joiningDate: emp.joinDate || emp.joiningDate || '',
          bankAccount: emp.bankAccount || '',
          panCard: emp.panCard || '',
          weekOffDay: emp.weekOffDay || '',
          weekOffType: emp.weekOffType || '0+4',
          status: emp.status || 'active'
        };
      });

      if (isMounted) {
        setEmployeesMasterData(employeesMap);
      }

      // === MERGE SALARY + SUMMARY DATA ===
      let processedSalaries = [];

      if (salaryData.success && salaryData.salaries.length > 0) {
        processedSalaries = salaryData.salaries.map(emp => {
          const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

          const actualWeekOffDays = summary.weekOffPerMonth ?? emp.weekOffs ?? 0;

          let calculatedSalary = emp.calculatedSalary || 0;

          if (!includeWeekOffInSalary && calculatedSalary > 0) {
            const employeeData = employeesMap[emp.employeeId];
            const daysInMonthCalc = salaryData.monthDays || daysInMonthValue;
            const dailyRate = employeeData?.salaryPerMonth / daysInMonthCalc || 0;
            const weekOffAmount = actualWeekOffDays * dailyRate;
            calculatedSalary = Math.max(0, calculatedSalary - weekOffAmount);
          }

          // Add department and designation from employee data
          const employeeData = employeesMap[emp.employeeId] || {};

          return {
            ...emp,
            presentDays: summary.presentDays ?? emp.presentDays ?? 0,
            workingDays: emp.totalWorkingDays || 0,
            totalWorkingDays: emp.totalWorkingDays || 0,
            halfDayWorking: summary.halfDayWorking ?? emp.halfDayWorking ?? 0,
            fullDayNotWorking: summary.fullDayNotWorking ?? emp.fullDayNotWorking ?? 0,
            onsiteDays: summary.onsiteDays ?? 0,
            lateDays: summary.lateDays ?? 0,
            fullDayLeaves: summary.fullDayLeaves ?? 0,
            halfDayLeaves: summary.halfDayLeaves ?? 0,
            weekOffs: actualWeekOffDays,
            month: salaryData.month || month || emp.month || "Not specified",
            salaryPerDay: emp.salaryPerDay || 0,
            calculatedSalary: calculatedSalary,
            monthDays: salaryData.monthDays || daysInMonthValue,
            includeWeekOffInSalary: includeWeekOffInSalary,
            isHistoricalMonth: isHistorical,
            isCurrentMonth: isCurrent,
            department: employeeData.department || 'N/A',
            designation: employeeData.designation || 'N/A'
          };
        });
      } else {
        // Salary API fail → fallback to employees only
        processedSalaries = activeEmployees.map(emp => {
          const employeeData = employeesMap[emp.employeeId];
          const actualWeekOffDays = emp.weekOffPerMonth || 0;
          const dailyRate = employeeData?.salaryPerMonth / daysInMonthValue || 0;

          let calculatedSalary = 0;
          if (employeeData?.salaryPerMonth) {
            const paidDays = (emp.totalWorkingDays || 0) + (emp.halfDayWorking || 0) * 0.5;
            const totalPaidDays = includeWeekOffInSalary ? paidDays + actualWeekOffDays : paidDays;
            calculatedSalary = (totalPaidDays * dailyRate);
          }

          return {
            employeeId: emp.employeeId,
            name: emp.name,
            presentDays: 0,
            workingDays: 0,
            totalWorkingDays: 0,
            halfDayWorking: 0,
            fullDayNotWorking: 0,
            calculatedSalary: calculatedSalary,
            salaryPerMonth: emp.salaryPerMonth || 0,
            salaryPerDay: dailyRate,
            weekOffs: actualWeekOffDays,
            totalLeaves: 0,
            leaveTypes: {},
            month: month || "No Month",
            monthDays: daysInMonthValue,
            includeWeekOffInSalary: includeWeekOffInSalary,
            isHistoricalMonth: isHistorical,
            isCurrentMonth: isCurrent,
            status: emp.status || 'active',
            department: employeeData?.department || 'N/A',
            designation: employeeData?.designation || 'N/A'
          };
        });
      }

      // ✅ Filter out inactive employees from processed salaries
      const activeProcessedSalaries = filterInactiveEmployees(processedSalaries, employeesMap);

      if (isMounted) {
        setRecords(activeProcessedSalaries);
        setFilteredRecords(activeProcessedSalaries);
      }

      if (leavesData.length > 0 && isMounted) {
        processLeavesData(leavesData, month);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      if (isMounted) {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, processLeavesData, filterInactiveEmployees, filterEmployeesByJoiningDate]);

  useEffect(() => {
    if (clientId) {
      const cleanup = fetchData(selectedMonth);
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [clientId, fetchData, selectedMonth]);

  // Filter records based on search, department, designation, and date range
  useEffect(() => {
    let filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );

    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(record => record.department === filterDepartment);
    }

    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(record => record.designation === filterDesignation);
    }

    // Filter by Date Range (fromDate to toDate)
    if (fromDate && toDate) {
      // This is for the selected month, but we're showing monthly data
      // For date range filtering, we would need daily data
      // For now, just show a message or filter based on month
      console.log("Date range selected:", fromDate, "to", toDate);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterDesignation, records, fromDate, toDate]);

  // Handle month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate(""); // Reset date filters when month changes
    setToDate("");
    if (month) {
      fetchData(month);
    } else {
      fetchData();
    }
  };

  // Handle date range filter
  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    // Extract month from dates
    const fromMonth = fromDate.slice(0, 7);
    const toMonth = toDate.slice(0, 7);

    if (fromMonth !== toMonth) {
      alert("Date range must be within the same month");
      return;
    }

    // Set the month and fetch data
    setSelectedMonth(fromMonth);
    fetchData(fromMonth);

    // Apply date range filter logic here
    // This would require daily attendance data
    console.log("Filtering from", fromDate, "to", toDate);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
    fetchData(currentMonth);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  // Calculate salary using backend data
  const calculateSalary = (employee) => {
    return employee.calculatedSalary || 0;
  };

  // Calculate daily rate
  const calculateDailyRate = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    if (!employeeData || !employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) return 0;
    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    return (employeeData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  // Get employee master data
  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: employee.designation || '',
      department: employee.department || '',
      joiningDate: '',
      bankAccount: '',
      employeeId: employee.employeeId,
      weekOffDay: '',
      weekOffType: '0+4',
      status: employee.status || 'active'
    };
  };

  // Get actual week-off days for display
  const getWeekOffDaysForDisplay = (employee) => {
    return employee.weekOffs || 0;
  };

  // Get week-off days for salary calculation
  const getWeekOffDaysForSalary = (employee) => {
    return shouldIncludeWeekOffInSalary(employee.month || selectedMonth) ? (employee.weekOffs || 0) : 0;
  };

  const calculateHolidays = (employee) => {
    return 0;
  };

  // Handle week off configuration
  const handleWeekOffChange = async (employeeId, weekOffDay, weekOffType, manualDays = "") => {
    if (!weekOffDay || !weekOffType) return;

    try {
      const requestBody = {
        employeeId,
        weekOffDay,
        weekOffType,
        clientId
      };

      if (weekOffType === 'manual' && manualDays) {
        requestBody.weekOffPerMonth = parseInt(manualDays);
      }

      const response = await fetch(`http://localhost:5000/api/attendancesummary/updateWeekOffConfig/${clientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const updatedEmpData = {
          ...employeesMasterData[employeeId],
          weekOffDay,
          weekOffPerMonth: result.config.weekOffPerMonth,
          weekOffType: result.config.weekOffType
        };

        setEmployeesMasterData(prev => ({
          ...prev,
          [employeeId]: updatedEmpData
        }));

        console.log(`✅ Week off updated for ${employeeId}: ${weekOffDay}, type: ${weekOffType}`);

        setTimeout(() => {
          fetchData(selectedMonth);
          console.log("🔄 Refreshing data after week-off update");
        }, 1000);

      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating week off:', error);
      alert('Failed to update week off');
    }
  };

  // Handle attendance row click
  const handleAttendanceRowClick = async (employee) => {
    setSelectedEmployee(employee);
    setShowAttendanceModal(true);
    await fetchAttendanceDetails(employee.employeeId);
  };

  const fetchAttendanceDetails = async (employeeId) => {
    try {
      let url = ATTENDANCE_DETAILS_API_URL;
      if (selectedMonth) {
        url += `?month=${selectedMonth}&employeeId=${employeeId}`;
      } else {
        url += `?employeeId=${employeeId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const sortedRecords = data.records.sort((a, b) =>
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        setEmployeeAttendanceDetails(sortedRecords);
      } else {
        setEmployeeAttendanceDetails([]);
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      setEmployeeAttendanceDetails([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Handle edit
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
    const holidays = calculateHolidays(employee);

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays: weekOffDaysForSalary,
      holidays: holidays,
      CL: leaves.CL,
      EL: leaves.EL,
      COFF: leaves.COFF,
      LOP: leaves.LOP,
      dailyRate: calculateDailyRate(employee)
    });

    setExtraWorkData({
      extraDays: employee.extraWork?.extraDays || 0,
      extraHours: employee.extraWork?.extraHours || 0,
      overtimeRate: 0,
      bonus: employee.extraWork?.bonus || 0,
      deductions: employee.extraWork?.deductions || 0,
      reason: employee.extraWork?.reason || ""
    });

    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || getWeekOffDaysForSalary(selectedEmployee);
    const holidays = editFormData.holidays || calculateHolidays(selectedEmployee);
    const unpaidLeaves = leaves.LOP;

    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = editFormData.workingDays || 0;
    const halfDays = editFormData.halfDayWorking || 0;
    const effectiveWorkingDays = workingDays + (0.5 * halfDays);

    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const paidDays = Math.max(0, effectiveWorkingDays + weekOffDays + paidLeaveDays);
    const baseSalary = paidDays * dailyRate;

    const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
    const bonus = extraWorkData.bonus || 0;
    const deductions = extraWorkData.deductions || 0;
    const totalExtraAmount = extraDaysAmount + bonus - deductions;
    const finalSalary = baseSalary + totalExtraAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      extraWork: {
        extraDays: extraWorkData.extraDays || 0,
        extraHours: extraWorkData.extraHours || 0,
        overtimeRate: 0,
        overtimeAmount: 0,
        bonus: bonus,
        deductions: deductions,
        totalExtraAmount: totalExtraAmount,
        reason: extraWorkData.reason || ""
      }
    };

    try {
      const response = await fetch(UPDATE_PAYROLL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.employeeId,
          month: selectedEmployee.month || selectedMonth,
          calculatedSalary: Math.round(finalSalary),
          extraWork: updatedData.extraWork,
          presentDays: editFormData.presentDays,
          workingDays: editFormData.workingDays,
          halfDayWorking: editFormData.halfDayWorking,
          fullDayNotWorking: editFormData.fullDayNotWorking,
          weekOffDays: weekOffDays,
          holidays: holidays
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const result = await response.json();

      const updatedRecords = records.map(record => {
        if (record.employeeId === selectedEmployee.employeeId) {
          const serverSummary = result.summary;
          return {
            ...record,
            ...updatedData,
            extraWork: serverSummary.extraWork || updatedData.extraWork,
            calculatedSalary: serverSummary.calculatedSalary || updatedData.calculatedSalary,
            presentDays: serverSummary.presentDays ?? record.presentDays,
            totalWorkingDays: serverSummary.totalWorkingDays ?? record.totalWorkingDays
          };
        }
        return record;
      });

      setRecords(updatedRecords);
      setFilteredRecords(prev => prev.map(r =>
        r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
      ));

      setShowEditModal(false);
      alert("Salary details updated & synced successfully!");

    } catch (error) {
      console.error("Error saving payroll:", error);
      alert("Failed to save payroll changes: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleExtraWorkChange = (e) => {
    const { name, value } = e.target;
    setExtraWorkData(prev => ({
      ...prev,
      [name]: name === 'reason' ? value : (parseFloat(value) || 0)
    }));
  };

  // Reset to Actual
  const handleReset = () => {
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = getWeekOffDaysForSalary(selectedEmployee);

    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = selectedEmployee.totalWorkingDays || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);
    const paidDays = Math.max(0, workingDays + weekOffDays + paidLeaveDays);

    const systemCalculatedSalary = Math.round(paidDays * dailyRate);

    setEditFormData({
      ...editFormData,
      calculatedSalary: systemCalculatedSalary,
      weekOffDays: weekOffDays,
    });

    setExtraWorkData({
      extraDays: 0,
      extraHours: 0,
      overtimeRate: 0,
      bonus: 0,
      deductions: 0,
      reason: "Reset to system calculation"
    });

    alert("Values reset to system calculation. Click 'Save Changes' to apply.");
  };

  // Handle view
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Download invoice
  const downloadInvoice = async (employee) => {
    const employeeMonth = employee.month || selectedMonth;

    const allowed = isPayslipDownloadAllowed(employeeMonth);

    if (!allowed) {
      const daysInMonth = getDaysInMonth(employeeMonth);
      alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
      return;
    }

    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();

      try {
        const adminName = localStorage.getItem("adminName") || "Admin";
        const adminId = localStorage.getItem("adminId") || "admin";
        const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

        console.log("Logging payslip download:", {
          adminName,
          adminId,
          adminEmail,
          employee: employee.name
        });

        const response = await axios.post("http://localhost:5000/user-activity/log", {
          userId: adminId,
          userName: adminName,
          userEmail: adminEmail,
          userRole: "admin",
          action: "payslip_download",
          actionDetails: `Downloaded payslip for ${employee.name} (${employee.employeeId}) - ${formatMonthDisplay(employee.month || selectedMonth)}`,
          metadata: {
            employeeId: employee.employeeId,
            employeeName: employee.name,
            month: employee.month || selectedMonth,
            salary: employee.calculatedSalary
          }
        });

        console.log("✅ Payslip download logged successfully:", response.data);
      } catch (error) {
        console.error("❌ Failed to log payslip download:", error.response?.data || error.message);
      }
    }
  };

  // Generate invoice HTML
  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);

    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; text-align: center; }
            .error { color: red; font-size: 18px; margin-top: 100px; border: 1px solid red; padding: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Salary Data Not Available</h2>
            <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
            <p>Please contact HR department.</p>
          </div>
        </body>
        </html>
      `;
    }

    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    const totalMonthDays = daysInMonth;
    const dailyRate = calculateDailyRate(employee);
    const dailyRateNumber = parseFloat(dailyRate) || 0;
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };

    const actualWeekOffDays = getWeekOffDaysForDisplay(employee);
    const weekOffDaysForSalary = getWeekOffDaysForSalary(employee);
    const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(employee.month || selectedMonth);
    const isHistorical = isHistoricalMonth(employee.month || selectedMonth);
    const isCurrent = isCurrentMonth(employee.month || selectedMonth);

    const presentDays = employee.workingDays ?? employee.presentDays ?? 0;
    const halfDays = employee.halfDayWorking || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);

    const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDaysForSalary + paidLeaveDays;

    const halfDayDeductionDays = halfDays * 0.5;
    const halfDayDeductionAmount = halfDayDeductionDays * dailyRateNumber;

    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);

    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRateNumber;
    const totalEarnings = grossSalary + bonus + extraDaysPay;

    const otherDeductions = employee.extraWork?.deductions || 0;

    const netPay = employee.calculatedSalary || (totalEarnings - (halfDayDeductionAmount + (lopDays * dailyRateNumber) + otherDeductions));

    const lopAmount = Math.max(0, totalEarnings - netPay - halfDayDeductionAmount - otherDeductions);

    const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;

    const hasExtraWork = employee.extraWork && (
      (employee.extraWork.extraDays || 0) > 0 ||
      (employee.extraWork.bonus || 0) > 0 ||
      (employee.extraWork.deductions || 0) > 0
    );

    return `
        <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
                <title>Payslip - ${employee.name}</title>
                <style>
                  @page {size: A4; margin: 0; }
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #000;
                  }
                  .invoice-container {
                    width: 100%;
                    max-width: 210mm;
                    margin: 0 auto;
                    border: 1px solid #000; 
                  }
                  table {width: 100%; border-collapse: collapse; }
                  th, td {
                    padding: 4px 8px;
                    border: 1px solid #000;
                    font-size: 12px;
                    vertical-align: middle;
                  }
                  .header-cell {border: none; padding: 2px 2px; text-align: center; border-bottom: 1px solid #000; }
                  .section-header {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    text-align: center;
                    text-transform: uppercase;
                  }
                  .amount-col {text-align: right; width: 15%; }
                  .label-col {text-align: left; width: 35%; }
                  .notes-box {
                    margin: 10px;
                    padding: 5px;
                    border: 1px dashed #666;
                    font-size: 11px;
                    background-color: #fafafa;
                  }
                </style>
            </head>
            <body>
              <div class="invoice-container">

                <!-- MAIN LAYOUT TABLE -->
                <table>

                  <!-- HEADER -->
                  <tr>
                    <td colspan="4" class="header-cell">
                      <div style="text-align: center; margin-bottom: 2px;">
                        <span style="font-size: 18px; font-weight: bold; text-decoration: underline; text-underline-offset: 3px; display: inline-block;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
                        <br>
                          <span style="font-size: 11px; color: #666;">
                            ${isHistorical ? 'Historical Month - Full Salary' : isCurrent ? 'Current Month' : 'Future Month'}
                          </span>
                      </div>
                    </td>
                  </tr>

                  <!-- EMPLOYEE DETAILS -->
                  <tr style="background-color: #fafafa;">
                    <td width="20%"><strong>ID</strong></td>
                    <td width="30%">${employee.employeeId}</td>
                    <td width="20%"><strong>Joined</strong></td>
                    <td width="30%">${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Name</strong></td>
                    <td>${employee.name}</td>
                    <td><strong>Department</strong></td>
                    <td>${employeeData.department || employee.department || '-'}</td>
                  </tr>
                  <tr style="background-color: #fafafa;">
                    <td><strong>Designation</strong></td>
                    <td>${employeeData.designation || employee.designation || '-'}</td>
                    <td><strong>Month</strong></td>
                    <td>${formatMonthDisplay(employee.month || selectedMonth)}</td>
                  </tr>
                  <tr>
                    <td><strong>Invoice Date</strong></td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td><strong>Total Days</strong></td>
                    <td>${totalMonthDays} Days</td>
                  </tr>

                  <!-- SALARY BREAKDOWN HEADER -->
                  <tr class="section-header">
                    <td colspan="2">EARNINGS</td>
                    <td colspan="2">DEDUCTIONS</td>
                  </tr>

                  <!-- SALARY CONTENT Row 1 -->
                  <tr>
                    <td class="label-col">Basic Salary</td>
                    <td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
                    <td class="label-col">LOP / Absent (${lopDays} days)</td>
                    <td class="amount-col" style="color:red;">
                      ${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}
                    </td>
                  </tr>

                  <!-- ROW 2: Days Info -->
                  <tr>
                    <td class="label-col">Working Days (Full: ${presentDays})</td>
                    <td class="amount-col">-</td>
                    <td class="label-col">Half Day Deductions (${halfDays} HD)</td>
                    <td class="amount-col" style="color:red;">
                      ${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}
                    </td>
                  </tr>

                  <!-- ROW 3: Week Offs -->
                  <tr>
                    <td class="label-col">Week Off Days (${actualWeekOffDays})</td>
                    <td class="amount-col">-</td>
                    <td class="label-col">Other Deductions</td>
                    <td class="amount-col" style="color:red;">
                      ${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}
                    </td>
                  </tr>

                  <!-- ROW 4: Extra / Bonus -->
                  <tr>
                    <td class="label-col">Bonus / Extra</td>
                    <td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
                    <td class="label-col"></td>
                    <td class="amount-col"></td>
                  </tr>

                  <!-- TOTALS ROW -->
                  <tr style="font-weight: bold; background-color: #f0f0f0;">
                    <td class="label-col">Gross Earnings</td>
                    <td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
                    <td class="label-col">Total Deductions</td>
                    <td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
                  </tr>

                  <!-- NET PAY ROW -->
                  <tr style="font-weight: bold; background-color: #e0eee0; font-size: 14px;">
                    <td class="label-col" colspan="2" style="text-align: right; padding-right: 20px;">NET PAY</td>
                    <td class="amount-col" colspan="2" style="text-align: left; padding-left: 20px;">₹${Math.round(netPay).toFixed(2)}</td>
                  </tr>

                  <!-- NOTES SECTION IF EXISTS -->
                  ${hasExtraWork && employee.extraWork.reason ? `
            <tr>
              <td colspan="4" style="border: none; padding: 10px;">
                <div class="notes-box">
                  <strong>Adjustments Note:</strong> ${employee.extraWork.reason}
                </div>
              </td>
            </tr>
            ` : ''}

                </table>

                <div style="text-align: center; font-size: 10px; margin-top: 10px;">
                  This is a computer-generated document.
                </div>

              </div>
            </body>
          </html>
      `;
  };

  // Get leave types for display
  const getLeaveTypes = (employee) => {
    if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
      const leaveStrings = [];
      Object.entries(employee.leaveTypes).forEach(([type, count]) => {
        if (count > 0) {
          leaveStrings.push(`${type.toUpperCase()}: ${count} `);
        }
      });
      if (leaveStrings.length > 0) return leaveStrings.join(', ');
    }

    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];

    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);

    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  // Format month display
  const formatMonthDisplay = (month) => {
    if (!month) return "Current Month";
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

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
            Showing payroll for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Month: {formatMonthDisplay(selectedMonth)}
        </span>
      </div>
    </div>
  );

  if (!clientId) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg text-red-600">Client ID not found. Please login again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading payroll data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-9xl">
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => fetchData(selectedMonth)}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Client Info Banner */}
        <ClientInfoBanner />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4">
          {/* Active Employees */}
          <div className="px-2 py-2 bg-white border-t-4 border-blue-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-center  text-xs font-medium text-gray-700">
                  Active Employees: {filteredRecords.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Salary */}
          <div className="px-2 py-2 bg-white border-t-4 border-green-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <center> <p className="text-center text-xs font-medium text-gray-700">
                  Total Salary: ₹{filteredRecords.reduce((s, e) => s + (e.calculatedSalary || 0), 0).toLocaleString()}
                </p></center>
              </div>
            </div>
          </div>

          {/* Active This Month */}
          <div className="px-2 py-2 bg-white border-t-4 border-purple-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-center text-xs font-medium text-gray-700">
                  Active This Month: {filteredRecords.filter(e => (e.totalWorkingDays || 0) > 0).length}
                </p>
              </div>
            </div>
          </div>

          {/* On Leave */}
          <div className="px-2 py-2 bg-white border-t-4 border-red-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-center text-xs font-medium text-gray-700">
                  On Leave: {filteredRecords.filter(emp => {
                    const leaves = employeeLeaves[emp.employeeId];
                    return leaves && (leaves.CL + leaves.EL + leaves.COFF + leaves.LOP) > 0;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

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

            {/* From Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (e.target.value && toDate) {
                    handleDateRangeFilter();
                  }
                }}
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
                onChange={(e) => {
                  setToDate(e.target.value);
                  if (fromDate && e.target.value) {
                    handleDateRangeFilter();
                  }
                }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Apply Date Range Button */}
            <button
              onClick={handleDateRangeFilter}
              disabled={!fromDate || !toDate}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Date Range
            </button>

            {/* Current Month Button */}
            <button
              onClick={() => {
                const currentMonth = new Date().toISOString().slice(0, 7);
                setSelectedMonth(currentMonth);
                fetchData(currentMonth);
              }}
              className="h-8 px-3 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Current
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchData(selectedMonth)}
              disabled={isLoadingMonth}
              className="h-8 px-3 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoadingMonth ? "⟳" : "⟳ Refresh"}
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Payroll Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">Employee ID</th>
                  <th className="py-2 text-center">Name</th>
                  <th className="py-2 text-center">Department</th>
                  <th className="py-2 text-center">Designation</th>
                  <th className="py-2 text-center">Working Days</th>
                  <th className="py-2 text-center">Present Days</th>
                  <th className="py-2 text-center">Half Days</th>
                  <th className="py-2 text-center">Week Offs</th>
                  <th className="py-2 text-center">Monthly Salary</th>
                  <th className="py-2 text-center">Calculated Salary</th>
                  <th className="py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.map((item, index) => (
                  <tr
                    key={item.employeeId}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap ">{item.employeeId}</td>
                    <td className="px-2 py-2 text-center">
                      <div className="px-2 py-2 text-center">
                        <div>
                          <div className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">
                      {item.department}
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600">
                      {item.designation}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="px-2 py-2 font-medium text-center text-blue-800 bg-blue-100 rounded">
                        {item.totalWorkingDays || 0}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="px-2 py-2 font-medium text-center text-green-800 bg-green-100 rounded">
                        {item.presentDays || 0}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="px-2 py-2 font-medium text-center text-yellow-800 bg-yellow-100 rounded">
                        {item.halfDayWorking || 0}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-2 font-medium text-center text-purple-800 bg-purple-100 rounded">
                            {getWeekOffDaysForDisplay(item)} days
                          </span>
                          {employeesMasterData[item.employeeId]?.weekOffType && (
                            <span className="text-xs text-gray-500">({employeesMasterData[item.employeeId]?.weekOffType})</span>
                          )}
                        </div>
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                          value={employeesMasterData[item.employeeId]?.weekOffType || ""}
                          onChange={(e) => {
                            const weekOffType = e.target.value;
                            const weekOffDay = employeesMasterData[item.employeeId]?.weekOffDay || "Sunday";
                            if (weekOffType === 'manual') {
                              const manualDays = prompt("Enter total week-off days:");
                              if (manualDays && !isNaN(manualDays)) handleWeekOffChange(item.employeeId, weekOffDay, weekOffType, manualDays);
                            } else {
                              handleWeekOffChange(item.employeeId, weekOffDay, weekOffType);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="0+2">0+2 (2 days)</option>
                          <option value="0+4">0+4 (4 days)</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-2 py-2 font-medium text-center text-gray-900">
                      ₹{(item.salaryPerMonth || 0).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Daily: ₹{calculateDailyRate(item)}</div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="px-2 py-2 text-center text-blue-600 transition duration-150 rounded-md hover:bg-blue-50"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-2 text-center text-green-600 transition duration-150 rounded-md hover:bg-green-50"
                          title="Edit Salary"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => downloadInvoice(item)}
                          className={`px-2 py-2 text-center rounded-md transition duration-150 ${isPayslipDownloadAllowed(item.month || selectedMonth)
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                            }`}
                          title={isPayslipDownloadAllowed(item.month || selectedMonth)
                            ? "Download Payslip"
                            : item.isHistoricalMonth
                              ? "Download Payslip (Historical Month)"
                              : `Payslip download available only on or after the last day of the month (${getDaysInMonth(item.month || selectedMonth)}th)`}
                          disabled={!isPayslipDownloadAllowed(item.month || selectedMonth)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination with Show Entries Dropdown */}
          {filteredRecords.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
              {/* Show entries dropdown */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Show:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="p-2 text-sm border rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
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
                  onClick={handleNext}
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

          {filteredRecords.length === 0 && !loading && (
            <div className="py-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterDepartment || filterDesignation ? 'Try clearing filters' : 'No payroll data available for active employees'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
              <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0">
                <span className="text-lg font-semibold text-blue-800">
                  {selectedEmployee.name?.charAt(0) || 'E'}
                </span>
              </div>

              {/* Employee Info */}
              <div className="flex flex-col flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedEmployee.name}
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department}</p>
                  <p><span className="font-medium text-gray-700">Designation:</span> {selectedEmployee.designation}</p>
                  <p>
                    <span className="font-medium text-gray-700">Month:</span>
                    {selectedEmployee.month || selectedMonth || "Current"}
                    ({selectedEmployee.monthDays || monthDays} days)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 mb-6 text-sm">

              {/* Present Days */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Present Days</span>
                <span className="font-semibold text-green-600">
                  {selectedEmployee.presentDays || 0}
                </span>
              </div>

              {/* Working Days */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Working Days</span>
                <span className="font-semibold text-blue-600">
                  {selectedEmployee.totalWorkingDays || 0}
                </span>
              </div>

              {/* Half Days */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Half Days</span>
                <span className="font-semibold text-yellow-600">
                  {selectedEmployee.halfDayWorking || 0}
                </span>
              </div>

              {/* WeekOff Days */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">WeekOff Days</span>
                <span className="font-semibold text-purple-600">
                  {getWeekOffDaysForDisplay(selectedEmployee)}
                </span>
              </div>

              {/* Month Days */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Month Days</span>
                <span className="font-semibold text-gray-800">
                  {selectedEmployee.monthDays || monthDays}
                </span>
              </div>

              {/* Monthly Salary */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Monthly Salary</span>
                <span className="font-semibold text-blue-600">
                  ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}
                </span>
              </div>

              {/* Daily Rate */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Daily Rate</span>
                <span className="font-semibold text-gray-800">
                  ₹{calculateDailyRate(selectedEmployee)}/day
                </span>
              </div>

              {/* Calculated Salary */}
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Calculated Salary</span>
                <span className="font-semibold text-green-600">
                  ₹{calculateSalary(selectedEmployee)}
                </span>
              </div>

              {/* Approved Leaves */}
              <div className="sm:col-span-2 flex justify-between border-b pb-1">
                <span className="text-gray-600">Approved Leaves</span>
                <span className="font-semibold text-red-600">
                  {getLeaveTypes(selectedEmployee) || "No Approved Leaves"}
                </span>
              </div>

            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => downloadInvoice(selectedEmployee)}
                disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)}
                className={`px-6 py-2 rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Download Payslip
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 text-white transition duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Salary Details - {selectedEmployee.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-700">
                <strong>Month:</strong> {selectedEmployee.month || selectedMonth || "Current Month"} |
                <strong> Days in Month:</strong> {selectedEmployee.monthDays || monthDays} |
                <strong> Monthly Salary:</strong> ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0} |
                <strong> Type:</strong> {selectedEmployee.isHistoricalMonth ? 'Historical Month' : selectedEmployee.isCurrentMonth ? 'Current Month' : 'Future Month'}
              </p>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Present Days</label>
                  <input
                    type="number"
                    name="presentDays"
                    value={editFormData.presentDays || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={selectedEmployee.monthDays || monthDays}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Working Days</label>
                  <input
                    type="number"
                    name="workingDays"
                    value={editFormData.workingDays || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={selectedEmployee.monthDays || monthDays}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Half Days</label>
                  <input
                    type="number"
                    name="halfDayWorking"
                    value={editFormData.halfDayWorking || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Full Day Leaves</label>
                  <input
                    type="number"
                    name="fullDayNotWorking"
                    value={editFormData.fullDayNotWorking || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Daily Rate (₹)</label>
                  <input
                    type="text"
                    value={editFormData.dailyRate || calculateDailyRate(selectedEmployee)}
                    className="w-full p-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Week-off Days</label>
                  <input
                    type="number"
                    name="weekOffDays"
                    value={getWeekOffDaysForDisplay(selectedEmployee)}
                    className="w-full p-3 text-gray-600 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Calculated Salary (₹)</label>
                  <input
                    type="number"
                    name="calculatedSalary"
                    value={editFormData.calculatedSalary || 0}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    min="0"
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Extra Work & Adjustments</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Extra Days</label>
                    <input
                      type="number"
                      name="extraDays"
                      value={extraWorkData.extraDays || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Bonus (₹)</label>
                    <input
                      type="number"
                      name="bonus"
                      value={extraWorkData.bonus || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Deductions (₹)</label>
                    <input
                      type="number"
                      name="deductions"
                      value={extraWorkData.deductions || 0}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
                    <input
                      type="text"
                      name="reason"
                      value={extraWorkData.reason || ""}
                      onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for adjustments..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 mr-auto text-white transition duration-200 bg-yellow-500 rounded-lg hover:bg-yellow-600"
                >
                  Reset to Actual
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-gray-700 transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white transition duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRoll;