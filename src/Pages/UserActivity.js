import axios from "axios";
import { useEffect, useState } from "react";
import { FiCalendar, FiSearch } from "react-icons/fi";

const API_BASE_URL = 'http://localhost:5000/api';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    userRole: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 50,
  });
  const [stats, setStats] = useState(null);

  // Get clientId from localStorage
  const getClientId = () => localStorage.getItem("clientId") || "";

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const clientId = getClientId();

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );

      const response = await axios.get(
        `${API_BASE_URL}/user-activity/all/${clientId}`,
        { params }
      );

      if (response.data.success) {
        setActivities(response.data.data.activities);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const clientId = getClientId();
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await axios.get(
        `${API_BASE_URL}/user-activity/stats/${clientId}`,
        { params }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [pagination.currentPage, filters]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ search: "", action: "", userRole: "", startDate: "", endDate: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Timestamp", "User Name", "User Email", "Role", "Action", "Details"];
    const csvData = activities.map((activity) => [
      new Date(activity.createdAt).toLocaleString(),
      activity.userName,
      activity.userEmail,
      activity.userRole,
      formatActionName(activity.action),
      activity.actionDetails,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Format action name
  const formatActionName = (action) => {
    const actionMap = {
      login: "Login",
      logout: "Logout",
      leave_apply: "Leave Applied",
      leave_approve: "Leave Approved",
      leave_reject: "Leave Rejected",
      payslip_download: "Payslip Downloaded",
    };
    return actionMap[action] || action;
  };

  // Get action badge color
  const getActionBadgeColor = (action) => {
    const colorMap = {
      login: "bg-green-100 text-green-800",
      logout: "bg-gray-100 text-gray-800",
      leave_apply: "bg-blue-100 text-blue-800",
      leave_approve: "bg-emerald-100 text-emerald-800",
      leave_reject: "bg-red-100 text-red-800",
      payslip_download: "bg-purple-100 text-purple-800",
    };
    return colorMap[action] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Type */}
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="leave_apply">Leave Applied</option>
              <option value="leave_approve">Leave Approved</option>
              <option value="leave_reject">Leave Rejected</option>
              <option value="payslip_download">Payslip Downloaded</option>
            </select>

            {/* User Role */}
            <select
              name="userRole"
              value={filters.userRole}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            {/* Start Date */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">Timestamp</th>
                  <th className="py-2 text-center">User</th>
                  <th className="py-2 text-center">Role</th>
                  <th className="py-2 text-center">Action</th>
                  <th className="py-2 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading activities...</span>
                      </div>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No activities found</p>
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(activity.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{activity.userName}</span>
                          <span className="text-xs text-gray-500">{activity.userEmail || activity.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.userRole === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                          {activity.userRole.charAt(0).toUpperCase() + activity.userRole.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(activity.action)}`}>
                          {formatActionName(activity.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{activity.actionDetails}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && activities.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
                {" "}to{" "}
                <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span>
                {" "}of{" "}
                <span className="font-medium">{pagination.totalCount}</span> results
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setPagination((prev) => ({ ...prev, currentPage: page }))}
                          className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
