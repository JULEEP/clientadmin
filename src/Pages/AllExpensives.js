import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMoneyBillWave,
  FaSync,
  FaEye,
  FaSearch,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api';

const AllExpensives = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // KM Rate State (GLOBAL - no clientId)
  const [kmRate, setKmRate] = useState(0);
  const [newRate, setNewRate] = useState('');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [rateMessage, setRateMessage] = useState({ text: '', type: '' });

  // Get clientId from localStorage (ONLY for fetching expenses)
  const clientId = localStorage.getItem('clientId') || '';

  useEffect(() => {
    // Fetch global KM rate (NO clientId needed)
    fetchKmRate();
    
    // Fetch client-specific expenses
    if (clientId) {
      fetchAllExpenses();
    } else {
      console.error("Client ID not found. Please login again.");
      setError("Client ID not found. Please login again.");
      setLoading(false);
    }
  }, [clientId]);

  // 🔍 Fetch GLOBAL KM rate (no clientId)
  const fetchKmRate = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/expense/rate`);
      if (res.data.success) {
        setKmRate(res.data.rate);
        setNewRate(res.data.rate.toString());
      }
    } catch (err) {
      console.error("Failed to fetch rate:", err);
    }
  };

  // 🔄 Update GLOBAL KM rate (no clientId)
  const handleUpdateRate = async () => {
    if (!newRate || isNaN(newRate) || parseFloat(newRate) <= 0) {
      setRateMessage({ text: 'Invalid rate', type: 'error' });
      return;
    }

    setIsUpdatingRate(true);
    setRateMessage({ text: '', type: '' });
    try {
      const res = await axios.put(`${API_BASE_URL}/expense/rate`, { rate: parseFloat(newRate) });
      if (res.data.success) {
        setKmRate(res.data.rate);
        setRateMessage({ text: 'Rate updated!', type: 'success' });
        setTimeout(() => setRateMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setRateMessage({ text: 'Update failed', type: 'error' });
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // 📊 Fetch client-specific expenses (WITH clientId)
  const fetchAllExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/expense/all/${clientId}`);
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching all expenses:", error);
      setError(error.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // Filter original records
  const filteredRecords = expenses.filter(exp => {
    const query = searchQuery.toLowerCase();
    const empName = (exp.employeeDetails?.name || '').toLowerCase();
    const empId = (exp.employeeId || '').toLowerCase();
    const purpose = (exp.purpose || '').toLowerCase();

    const matchesSearch = empName.includes(query) || empId.includes(query) || purpose.includes(query);

    let matchesDate = true;
    if (dateFilter) {
      const expDate = new Date(exp.date).toISOString().split('T')[0];
      matchesDate = expDate === dateFilter;
    }

    return matchesSearch && matchesDate;
  });

  // Group filtered records by EmployeeId
  const groupedData = filteredRecords.reduce((acc, current) => {
    const empId = current.employeeId;
    if (!acc[empId]) {
      acc[empId] = {
        employeeId: empId,
        employeeDetails: current.employeeDetails,
        records: [],
        totalAmount: 0,
        totalKm: 0,
        visitCount: 0
      };
    }
    acc[empId].records.push(current);
    acc[empId].totalAmount += current.totalAmount || 0;
    acc[empId].totalKm += current.km || 0;
    acc[empId].visitCount += 1;
    return acc;
  }, {});

  const groupedExpenses = Object.values(groupedData).sort((a, b) => b.totalAmount - a.totalAmount);
  const totalGlobalSum = filteredRecords.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

  // Client Info Banner Component
  const ClientInfoBanner = () => (
    <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-200 ml-0 md:ml-2 lg:ml-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Client ID:</span>
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded text-xs">
            {clientId.substring(0, 8)}...
          </span>
          <span className="ml-4 text-xs text-gray-500">
            Showing expenses for your client account
          </span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Total Expenses: {filteredRecords.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 font-sans">
      {/* Main container with left padding */}
      <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
        {/* Client Info Banner - Shows clientId for expenses only */}
        {clientId && <ClientInfoBanner />}

        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-shrink-0">
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">All Expenses</h2>
          </div>

          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            {/* Global Sum Stats */}
            <div className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Global Reimbursement</span>
              <span className="text-sm font-black text-indigo-600">₹{totalGlobalSum.toLocaleString()}</span>
            </div>

            {/* Rate Management - GLOBAL (NO clientId) */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm p-1.5 h-[38px] relative">
              <span className="text-[10px] font-bold text-gray-400 uppercase px-2 flex items-center gap-1.5 whitespace-nowrap">
                <FaMoneyBillWave className="text-green-500" /> KM Rate: ₹{kmRate}
              </span>
              <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
              <div className="relative group">
                <input
                  type="number"
                  placeholder="New rate"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-16 h-full bg-gray-50 border-none text-xs font-bold text-gray-700 focus:ring-0 rounded-md px-2 placeholder:text-gray-300"
                />
              </div>
              <button
                onClick={handleUpdateRate}
                disabled={isUpdatingRate || newRate === kmRate.toString()}
                className="px-3 h-full bg-blue-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-1"
              >
                {isUpdatingRate ? <FaSync className="animate-spin" /> : <FaCheckCircle />}
                Update
              </button>
              {rateMessage.text && (
                <div className={`absolute -bottom-6 right-0 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-20 ${rateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {rateMessage.text}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                className="w-full appearance-none bg-white h-[38px] px-4 pr-10 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 shadow-sm sm:w-40"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDateFilter("")}>
                  <FaTimes className="text-[12px]" />
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
              <input 
                type="text" 
                className="w-full h-[38px] py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
                placeholder="Search employee or ID..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FaSearch className="text-sm" />
              </div>
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FaTimes className="text-[12px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setSearchQuery("")} />
                </div>
              )}
            </div>

            <button 
              onClick={fetchAllExpenses} 
              className="h-[38px] w-[38px] flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs font-bold">{error}</div>}

        {/* Grouped Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          {loading && expenses.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Processing Data...</p>
            </div>
          ) : groupedExpenses.length > 0 ? (
            <table className="min-w-full">
              <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                <tr>
                  <th className="py-4 px-6 font-bold text-center">Employee</th>
                  <th className="py-4 px-6 font-bold text-center">Designation</th>
                  <th className="py-4 px-6 font-bold text-center">Total Visits</th>
                  <th className="py-4 px-6 font-bold text-center">Total Distance</th>
                  <th className="py-4 px-6 font-bold text-right whitespace-nowrap">Total Reimbursement</th>
                  <th className="py-4 px-6 font-bold text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 uppercase tracking-tighter">
                {groupedExpenses.map((group, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm font-medium text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-bold text-gray-800">{group.employeeDetails?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">ID: {group.employeeId}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-center">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {group.employeeDetails?.role || 'Employee'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      <span className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-full border border-gray-100">
                        {group.visitCount} Visits
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-center">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                        {group.totalKm} KM
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-black text-gray-900 tabular-nums">₹{group.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleOpenModal(group)} 
                        className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 font-bold text-xs group/btn mx-auto bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
                      >
                        <FaEye className="group-hover/btn:scale-110" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                <FaMoneyBillWave size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 tracking-tight">No Records Found</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto font-medium">
                No expense records match your current filtering criteria.
              </p>
            </div>
          )}
        </div>

        {/* Aggregate Details Modal */}
        {isModalOpen && selectedGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-gray-200">
              {/* Header */}
              <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {selectedGroup.employeeDetails?.name ? selectedGroup.employeeDetails.name[0].toUpperCase() : 'E'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {selectedGroup.employeeDetails?.name || 'System User'}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 underline decoration-blue-200 underline-offset-4">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                        ID: {selectedGroup.employeeId}
                      </span>
                      <span className="text-xs font-bold text-gray-400">|</span>
                      <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                        {selectedGroup.employeeDetails?.role || 'Employee'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total visits</p>
                    <p className="text-xl font-bold text-gray-900">{selectedGroup.visitCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reimbursement</p>
                    <p className="text-3xl font-black text-blue-700 tabular-nums">₹{selectedGroup.totalAmount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 shadow-sm"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Modal Body - Detailed Table */}
              <div className="flex-1 overflow-y-auto p-0 bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 text-left border-r border-blue-600/30">Date</th>
                      <th className="px-6 py-4 text-left border-r border-blue-600/30">Purpose of visit</th>
                      <th className="px-6 py-4 text-center border-r border-blue-600/30">KM</th>
                      <th className="px-6 py-4 text-right border-r border-blue-600/30">Rate</th>
                      <th className="px-6 py-4 text-center border-r border-blue-600/30">Outcome</th>
                      <th className="px-6 py-4 text-right border-r border-blue-600/30">Order</th>
                      <th className="px-6 py-4 text-right border-r border-blue-600/30">Upsell</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {selectedGroup.records.map((rec, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-bold border-r border-gray-50 uppercase tracking-tighter">
                          {new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-gray-900 border-r border-gray-50">
                          <div className="flex flex-col">
                            <span className="font-bold">{rec.purpose}</span>
                            {rec.remark && <span className="text-[10px] text-gray-400 mt-1 italic font-medium">{rec.remark}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center border-r border-gray-50 text-blue-600 font-black tabular-nums">
                          {rec.km}
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-gray-400 text-xs font-bold whitespace-nowrap">
                          ₹{rec.rateApplied}/km
                        </td>
                        <td className="px-6 py-4 text-center border-r border-gray-50">
                          <span className="text-[10px] font-bold italic text-gray-500 max-w-[150px] truncate block" title={rec.outcome}>
                            "{rec.outcome || '-'}"
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-green-600 tabular-nums font-bold">
                          {rec.orderValue > 0 ? `₹${rec.orderValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-purple-600 tabular-nums font-bold">
                          {rec.upsellValue > 0 ? `₹${rec.upsellValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right bg-blue-50/30 text-blue-900 font-black tabular-nums">
                          ₹{rec.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedGroup.records.length === 0 && (
                  <div className="py-20 text-center text-gray-400 italic font-medium">No individual logs available.</div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
};

export default AllExpensives;