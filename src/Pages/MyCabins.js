import axios from "axios";
import { 
  Building2, 
  Users, 
  IndianRupee, 
  MapPin, 
  Wifi, 
  Car, 
  Lock, 
  Bath, 
  Shield, 
  Sofa,
  Calendar,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Filter,
  Search,
  Download,
  Printer,
  Phone,
  Mail,
  Globe,
  Star,
  Image as ImageIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyCabins() {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCabins, setFilteredCabins] = useState([]);
  
  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  
  const navigate = useNavigate();

  // Get clientId from localStorage
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    
    if (storedClientId) {
      setClientId(storedClientId);
    } else {
      alert("Please login first to view your cabins");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch user's cabins
  useEffect(() => {
    if (!clientId) return;

    const fetchMyCabins = async () => {
      try {
        setLoading(true);
        setError("");
        
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        
        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5050/api/cabins/my-cabins/${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success || response.data.cabins) {
          const cabinsData = response.data.cabins || [];
          setCabins(cabinsData);
          setFilteredCabins(cabinsData);
        } else {
          setError("Failed to fetch cabins");
        }
        
      } catch (err) {
        console.error("Error fetching cabins:", err);
        
        if (err.response) {
          setError(`Error: ${err.response.data.message || "Failed to fetch cabins"}`);
        } else if (err.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Error: " + err.message);
        }
        
        setCabins([]);
        setFilteredCabins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCabins();
  }, [clientId]);

  // Filter cabins based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCabins(cabins);
      return;
    }

    const filtered = cabins.filter(cabin =>
      cabin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabin.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabin.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCabins(filtered);
  }, [searchTerm, cabins]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get amenities count
  const getAmenitiesCount = (amenities) => {
    if (!amenities) return 0;
    return Object.values(amenities).filter(v => v).length;
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} className="text-blue-600" />;
      case 'parking': return <Car size={16} className="text-green-600" />;
      case 'lockers': return <Lock size={16} className="text-amber-600" />;
      case 'privateWashroom': return <Bath size={16} className="text-purple-600" />;
      case 'secureAccess': return <Shield size={16} className="text-red-600" />;
      case 'comfortSeating': return <Sofa size={16} className="text-indigo-600" />;
      default: return null;
    }
  };

  // Get amenity label
  const getAmenityLabel = (key) => {
    const labels = {
      wifi: "Wi-Fi",
      parking: "Parking",
      lockers: "Lockers",
      privateWashroom: "Private Washroom",
      secureAccess: "Secure Access",
      comfortSeating: "Comfort Seating"
    };
    return labels[key] || key;
  };

  // Handle View Modal Open
  const handleOpenViewModal = (cabin) => {
    setSelectedCabin(cabin);
    setViewModalOpen(true);
  };

  // Handle Edit Modal Open
  const handleOpenEditModal = (cabin) => {
    setSelectedCabin(cabin);
    setEditFormData({
      name: cabin.name || "",
      description: cabin.description || "",
      capacity: cabin.capacity || "",
      address: cabin.address || "",
      price: cabin.price || "",
      amenities: cabin.amenities || {
        wifi: false,
        parking: false,
        lockers: false,
        privateWashroom: false,
        secureAccess: false,
        comfortSeating: false,
      }
    });
    setEditModalOpen(true);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle amenity in edit form
  const toggleEditAmenity = (key) => {
    setEditFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key]
      }
    }));
  };

  // Handle update cabin
  const handleUpdateCabin = async () => {
    if (!selectedCabin) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      const response = await axios.put(
        `http://localhost:5050/api/cabins/${selectedCabin._id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success) {
        alert("Cabin updated successfully!");
        
        // Update local state
        setCabins(prev => prev.map(cabin => 
          cabin._id === selectedCabin._id ? { ...cabin, ...editFormData } : cabin
        ));
        
        setFilteredCabins(prev => prev.map(cabin => 
          cabin._id === selectedCabin._id ? { ...cabin, ...editFormData } : cabin
        ));
        
        setEditModalOpen(false);
        setSelectedCabin(null);
      }
    } catch (err) {
      console.error("Error updating cabin:", err);
      alert("Failed to update cabin. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete cabin
  const handleDeleteCabin = async (cabinId) => {
    if (!window.confirm("Are you sure you want to delete this cabin? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      const response = await axios.delete(
        `http://localhost:5050/api/cabins/${cabinId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Cabin deleted successfully!");
        // Remove from state
        setCabins(prev => prev.filter(cabin => cabin._id !== cabinId));
        setFilteredCabins(prev => prev.filter(cabin => cabin._id !== cabinId));
      }
    } catch (err) {
      console.error("Error deleting cabin:", err);
      alert("Failed to delete cabin. Please try again.");
    }
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = ["Name", "Address", "Capacity", "Price/Hour", "Amenities", "Created Date"];
    const data = cabins.map(cabin => [
      cabin.name,
      cabin.address,
      cabin.capacity,
      `₹${cabin.price}`,
      getAmenitiesCount(cabin.amenities),
      formatDate(cabin.createdAt)
    ]);

    const csvContent = [
      headers.join(","),
      ...data.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-cabins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Your Cabins</h3>
          <p className="text-gray-500">Fetching your cabin listings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Main container with left padding */}
        <div className="max-w-7xl mx-auto pl-2 md:pl-4 lg:pl-6">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Building2 size={32} className="text-blue-600" />
                  My Cabins
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your coworking spaces and listings
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/add-cabin")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Building2 size={18} />
                  Add New Cabin
                </button>
                
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <ChevronRight size={18} />
                  Dashboard
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Cabins</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{cabins.length}</h3>
                  </div>
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Cabins</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{cabins.length}</h3>
                  </div>
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {cabins.reduce((sum, cabin) => sum + parseInt(cabin.capacity || 0), 0)}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <Users size={20} className="text-amber-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Price/Hour</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {cabins.length > 0 
                        ? `₹${Math.round(cabins.reduce((sum, cabin) => sum + parseInt(cabin.price || 0), 0) / cabins.length)}`
                        : "₹0"
                      }
                    </h3>
                  </div>
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <IndianRupee size={20} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Error Loading Cabins</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Actions Bar */}
          <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cabins by name, address or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
                
                <button 
                  onClick={exportToCSV}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Cabins Table */}
          {filteredCabins.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="p-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl inline-flex mb-5">
                  <Building2 size={48} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Cabins Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? "No cabins match your search criteria." : "You haven't added any cabins yet."}
                </p>
                <button
                  onClick={() => navigate("/add-cabin")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
                >
                  Create Your First Cabin
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">
                    Cabin Listings <span className="text-blue-600">({filteredCabins.length})</span>
                  </h2>
                  <div className="text-sm text-gray-500">
                    Showing {filteredCabins.length} of {cabins.length} cabins
                  </div>
                </div>
              </div>
              
              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cabin Details
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price/Hour
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amenities
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-200">
                    {filteredCabins.map((cabin) => (
                      <tr key={cabin._id} className="hover:bg-gray-50 transition-colors">
                        {/* Cabin Details */}
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {cabin.images && cabin.images.length > 0 ? (
                                <img
                                  src={`http://localhost:5050/${cabin.images[0]}`}
                                  alt={cabin.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200&auto=format&fit=crop";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                                  <Building2 size={20} className="text-blue-400" />
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="font-medium text-gray-900">{cabin.name}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{cabin.address}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Capacity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-medium">{cabin.capacity}</span>
                            <span className="text-sm text-gray-500">persons</span>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <IndianRupee size={16} className="text-gray-600" />
                            <span className="font-bold text-gray-900">{cabin.price}</span>
                            <span className="text-sm text-gray-500">/hour</span>
                          </div>
                        </td>
                        
                        {/* Amenities */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {cabin.amenities && Object.entries(cabin.amenities)
                                .filter(([key, value]) => value)
                                .slice(0, 3)
                                .map(([key]) => (
                                  <div 
                                    key={key} 
                                    className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                                    title={getAmenityLabel(key)}
                                  >
                                    {getAmenityIcon(key)}
                                  </div>
                                ))}
                            </div>
                            
                            {getAmenitiesCount(cabin.amenities) > 3 && (
                              <div className="text-sm text-gray-500">
                                +{getAmenitiesCount(cabin.amenities) - 3} more
                              </div>
                            )}
                            
                            {getAmenitiesCount(cabin.amenities) === 0 && (
                              <span className="text-sm text-gray-400">No amenities</span>
                            )}
                          </div>
                        </td>
                        
                        {/* Created Date */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{formatDate(cabin.createdAt)}</span>
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={10} className="mr-1" />
                            Active
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenViewModal(cabin)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleOpenEditModal(cabin)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Edit Cabin"
                            >
                              <Edit size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteCabin(cabin._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Cabin"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {filteredCabins.length} cabins
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">Page 1 of 1</span>
                    <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredCabins.length > 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Need Help?</h4>
                    <p className="text-gray-600 text-sm">
                      Contact support for assistance with cabin management, bookings, or pricing.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/support")}
                      className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Contact Support
                    </button>
                    <button
                      onClick={() => navigate("/add-cabin")}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors text-sm"
                    >
                      Add New Cabin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModalOpen && selectedCabin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setViewModalOpen(false)}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 size={28} className="text-white" />
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCabin.name}</h2>
                      <p className="text-blue-100 text-sm mt-1">Cabin Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Images & Basic Info */}
                  <div className="space-y-6">
                    {/* Images */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ImageIcon size={20} className="text-blue-600" />
                        Photos
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCabin.images && selectedCabin.images.length > 0 ? (
                          selectedCabin.images.slice(0, 4).map((img, index) => (
                            <div key={index} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                              <img
                                src={`http://localhost:5050/${img}`}
                                alt={`${selectedCabin.name} - ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&auto=format&fit=crop";
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 aspect-video bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <ImageIcon size={48} className="text-blue-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin size={20} className="text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{selectedCabin.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Users size={20} className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Capacity</p>
                            <p className="font-medium">{selectedCabin.capacity} persons</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <IndianRupee size={20} className="text-amber-600" />
                          <div>
                            <p className="text-sm text-gray-500">Price per hour</p>
                            <p className="font-medium">₹{selectedCabin.price}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-500">Created Date</p>
                            <p className="font-medium">{formatDate(selectedCabin.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Description & Amenities */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                      <div className="bg-gray-50 rounded-xl p-5">
                        <p className="text-gray-700 whitespace-pre-line">{selectedCabin.description}</p>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    {selectedCabin.amenities && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(selectedCabin.amenities).map(([key, value]) => (
                            <div 
                              key={key} 
                              className={`flex items-center gap-3 p-3 rounded-lg ${value ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}
                            >
                              <div className={`p-2 rounded ${value ? 'bg-green-100' : 'bg-gray-200'}`}>
                                {getAmenityIcon(key)}
                              </div>
                              <div>
                                <p className={`font-medium ${value ? 'text-green-800' : 'text-gray-500'}`}>
                                  {getAmenityLabel(key)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {value ? 'Available' : 'Not Available'}
                                </p>
                              </div>
                              {value && (
                                <CheckCircle size={16} className="ml-auto text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Cabin ID */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Cabin ID</p>
                          <p className="font-mono text-sm">{selectedCabin._id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-8 py-5 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenEditModal(selectedCabin);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors"
                  >
                    Edit Cabin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedCabin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setEditModalOpen(false)}></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-green-700 to-emerald-800 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Edit size={28} className="text-white" />
                    <div>
                      <h2 className="text-2xl font-bold">Edit Cabin</h2>
                      <p className="text-green-100 text-sm mt-1">Update cabin information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form className="space-y-6">
                  {/* Cabin Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cabin Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* Capacity & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (persons)
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={editFormData.capacity}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per hour (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    />
                  </div>
                  
                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: "wifi", label: "Wi-Fi", icon: <Wifi size={18} /> },
                        { key: "parking", label: "Parking", icon: <Car size={18} /> },
                        { key: "lockers", label: "Lockers", icon: <Lock size={18} /> },
                        { key: "privateWashroom", label: "Private Washroom", icon: <Bath size={18} /> },
                        { key: "secureAccess", label: "Secure Access", icon: <Shield size={18} /> },
                        { key: "comfortSeating", label: "Comfort Seating", icon: <Sofa size={18} /> },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleEditAmenity(item.key)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                            editFormData.amenities[item.key]
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          {editFormData.amenities[item.key] && (
                            <CheckCircle size={16} className="ml-auto text-green-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-8 py-5 border-t border-gray-200">
                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditModalOpen(false);
                        handleOpenViewModal(selectedCabin);
                      }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={handleUpdateCabin}
                      disabled={editLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Update Cabin
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyCabins;