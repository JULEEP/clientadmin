import axios from 'axios';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import {
  FiBriefcase,
  FiTrendingUp,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiUserX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

const API_BASE_URL = 'http://localhost:5000/api'

const COLORS = [
  '#4F46E5', // Indigo 600
  '#10B981', // Emerald 500
  '#F59E0B', // Amber 500
  '#EF4444', // Rose 500
  '#8B5CF6', // Violet 500
  '#EC4899', // Pink 500
  '#06B6D4', // Cyan 500
  '#F97316'  // Orange 500
];

const SCORE_COLORS = {
  "0-40": "#EF4444",
  "40-50": "#F97316",
  "50-60": "#F59E0B",
  "60-70": "#EAB308",
  "70-80": "#84CC16",
  "80-90": "#10B981",
  "90-100": "#4F46E5"
};

// Custom Tooltip Components
const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3 py-2 text-xs bg-white border border-gray-100 rounded-lg shadow-xl">
        <p className="font-bold text-gray-800 mb-0.5 leading-none">{data.name}</p>
        <p className="leading-none text-gray-500">Count: {data.value}</p>
      </div>
    );
  }
  return null;
};

const ScoreTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3 py-2 text-xs bg-white border border-gray-100 rounded-lg shadow-xl">
        <p className="font-bold text-gray-800 mb-0.5 leading-none">{data.range}</p>
        <p className="leading-none text-gray-500">Candidates: {data.count}</p>
      </div>
    );
  }
  return null;
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

  // Calculate additional metrics
  const interviewToSelectedRate = stats.interview > 0 
    ? ((stats.selected / stats.interview) * 100).toFixed(1) 
    : 0;
  
  const rejectionRate = stats.totalApplicants > 0 
    ? ((stats.rejected / stats.totalApplicants) * 100).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-indigo-600 font-medium animate-pulse">
        Initializing Recruitment Analytics...
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

  return (
    <div className="min-h-screen p-2 lg:p-6 bg-gray-50/50">
      {/* Header Section */}
      {/* <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Recruitment Overview</h1>
        <p className="text-sm text-gray-500 font-medium">Data-driven insights for your hiring funnel</p>
      </div> */}

      {/* 1. Top Summary Stats - Like AttendanceDashboard */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={FiUsers}
          label={`Total Applicants: ${stats.totalApplicants || 0}`}
          color="indigo"
          onClick={() => navigate("/job-applicants")}
        />
        <StatCard
          icon={FiUserPlus}
          label={`Interviews: ${stats.interview || 0}`}
          color="amber"
          onClick={() => navigate("/job-applicants?status=Interview")}
        />
        <StatCard
          icon={FiUserCheck}
          label={`Selected: ${stats.selected || 0}`}
          color="emerald"
          onClick={() => navigate("/job-applicants?status=Selected")}
        />
        <StatCard
          icon={FiUserX}
          label={`Rejected: ${stats.rejected || 0}`}
          color="rose"
          onClick={() => navigate("/job-applicants?status=Rejected")}
        />
        <StatCard
          icon={FiTrendingUp}
          label={`Success Rate: ${interviewToSelectedRate}%`}
          color="cyan"
          onClick={() => navigate("/job-applicants")}
        />
      </div>

      {/* 2. Charts Section - Like AttendanceDashboard layout */}
      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
        {/* Status Distribution - Pie Chart */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">Status Distribution</h3>
              <p className="text-xs text-gray-500">Breakdown of applicants by stage</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-600 bg-white"
                value={statusRole}
                onChange={(e) => setStatusRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                {stats.availableRoles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                onClick={() => navigate("/job-applicants")}
                className="font-bold text-indigo-600 transition-colors text-xs hover:text-indigo-800 whitespace-nowrap"
              >
                View All →
              </button>
            </div>
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
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                  >
                    {stats.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
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
                <FiBriefcase className="w-10 h-10 mb-2 opacity-20" />
                <p>No status data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Score Distribution - Bar Chart */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">Score Distribution</h3>
              <p className="text-xs text-gray-500">Candidates by score range</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-600 bg-white"
                value={scoreRole}
                onChange={(e) => setScoreRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                {stats.availableRoles?.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                onClick={() => navigate("/job-applicants")}
                className="font-bold text-emerald-600 transition-colors text-xs hover:text-emerald-800 whitespace-nowrap"
              >
                View Details →
              </button>
            </div>
          </div>

          <div className="flex-1 w-full">
            {stats.scoreDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="range"
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
                  <Tooltip content={<ScoreTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={25}>
                    {stats.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SCORE_COLORS[entry.range] || "#4F46E5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                <FiTrendingUp className="w-8 h-8 mb-2 opacity-20" />
                <p>No score data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Quality Metrics & Quick Actions - Like AttendanceDashboard layout */}
      <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
        {/* Quality Metrics Cards */}
        <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Quality Metrics</h3>
              <p className="text-xs text-gray-500">Candidates scoring above thresholds</p>
            </div>
            <FiTrendingUp className="text-2xl text-indigo-400 opacity-50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QualityCard
              label="50+ Score"
              value={stats.qualityMetrics?.score50plus || 0}
              total={stats.totalApplicants}
              color="amber"
            />
            <QualityCard
              label="60+ Score"
              value={stats.qualityMetrics?.score60plus || 0}
              total={stats.totalApplicants}
              color="emerald"
            />
            <QualityCard
              label="70+ Score"
              value={stats.qualityMetrics?.score70plus || 0}
              total={stats.totalApplicants}
              color="cyan"
            />
            <QualityCard
              label="80+ Score"
              value={stats.qualityMetrics?.score80plus || 0}
              total={stats.totalApplicants}
              color="indigo"
            />
            <QualityCard
              label="90+ Score"
              value={stats.qualityMetrics?.score90plus || 0}
              total={stats.totalApplicants}
              color="purple"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Interview to Selection Rate</span>
              <span className="font-bold text-emerald-600">{interviewToSelectedRate}%</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">Overall Rejection Rate</span>
              <span className="font-bold text-rose-600">{rejectionRate}%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions - Like AttendanceDashboard */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center group cursor-pointer hover:border-indigo-200 transition-all hover:bg-slate-50/50" onClick={() => navigate("/job-posts")}>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <FiBriefcase className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Job Posts</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Create, update, and manage your job postings to attract top talent.
            </p>
            <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Go to Job Posts →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Monthly Trend - Additional Chart like AttendanceDashboard */}
      <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[300px] mb-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <div>
            <h3 className="text-base font-bold text-gray-800">Monthly Application Trend</h3>
            <p className="text-xs text-gray-500">Applications received over time</p>
          </div>
          <button
            onClick={() => navigate("/job-applicants")}
            className="font-bold text-indigo-600 transition-colors text-xs hover:text-indigo-800"
          >
            View All →
          </button>
        </div>

        <div className="flex-1 w-full">
          {stats.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fill="url(#colorApplications)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
              <FiTrendingUp className="w-8 h-8 mb-2 opacity-20" />
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// StatCard component - Exactly like AttendanceDashboard
const StatCard = ({ icon: Icon, label, color, onClick }) => {
  const themes = {
    indigo: {
      iconBg: "bg-indigo-100 text-indigo-600",
      border: "border-indigo-500",
    },
    emerald: {
      iconBg: "bg-emerald-100 text-emerald-600",
      border: "border-emerald-500",
    },
    amber: {
      iconBg: "bg-amber-100 text-amber-600",
      border: "border-amber-500",
    },
    rose: {
      iconBg: "bg-rose-100 text-rose-600",
      border: "border-rose-500",
    },
    cyan: {
      iconBg: "bg-cyan-100 text-cyan-600",
      border: "border-cyan-500",
    },
  };

  const currentTheme = themes[color] || themes.indigo;

  return (
    <div
      className={`flex flex-row items-center gap-2 p-2 transition-all duration-300 bg-white rounded-xl shadow-sm border-t-4 ${currentTheme.border} cursor-pointer hover:shadow-md hover:-translate-y-1`}
      onClick={onClick}
    >
      <div
        className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg ${currentTheme.iconBg}`}
      >
        <Icon className="text-base" />
      </div>

      <div className="flex flex-col min-w-0">
        <p className="text-xs font-semibold tracking-wide text-gray-700 uppercase truncate">
          {label}
        </p>
      </div>
    </div>
  );
};

// Quality Card component for metrics
const QualityCard = ({ label, value, total, color }) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  
  const colorClasses = {
    amber: "bg-amber-50 border-amber-100",
    emerald: "bg-emerald-50 border-emerald-100",
    cyan: "bg-cyan-50 border-cyan-100",
    indigo: "bg-indigo-50 border-indigo-100",
    purple: "bg-purple-50 border-purple-100",
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color] || colorClasses.indigo}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-gray-700">{percentage}%</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-lg font-black text-gray-800">
          <CountUp end={value} duration={1.5} />
        </span>
        <span className="text-[9px] text-gray-400">/ {total}</span>
      </div>
      <div className="w-full h-1 bg-white rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            color === 'amber' ? 'bg-amber-500' :
            color === 'emerald' ? 'bg-emerald-500' :
            color === 'cyan' ? 'bg-cyan-500' :
            color === 'purple' ? 'bg-purple-500' :
            'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default RecruitmentDashboard;