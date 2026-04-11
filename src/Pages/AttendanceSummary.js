import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaDownload, FaUserTag } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import "../index.css";

const BASE_URL = "http://localhost:5000/api";

// ✅ DUMMY DATA FOR FALLBACK
const DUMMY_EMPLOYEES = [
  { _id: "dummy_emp_001", employeeId: "EMP001", name: "Rajesh Kumar", department: "IT", role: "Senior Software Engineer", status: "active" },
  { _id: "dummy_emp_002", employeeId: "EMP002", name: "Priya Sharma", department: "HR", role: "HR Manager", status: "active" },
  { _id: "dummy_emp_003", employeeId: "EMP003", name: "Amit Patel", department: "Sales", role: "Sales Executive", status: "active" },
  { _id: "dummy_emp_004", employeeId: "EMP004", name: "Neha Gupta", department: "Marketing", role: "Marketing Specialist", status: "inactive" },
  { _id: "dummy_emp_005", employeeId: "EMP005", name: "Suresh Reddy", department: "Operations", role: "Operations Manager", status: "active" },
  { _id: "dummy_emp_006", employeeId: "EMP006", name: "Anjali Desai", department: "IT", role: "Frontend Developer", status: "active" },
  { _id: "dummy_emp_007", employeeId: "EMP007", name: "Vikram Singh", department: "Finance", role: "Finance Analyst", status: "inactive" },
  { _id: "dummy_emp_008", employeeId: "EMP008", name: "Divya Mehta", department: "Customer Support", role: "Support Lead", status: "active" },
  { _id: "dummy_emp_009", employeeId: "EMP009", name: "Manish Joshi", department: "IT", role: "Backend Developer", status: "active" },
  { _id: "dummy_emp_010", employeeId: "EMP010", name: "Kavita Nair", department: "HR", role: "Recruitment Specialist", status: "active" },
];

const DUMMY_ATTENDANCE_RECORDS = [
  { _id: "dummy_att_001", employeeId: "EMP001", checkInTime: "2024-01-15T09:15:00.000Z", checkOutTime: "2024-01-15T18:30:00.000Z", totalHours: 9.25, reason: "Onsite", comment: "" },
  { _id: "dummy_att_002", employeeId: "EMP001", checkInTime: "2024-01-16T09:45:00.000Z", checkOutTime: "2024-01-16T18:15:00.000Z", totalHours: 8.5, reason: "Onsite", comment: "" },
  { _id: "dummy_att_003", employeeId: "EMP001", checkInTime: "2024-01-17T10:30:00.000Z", checkOutTime: "2024-01-17T19:00:00.000Z", totalHours: 8.5, reason: "Work From Home", comment: "" },
  { _id: "dummy_att_004", employeeId: "EMP002", checkInTime: "2024-01-15T09:30:00.000Z", checkOutTime: "2024-01-15T18:00:00.000Z", totalHours: 8.5, reason: "Onsite", comment: "" },
  { _id: "dummy_att_005", employeeId: "EMP002", checkInTime: "2024-01-16T09:00:00.000Z", checkOutTime: "2024-01-16T17:30:00.000Z", totalHours: 8.5, reason: "Onsite", comment: "" },
  { _id: "dummy_att_006", employeeId: "EMP003", checkInTime: "2024-01-15T09:20:00.000Z", checkOutTime: "2024-01-15T18:45:00.000Z", totalHours: 9.42, reason: "Field Work", comment: "" },
  { _id: "dummy_att_007", employeeId: "EMP003", checkInTime: "2024-01-16T09:50:00.000Z", checkOutTime: "2024-01-16T18:30:00.000Z", totalHours: 8.67, reason: "Onsite", comment: "" },
  { _id: "dummy_att_008", employeeId: "EMP005", checkInTime: "2024-01-15T09:10:00.000Z", checkOutTime: "2024-01-15T18:20:00.000Z", totalHours: 9.17, reason: "Onsite", comment: "" },
  { _id: "dummy_att_009", employeeId: "EMP006", checkInTime: "2024-01-15T10:00:00.000Z", checkOutTime: "2024-01-15T19:00:00.000Z", totalHours: 9.0, reason: "Work From Home", comment: "" },
  { _id: "dummy_att_010", employeeId: "EMP008", checkInTime: "2024-01-15T09:25:00.000Z", checkOutTime: "2024-01-15T18:15:00.000Z", totalHours: 8.83, reason: "Onsite", comment: "" },
];

const DUMMY_MASTER_SHIFTS = [
  { shiftType: "A", shiftName: "Morning Shift", timeSlots: [{ timeRange: "09:00 - 18:00", description: "Regular morning shift" }] },
  { shiftType: "B", shiftName: "Evening Shift", timeSlots: [{ timeRange: "14:00 - 23:00", description: "Evening shift" }] },
  { shiftType: "D", shiftName: "Day Shift", timeSlots: [{ timeRange: "10:00 - 19:00", description: "Day shift" }] },
];

