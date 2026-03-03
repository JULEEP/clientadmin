import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaRoute,
  FaClipboardList,
  FaShoppingCart,
  FaChartLine,
  FaCommentDots,
  FaPlus,
  FaHistory,
  FaCog,
  FaSync,
  FaTimes,
  FaEye,
  FaInfoCircle
} from 'react-icons/fa';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kmRate, setKmRate] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [formData, setFormData] = useState({
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    km: '',
    outcome: '',
    orderValue: '',
    upsellValue: '',
    remark: ''
  });

  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [expensesRes, rateRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/expense/my?employeeId=${employeeId}`),
        axios.get(`${API_BASE_URL}/expense/rate`)
      ]);

      if (expensesRes.data.success) setExpenses(expensesRes.data.data);
      if (rateRes.data.success) {
        setKmRate(rateRes.data.rate);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purpose || !formData.km || !formData.date) {
      alert("Please fill in purpose, distance, and date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/expense/add`, {
        ...formData,
        employeeId
      });

      if (res.data.success) {
        setExpenses([res.data.expense, ...expenses]);
        setFormData({
          purpose: '',
          date: new Date().toISOString().split('T')[0],
          km: '',
          outcome: '',
          orderValue: '',
          upsellValue: '',
          remark: ''
        });
        setIsModalOpen(false);
        alert("Expense recorded successfully!");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Failed to record expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  const calculatedCost = formData.km ? (parseFloat(formData.km) * kmRate).toFixed(2) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      {/* Page content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900">
                My Expense Records
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
              >
                + Record Expense
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-gray-50 border rounded-lg flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Rate:</span>
                <span className="text-sm font-bold text-blue-600">₹{kmRate}/KM</span>
              </div>
            </div>
          </div>


          {expenses.length === 0 && !loading ? (
            <p className="text-gray-500">No expense records found.</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-3">Purpose & Date</th>
                    <th className="px-4 py-3 text-center">Distance</th>
                    <th className="px-4 py-3 text-center">Outcome</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{expense.purpose}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <FaCalendarAlt className="text-[10px]" /> {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-600">
                        {expense.km} KM
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-semibold text-gray-700">{expense.outcome || '-'}</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {expense.orderValue > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-bold rounded uppercase tabular-nums">Order: ₹{expense.orderValue}</span>
                              </div>
                            )}
                            {expense.upsellValue > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded uppercase tabular-nums">Upsell: ₹{expense.upsellValue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-gray-900">₹{expense.totalAmount}</span>
                          <span className="text-[9px] text-gray-300">@{expense.rateApplied}/km</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Record Expense Modal - EXACT Match with Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl animate-in zoom-in-95 duration-200 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Record Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">Purpose of Travel</label>
                <input
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="e.g., Client meeting"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">KM Traveled</label>
                  <input
                    type="number"
                    name="km"
                    value={formData.km}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estimated Cost:</span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">₹{calculatedCost}</span>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">Meeting Outcome</label>
                <input
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Outcome of the visit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Order Value</label>
                  <input
                    type="number"
                    name="orderValue"
                    value={formData.orderValue}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Upsell Value</label>
                  <input
                    type="number"
                    name="upsellValue"
                    value={formData.upsellValue}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-left">Remark</label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Additional notes"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold"
                >
                  {submitting ? "Submitting..." : "Submit Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Details Modal - Match Sleek Record Modal UI */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl animate-in zoom-in-95 duration-200 text-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Expense Details</h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 text-left">Purpose of Travel</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-bold text-left">
                  {selectedExpense.purpose}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-500">Date</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-medium">
                    {new Date(selectedExpense.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-500">KM Traveled</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-medium tabular-nums">
                    {selectedExpense.km} KM
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-700 tabular-nums block">₹{selectedExpense.totalAmount}</span>
                  <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">@{selectedExpense.rateApplied}/km</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 text-left">Meeting Outcome</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-800 font-medium text-left">
                  {selectedExpense.outcome || '-'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-500">Order Value</label>
                  <div className="w-full p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-bold tabular-nums">
                    ₹{selectedExpense.orderValue || 0}
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-500">Upsell Value</label>
                  <div className="w-full p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-700 font-bold tabular-nums">
                    ₹{selectedExpense.upsellValue || 0}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 text-left">Remark</label>
                <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 text-xs min-h-[60px] text-left">
                  {selectedExpense.remark || '-'}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;