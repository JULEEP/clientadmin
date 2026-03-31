



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
import { API_BASE_URL } from '../utils/config';

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
  const [tatRole, setTatRole] = useState("All");
  const [trendRole, setTrendRole] = useState("All");
  const [trendMonth, setTrendMonth] = useState("");
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
            scoreRole: scoreRole,
            tatRole: tatRole,
            trendRole: trendRole,
            ...(trendMonth ? { trendMonth } : {})
          }
        });
        if (response.data.success) {
          console.log("Recruitment Stats:", response.data.stats);
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
  }, [statusRole, scoreRole, tatRole, trendRole, trendMonth]);

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
          label="Total Applicants"
          value={stats.totalApplicants || 0}
          color="indigo"
          onClick={() => navigate("/job-applicants")}
        />
        <StatCard
          icon={FiUserPlus}
          label="Interviews"
          value={stats.interview || 0}
          color="amber"
          onClick={() => navigate("/schedule-interviews")}
        />
        <StatCard
          icon={FiUserCheck}
          label="Selected"
          value={stats.selected || 0}
          color="emerald"
          onClick={() => navigate("/selected-candidates")}
        />
        <StatCard
          icon={FiUserX}
          label="Rejected"
          value={stats.rejected || 0}
          color="rose"
          onClick={() => navigate("/rejected-candidates")}
        />
        <StatCard
          icon={FiBriefcase}
          label="Total Vacancies"
          value={stats.totalVacancies || 0}
          color="purple"
          onClick={() => navigate("/job-positions-status")}
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
        <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Quality Metrics</h3>
              <p className="text-xs text-gray-500">Candidates scoring above thresholds</p>
            </div>
            <FiTrendingUp className="text-2xl text-indigo-400 opacity-50" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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

        {/* 3. Hiring TAT (Turnaround Time) - Candidate-wise Graph */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">Hiring TAT (Days)</h3>
              <p className="text-xs text-gray-500">Candidate-wise hiring duration</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-600 bg-white"
                value={tatRole}
                onChange={(e) => setTatRole(e.target.value)}
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
                View Details →
              </button>
            </div>
          </div>

          <div className="flex-1 w-full overflow-x-auto">
            {stats.tatDistribution?.length > 0 ? (
              <div style={{ minWidth: Math.max(stats.tatDistribution.length * 50, 400) }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.tatDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value} Days`, 'Hiring TAT']}
                    />
                    <Bar dataKey="days" radius={[4, 4, 0, 0]} barSize={25}>
                      {stats.tatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                <FiBriefcase className="w-8 h-8 mb-2 opacity-20" />
                <p>No TAT data available</p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* 4. Monthly Trend - Additional Chart like AttendanceDashboard */}
      <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[300px] mb-4">
        <div className="flex items-center justify-between mb-3 px-2 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-800">Monthly Application Trend</h3>
            <p className="text-xs text-gray-500">
              {trendMonth ? `Daily breakdown for ${new Date(trendMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'Applications over the last 6 months'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-600 bg-white"
              value={trendRole}
              onChange={(e) => setTrendRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              {stats.availableRoles?.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <input
              type="month"
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-600 bg-white cursor-pointer"
              value={trendMonth}
              onChange={(e) => setTrendMonth(e.target.value)}
              title="Filter by month for daily view"
            />
            {trendMonth && (
              <button
                onClick={() => setTrendMonth("")}
                className="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors"
                title="Clear month filter"
              >
                ✕ Clear
              </button>
            )}
            <button
              onClick={() => navigate("/job-applicants")}
              className="font-bold text-indigo-600 transition-colors text-xs hover:text-indigo-800 whitespace-nowrap"
            >
              View All →
            </button>
          </div>
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
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} Applications`, 'Count']}
                />
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

// StatCard component - Matching the main Dashboard design
const StatCard = ({ icon: Icon, label, value, color, onClick, isPercentage }) => {
  const themes = {
    indigo: "border-indigo-500",
    emerald: "border-emerald-500",
    amber: "border-amber-500",
    rose: "border-rose-500",
    cyan: "border-cyan-500",
  };

  const currentTheme = themes[color] || themes.indigo;

  return (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        <CountUp end={value} duration={2} separator="," />
        {isPercentage && "%"}
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
    <div className={`p-2 px-3 rounded-xl border ${colorClasses[color] || colorClasses.indigo} shadow-sm`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-black text-gray-800">
          <CountUp end={value} duration={1.5} />
        </span>
        <span className="text-[10px] font-bold text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full h-1 bg-white rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color === 'amber' ? 'bg-amber-500' :
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