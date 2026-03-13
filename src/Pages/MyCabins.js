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
  X,
  Search,
  Plus,
  ChevronLeft,
  Image as ImageIcon,
  Upload
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Add Cabin Form States
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    address: "",
    price: "",
    amenities: {
      wifi: false,
      parking: false,
      lockers: false,
      privateWashroom: false,
      secureAccess: false,
      comfortSeating: false,
    },
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  
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
        
        const response = await axios.get(
          `http://localhost:5050/api/cabins/my-cabins/${clientId}`
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
      cabin.address?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle Add Modal Open
  const handleOpenAddModal = () => {
    setAddFormData({
      name: "",
      description: "",
      capacity: "",
      address: "",
      price: "",
      amenities: {
        wifi: false,
        parking: false,
        lockers: false,
        privateWashroom: false,
        secureAccess: false,
        comfortSeating: false,
      },
    });
    setImages([]);
    setImagePreviews([]);
    setAddModalOpen(true);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add form change
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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

  // Toggle amenity in add form
  const toggleAddAmenity = (key) => {
    setAddFormData(prev => ({
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
      
      const response = await axios.put(
        `http://localhost:5050/api/cabins/${selectedCabin._id}`,
        editFormData,
        {
          headers: {
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

  // Handle add cabin
  const handleAddCabin = async (e) => {
    e.preventDefault();
    
    // Check if clientId is available
    if (!clientId) {
      alert("Client ID not found. Please login again.");
      navigate("/login");
      return;
    }

    setAddLoading(true);

    // Create FormData for API
    const data = new FormData();
    data.append("name", addFormData.name);
    data.append("description", addFormData.description);
    data.append("capacity", addFormData.capacity);
    data.append("address", addFormData.address);
    data.append("price", addFormData.price);

    // Send amenities correctly
    data.append("amenities", JSON.stringify(addFormData.amenities));

    // Append all images
    images.forEach((img) => {
      data.append("images", img);
    });

    try {
      // Log the data being sent (for debugging)
      console.log("Submitting cabin data for client:", clientId);
      console.log("Cabin Name:", addFormData.name);
      console.log("Amenities:", addFormData.amenities);
      console.log("Images count:", images.length);

      // Send request with clientId in URL
      const response = await axios.post(
        `http://localhost:5050/api/cabins/${clientId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API Response:", response.data);
      
      alert("Cabin added successfully!");
      
      // Clear form
      setAddFormData({
        name: "",
        description: "",
        capacity: "",
        address: "",
        price: "",
        amenities: {
          wifi: false,
          parking: false,
          lockers: false,
          privateWashroom: false,
          secureAccess: false,
          comfortSeating: false,
        },
      });
      setImages([]);
      setImagePreviews([]);
      
      // Refresh cabins list
      const fetchResponse = await axios.get(
        `http://localhost:5050/api/cabins/my-cabins/${clientId}`
      );

      if (fetchResponse.data.success || fetchResponse.data.cabins) {
        const cabinsData = fetchResponse.data.cabins || [];
        setCabins(cabinsData);
        setFilteredCabins(cabinsData);
      }
      
      setAddModalOpen(false);
      
    } catch (err) {
      console.error("Error adding cabin:", err);
      
      if (err.response) {
        console.error("Server Response:", err.response.data);
        console.error("Status:", err.response.status);
        alert(`Error: ${err.response.data.message || "Failed to add cabin"}`);
      } else if (err.request) {
        console.error("No response received:", err.request);
        alert("Network error. Please check your connection.");
      } else {
        console.error("Error setting up request:", err.message);
        alert("Error: " + err.message);
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Handle delete cabin
  const handleDeleteCabin = async (cabinId) => {
    if (!window.confirm("Are you sure you want to delete this cabin?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5050/api/cabins/${cabinId}`
      );

      if (response.data.success) {
        alert("Cabin deleted successfully!");
        setCabins(prev => prev.filter(cabin => cabin._id !== cabinId));
        setFilteredCabins(prev => prev.filter(cabin => cabin._id !== cabinId));
      }
    } catch (err) {
      console.error("Error deleting cabin:", err);
      alert("Failed to delete cabin. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cabins...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">MANAGE CABINS</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Total {filteredCabins.length} workspaces listed
                  </p>
                </div>
              </div>
              
              {/* Premium Add Cabin Button */}
              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-gradient-to-r hover:from-[#1E3A8A] hover:to-[#14B8A6] transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <Plus size={16} strokeWidth={3} />
                </div>
                Add New Cabin
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Cabins Grid */}
          {filteredCabins.length === 0 && !error ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No cabins found</h3>
              <p className="text-gray-500 mb-8">
                {searchTerm ? "No cabins match your search criteria." : "You haven't added any cabins yet."}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md"
              >
                <Plus size={20} />
                Add New Cabin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCabins.map((cabin) => (
                <div
                  key={cabin._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 relative">
                    {cabin.images && cabin.images.length > 0 ? (
                      <img
                        src={`http://localhost:5050/${cabin.images[0]}`}
                        alt={cabin.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={48} className="text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{cabin.name}</h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{cabin.address}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Users size={16} className="text-gray-400" />
                        <span className="font-medium">{cabin.capacity}</span>
                        <span className="text-gray-500">seats</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <IndianRupee size={16} className="text-gray-400" />
                        <span className="font-medium">₹{cabin.price}</span>
                        <span className="text-gray-500">/hour</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {cabin.amenities && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(cabin.amenities)
                          .filter(([key, value]) => value)
                          .slice(0, 4)
                          .map(([key]) => (
                            <div
                              key={key}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-600"
                            >
                              {getAmenityIcon(key)}
                              <span>{getAmenityLabel(key)}</span>
                            </div>
                          ))}
                        {getAmenitiesCount(cabin.amenities) > 4 && (
                          <span className="text-xs text-gray-500 flex items-center">
                            +{getAmenitiesCount(cabin.amenities) - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenViewModal(cabin)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(cabin)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCabin(cabin._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD CABIN MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setAddModalOpen(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="px-8 py-6 border-b border-gray-200 bg-white rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-900">Add New Cabin</h2>
                <p className="text-gray-500 text-sm mt-1">Create a new workspace listing</p>
              </div>
              
              {/* Content - Scrollable */}
              <div className="p-8 overflow-y-auto flex-1">
                <form onSubmit={handleAddCabin} className="space-y-6">
                  {/* BUILDING NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      BUILDING NAME
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddChange}
                      placeholder="e.g. Tech Hub Alpha"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  {/* ADDRESS */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      ADDRESS
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={addFormData.address}
                      onChange={handleAddChange}
                      placeholder="e.g. Floor 4, Suite 10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  {/* CABIN SPEC */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      CABIN SPEC
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddChange}
                      placeholder="e.g. Private Office B"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  {/* CAPACITY */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      CAPACITY
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={addFormData.capacity}
                      onChange={handleAddChange}
                      placeholder="Seats"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  {/* PRICE PER HOUR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      PRICE PER HOUR (£)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={addFormData.price}
                      onChange={handleAddChange}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  {/* INCLUDED AMENITIES */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      INCLUDED AMENITIES
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "wifi", label: "Wi-Fi" },
                        { key: "parking", label: "Parking" },
                        { key: "lockers", label: "Lockers" },
                        { key: "privateWashroom", label: "Private" },
                        { key: "secureAccess", label: "Security" },
                        { key: "comfortSeating", label: "Comfort" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleAddAmenity(item.key)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                            addFormData.amenities[item.key]
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          {addFormData.amenities[item.key] && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* IMAGES UPLOAD */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      CABIN IMAGES
                    </label>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-gray-600">Upload Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      You can select multiple images. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                  
                  {/* SPACE DESCRIPTION */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      SPACE DESCRIPTION
                    </label>
                    <textarea
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddChange}
                      placeholder="Share details about this unique workspace..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      required
                    />
                  </div>
                </form>
              </div>
              
              {/* Footer - Fixed */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCabin}
                    disabled={addLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      'Create Cabin'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModalOpen && selectedCabin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setViewModalOpen(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="px-8 py-6 border-b border-gray-200 bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCabin.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">Cabin Details</p>
                  </div>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="p-8 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg overflow-hidden">
                    {selectedCabin.images && selectedCabin.images.length > 0 ? (
                      <img
                        src={`http://localhost:5050/${selectedCabin.images[0]}`}
                        alt={selectedCabin.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={48} className="text-blue-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</p>
                      <p className="font-medium text-gray-900">{selectedCabin.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</p>
                      <p className="font-medium text-gray-900">{selectedCabin.capacity} seats</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</p>
                      <p className="font-medium text-gray-900">₹{selectedCabin.price}/hour</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Added on</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedCabin.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-gray-700">{selectedCabin.description}</p>
                  </div>
                  
                  {/* Amenities */}
                  {selectedCabin.amenities && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amenities</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedCabin.amenities)
                          .filter(([key, value]) => value)
                          .map(([key]) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg"
                            >
                              {getAmenityIcon(key)}
                              <span className="text-sm text-blue-700">{getAmenityLabel(key)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer - Fixed */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
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
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditModalOpen(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="px-8 py-6 border-b border-gray-200 bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Cabin</h2>
                    <p className="text-gray-500 text-sm mt-1">Update cabin information</p>
                  </div>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="p-8 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* BUILDING NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      BUILDING NAME
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* ADDRESS */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      ADDRESS
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* CABIN SPEC */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      CABIN SPEC
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* CAPACITY */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      CAPACITY
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={editFormData.capacity}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* PRICE PER HOUR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      PRICE PER HOUR (£)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  
                  {/* INCLUDED AMENITIES */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      INCLUDED AMENITIES
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "wifi", label: "Wi-Fi" },
                        { key: "parking", label: "Parking" },
                        { key: "lockers", label: "Lockers" },
                        { key: "privateWashroom", label: "Private" },
                        { key: "secureAccess", label: "Security" },
                        { key: "comfortSeating", label: "Comfort" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleEditAmenity(item.key)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                            editFormData.amenities[item.key]
                              ? "bg-green-50 border-green-300 text-green-700"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          {editFormData.amenities[item.key] && (
                            <span className="text-green-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* SPACE DESCRIPTION */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      SPACE DESCRIPTION
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer - Fixed */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
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
                      'Update Cabin'
                    )}
                  </button>
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