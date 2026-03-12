import axios from "axios";
import { 
  FileText, 
  Home, 
  MapPin, 
  Users, 
  IndianRupee, 
  Upload, 
  CheckCircle, 
  X, 
  Building2, 
  Wifi,
  Car,
  Lock,
  Bath,
  Shield,
  Sofa,
  Image as ImageIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddCabin() {
  const [formData, setFormData] = useState({
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

  const [clientId, setClientId] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get clientId from localStorage on component mount
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    
    if (storedClientId) {
      setClientId(storedClientId);
      console.log("Client ID loaded:", storedClientId);
    } else {
      console.warn("No clientId found in localStorage");
      alert("Please login first to add cabin");
      navigate("/login");
    }
  }, [navigate]);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ TOGGLE AMENITIES (FIX)
  const toggleAmenity = (key) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  // Handle images
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Remove image from preview
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if clientId is available
    if (!clientId) {
      alert("Client ID not found. Please login again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    // Create FormData for API
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("capacity", formData.capacity);
    data.append("address", formData.address);
    data.append("price", formData.price);

    // ✅ Send amenities correctly
    data.append("amenities", JSON.stringify(formData.amenities));

    // Append all images
    images.forEach((img) => {
      data.append("images", img);
    });

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      if (!token) {
        alert("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      // Log the data being sent (for debugging)
      console.log("Submitting cabin data for client:", clientId);
      console.log("Cabin Name:", formData.name);
      console.log("Amenities:", formData.amenities);
      console.log("Images count:", images.length);

      // Send request with clientId in URL
      const response = await axios.post(
        `http://localhost:5050/api/cabins/${clientId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API Response:", response.data);
      
      alert("Cabin added successfully!");
      
      // Clear form
      setFormData({
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
      
      // Navigate to my cabins page
      navigate("/my-cabins");
      
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
      setLoading(false);
    }
  };

  // If clientId is not loaded yet, show loading
  if (!clientId && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading your account information...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Amenities with React icons
  const amenitiesList = [
    { key: "wifi", label: "Wi-Fi", icon: <Wifi size={20} />, color: "text-blue-600" },
    { key: "parking", label: "Parking", icon: <Car size={20} />, color: "text-green-600" },
    { key: "lockers", label: "Lockers", icon: <Lock size={20} />, color: "text-amber-600" },
    { key: "privateWashroom", label: "Private Washroom", icon: <Bath size={20} />, color: "text-purple-600" },
    { key: "secureAccess", label: "Secure Access", icon: <Shield size={20} />, color: "text-red-600" },
    { key: "comfortSeating", label: "Comfort Seating", icon: <Sofa size={20} />, color: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-7 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Home size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Add New Cabin Space</h1>
                <p className="text-blue-100 mt-1">Create your own coworking space listing</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cabin Name */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" />
                    Cabin Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Executive Boardroom, Conference Hall"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none shadow-sm"
                  />
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    Address / Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      placeholder="e.g., Tech Hub, Floor 2, Silicon Valley"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      max="100"
                      placeholder="e.g., 10 persons"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <IndianRupee size={16} className="text-blue-600" />
                    Price per hour <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee size={18} className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      min="0"
                      placeholder="e.g., 500"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                Available Amenities
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenitiesList.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.amenities[item.key]
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${formData.amenities[item.key] ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <div className={item.color}>
                        {item.icon}
                      </div>
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-medium ${formData.amenities[item.key] ? 'text-green-800' : 'text-gray-800'}`}>
                        {item.label}
                      </div>
                    </div>
                    {formData.amenities[item.key] && (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                Description
              </h3>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText size={16} className="text-purple-600" />
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    name="description"
                    placeholder="Describe the cabin in detail. Include equipment available, special features, rules, accessibility information, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all outline-none shadow-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-amber-600 rounded-full"></div>
                Cabin Photos
              </h3>
              
              <div className="space-y-4">
                <div className={`border-3 ${images.length > 0 ? 'border-blue-200' : 'border-dashed border-gray-300'} rounded-2xl p-8 text-center transition-all duration-300 bg-gradient-to-b from-gray-50 to-white hover:from-blue-50 hover:to-white hover:border-blue-300 cursor-pointer relative group`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                      {images.length > 0 ? (
                        <ImageIcon size={32} className="text-blue-600" />
                      ) : (
                        <Upload size={32} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                        {images.length > 0 
                          ? `${images.length} image${images.length !== 1 ? 's' : ''} selected` 
                          : 'Click to upload cabin photos'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload up to 5 images (PNG, JPG, JPEG up to 5MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-700">Preview ({images.length})</h4>
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                      >
                        <X size={16} />
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="ml-auto bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                              title="Remove image"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-blue-200 transform hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                    <span>Adding Cabin...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} />
                    <span>Create Cabin Space</span>
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  This cabin will be automatically linked to your account
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Account ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{clientId.substring(0, 12)}...</span>
                </p>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCabin;