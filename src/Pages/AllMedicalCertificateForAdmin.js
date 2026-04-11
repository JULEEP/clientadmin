import React, { useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { FaSearch, FaDownload, FaEye } from "react-icons/fa";
import { FiList, FiCheckCircle, FiXCircle } from "react-icons/fi";

// API Configuration
const API_BASE_URL = "https://api.timelyhealth.in/api";
const API_DOMAIN = "https://api.timelyhealth.in";

// DUMMY DATA FOR FALLBACK
const DUMMY_CERTIFICATES = [
  {
    _id: "dummy_cert_001",
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    registrationDate: "2024-01-15T00:00:00.000Z",
    expiryDate: "2025-01-14T00:00:00.000Z",
    documentUrl: "/uploads/dummy_cert_001.pdf"
  },
  {
    _id: "dummy_cert_002",
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    registrationDate: "2023-12-10T00:00:00.000Z",
    expiryDate: "2024-12-09T00:00:00.000Z",
    documentUrl: "/uploads/dummy_cert_002.pdf"
  },
  {
    _id: "dummy_cert_003",
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    registrationDate: "2022-06-20T00:00:00.000Z",
    expiryDate: "2023-06-19T00:00:00.000Z",
    documentUrl: "/uploads/dummy_cert_003.pdf"
  },
  {
    _id: "dummy_cert_004",
    employeeId: "EMP005",
    employeeName: "Suresh Reddy",
    registrationDate: "2024-02-01T00:00:00.000Z",
    expiryDate: "2025-01-31T00:00:00.000Z",
    documentUrl: "/uploads/dummy_cert_004.pdf"
  },
  {
    _id: "dummy_cert_005",
    employeeId: "EMP006",
    employeeName: "Anjali Desai",
    registrationDate: "2023-10-05T00:00:00.000Z",
    expiryDate: "2024-10-04T00:00:00.000Z",
    documentUrl: "/uploads/dummy_cert_005.pdf"
  }
];

const AllMedicalCertificateForAdmin = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [error, setError] = useState("");

  // Get clientId from localStorage
  const clientId = localStorage.getItem("clientId") || "";

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load dummy data function
  const loadDummyData = () => {
    console.log("Loading dummy medical certificates as fallback");
    setIsUsingDummyData(true);
    setCertificates(DUMMY_CERTIFICATES);
    setFilteredCertificates(DUMMY_CERTIFICATES);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");
      setIsUsingDummyData(false);
      
      // If no clientId, use dummy data
      if (!clientId) {
        loadDummyData();
        return;
      }
      
      const res = await axios.get(`${API_BASE_URL}/medical-certificates/all/${clientId}`);
      
      if (res.data.success) {
        const data = res.data.data || [];
        if (data.length === 0) {
          loadDummyData();
        } else {
          setCertificates(data);
          setFilteredCertificates(data);
          setIsUsingDummyData(false);
        }
      } else {
        loadDummyData();
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setError(err.response?.data?.message || "Failed to fetch certificates");
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...certificates];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter((c) => {
        const isExpired = new Date(c.expiryDate) < today;
        return statusFilter === "active" ? !isExpired : isExpired;
      });
    }

    setFilteredCertificates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, certificates]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const downloadCSV = () => {
    if (filteredCertificates.length === 0) {
      alert("No data available to download!");
      return;
    }
    const headers = ["Employee Name", "Employee ID", "Reg. Date", "Exp. Date", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredCertificates.map(c => {
        const isExpired = new Date(c.expiryDate) < new Date();
        return [
          `"${c.employeeName || 'N/A'}"`,
          `"${c.employeeId || 'N/A'}"`,
          `"${new Date(c.registrationDate).toLocaleDateString()}"`,
          `"${new Date(c.expiryDate).toLocaleDateString()}"`,
          isExpired ? "Expired" : "Active"
        ].join(",");
      })
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_certificates_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        <CountUp end={value} duration={2} separator="," />
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">Loading medical records...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Demo Mode Banner */}
        {isUsingDummyData && (
          <div className="mb-3 p-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg">
            <span className="font-medium">⚠️ Demo Mode:</span> Showing sample medical certificate data. API connection may be unavailable.
          </div>
        )}
        
        {/* Client Info Banner */}
        {clientId && !isUsingDummyData && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-700">Client: {clientId.substring(0, 8)}...</p></div>
              <div><p className="text-xs text-gray-500">Records: {certificates.length}</p></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:grid-cols-3">
          <StatCard
            icon={FiList}
            label="Total Records"
            value={certificates.length}
            color="border-purple-500"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Active"
            value={certificates.filter(c => new Date(c.expiryDate) >= new Date()).length}
            color="border-green-500"
          />
          <StatCard
            icon={FiXCircle}
            label="Expired"
            value={certificates.filter(c => new Date(c.expiryDate) < new Date()).length}
            color="border-red-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            {/* Buttons */}
            <button
              onClick={downloadCSV}
              className="h-8 px-3 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition flex items-center gap-1"
            >
              <FaDownload className="text-[10px]" /> CSV
            </button>
            <button
              onClick={clearFilters}
              className="h-8 px-3 text-xs font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-2 py-2 text-center">Employee ID</th>
                  <th className="px-2 py-2 text-center">Name</th>
                  <th className="px-2 py-2 text-center">Reg. Date</th>
                  <th className="px-2 py-2 text-center">Exp. Date</th>
                  <th className="px-2 py-2 text-center">Status</th>
                  <th className="px-2 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((c) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    return (
                      <tr key={c._id} className="transition border-b hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                          {c.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                          <div className="font-semibold">{c.employeeName}</div>
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap text-gray-600">
                          {new Date(c.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap text-gray-600">
                          {new Date(c.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-[10px] text-center rounded-full ${
                              isExpired
                                ? "text-red-700 bg-red-100 border border-red-200"
                                : "text-green-700 bg-green-100 border border-green-200"
                            }`}
                          >
                            {isExpired ? "❌ Expired" : "✅ Active"}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
                          {c.documentUrl ? (
                            <a
                              href={`${API_DOMAIN}${c.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-xs text-center text-white transition bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center gap-1"
                            >
                              <FaEye className="text-[10px]" /> View
                            </a>
                          ) : (
                            <span className="px-2 py-1 text-xs text-center text-gray-500 bg-gray-100 rounded-md">
                              No File
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500 text-sm">
                      No medical records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        {filteredCertificates.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 text-xs border rounded-lg outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-gray-600">entries</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-xs border rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                }`}
              >
                Prev
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
                  disabled={page === "..."}
                  className={`px-3 py-1 text-xs border rounded-lg ${
                    page === "..."
                      ? "text-gray-500 bg-gray-50 cursor-default"
                      : currentPage === page
                      ? "text-white bg-blue-600 border-blue-600 font-bold"
                      : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-xs border rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMedicalCertificateForAdmin;