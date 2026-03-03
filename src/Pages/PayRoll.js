import { useCallback, useEffect, useState } from "react";

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30);

  const recordsPerPage = 10;

  const getClientId = () => localStorage.getItem("clientId") || "";

  const ATTENDANCE_SUMMARY_BASE_URL = "http://localhost:5000/api/attendancesummary/get";
  const ATTENDANCE_DETAILS_BASE_URL = "http://localhost:5000/api/attendance/allattendance";
  const LEAVES_BASE_URL = "http://localhost:5000/api/leaves/leaves";
  const EMPLOYEES_BASE_URL = "http://localhost:5000/api/employees/get-employees";

  const buildUrl = (baseUrl, month = "", employeeId = "") => {
    const clientId = getClientId();
    let url = `${baseUrl}/${clientId}`;
    const params = [];
    if (month) params.push(`month=${month}`);
    if (employeeId) params.push(`employeeId=${employeeId}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    return url;
  };

  const getSalaryApiUrl = (month) => {
    const clientId = getClientId();
    if (month) return `http://localhost:5000/api/attendancesummary/getsalaries/${clientId}?month=${month}`;
    return `http://localhost:5000/api/attendancesummary/getsalaries/${clientId}`;
  };

  const processLeavesData = useCallback((leavesData) => {
    const leavesMap = {};
    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;
      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
      }
      const leaveType = leave.leaveType || 'Other';
      const duration = calculateLeaveDuration(leave.startDate, leave.endDate);
      if (leavesMap[employeeId][leaveType] !== undefined) {
        leavesMap[employeeId][leaveType] += duration;
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
    });
    setEmployeeLeaves(leavesMap);
  }, []);

  const calculateLeaveDuration = (fromDate, toDate) => {
    if (!fromDate) return 0;
    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : new Date(fromDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const fetchData = useCallback(async (month = "") => {
    let isMounted = true;
    try {
      setLoading(true);
      setError("");

      // STEP 0: Attendance Summary
      let summaryData = [];
      try {
        const summaryUrl = buildUrl(ATTENDANCE_SUMMARY_BASE_URL, month);
        const summaryRes = await fetch(summaryUrl);
        if (summaryRes.ok && isMounted) {
          const json = await summaryRes.json();
          summaryData = json.summary || [];
        }
      } catch (e) {
        console.warn("⚠️ Summary API Error:", e.message);
      }

      // STEP 1: Salary API
      let salaryData = { success: false, salaries: [], monthDays: 30 };
      try {
        const salaryUrl = getSalaryApiUrl(month);
        const salaryRes = await fetch(salaryUrl);
        if (salaryRes.ok && isMounted) {
          salaryData = await salaryRes.json();
          if (salaryData.monthDays && isMounted) setMonthDays(salaryData.monthDays);
        }
      } catch (err) {
        console.warn("⚠️ Salary API error:", err.message);
      }

      // STEP 2: Employees + Leaves
      const employeesUrl = buildUrl(EMPLOYEES_BASE_URL);
      const leavesUrl = buildUrl(LEAVES_BASE_URL);

      const [employeesRes, leavesRes] = await Promise.all([
        fetch(employeesUrl).catch(() => ({ ok: false })),
        fetch(leavesUrl).catch(() => ({ ok: false }))
      ]);

      // ✅ FIX: Handle both array and object responses
      let employeesRaw = employeesRes.ok ? await employeesRes.json() : [];
      let leavesRaw = leavesRes.ok ? await leavesRes.json() : [];

      let employeesData = Array.isArray(employeesRaw)
        ? employeesRaw
        : (employeesRaw.employees || employeesRaw.data || employeesRaw.result || []);

      let leavesData = Array.isArray(leavesRaw)
        ? leavesRaw
        : (leavesRaw.leaves || leavesRaw.data || leavesRaw.result || []);

      console.log("✅ Employees from API:", employeesData.length);
      console.log("✅ Leaves from API:", leavesData.length);

      // EMPLOYEES MAP
      const employeesMap = {};
      employeesData.forEach(emp => {
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
          weekOffType: emp.weekOffType || '0+4'
        };
      });

      if (isMounted) setEmployeesMasterData(employeesMap);

      // MERGE SALARY + SUMMARY DATA
      let processedSalaries = [];
      if (salaryData.success && salaryData.salaries?.length > 0) {
        processedSalaries = salaryData.salaries.map(emp => {
          const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
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
            weekOffs: summary.weekOffPerMonth ?? emp.weekOffs ?? 0,
            month: salaryData.month || month || emp.month || "Not specified",
            salaryPerDay: emp.salaryPerDay || 0,
            calculatedSalary: emp.calculatedSalary || 0,
            monthDays: salaryData.monthDays || 30
          };
        });
      } else {
        processedSalaries = employeesData.map(emp => ({
          employeeId: emp.employeeId,
          name: emp.name,
          presentDays: 0,
          workingDays: 0,
          totalWorkingDays: 0,
          halfDayWorking: 0,
          fullDayNotWorking: 0,
          calculatedSalary: 0,
          salaryPerMonth: emp.salaryPerMonth || 0,
          salaryPerDay: 0,
          weekOffs: emp.weekOffPerMonth || 0,
          totalLeaves: 0,
          leaveTypes: {},
          month: month || "No Month",
          monthDays: salaryData.monthDays || 30
        }));
      }

      if (isMounted) {
        setRecords(processedSalaries);
        setFilteredRecords(processedSalaries);
      }

      if (leavesData.length > 0 && isMounted) processLeavesData(leavesData);

    } catch (err) {
      console.error("❌ ERROR:", err);
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }

    return () => { isMounted = false; };
  }, [processLeavesData]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [fetchData]);

  const calculateSalary = (employee) => employee.calculatedSalary || 0;

  const calculateDailyRate = (employee) => {
    const employeeData = employeesMasterData[employee.employeeId];
    if (!employeeData?.salaryPerMonth || employeeData.salaryPerMonth === 0) return 0;
    const daysInMonth = employee.monthDays || monthDays || 30;
    return (employeeData.salaryPerMonth / daysInMonth).toFixed(2);
  };

  const getEmployeeData = (employee) => {
    return employeesMasterData[employee.employeeId] || {
      salaryPerMonth: employee.salaryPerMonth || 0,
      shiftHours: 8,
      weekOffPerMonth: employee.weekOffs || 0,
      name: employee.name || '',
      designation: '',
      department: '',
      joiningDate: '',
      bankAccount: '',
      employeeId: employee.employeeId,
      weekOffDay: '',
      weekOffType: '0+4'
    };
  };

  const calculateWeekOffDays = (employee) => employee.weekOffs || 0;
  const calculateHolidays = () => 0;

  const handleWeekOffChange = async (employeeId, weekOffDay, weekOffType, manualDays = "") => {
    if (!weekOffDay || !weekOffType) return;
    try {
      const clientId = getClientId();
      const requestBody = { employeeId, weekOffDay, weekOffType, clientId };
      if (weekOffType === 'manual' && manualDays) requestBody.weekOffPerMonth = parseInt(manualDays);

      const response = await fetch(`http://localhost:5000/api/attendancesummary/updateWeekOffConfig/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      if (result.success) {
        setEmployeesMasterData(prev => ({
          ...prev,
          [employeeId]: {
            ...prev[employeeId],
            weekOffDay,
            weekOffPerMonth: result.config.weekOffPerMonth,
            weekOffType: result.config.weekOffType
          }
        }));
        setTimeout(() => fetchData(selectedMonth), 1000);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating week off:', error);
      alert('Failed to update week off');
    }
  };

  const fetchAttendanceDetails = async (employeeId) => {
    try {
      const url = buildUrl(ATTENDANCE_DETAILS_BASE_URL, selectedMonth, employeeId);
      const response = await fetch(url);
      const data = await response.json();
      if (data.records?.length > 0) {
        setEmployeeAttendanceDetails(data.records.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)));
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
    return new Date(dateString).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const holidays = calculateHolidays(employee);

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays,
      holidays,
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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || calculateWeekOffDays(selectedEmployee);

    const daysInMonth = selectedEmployee.monthDays || monthDays || 30;
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
        bonus,
        deductions,
        totalExtraAmount,
        reason: extraWorkData.reason || ""
      }
    };

    const updatedRecords = records.map(record =>
      record.employeeId === selectedEmployee.employeeId ? { ...record, ...updatedData } : record
    );

    setRecords(updatedRecords);
    setShowEditModal(false);
    alert("Salary details updated successfully!");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleExtraWorkChange = (e) => {
    const { name, value } = e.target;
    setExtraWorkData(prev => ({ ...prev, [name]: name === 'reason' ? value : (parseFloat(value) || 0) }));
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const formatMonthDisplay = (month) => {
    if (!month) return "Current Month";
    const [year, monthNum] = month.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const downloadInvoice = (employee) => {
    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);
    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `<!DOCTYPE html><html><body><div style="text-align:center;color:red;margin-top:100px;"><h2>Salary Data Not Available</h2><p>Salary information is not available for ${employee?.name || 'this employee'}.</p></div></body></html>`;
    }

    const totalMonthDays = employee.monthDays || monthDays || 30;
    const dailyRate = calculateDailyRate(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = calculateWeekOffDays(employee);
    const presentDays = employee.presentDays || 0;
    const halfDays = employee.halfDayWorking || 0;
    const paidLeaveDays = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0);
    const totalPaidDays = presentDays + (halfDays * 0.5) + weekOffDays + paidLeaveDays;
    const halfDayDeductionDays = halfDays * 0.5;
    const halfDayDeductionAmount = halfDayDeductionDays * dailyRate;
    const totalUnpaidDays = Math.max(0, totalMonthDays - totalPaidDays);
    const lopDays = Math.max(0, totalUnpaidDays - halfDayDeductionDays);
    const lopAmount = lopDays * dailyRate;
    const grossSalary = employeeData.salaryPerMonth || 0;
    const bonus = employee.extraWork?.bonus || 0;
    const extraDaysPay = (employee.extraWork?.extraDays || 0) * dailyRate;
    const otherDeductions = employee.extraWork?.deductions || 0;
    const totalEarnings = grossSalary + bonus + extraDaysPay;
    const totalDeductions = halfDayDeductionAmount + lopAmount + otherDeductions;
    const netPay = totalEarnings - totalDeductions;
    const hasExtraWork = employee.extraWork && ((employee.extraWork.extraDays || 0) > 0 || (employee.extraWork.bonus || 0) > 0 || (employee.extraWork.deductions || 0) > 0);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${employee.name}</title>
  <style>
    @page { size: A4; margin: 0; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
    .invoice-container { width: 100%; max-width: 210mm; margin: 0 auto; border: 1px solid #000; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 4px 8px; border: 1px solid #000; font-size: 12px; vertical-align: middle; }
    .header-cell { border: none; padding: 2px; text-align: center; border-bottom: 1px solid #000; }
    .section-header { background-color: #f0f0f0; font-weight: bold; text-align: center; text-transform: uppercase; }
    .amount-col { text-align: right; width: 15%; }
    .label-col { text-align: left; width: 35%; }
    .notes-box { margin: 10px; padding: 5px; border: 1px dashed #666; font-size: 11px; background: #fafafa; }
  </style>
</head>
<body>
<div class="invoice-container">
  <table>
    <tr>
      <td colspan="4" class="header-cell">
        <div style="text-align:center;padding:10px 0 5px;">
          <h1 style="margin:0;font-size:24px;font-weight:bold;text-transform:uppercase;">Timely Health Tech Pvt Ltd</h1>
          <p style="margin:2px 0;font-size:11px;">H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, TG - 500081</p>
          <span style="font-size:16px;font-weight:bold;text-decoration:underline;">PAYSLIP ${formatMonthDisplay(employee.month || selectedMonth).toUpperCase()}</span>
        </div>
      </td>
    </tr>
    <tr><td><strong>ID</strong></td><td>${employee.employeeId}</td><td><strong>Joined</strong></td><td>${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : '-'}</td></tr>
    <tr><td><strong>Name</strong></td><td>${employee.name}</td><td><strong>Role</strong></td><td>${employeeData.designation || '-'}</td></tr>
    <tr><td><strong>Dept</strong></td><td>${employeeData.department || '-'}</td><td><strong>Month</strong></td><td>${formatMonthDisplay(employee.month || selectedMonth)}</td></tr>
    <tr><td><strong>Invoice Date</strong></td><td>${new Date().toLocaleDateString()}</td><td><strong>Total Days</strong></td><td>${totalMonthDays} Days</td></tr>
    <tr class="section-header"><td colspan="2">EARNINGS</td><td colspan="2">DEDUCTIONS</td></tr>
    <tr>
      <td class="label-col">Basic Salary</td><td class="amount-col">₹${Math.round(grossSalary).toFixed(2)}</td>
      <td class="label-col">LOP / Absent (${lopDays} days)</td><td class="amount-col" style="color:red;">${lopAmount > 0 ? '-' : ''}₹${Math.round(lopAmount).toFixed(2)}</td>
    </tr>
    <tr>
      <td class="label-col">Working Days (Full: ${presentDays})</td><td class="amount-col">-</td>
      <td class="label-col">Half Day Deductions (${halfDays} HD)</td><td class="amount-col" style="color:red;">${halfDayDeductionAmount > 0 ? '-' : ''}₹${Math.round(halfDayDeductionAmount).toFixed(2)}</td>
    </tr>
    <tr>
      <td class="label-col">Week Off Days (${weekOffDays})</td><td class="amount-col">-</td>
      <td class="label-col">Other Deductions</td><td class="amount-col" style="color:red;">${otherDeductions > 0 ? '-' : ''}₹${otherDeductions.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="label-col">Bonus / Extra</td><td class="amount-col">₹${Math.round(bonus + extraDaysPay).toFixed(2)}</td>
      <td class="label-col"></td><td class="amount-col"></td>
    </tr>
    <tr style="font-weight:bold;background:#f0f0f0;">
      <td class="label-col">Gross Earnings</td><td class="amount-col">₹${Math.round(totalEarnings).toFixed(2)}</td>
      <td class="label-col">Total Deductions</td><td class="amount-col" style="color:red;">₹${Math.round(totalDeductions).toFixed(2)}</td>
    </tr>
    <tr style="font-weight:bold;background:#e0eee0;font-size:14px;">
      <td colspan="2" style="text-align:right;padding-right:20px;">NET PAY</td>
      <td colspan="2" style="text-align:left;padding-left:20px;">₹${Math.round(netPay).toFixed(2)}</td>
    </tr>
    ${hasExtraWork && employee.extraWork.reason ? `<tr><td colspan="4" style="border:none;padding:10px;"><div class="notes-box"><strong>Adjustments Note:</strong> ${employee.extraWork.reason}</div></td></tr>` : ''}
  </table>
  <div style="text-align:center;font-size:10px;margin-top:10px;">This is a computer-generated document.</div>
</div>
</body>
</html>`;
  };

  const getLeaveTypes = (employee) => {
    if (employee.leaveTypes && Object.keys(employee.leaveTypes).length > 0) {
      const leaveStrings = [];
      Object.entries(employee.leaveTypes).forEach(([type, count]) => {
        if (count > 0) leaveStrings.push(`${type.toUpperCase()}: ${count}`);
      });
      if (leaveStrings.length > 0) return leaveStrings.join(', ');
    }
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];
    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);
    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-blue-600">Loading payroll data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-8xl">

        {/* Search and Filter */}
        <div className="px-4 py-2 mb-3 bg-white border rounded-lg shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by ID or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1.5 pl-8 pr-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-400"
              />
              <svg className="absolute w-4 h-4 text-gray-400 left-2 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const monthValue = e.target.value;
                  setSelectedMonth(monthValue);
                  monthValue ? fetchData(monthValue) : fetchData();
                }}
                className="px-2 py-1.5 text-sm border rounded-md cursor-pointer"
              />
              <button onClick={() => { setSelectedMonth(""); fetchData(); }} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200">
                Current
              </button>
              <button onClick={() => fetchData(selectedMonth)} disabled={isLoadingMonth} className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                {isLoadingMonth ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" />
                  </svg>
                ) : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4">
          <div className="px-3 py-2 bg-white border-l-2 border-blue-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">Total Employees</p>
                <p className="text-sm font-semibold text-gray-800">{filteredRecords.length}</p>
              </div>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0" />
                </svg>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-white border-l-2 border-green-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">Total Salary</p>
                <p className="text-sm font-semibold text-gray-800">₹{filteredRecords.reduce((s, e) => s + (e.calculatedSalary || 0), 0).toLocaleString()}</p>
              </div>
              <div className="p-1.5 bg-green-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" />
                </svg>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-white border-l-2 border-purple-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">Active This Month</p>
                <p className="text-sm font-semibold text-gray-800">{filteredRecords.filter(e => (e.totalWorkingDays || 0) > 0).length}</p>
              </div>
              <div className="p-1.5 bg-purple-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-white border-l-2 border-red-500 rounded-md shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">On Leave</p>
                <p className="text-sm font-semibold text-gray-800">
                  {filteredRecords.filter(emp => {
                    const leaves = employeeLeaves[emp.employeeId];
                    return leaves && (leaves.CL + leaves.EL + leaves.COFF + leaves.LOP) > 0;
                  }).length}
                </p>
              </div>
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Working Days</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Present Days</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Half Days</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Week Offs</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Monthly Salary</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Calculated Salary</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.map((item, index) => (
                  <tr key={item.employeeId} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 text-sm font-medium text-gray-900">{item.employeeId}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-800">{item.name?.charAt(0) || 'E'}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.department || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">{item.totalWorkingDays || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">{item.presentDays || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">{item.halfDayWorking || 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded">{item.weekOffs || 0} days</span>
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
                    <td className="p-4 text-right font-medium text-gray-900">₹{(item.salaryPerMonth || 0).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-green-700">₹{calculateSalary(item).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Daily: ₹{calculateDailyRate(item)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button onClick={() => handleView(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="View Details">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md" title="Edit Salary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => downloadInvoice(item)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md" title="Download Payslip">
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

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastRecord, filteredRecords.length)}</span>{' '}
                  of <span className="font-medium">{filteredRecords.length}</span> employees
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={handlePrevious} disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {getPageNumbers().map((pageNumber) => (
                    <button key={pageNumber} onClick={() => handlePageClick(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                      {pageNumber}
                    </button>
                  ))}
                  <button onClick={handleNext} disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}

          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'No payroll data available for the selected month'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <span className="text-lg font-semibold text-blue-800">{selectedEmployee.name?.charAt(0) || 'E'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedEmployee.employeeId}</p>
                  <p className="text-sm text-gray-600">Month: {selectedEmployee.month || selectedMonth || "Current"} ({selectedEmployee.monthDays || monthDays} days)</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Present Days</p><p className="text-lg font-semibold text-green-600">{selectedEmployee.presentDays || 0}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Working Days</p><p className="text-lg font-semibold text-blue-600">{selectedEmployee.totalWorkingDays || 0}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Half Days</p><p className="text-lg font-semibold text-yellow-600">{selectedEmployee.halfDayWorking || 0}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">WeekOff Days</p><p className="text-lg font-semibold text-purple-600">{selectedEmployee.weekOffs || 0}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Month Days</p><p className="text-lg font-semibold text-gray-800">{selectedEmployee.monthDays || monthDays}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Monthly Salary</p><p className="text-lg font-semibold text-blue-600">₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Daily Rate</p><p className="text-lg font-semibold text-gray-800">₹{calculateDailyRate(selectedEmployee)}/day</p></div>
              <div className="bg-white p-3 rounded-lg border"><p className="text-sm text-gray-600">Calculated Salary</p><p className="text-lg font-semibold text-green-600">₹{calculateSalary(selectedEmployee)}</p></div>
              <div className="bg-white p-3 rounded-lg border col-span-2"><p className="text-sm text-gray-600">Approved Leaves</p><p className="text font-semibold text-red-600">{getLeaveTypes(selectedEmployee)}</p></div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Salary Details - {selectedEmployee.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Month:</strong> {selectedEmployee.month || selectedMonth || "Current Month"} |
                <strong> Days in Month:</strong> {selectedEmployee.monthDays || monthDays} |
                <strong> Monthly Salary:</strong> ₹{getEmployeeData(selectedEmployee).salaryPerMonth || 0}
              </p>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Present Days</label>
                  <input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" max={selectedEmployee.monthDays || monthDays} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Working Days</label>
                  <input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" max={selectedEmployee.monthDays || monthDays} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Half Days</label>
                  <input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Full Day Leaves</label>
                  <input type="number" name="fullDayNotWorking" value={editFormData.fullDayNotWorking || 0} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Daily Rate (₹)</label>
                  <input type="text" value={editFormData.dailyRate || calculateDailyRate(selectedEmployee)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Calculated Salary (₹)</label>
                  <input type="number" name="calculatedSalary" value={editFormData.calculatedSalary || 0} onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" min="0" readOnly />
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Extra Work & Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Extra Days</label>
                    <input type="number" name="extraDays" value={extraWorkData.extraDays || 0} onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Bonus (₹)</label>
                    <input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Deductions (₹)</label>
                    <input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Reason</label>
                    <input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter reason for adjustments..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRoll;
