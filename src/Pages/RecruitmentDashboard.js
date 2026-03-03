import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import { FiUsers, FiUserCheck, FiUserX, FiUserPlus, FiTrendingUp, FiPieChart, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const SCORE_COLORS = {
  "0-40": "#ef4444",
  "40-50": "#f97316",
  "50-60": "#f59e0b",
  "60-70": "#eab308",
  "70-80": "#84cc16",
  "80-90": "#10b981",
  "90-100": "#6366f1"
};

const QualityCard = ({ label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100"
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color] || colorClasses.blue} flex items-center justify-between shadow-sm`}>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="text-xl font-black">
        <CountUp end={value} duration={1.5} />
      </span>
    </div>
  );
};

const RecruitmentDashboard = () => {
  const [stats, setStats] = useState({
    totalApplicants: 0,
    selected: 0,
    rejected: 0,
    interview: 0,
    statusBreakdown: [],
    monthlyTrend: [],
    scoreDistribution: [],
    qualityMetrics: {
      score50plus: 0,
      score60plus: 0,
      score70plus: 0,
      score80plus: 0,
      score90plus: 0
    },
    availableRoles: []
  });
  const [statusRole, setStatusRole] = useState("All");
  const [scoreRole, setScoreRole] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/applications/stats`, {
          params: {
            statusRole: statusRole,
            scoreRole: scoreRole
          }
        });
        if (response.data.success) {
          setStats(response.data.stats);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recruitment stats:", err);
        setError("Failed to load recruitment statistics");
        setLoading(false);
      }
    };

    fetchStats();
  }, [statusRole, scoreRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-indigo-600 font-medium animate-pulse">
        Loading Recruitment Analytics...
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

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50/50">
      {/* Main container with left padding */}
      <div className="max-w-full mx-auto pl-2 md:pl-4 lg:pl-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">Recruitment Overview</h1>
          <p className="text-sm text-gray-500 font-medium">Data-driven insights for your hiring funnel</p>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FiUsers}
            label="Total Applicants"
            value={stats.totalApplicants}
            color="indigo"
            onClick={() => navigate("/job-applicants")}
          />
          <StatCard
            icon={FiUserPlus}
            label="Interviews"
            value={stats.interview}
            color="amber"
            onClick={() => navigate("/job-applicants?status=Interview")}
          />
          <StatCard
            icon={FiUserCheck}
            label="Selected"
            value={stats.selected}
            color="emerald"
            onClick={() => navigate("/job-applicants?status=Selected")}
          />
          <StatCard
            icon={FiUserX}
            label="Rejected"
            value={stats.rejected}
            color="rose"
            onClick={() => navigate("/job-applicants?status=Rejected")}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">

          {/* 1. Status Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Status Distribution</h3>
                <p className="text-xs text-gray-500">Breakdown of applicants by stage</p>
              </div>
              <select
                className="bg-purple-50 border-none text-[10px] font-bold text-purple-700 rounded-lg focus:ring-1 focus:ring-purple-500 py-1 px-2 cursor-pointer outline-none transition-all hover:bg-purple-100"
                value={statusRole}
                onChange={(e) => setStatusRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                {stats.availableRoles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              {stats.statusBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Applicants`, 'Count']} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">No status data available</div>
              )}
            </div>
          </div>

          {/* 2. Score Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-800">Score Distribution</h3>
                <p className="text-xs text-gray-500">Candidates by score range</p>
              </div>
              <select
                className="bg-emerald-50 border-none text-[10px] font-bold text-emerald-700 rounded-lg focus:ring-1 focus:ring-emerald-500 py-1 px-2 cursor-pointer outline-none transition-all hover:bg-emerald-100"
                value={scoreRole}
                onChange={(e) => setScoreRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                {stats.availableRoles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full mt-2">
              {stats.scoreDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(value) => [`${value} Candidates`, 'Count']}
                      contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      barSize={25}
                    >
                      {stats.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SCORE_COLORS[entry.range] || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">No distribution data available</div>
              )}
            </div>
          </div>

        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center group cursor-pointer hover:border-indigo-200 transition-all hover:bg-slate-50/50" onClick={() => navigate("/job-applicants")}>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FiUsers className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Applicants Overview</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Manage your hiring funnel and track candidates from application to offer.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center group cursor-pointer hover:border-emerald-200 transition-all hover:bg-slate-50/50" onClick={() => navigate("/job-posts")}>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <FiUserCheck className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hiring Velocity</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Analyze your time-to-hire and conversation rates for better planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const themes = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
  };

  return (
    <div
      className="flex flex-row items-center gap-3 p-4 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:translate-y-[-2px] active:scale-95 group"
      onClick={onClick}
    >
      <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${themes[color]} group-hover:bg-white`}>
        <Icon className="text-xl" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase truncate">{label}</p>
        <p className="text-xl font-black leading-tight text-gray-800">
          <CountUp end={parseFloat(value)} duration={2} />
        </p>
      </div>
    </div>
  );
};

export default RecruitmentDashboard;