const DUMMY_SHIFT_ASSIGNMENTS = [
  { employeeId: "EMP001", shiftType: "A" },
  { employeeId: "EMP002", shiftType: "A" },
  { employeeId: "EMP003", shiftType: "B" },
  { employeeId: "EMP005", shiftType: "A" },
  { employeeId: "EMP006", shiftType: "D" },
  { employeeId: "EMP008", shiftType: "A" },
];

const DUMMY_SUMMARY = [
  { employeeId: "EMP001", name: "Rajesh Kumar", month: "2024-01", presentDays: 22, halfDayWorking: 0, fullDayNotWorking: 0 },
  { employeeId: "EMP002", name: "Priya Sharma", month: "2024-01", presentDays: 21, halfDayWorking: 1, fullDayNotWorking: 0 },
  { employeeId: "EMP003", name: "Amit Patel", month: "2024-01", presentDays: 20, halfDayWorking: 0, fullDayNotWorking: 2 },
  { employeeId: "EMP005", name: "Suresh Reddy", month: "2024-01", presentDays: 22, halfDayWorking: 0, fullDayNotWorking: 0 },
  { employeeId: "EMP006", name: "Anjali Desai", month: "2024-01", presentDays: 21, halfDayWorking: 1, fullDayNotWorking: 0 },
  { employeeId: "EMP008", name: "Divya Mehta", month: "2024-01", presentDays: 22, halfDayWorking: 0, fullDayNotWorking: 0 },
];

