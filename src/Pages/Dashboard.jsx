import axios from 'axios';
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";
import StatCard from "../Components/StatCard";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const API_BASE_URL = "https://api.timelyhealth.in/api";

const AttendanceDashboard = () => {
  // Get clientId from localStorage
  const getClientId = () => {
    return localStorage.getItem('clientId') || localStorage.getItem('clientCustomId') || '';
  };

  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lateDate, setLateDate] = useState("");
  const [lateMonth, setLateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [absentDate, setAbsentDate] = useState("");
  const [absentMonth, setAbsentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [topLateMonth, setTopLateMonth] = useState(new Date().toISOString().slice(0, 7));

  const reactNavigate = useNavigate();

  const navigate = (path) => {
    if (window.location.pathname.startsWith("/emp-")) {
      const routeMap = {
        "/employeelist": "/emp-employees",
        "/today-attendance": "/emp-today-attendance",
        "/absent-today": "/emp-absent-today",
        "/late-today": "/emp-late-today",
        "/attedancesummary": "/emp-attendance-summary",
        "/leavelist": "/emp-leaves",
      };
      if (typeof path === "string" && routeMap[path]) {
        reactNavigate(routeMap[path]);
        return;
      }
    }
    reactNavigate(path);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const clientId = getClientId();
      
      // Add clientId to all requests as query parameter
      const headers = {
        'Content-Type': 'application/json'
      };

      // 1. Fetch Employees
      const empRes = await axios.get(`${API_BASE_URL}/employees/get-employees`, {
        params: { clientId },
        headers
      });
      setEmployees(empRes.data || []);

      // 2. Fetch Master Shifts
      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`, {
        params: { clientId },
        headers
      });
      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data || []);
      }

      // 3. Fetch Employee Shift Assignments
      const assignmentsRes = await axios.get(`${API_BASE_URL}/shifts/assignments`, {
        params: { clientId },
        headers
      });
      if (assignmentsRes.data.success) {
        setShiftsData(assignmentsRes.data.data || []);
      }

      // 4. Fetch Summary Stats
      const summaryRes = await axios.get(`${API_BASE_URL}/attendance/summary`, {
        params: { clientId },
        headers
      });
      setAttendanceData(summaryRes.data);

      // 5. Fetch All Attendance for Chart
      const allAttRes = await axios.get(`${API_BASE_URL}/attendance/allattendance`, {
        params: { clientId },
        headers
      });
      const allAttData = allAttRes.data;
      setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

      // 6. Fetch Approved Leaves
      const leavesRes = await axios.get(`${API_BASE_URL}/leaves/leaves`, {
        params: { clientId, status: 'approved' },
        headers
      });
      const leavesResult = leavesRes.data;
      setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Please ensure the backend server is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get Employee Name by ID
  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    const emp = employees.find(e => e.employeeId === id || e._id === id);
    return emp ? emp.name : id;
  };

  // Get Employee Shift Time from Master Shifts
  const getEmployeeShift = (employeeId) => {
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId ||
      s.employeeId === employeeId
    );

    if (!shiftAssignment) return null;

    const shiftType = shiftAssignment.shiftType;

    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

    if (!masterShift) {
      return getDefaultShiftTime(shiftType);
    }

    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5,
        isBrakeShift: true
      };
    }

    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return {
          start: start || "09:00",
          end: end || "18:00",
          grace: 5,
          isBrakeShift: false
        };
      }
    }

    return getDefaultShiftTime(shiftType);
  };

  // Default shift timings if no master shift found
  const getDefaultShiftTime = (shiftType) => {
    const shiftTimes = {
      "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
      "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
      "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
      "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
      "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
      "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
      "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
      "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
    };

    return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
  };

  // Filter Inactive Employees
  const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

  // Process Attendance Data with Color Coding
  const getAttendanceColor = (count, max) => {
    const percentage = (count / max) * 100;
    if (percentage >= 90) return '#10b981'; // Emerald 500
    if (percentage >= 75) return '#84cc16'; // Lime 500
    if (percentage >= 50) return '#EF4444'; // Amber 500
    if (percentage >= 25) return '#DC2626'; // Orange 500
    return '#ef4444'; // Red 500
  };

  const processAttendanceData = () => {
    if (!Array.isArray(allAttendance)) return [];

    const [year, month] = attendanceMonth ? attendanceMonth.split('-').map(Number) : [null, null];
    const counts = {};

    allAttendance.forEach(record => {
      if (year && month) {
        if (!record.checkInTime) return;
        const recordDate = new Date(record.checkInTime);
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const name = getEmployeeName(id);
      const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
      if (isPresent) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });

    const result = Object.entries(counts)
      .map(([id, count]) => ({
        id,
        name: getEmployeeName(id),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxCount = Math.max(...result.map(item => item.count), 1);

    return result.map(item => ({
      id: item.id,
      name: item.name,
      displayId: item.id,
      count: item.count,
      color: getAttendanceColor(item.count, maxCount)
    }));
  };

  // Process Late Analysis Data (Pie Chart)
  const processLateAnalysisData = () => {
    // 1. Date View: Late Minutes
    if (lateDate) {
      const lateMap = {};
      allAttendance.forEach(record => {
        if (!record.checkInTime) return;
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        if (recordDate !== lateDate) return;

        const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
        if (!id) return;

        const shift = getEmployeeShift(id);
        if (!shift) return;

        const checkInDateTime = new Date(record.checkInTime);
        const [hours, minutes] = shift.start.split(':').map(Number);
        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(hours, minutes, 0, 0);
        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

        if (checkInDateTime > graceTime) {
          const diffMs = checkInDateTime - graceTime;
          const lateMinutes = Math.floor(diffMs / (1000 * 60));
          const name = getEmployeeName(id);
          const label = `${name} (${id})`;
          lateMap[label] = { name: label, value: lateMinutes, type: 'minutes' };
        }
      });
      return Object.values(lateMap).sort((a, b) => b.value - a.value);
    }

    // 2. Month View: Late Days
    const [year, month] = lateMonth.split('-').map(Number);
    const lateCounts = {};

    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const shift = getEmployeeShift(id);
      if (!shift) return;

      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);
      // Fix: Ensure we compare with the correct date's shift time
      shiftStartTime.setFullYear(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

      if (checkInDateTime > graceTime) {
        const name = getEmployeeName(id);
        const label = `${name} (${id})`;
        lateCounts[label] = (lateCounts[label] || 0) + 1;
      }
    });

    return Object.entries(lateCounts)
      .map(([name, count]) => ({ name, value: count, type: 'days' }))
      .sort((a, b) => b.value - a.value);
  };

  const COLORS = [
    '#DC2626',  // Rose 600
    '#EF4444',  // Rose 600
    '#E11D48',  // Rose 600
    '#D97706', // Amber 600
    '#F59E0B', // Amber 500
    '#FBBF24', // Amber 400
    '#0891B2', // Cyan 600
    '#06B6D4', // Cyan 500
    '#22D3EE', // Cyan 400
    '#4F46E5', // Indigo 600
    '#6366F1', // Indigo 500
    '#818CF8', // Indigo 400
    '#059669',// Emerald 600
    '#10B981', // Emerald 500
    '#34D399' // Emerald 400
  ];

  // Get Color based on late minutes
  const getLateMinutesColor = (minutes) => {
    if (minutes <= 5) return '#34D399';   // Emerald 400
    if (minutes <= 10) return '#10B981';  // Emerald 500
    if (minutes <= 20) return '#059669';  // Emerald 600
    if (minutes <= 30) return '#6366F1';  // Indigo 500
    if (minutes <= 40) return '#06B6D4';  // Cyan 500
    if (minutes <= 50) return '#FBBF24';  // Amber 400
    if (minutes <= 60) return '#F59E0B';  // Amber 500
    return '#EF4444'; // Rose 600
  };

  // Get Color based on days absent
  const getAbsentColor = (daysSince) => {
    if (daysSince <= 1) return '#34D399';   // Emerald 400
    if (daysSince <= 3) return '#10B981';   // Emerald 500
    if (daysSince <= 5) return '#059669';   // Emerald 600
    if (daysSince <= 7) return '#6366F1';   // Indigo 500
    if (daysSince <= 10) return '#06B6D4';  // Cyan 500
    if (daysSince <= 14) return '#FBBF24';  // Amber 400
    if (daysSince <= 21) return '#F59E0B';  // Amber 500
    return '#EF4444'; // Rose 600
  };

  // Process Absent Analysis Data (Bar Chart)
  const processAbsentAnalysisData = () => {
    // Ensure employees are loaded
    if (!employees.length) return [];

    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));

    // 1. Date View: Days Since Last Attendance
    if (absentDate) {
      const selectedDate = new Date(absentDate);
      const selectedDateStr = absentDate;
      const presentIds = new Set();

      allAttendance.forEach(record => {
        if (!record.checkInTime) return;
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        if (recordDate === selectedDateStr) {
          const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
          if (id) presentIds.add(id);
        }
      });

      const absentData = [];
      activeEmps.forEach(emp => {
        if (!presentIds.has(emp.employeeId)) {
          let lastAttendanceDate = null;
          allAttendance.forEach(record => {
            const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
            if (id === emp.employeeId && record.checkInTime) {
              const recordDate = new Date(record.checkInTime);
              if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
                lastAttendanceDate = recordDate;
              }
            }
          });

          let daysSince = 0;
          if (lastAttendanceDate) {
            const diffTime = selectedDate - lastAttendanceDate;
            daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          } else {
            const joinDate = emp.joinDate ? new Date(emp.joinDate) : selectedDate;
            const diffTime = Math.max(0, selectedDate - joinDate);
            daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }

          absentData.push({
            name: `${emp.name} (${emp.employeeId})`,
            value: Math.max(0, daysSince),
            type: 'daysSince',
            color: getAbsentColor(daysSince)
          });
        }
      });
      return absentData.sort((a, b) => b.value - a.value).slice(0, 10);
    }

    // 2. Month View: Total Absent Days
    const [year, month] = absentMonth.split('-').map(Number);
    const absentCounts = {};
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const daysToCount = isCurrentMonth ? now.getDate() : totalDaysInMonth;

    // Initialize counts for all active employees
    activeEmps.forEach(emp => {
      absentCounts[emp.employeeId] = {
        name: `${emp.name} (${emp.employeeId})`,
        present: 0
      };
    });

    // Count present days
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

      if (recordDate.getDate() > daysToCount) return;

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (absentCounts[id]) {
        absentCounts[id].present++;
      }
    });

    // Calculate absent
    const results = Object.values(absentCounts).map(emp => {
      const absentDays = Math.max(0, daysToCount - emp.present);
      return {
        name: emp.name,
        value: absentDays,
        type: 'absentDays',
        color: getAttendanceColor(emp.present, daysToCount)
      };
    }).filter(r => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 15);

    return results;
  };

  // Process Top Late Comers (for the new bar chart)
  const processTopLateComersData = () => {
    const [year, month] = topLateMonth ? topLateMonth.split('-').map(Number) : [null, null];
    const lateCounts = {};

    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (year && month && (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month)) return;

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const shift = getEmployeeShift(id);
      if (!shift) return;

      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);
      shiftStartTime.setFullYear(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

      if (checkInDateTime > graceTime) {
        lateCounts[id] = (lateCounts[id] || 0) + 1;
      }
    });

    return Object.entries(lateCounts)
      .map(([id, count]) => ({
        id,
        name: getEmployeeName(id),
        count
      }))
      .sort((a, b) => b.count - a.count) 
      .slice(0, 10); 
  };

  // Calculate Present Count for Today
  const calculatePresentCount = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    const present = allAttendance.filter(record => {
      if (!record.checkInTime) return false;
      return record.checkInTime.startsWith(dateStr);
    });
    const uniqueIds = new Set(present.map(r =>
      (typeof r.employeeId === 'object' ? r.employeeId?.employeeId : r.employeeId)
    ));
    return uniqueIds.size;
  };

  // Calculate Absent Count for Today
  const calculateAbsentCount = (dateStr) => {
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    const presentCount = calculatePresentCount(dateStr);
    return Math.max(0, activeEmps.length - presentCount);
  };

  // Calculate Late Count for Today
  const calculateLateCount = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    let count = 0;

    // We iterate through all attendance records to find lates for the given date
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      if (!record.checkInTime.startsWith(dateStr)) return;

      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const shift = getEmployeeShift(id);
      if (!shift) return;

      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);

      // Construct shift start time for the *attendance record's date*
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);

      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

      if (checkInDateTime > graceTime) {
        count++;
      }
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
        Initializing Dashboard Analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
        <div className="text-center">
          <p className="mb-2 text-2xl font-bold">Oops!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totals = attendanceData?.totals || {};
  const attendanceChartData = processAttendanceData();
  const lateComersData = processTopLateComersData();

  const lateChartData = processLateAnalysisData();
  const absentChartData = processAbsentAnalysisData();

  const presentToday = calculatePresentCount(new Date().toISOString().split('T')[0]);
  const absentToday = calculateAbsentCount(new Date().toISOString().split('T')[0]);
  const lateToday = calculateLateCount(new Date().toISOString().split('T')[0]);

  // Custom tooltip formatter for attendance chart
  const AttendanceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name} ({data.id})</p>
          <p className="text-gray-600">Attendance: {data.count} days</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip formatter for leaves chart
  const LeavesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name} ({data.id})</p>
          <p className="text-gray-600">Leaves: {data.count} days</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip formatter for late chart
  const LateTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-100 rounded-lg shadow-xl">
          <p className="font-bold text-gray-800 mb-0.5 leading-none">{data.name}</p>
          <p className="leading-none text-gray-500">
            {data.type === 'minutes' ? `Late Duration: ${data.value} mins` : `Late Days: ${data.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip formatter for absent chart
  const AbsentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-100 rounded-lg shadow-xl">
          <p className="font-bold text-gray-800 mb-0.5 leading-none">{data.name}</p>
          <p className="leading-none text-gray-500">
            {data.type === 'daysSince' ? `Days Since Last: ${data.value}` : `Absent Days: ${data.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen p-2 lg:p-6 bg-gray-50/50">
      {/* 1. Top Summary Stats - Updated Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={FiUsers}
          label="Total Staff"
          value={totals.employees || 0}
          color="indigo"
          onClick={() => navigate("/employeelist")}
        />
        <StatCard
          icon={FiUserCheck}
          label="Present Today"
          value={presentToday || 0}
          color="emerald"
          onClick={() => navigate("/today-attendance")}
        />
        <StatCard
          icon={FiUserX}
          label="Absent Today"
          value={absentToday || 0}
          color="rose"
          onClick={() => navigate("/absent-today")}
        />
        <StatCard
          icon={FiClock}
          label="Late Arrival"
          value={lateToday || 0}
          color="amber"
          onClick={() => navigate("/late-today")}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Attendance Rate"
          value={totals.attendanceRate || 0}
          isPercentage={true}
          color="cyan"
          onClick={() => navigate("/attedancesummary")}
        />
      </div>

      {/* 3. Historical Performance */}
      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
        {/* Attendance Performance */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800">Top Attendance Performance</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={attendanceMonth}
                onChange={(e) => setAttendanceMonth(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-600"
              />
              <button onClick={() => navigate("/attedancesummary")} className="font-bold text-indigo-600 transition-colors text-s hover:text-indigo-800 hidden sm:block">View Report →</button>
            </div>
          </div>
          <div className="flex-1 w-full">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<AttendanceTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No attendance data available</div>
            )}
          </div>
        </div>

        {/* Most Late Comings */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-800">Most Late Comings</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={topLateMonth}
                onChange={(e) => setTopLateMonth(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-rose-600"
              />
              <button
                onClick={() => navigate("/late-today")}
                className="font-bold transition-colors text-s text-rose-600 hover:text-rose-800 hidden sm:block"
              >
                View All Lates →
              </button>
            </div>
          </div>

          <div className="flex-1 w-full">
            {lateComersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={lateComersData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    allowDecimals={false}
                  />

                  <Tooltip content={<AttendanceTooltip />} cursor={{ fill: '#f8fafc' }} />

                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                    {lateComersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index >= 3 ? "#F59E0B" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No monthly late data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Late & Absent Analysis */}
      <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
        {/* Late Analysis (Pie Chart) */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex flex-col mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-800">Late Analysis</h3>
              <div className="flex items-center gap-2">
                {/* Month Filter */}
                <input
                  type="month"
                  value={lateMonth}
                  onChange={(e) => {
                    setLateMonth(e.target.value);
                    setLateDate(""); // Clear date when month changes to default to month view
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
                />
                {/* Date Filter */}
                <input
                  type="date"
                  value={lateDate}
                  onChange={(e) => setLateDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
                />
                <button
                  onClick={() => navigate("/late-today")}
                  className="font-bold text-s text-amber-600 hover:text-amber-800 whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {lateDate ? `Late Minutes on ${lateDate}` : `Late Days in ${lateMonth}`}
            </p>
          </div>

          <div className="flex-1 w-full">
            {lateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lateChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {lateChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<LateTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                <FiClock className="w-10 h-10 mb-2 opacity-20" />
                <p>No late records found</p>
              </div>
            )}
          </div>
        </div>

        {/* Absent Analysis (Bar Chart) */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex flex-col mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-800">Absent Analysis</h3>
              <div className="flex items-center gap-2">
                {/* Month Filter */}
                <input
                  type="month"
                  value={absentMonth}
                  onChange={(e) => {
                    setAbsentMonth(e.target.value);
                    setAbsentDate("");
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
                />
                {/* Date Filter */}
                <input
                  type="date"
                  value={absentDate}
                  onChange={(e) => setAbsentDate(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
                />
                <button
                  onClick={() => navigate("/absent-today")}
                  className="font-bold text-s text-rose-600 hover:text-rose-800 whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {absentDate ? `Days Since Last Attendance (as of ${absentDate})` : `Total Absent Days in ${absentMonth}`}
            </p>
          </div>

          <div className="flex-1 w-full">
            {absentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={absentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {absentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<AbsentTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                <FiUserX className="w-8 h-8 mb-2 opacity-20" />
                <p>No absent records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;