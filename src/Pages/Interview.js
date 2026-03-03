import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt, FaClock, FaCheck, FaTimes, FaInbox,
  FaSearch, FaSync, FaVideo, FaMapMarkerAlt, FaBriefcase,
  FaCheckCircle, FaTimesCircle
} from "react-icons/fa";



const API_BASE_URL = 'http://localhost:5000/api';


const Interview = () => {
  const { appliedJobs, searchQuery: globalSearchQuery, fetchDashboardData } = useOutletContext();

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const statusDropdownRef = useRef(null);

  // Filter applications that have an interview invitation
  const interviewApps = appliedJobs.filter(app =>
    app.interviewStatus === "Invited" || app.interviewStatus === "Rescheduled"
  );

  const statuses = ["Pending", "Confirmed", "Declined"];

  const filteredApps = interviewApps.filter(app => {
    const combinedQuery = (globalSearchQuery || localSearchQuery).toLowerCase();
    const matchesSearch =
      (app.jobId?.role || "").toLowerCase().includes(combinedQuery) ||
      (app.candidateInterviewStatus || "").toLowerCase().includes(combinedQuery);

    const matchesStatus = statusFilter
      ? (app.candidateInterviewStatus || "Pending") === statusFilter
      : true;

    let matchesDate = true;
    if (dateFilter && app.interviewTime) {
      const schedDate = new Date(app.interviewTime).toISOString().split("T")[0];
      matchesDate = schedDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleConfirm = async (applicationId, status, note = "") => {
    setConfirmingId(applicationId + status);
    try {
      const token = localStorage.getItem("candidateToken");
      await axios.put(
        `${API_BASE_URL}/candidate/confirm-interview`,
        { applicationId, status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating interview status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  const getConfirmationStyle = (status) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700";
      case "Declined": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const resetFilters = () => {
    setLocalSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
  };

  const hasFilters = localSearchQuery || statusFilter || dateFilter;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">

      {/* Header & Filters */}
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-shrink-0">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Interview Schedule</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Your upcoming interviews and confirmation status</p>
        </div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              className="w-full appearance-none bg-white py-2.5 px-4 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm sm:w-40 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDateFilter("")}>
                <FaTimes className="text-[10px]" />
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-52" ref={statusDropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
              <FaBriefcase className="text-xs" />
            </div>
            <div
              className="w-full bg-white py-2.5 pl-10 pr-10 text-xs text-gray-700 border border-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-50 shadow-sm text-ellipsis whitespace-nowrap overflow-hidden"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              {statusFilter || "Filter by Confirmation"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {statusFilter ? (
                <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setStatusFilter(""); }} />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              )}
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="max-h-60 overflow-y-auto py-2">
                  <div className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${!statusFilter ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`} onClick={() => { setStatusFilter(""); setIsStatusDropdownOpen(false); }}>
                    All Statuses
                  </div>
                  {statuses.map(s => (
                    <div key={s} className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors ${statusFilter === s ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`} onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FaSearch className="text-xs" />
            </div>
            <input
              type="text"
              className="w-full py-2.5 pl-10 pr-10 text-xs text-gray-700 placeholder-gray-400 font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Search role, status..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            {localSearchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setLocalSearchQuery("")} />
              </div>
            )}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm uppercase tracking-widest transition-all">
              <FaSync className="text-[10px]" /> Reset
            </button>
          )}

          <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filteredApps.length} Interviews</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
        {filteredApps.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-[10px] text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="py-4 px-8 text-center">Role</th>
                <th className="py-4 px-6 text-center">Interview Date & Time</th>
                <th className="py-4 px-6 text-center">Mode</th>
                <th className="py-4 px-6 text-center">Confirmation</th>
                <th className="py-4 px-8 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app) => {
                const confirmStatus = app.candidateInterviewStatus || "Pending";
                const isPending = confirmStatus === "Pending";
                return (
                  <tr key={app._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    {/* Role */}
                    <td className="py-6 px-8 text-center">
                      <div className="font-black text-sm text-gray-900">{app.jobId?.role || "N/A"}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest ${app.interviewStatus === "Rescheduled" ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
                        {app.interviewStatus || "Invited"}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-6 px-6 text-center">
                      {app.interviewTime ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 text-xs font-black text-gray-800">
                            <FaCalendarAlt className="text-indigo-400" size={10} />
                            {new Date(app.interviewTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500">
                            <FaClock className="text-gray-300" size={9} />
                            {new Date(app.interviewTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">TBD</span>
                      )}
                    </td>

                    {/* Mode */}
                    <td className="py-6 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600">
                        {(app.interviewMode || "Online").toLowerCase() === "online" ? (
                          <FaVideo className="text-indigo-400" size={11} />
                        ) : (
                          <FaMapMarkerAlt className="text-orange-400" size={11} />
                        )}
                        <span>{app.interviewMode || "Online"}</span>
                      </div>
                    </td>

                    {/* Confirmation Status */}
                    <td className="py-6 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getConfirmationStyle(confirmStatus)}`}>
                        {confirmStatus.toUpperCase()}
                      </span>
                      {app.candidateInterviewNote && (
                        <div className="mt-1 text-[9px] text-gray-400 italic max-w-[120px] mx-auto truncate" title={app.candidateInterviewNote}>
                          "{app.candidateInterviewNote}"
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-6 px-8 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleConfirm(app._id, "Declined")}
                            disabled={confirmingId === app._id + "Declined"}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            <FaTimesCircle size={10} />
                            Decline
                          </button>
                          <button
                            onClick={() => handleConfirm(app._id, "Confirmed")}
                            disabled={confirmingId === app._id + "Confirmed"}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                          >
                            <FaCheckCircle size={10} />
                            Confirm
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${confirmStatus === "Confirmed" ? "text-green-600" : "text-red-500"}`}>
                          {confirmStatus === "Confirmed" ? <FaCheck size={10} /> : <FaTimes size={10} />}
                          {confirmStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto mb-6 border-2 border-dashed border-gray-100 animate-pulse">
              <FaInbox size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">No Interviews Scheduled</h3>
            <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-xs mx-auto">
              Interview invitations from HR will appear here. Keep checking your status on the Applications page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;