export default function AttendanceSummary() {
  const [editedRows, setEditedRows] = useState({});
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  
  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";
  
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

  const handleHoursChange = (index, value) => {
    const numericValue = parseFloat(value) || 0;
    setEditedRows(prev => ({
      ...prev,
      [index]: { ...prev[index], hours: numericValue, edited: true, timestamp: Date.now() }
    }));
  };

  const handleCommentChange = (index, value) => {
    setEditedRows(prev => ({
      ...prev,
      [index]: { ...prev[index], comment: value, timestamp: Date.now() }
    }));
  };

  const handleReasonChange = (index, value) => {
    setEditedRows(prev => ({
      ...prev,
      [index]: { ...prev[index], reason: value, timestamp: Date.now() }
    }));
  };

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const previousSummaryRef = useRef([]);
  const autoSaveIntervalRef = useRef(null);
  const saveStatusTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const lastSaveTimestampRef = useRef(0);

  // Click outside handlers
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

  const extractUniqueValues = (employeesList) => {
    const depts = new Set();
    const designations = new Set();
    employeesList.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  const loadDummyData = () => {
    console.log("📊 Loading dummy data as fallback");
    setIsUsingDummyData(true);
    const activeEmps = DUMMY_EMPLOYEES.filter(emp => emp.status === 'active');
    setEmployees(activeEmps);
    extractUniqueValues(activeEmps);
    setMasterShifts(DUMMY_MASTER_SHIFTS);
    setShiftsData(DUMMY_SHIFT_ASSIGNMENTS);
    const activeEmpIds = new Set(activeEmps.map(emp => emp.employeeId));
    const filteredAttendance = DUMMY_ATTENDANCE_RECORDS.filter(rec => activeEmpIds.has(rec.employeeId));
    setRecords(filteredAttendance);
    setFilteredRecords(filteredAttendance);
    const filteredSummaryData = DUMMY_SUMMARY.filter(sum => activeEmpIds.has(sum.employeeId));
    setEmployeeSummary(filteredSummaryData);
    previousSummaryRef.current = JSON.parse(JSON.stringify(filteredSummaryData));
    setLoading(false);
  };

  const getEmployeeShift = (employeeId) => {
    if (!Array.isArray(shiftsData) || !Array.isArray(masterShifts)) return null;
    const shiftAssignment = shiftsData.find(s => s?.employeeAssignment?.employeeId === employeeId || s?.employeeId === employeeId);
    if (!shiftAssignment) return null;
    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift?.shiftType === shiftType);
    if (!masterShift) return getDefaultShiftTime(shiftType);
    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5, isBrakeShift: true
      };
    }
    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot?.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return { start: start || "09:00", end: end || "18:00", grace: 5, isBrakeShift: false };
      }
    }
    return getDefaultShiftTime(shiftType);
  };

  const getDefaultShiftTime = (shiftType) => {
    const shiftTimes = {
      "A": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
      "B": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
      "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
      "D": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
      "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
      "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
      "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
      "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
    };
    return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
  };

  const getEmployeeShiftHours = (employeeId) => {
    const shift = getEmployeeShift(employeeId);
    if (!shift) return 9;
    const [startHour, startMinute] = shift.start.split(':').map(Number);
    const [endHour, endMinute] = shift.end.split(':').map(Number);
    return ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
  };

  const calculateDayType = (employeeId, hours) => {
    const numericHours = parseFloat(hours) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    if (shiftHours >= 3 && shiftHours <= 6) {
      if (numericHours >= shiftHours * 0.9) return "full";
      if (numericHours >= shiftHours * 0.5) return "half";
      return "full_leave";
    } else if (shiftHours >= 7 && shiftHours <= 12) {
      if (numericHours >= 8.8) return "full";
      if (numericHours >= 4.5) return "half";
      return "full_leave";
    } else {
      if (numericHours >= shiftHours * 0.9) return "full";
      if (numericHours >= shiftHours * 0.5) return "half";
      return "full_leave";
    }
  };

  const calculateOT = (employeeId, hours) => {
    const h = Number(hours) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    return h > shiftHours ? Number((h - shiftHours).toFixed(2)) : 0;
  };

  const calculateEmployeeOT = (employeeId) => {
    let totalOT = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      const hours = rec.hours || rec.totalHours || 0;
      totalOT += calculateOT(employeeId, hours);
    });
    return totalOT;
  };

  const calculateEmployeeWorkingDays = (employeeId) => {
    let presentDays = 0, halfDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      const hours = rec.hours || rec.totalHours || 0;
      const dayType = calculateDayType(employeeId, hours);
      if (dayType === "full") presentDays++;
      else if (dayType === "half") halfDays++;
    });
    return presentDays + (halfDays * 0.5);
  };

  const calculateEmployeeLateDays = (employeeId) => {
    let lateDays = 0;
    const shift = getEmployeeShift(employeeId);
    if (!shift) return 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.checkInTime) {
        const checkInDateTime = new Date(rec.checkInTime);
        const [hours, minutes] = shift.start.split(':').map(Number);
        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(hours, minutes, 0, 0);
        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
        if (checkInDateTime > graceTime) lateDays++;
      }
    });
    return lateDays;
  };

  const calculateEmployeeOnsiteDays = (employeeId) => {
    let onsiteDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.reason === "Onsite" || rec.reason === "Field Work") onsiteDays++;
    });
    return onsiteDays;
  };

  const calculateEmployeeRemoteDays = (employeeId) => {
    let remoteDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.reason === "Work From Home") remoteDays++;
    });
    return remoteDays;
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.department || '-';
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.role || employee?.designation || '-';
  };

  const downloadSingleEmployeeExcel = async (employeeId) => {
    try {
      const employee = employees.find(emp => emp.employeeId === employeeId);
      if (!employee) { alert("Employee not found"); return; }
      const empSummary = filteredSummary.find(emp => emp.employeeId === employeeId);
      if (!empSummary) { alert("No summary data found"); return; }
      let empAttendance = [...records].filter(rec => rec.employeeId === employeeId);
      if (selectedMonth) {
        empAttendance = empAttendance.filter(r => {
          if (!r.checkInTime) return false;
          return new Date(r.checkInTime).toISOString().slice(0, 7) === selectedMonth;
        });
      }
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        empAttendance = empAttendance.filter(r => {
          if (!r.checkInTime) return false;
          const recordDate = new Date(r.checkInTime);
          return recordDate >= from && recordDate <= to;
        });
      }
      if (empAttendance.length === 0) { alert("No attendance records found"); return; }
      const sortedAttendance = empAttendance.sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime));
      const zip = new JSZip();
      const shift = getEmployeeShift(employeeId);
      const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
      const shiftHours = getEmployeeShiftHours(employeeId);
      
      // Summary Sheet
      const summaryWorkbook = XLSX.utils.book_new();
      const summaryData = [{
        "Employee ID": empSummary.employeeId, "Name": empSummary.name,
        "Department": getEmployeeDepartment(employeeId), "Designation": getEmployeeDesignation(employeeId),
        "Shift Time": shiftInfo, "Shift Hours": shiftHours.toFixed(1),
        "Month": empSummary.month || selectedMonth, "Present Days": empSummary.presentDays,
        "Late Days": calculateEmployeeLateDays(employeeId), "Onsite Days": calculateEmployeeOnsiteDays(employeeId),
        "Half Day": empSummary.halfDayWorking || 0, "Full Day Leave": empSummary.fullDayNotWorking || 0,
        "Over Time": calculateEmployeeOT(employeeId).toFixed(2),
        "Working Days": calculateEmployeeWorkingDays(employeeId).toFixed(1),
        "Total Hours": sortedAttendance.reduce((sum, rec) => sum + (Number(rec.totalHours) || 0), 0).toFixed(2)
      }];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");
      const summaryExcelBuffer = XLSX.write(summaryWorkbook, { bookType: "xlsx", type: "array" });
      let summaryFileName = `${employeeId}_${employee.name}_Summary`;
      if (fromDate && toDate) summaryFileName += `_${fromDate}_to_${toDate}`;
      else if (selectedMonth) summaryFileName += `_${selectedMonth}`;
      summaryFileName += ".xlsx";
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });
      
      // Detail Sheet
      const detailWorkbook = XLSX.utils.book_new();
      const detailData = sortedAttendance.map(rec => {
        const checkIn = new Date(rec.checkInTime);
        const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
        const hours = rec.totalHours || (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");
        return {
          "Date": checkIn.toLocaleDateString("en-IN"), "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
          "Department": getEmployeeDepartment(employeeId), "Designation": getEmployeeDesignation(employeeId),
          "Check-In": formatDate(rec.checkInTime), "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
          "Hours": hours, "Over Time": calculateOT(employeeId, hours).toFixed(2),
          "Day Type": calculateDayType(employeeId, hours), "Reason": rec.reason || "", "Admin Comment": rec.comment || ""
        };
      });
      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(detailWorkbook, detailSheet, "Attendance");
      const detailExcelBuffer = XLSX.write(detailWorkbook, { bookType: "xlsx", type: "array" });
      let detailFileName = `${employeeId}_${employee.name}_Detailed_Attendance`;
      if (fromDate && toDate) detailFileName += `_${fromDate}_to_${toDate}`;
      else if (selectedMonth) detailFileName += `_${selectedMonth}`;
      detailFileName += ".xlsx";
      zip.file(detailFileName, detailExcelBuffer, { binary: true });
      
      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = `${employeeId}_${employee.name}_Attendance_Report`;
      if (fromDate && toDate) zipFileName += `_${fromDate}_to_${toDate}`;
      else if (selectedMonth) zipFileName += `_${selectedMonth}`;
      zipFileName += ".zip";
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded ${employee.name}'s report`);
    } catch (error) {
      console.error(error);
      showSaveStatus("❌ Failed to download report", "error");
    }
  };

  const downloadCombinedExcel = async () => {
    if (filteredSummary.length === 0) { alert("No summary data available"); return; }
    try {
      showSaveStatus("📦 Preparing ZIP file...");
      const zip = new JSZip();
      
      // Combined Summary
      const summaryWorkbook = XLSX.utils.book_new();
      const summaryData = filteredSummary.map(emp => {
        const shift = getEmployeeShift(emp.employeeId);
        const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
        return {
          "Employee ID": emp.employeeId, "Name": emp.name,
          "Department": getEmployeeDepartment(emp.employeeId), "Designation": getEmployeeDesignation(emp.employeeId),
          "Shift Time": shiftInfo, "Shift Hours": getEmployeeShiftHours(emp.employeeId).toFixed(1),
          "Month": emp.month || selectedMonth, "Present Days": emp.presentDays,
          "Late Days": calculateEmployeeLateDays(emp.employeeId), "Onsite Days": calculateEmployeeOnsiteDays(emp.employeeId),
          "Half Day": emp.halfDayWorking || 0, "Full Day": emp.fullDayNotWorking || 0,
          "Over Time": calculateEmployeeOT(emp.employeeId).toFixed(2),
          "Working Days": calculateEmployeeWorkingDays(emp.employeeId).toFixed(1)
        };
      });
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");
      const summaryExcelBuffer = XLSX.write(summaryWorkbook, { bookType: "xlsx", type: "array" });
      let summaryFileName = "All_Employees_Summary";
      if (fromDate && toDate) summaryFileName += `_${fromDate}_to_${toDate}`;
      else if (selectedMonth) summaryFileName += `_${selectedMonth}`;
      summaryFileName += ".xlsx";
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });
      
      // Individual Reports
      let filteredDetails = [...records];
      if (selectedMonth) {
        filteredDetails = filteredDetails.filter(r => r.checkInTime && new Date(r.checkInTime).toISOString().slice(0, 7) === selectedMonth);
      }
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filteredDetails = filteredDetails.filter(r => r.checkInTime && new Date(r.checkInTime) >= from && new Date(r.checkInTime) <= to);
      }
      const employeesFolder = zip.folder("Individual_Reports");
      const uniqueEmployees = [...new Set(filteredDetails.map(r => r.employeeId))];
      for (const empId of uniqueEmployees) {
        const empRecords = filteredDetails.filter(rec => rec.employeeId === empId);
        const employee = employees.find(e => e.employeeId === empId);
        if (empRecords.length === 0) continue;
        const sortedEmpRecords = empRecords.sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime));
        const empWorkbook = XLSX.utils.book_new();
        const detailData = sortedEmpRecords.map(rec => {
          const checkIn = new Date(rec.checkInTime);
          const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
          const hours = rec.totalHours || (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");
          return {
            "Date": checkIn.toLocaleDateString("en-IN"), "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
            "Department": getEmployeeDepartment(empId), "Designation": getEmployeeDesignation(empId),
            "Check-In": formatDate(rec.checkInTime), "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
            "Hours": hours, "Over Time": calculateOT(empId, hours).toFixed(2),
            "Day Type": calculateDayType(empId, hours), "Reason": rec.reason || "", "Admin Comment": rec.comment || ""
          };
        });
        const empSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(empWorkbook, empSheet, "Attendance");
        const empExcelBuffer = XLSX.write(empWorkbook, { bookType: "xlsx", type: "array" });
        let empFileName = `${empId}_${employee?.name || "Employee"}_Attendance`;
        if (fromDate && toDate) empFileName += `_${fromDate}_to_${toDate}`;
        else if (selectedMonth) empFileName += `_${selectedMonth}`;
        empFileName += ".xlsx";
        employeesFolder.file(empFileName, empExcelBuffer, { binary: true });
      }
      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = "Complete_Attendance_Report";
      if (fromDate && toDate) zipFileName += `_${fromDate}_to_${toDate}`;
      else if (selectedMonth) zipFileName += `_${selectedMonth}`;
      zipFileName += ".zip";
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded complete report (${filteredSummary.length} employees)`);
    } catch (error) {
      console.error(error);
      showSaveStatus("❌ Failed to download report", "error");
    }
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setEmployeeDetails([]);
    setEditedRows({});
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      if (!clientId) {
        loadDummyData();
        setLoading(false);
        return;
      }
      
      // Fetch Employees
      const empRes = await fetch(`${BASE_URL}/employees/get-employees/${clientId}`);
      if (!empRes.ok) throw new Error("Failed to fetch employees");
      const empData = await empRes.json();
      let employeesData = [];
      if (Array.isArray(empData)) employeesData = empData;
      else if (empData?.employees) employeesData = empData.employees;
      else if (empData?.data) employeesData = empData.data;
      
      if (!employeesData || employeesData.length === 0) { loadDummyData(); setLoading(false); return; }
      const activeEmployees = employeesData.filter(emp => emp.status !== 'inactive');
      setEmployees(activeEmployees);
      extractUniqueValues(activeEmployees);
      
      // Fetch Shifts
      try {
        const shiftsRes = await fetch(`${BASE_URL}/shifts/master/${clientId}`);
        if (shiftsRes.ok) {
          const shiftsResult = await shiftsRes.json();
          if (shiftsResult.success && shiftsResult.data?.length > 0) setMasterShifts(shiftsResult.data);
          else setMasterShifts(DUMMY_MASTER_SHIFTS);
        } else setMasterShifts(DUMMY_MASTER_SHIFTS);
        
        const assignmentsRes = await fetch(`${BASE_URL}/shifts/assignments/${clientId}`);
        if (assignmentsRes.ok) {
          const assignmentsResult = await assignmentsRes.json();
          if (assignmentsResult.success && assignmentsResult.data?.length > 0) setShiftsData(assignmentsResult.data);
          else setShiftsData(DUMMY_SHIFT_ASSIGNMENTS);
        } else setShiftsData(DUMMY_SHIFT_ASSIGNMENTS);
      } catch (shiftError) {
        setMasterShifts(DUMMY_MASTER_SHIFTS);
        setShiftsData(DUMMY_SHIFT_ASSIGNMENTS);
      }
      
      // Fetch Attendance
      const attRes = await fetch(`${BASE_URL}/attendance/allattendance/${clientId}`);
      if (!attRes.ok) throw new Error("Failed to fetch attendance");
      const attData = await attRes.json();
      let attendanceRecords = [];
      if (Array.isArray(attData)) attendanceRecords = attData;
      else if (attData?.records) attendanceRecords = attData.records;
      else if (attData?.allAttendance) attendanceRecords = attData.allAttendance;
      
      if (!attendanceRecords || attendanceRecords.length === 0) {
        const activeEmpIds = new Set(activeEmployees.map(emp => emp.employeeId));
        setRecords(DUMMY_ATTENDANCE_RECORDS.filter(rec => activeEmpIds.has(rec.employeeId)));
      } else {
        setRecords(attendanceRecords.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)));
      }
      
      await calculateSummaryFromBackend();
    } catch (err) {
      console.error(err);
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryFromBackend = async () => {
    try {
      if (isUsingDummyData) {
        setEmployeeSummary(DUMMY_SUMMARY);
        previousSummaryRef.current = JSON.parse(JSON.stringify(DUMMY_SUMMARY));
        return;
      }
      const response = await fetch(`${BASE_URL}/attendancesummary/calculate/${clientId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate: fromDate || null, toDate: toDate || null, month: selectedMonth || null })
      });
      const result = await response.json();
      if (result.success && result.summary?.length > 0) {
        setEmployeeSummary(result.summary);
        previousSummaryRef.current = JSON.parse(JSON.stringify(result.summary));
      } else {
        const generatedSummary = generateSummaryFromRecords();
        setEmployeeSummary(generatedSummary);
      }
    } catch (error) {
      console.error(error);
      const generatedSummary = generateSummaryFromRecords();
      setEmployeeSummary(generatedSummary);
    }
  };

  const generateSummaryFromRecords = () => {
    const summaryMap = new Map();
    records.forEach(rec => {
      if (!summaryMap.has(rec.employeeId)) {
        const employee = employees.find(e => e.employeeId === rec.employeeId);
        summaryMap.set(rec.employeeId, {
          employeeId: rec.employeeId, name: employee?.name || rec.employeeId,
          month: selectedMonth, presentDays: 0, halfDayWorking: 0, fullDayNotWorking: 0
        });
      }
      const hours = rec.totalHours || rec.hours || 0;
      const dayType = calculateDayType(rec.employeeId, hours);
      const summary = summaryMap.get(rec.employeeId);
      if (dayType === "full") summary.presentDays++;
      else if (dayType === "half") summary.halfDayWorking++;
      else if (dayType === "full_leave") summary.fullDayNotWorking++;
    });
    return Array.from(summaryMap.values());
  };

  const handleSaveAttendance = async (rec, hours, region, comment, reason, index, dateKey, checkInTime, checkOutTime) => {
    try {
      const hoursValue = hours !== undefined ? parseFloat(hours) : rec?.totalHours;
      const payload = {
        attendanceId: rec?._id, employeeId: selectedEmployee, date: dateKey,
        hours: hoursValue, region: region, comment: comment || "Admin Update",
        reason: reason || "Onsite", checkInTime, checkOutTime
      };
      const response = await fetch(`${BASE_URL}/attendancesummary/update/${clientId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        showSaveStatus("✅ Record updated!");
        if (selectedEmployee) await handleViewDetails(selectedEmployee);
        await calculateSummaryFromBackend();
      } else {
        showSaveStatus("❌ Update failed", "error");
      }
    } catch (error) {
      console.error(error);
      showSaveStatus("🚨 Error", "error");
    }
  };

  const handleViewDetails = async (employeeId) => {
    try {
      setSelectedEmployee(employeeId);
      setEditedRows({});
      if (isUsingDummyData) {
        setEmployeeDetails(DUMMY_ATTENDANCE_RECORDS.filter(rec => rec.employeeId === employeeId));
        return;
      }
      const params = new URLSearchParams({ employeeId });
      if (fromDate && toDate) { params.append("fromDate", fromDate); params.append("toDate", toDate); }
      if (selectedMonth) params.append("month", selectedMonth);
      const response = await fetch(`${BASE_URL}/attendancesummary/employee-details/${clientId}?${params}`);
      const result = await response.json();
      if (result.success) {
        setEmployeeDetails(result.details.sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime)));
      }
    } catch (error) {
      console.error(error);
      showSaveStatus("❌ Error loading details", "error");
    }
  };

  const handleDateRangeFilter = async () => {
    setLoading(true);
    await calculateSummaryFromBackend();
    setCurrentPage(1);
    setLoading(false);
  };

  const handleMonthChange = async (e) => {
    setSelectedMonth(e.target.value);
    setFromDate("");
    setToDate("");
    setLoading(true);
    await calculateSummaryFromBackend();
    setCurrentPage(1);
    setLoading(false);
  };

  const clearFilters = async () => {
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setLoading(true);
    await calculateSummaryFromBackend();
    setCurrentPage(1);
    setLoading(false);
  };

  const showSaveStatus = (message, type = "success") => {
    setSaveStatus(message);
    if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(""), 3000);
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-";

  const getDayTypeBadge = (hours) => {
    if (!selectedEmployee) return <span className="px-1 py-0.5 text-[10px] text-gray-500 bg-gray-200 rounded">-</span>;
    const dayType = calculateDayType(selectedEmployee, hours);
    switch (dayType) {
      case "full": return <span className="px-1 py-0.5 text-[10px] text-white bg-green-500 rounded">Full</span>;
      case "half": return <span className="px-1 py-0.5 text-[10px] text-white bg-yellow-500 rounded">Half</span>;
      case "full_leave": return <span className="px-1 py-0.5 text-[10px] text-white bg-red-500 rounded">Leave</span>;
      default: return <span className="px-1 py-0.5 text-[10px] text-gray-500 bg-gray-200 rounded">-</span>;
    }
  };

  // Filter summary
  useEffect(() => {
    let filtered = [...employeeSummary];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp => emp.employeeId?.toString().toLowerCase().includes(term) || emp.name?.toLowerCase().includes(term));
    }
    if (filterDepartment) filtered = filtered.filter(emp => getEmployeeDepartment(emp.employeeId) === filterDepartment);
    if (filterDesignation) filtered = filtered.filter(emp => getEmployeeDesignation(emp.employeeId) === filterDesignation);
    setFilteredSummary(filtered);
    setCurrentPage(1);
  }, [employeeSummary, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    fetchAllData();
    return () => {
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSummary.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSummary.length / itemsPerPage);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-sm font-semibold text-blue-600">Loading...</div></div>;
  if (error && !isUsingDummyData) return <div className="flex items-center justify-center min-h-screen"><div className="p-3 text-xs text-red-600 bg-red-100 rounded">Error: {error}</div></div>;

  return (
    <div className="min-h-screen p-2 bg-gray-50">
      <div className="max-w-full mx-auto">
        
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-3 py-1.5 rounded shadow text-xs font-medium animate-fade-in ${saveStatus.includes("✅") ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {saveStatus}
          </div>
        )}

        {/* Client Banner */}
        {clientId && !isUsingDummyData && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-xs text-gray-500">Employees: {employees.length}</p></div>
            </div>
          </div>
        )}

        {/* Demo Banner */}
        {isUsingDummyData && (
          <div className="mb-2 p-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample data
          </div>
        )}

        {/* Filters */}
        <div className="p-2 mb-2 bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-40 px-2 py-1 text-xs border rounded" />
            
            {/* Dept Filter */}
            <div className="relative" ref={departmentFilterRef}>
              <button onClick={() => setShowDepartmentFilter(!showDepartmentFilter)} className={`h-7 px-2 text-xs rounded ${filterDepartment ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>
                <FaBuilding className="inline mr-1 text-[10px]" /> Dept{filterDepartment && `:${filterDepartment}`}
              </button>
              {showDepartmentFilter && (
                <div className="absolute z-50 w-40 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto">
                  <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50">All</div>
                  {uniqueDepartments.map(dept => (
                    <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-2 py-1 text-xs cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? 'bg-blue-50 text-blue-700' : ''}`}>{dept}</div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Desig Filter */}
            <div className="relative" ref={designationFilterRef}>
              <button onClick={() => setShowDesignationFilter(!showDesignationFilter)} className={`h-7 px-2 text-xs rounded ${filterDesignation ? 'bg-blue-600 text-white' : 'bg-gray-100 border'}`}>
                <FaUserTag className="inline mr-1 text-[10px]" /> Desig{filterDesignation && `:${filterDesignation}`}
              </button>
              {showDesignationFilter && (
                <div className="absolute z-50 w-40 mt-1 bg-white border rounded shadow max-h-48 overflow-y-auto">
                  <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50">All</div>
                  {uniqueDesignations.map(des => (
                    <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-2 py-1 text-xs cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? 'bg-blue-50 text-blue-700' : ''}`}>{des}</div>
                  ))}
                </div>
              )}
            </div>
            
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-36 px-2 py-1 text-xs border rounded" placeholder="From" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-36 px-2 py-1 text-xs border rounded" placeholder="To" />
            <input type="month" value={selectedMonth} onChange={handleMonthChange} className="w-32 px-2 py-1 text-xs border rounded" />
            
            <button onClick={handleDateRangeFilter} className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
            <button onClick={clearFilters} className="px-2 py-1 text-xs text-gray-700 bg-white border rounded hover:bg-gray-50">Clear</button>
            <button onClick={downloadCombinedExcel} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
              <FaDownload className="inline mr-1 text-[10px]" /> Download
            </button>
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                <tr>
                  <th className="py-1.5 px-2 text-center">ID</th>
                  <th className="py-1.5 px-2 text-center">Name</th>
                  <th className="py-1.5 px-2 text-center">Dept</th>
                  <th className="py-1.5 px-2 text-center">Desig</th>
                  <th className="py-1.5 px-2 text-center">Month</th>
                  <th className="py-1.5 px-2 text-center">Pre</th>
                  <th className="py-1.5 px-2 text-center">Late</th>
                  <th className="py-1.5 px-2 text-center">Onsite</th>
                  <th className="py-1.5 px-2 text-center">Remote</th>
                  <th className="py-1.5 px-2 text-center">Half</th>
                  <th className="py-1.5 px-2 text-center">Full</th>
                  <th className="py-1.5 px-2 text-center">OT</th>
                  <th className="py-1.5 px-2 text-center">Work Days</th>
                  <th className="py-1.5 px-2 text-center">DL</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((emp) => {
                  const workingDays = calculateEmployeeWorkingDays(emp.employeeId);
                  return (
                    <tr key={emp.employeeId} onClick={() => handleViewDetails(emp.employeeId)} className="border-t cursor-pointer hover:bg-blue-50">
                      <td className="py-1.5 px-2 text-center font-medium">{emp.employeeId}</td>
                      <td className="py-1.5 px-2 text-center">{emp.name}</td>
                      <td className="py-1.5 px-2 text-center text-gray-600">{getEmployeeDepartment(emp.employeeId)}</td>
                      <td className="py-1.5 px-2 text-center text-gray-600">{getEmployeeDesignation(emp.employeeId)}</td>
                      <td className="py-1.5 px-2 text-center">{emp.month || selectedMonth}</td>
                      <td className="py-1.5 px-2 text-center text-green-600 font-medium">{emp.presentDays}</td>
                      <td className="py-1.5 px-2 text-center text-orange-600">{calculateEmployeeLateDays(emp.employeeId)}</td>
                      <td className="py-1.5 px-2 text-center text-blue-600">{calculateEmployeeOnsiteDays(emp.employeeId)}</td>
                      <td className="py-1.5 px-2 text-center text-teal-600">{calculateEmployeeRemoteDays(emp.employeeId)}</td>
                      <td className="py-1.5 px-2 text-center text-yellow-600">{emp.halfDayWorking || 0}</td>
                      <td className="py-1.5 px-2 text-center text-red-600">{emp.fullDayNotWorking || 0}</td>
                      <td className="py-1.5 px-2 text-center text-indigo-600 font-semibold">{calculateEmployeeOT(emp.employeeId).toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-center text-purple-600 font-bold">{workingDays.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => downloadSingleEmployeeExcel(emp.employeeId)} className="px-2 py-0.5 text-white bg-blue-600 rounded text-[10px] hover:bg-blue-700" title="Download Report">
                          <FiDownload className="inline text-[10px]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {employeeSummary.length > 0 && (
            <div className="flex justify-between items-center p-2 border-t text-xs">
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-1 py-0.5 border rounded text-xs">
                  <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-2 py-0.5 border rounded disabled:opacity-50">Prev</button>
                <span className="px-2 py-0.5">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-2 py-0.5 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedEmployee && (() => {
          const [year, m] = selectedMonth.split("-");
          const start = new Date(year, m - 1, 1);
          const end = new Date(year, m, 0);
          const monthDates = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) monthDates.push(new Date(d));
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="relative w-full max-w-6xl">
                <button onClick={closeModal} className="absolute -top-8 right-0 text-white bg-red-500 px-3 py-0.5 rounded text-sm">✖ Close</button>
                <div className="bg-white p-3 rounded shadow-xl max-h-[80vh] overflow-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                        <tr>
                          <th className="py-1 px-2">Date</th>
                          <th className="py-1 px-2">In</th>
                          <th className="py-1 px-2">Out</th>
                          <th className="py-1 px-2">Reason</th>
                          <th className="py-1 px-2">Hrs</th>
                          <th className="py-1 px-2">Comment</th>
                          <th className="py-1 px-2">OT</th>
                          <th className="py-1 px-2">Type</th>
                          <th className="py-1 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthDates.map((date) => {
                          const dateKey = date.toLocaleDateString('en-CA');
                          const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                          const edited = editedRows[dateKey] || {};
                          const currentReason = edited.reason !== undefined ? edited.reason : (rec?.reason || "");
                          const currentComment = edited.comment !== undefined ? edited.comment : (rec?.comment || "");
                          const currentHours = edited.hours !== undefined ? edited.hours : (rec?.totalHours || rec?.hours || 0);
                          const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : "";
                          const baseCheckIn = rec?.checkInTime ? formatTime(rec.checkInTime) : "";
                          const baseCheckOut = rec?.checkOutTime ? formatTime(rec.checkOutTime) : "";
                          const combineDateTime = (timeStr) => timeStr ? `${dateKey}T${timeStr}:00` : null;
                          
                          return (
                            <tr key={dateKey} className="border-t hover:bg-blue-50">
                              <td className="py-1 px-2 text-center">{date.toLocaleDateString("en-IN")}</td>
                              <td className="py-1 px-2"><input type="time" className="w-20 px-1 py-0.5 border rounded text-xs" value={edited.checkInTime !== undefined ? edited.checkInTime : baseCheckIn} onChange={(e) => setEditedRows(prev => ({ ...prev, [dateKey]: { ...prev[dateKey], checkInTime: e.target.value } }))} /></td>
                              <td className="py-1 px-2"><input type="time" className="w-20 px-1 py-0.5 border rounded text-xs" value={edited.checkOutTime !== undefined ? edited.checkOutTime : baseCheckOut} onChange={(e) => setEditedRows(prev => ({ ...prev, [dateKey]: { ...prev[dateKey], checkOutTime: e.target.value } }))} /></td>
                              <td className="py-1 px-2"><select className="w-28 px-1 py-0.5 border rounded text-xs" value={currentReason} onChange={e => handleReasonChange(dateKey, e.target.value)}><option value="">Select</option><option value="Onsite">Onsite</option><option value="Field Work">Field Work</option><option value="Work From Home">WFH</option></select></td>
                              <td className="py-1 px-2"><input type="number" step="0.25" className="w-16 px-1 py-0.5 border rounded text-xs" value={currentHours} onChange={e => handleHoursChange(dateKey, e.target.value)} /></td>
                              <td className="py-1 px-2"><input type="text" className="w-28 px-1 py-0.5 border rounded text-xs" placeholder="Comment" value={currentComment} onChange={e => handleCommentChange(dateKey, e.target.value)} /></td>
                              <td className="py-1 px-2 text-indigo-600 font-semibold text-center">{rec ? calculateOT(selectedEmployee, currentHours).toFixed(1) : "-"}</td>
                              <td className="py-1 px-2 text-center">{rec ? getDayTypeBadge(currentHours) : "-"}</td>
                              <td className="py-1 px-2 text-center">
                                <button onClick={() => handleSaveAttendance(rec, currentHours, null, currentComment, currentReason, 0, dateKey, combineDateTime(edited.checkInTime), combineDateTime(edited.checkOutTime))} className={`px-2 py-0.5 text-white rounded text-[10px] ${(edited.checkInTime || rec) ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}>
                                  {rec ? "Save" : "Add"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      <style>{`@keyframes fade-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in{animation:fade-in 0.2s ease-out}`}</style>
    </div>
  );
}