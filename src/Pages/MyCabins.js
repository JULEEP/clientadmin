import axios from "axios";
import {
  Building2,
  CheckCircle,
  FileText,
  Home,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminNavbar from "../Components/AdminNavbar"; // Correct path: Components folder

const API_URL = "http://localhost:5050";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

const MyCabins = () => {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Add Cabin Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    address: "",
    price: "",
    cabin: "",
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

  const fetchCabins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/cabins/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data.cabins || res.data;
      setCabins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching cabins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabins();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this cabin?")) return;

    try {
      await axios.delete(`${API_URL}/api/cabins/${id}`, getAuthHeader());
      setCabins(cabins.filter(c => c._id !== id));
      toast.success("Cabin deleted successfully");
    } catch (error) {
      console.error("Error deleting cabin", error);
      toast.error("Failed to delete cabin");
    }
  }

  // Form Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (key) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.cabin ? `${formData.name} - ${formData.cabin}` : formData.name);
    data.append("description", formData.description);
    data.append("capacity", formData.capacity);
    data.append("address", formData.address);
    data.append("price", formData.price);
    data.append("amenities", JSON.stringify(formData.amenities));
    images.forEach((img) => data.append("images", img));

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/cabins`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Cabin added successfully!");
      setIsModalOpen(false);
      // Reset Form
      setFormData({
        name: "",
        description: "",
        capacity: "",
        address: "",
        price: "",
        cabin: "",
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
      fetchCabins();
    } catch (err) {
      console.error("Add Cabin Error:", err);
      toast.error("Failed to add cabin");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCabins = cabins.filter(cabin =>
    cabin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cabin.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminNavbar />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 w-full mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Manage Cabins</h2>
            <p className="text-slate-500 font-medium mt-1">Total {filteredCabins.length} workspaces listed</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative group w-full sm:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name or location..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 text-sm font-semibold transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Add Cabin Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-green-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#3b82f6] transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
            >
              <div className="p-1 bg-white/20 rounded-lg">
                <Plus size={16} strokeWidth={3} />
              </div>
              Add New Cabin
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-600 border-r-transparent"></div>
          </div>
        ) : filteredCabins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No cabins found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredCabins.map((cabin) => (
              <div
                key={cabin._id}
                onClick={() => navigate(`/cabin/${cabin._id}`)}
                className="group bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                <div className="relative h-52 bg-slate-200 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                  <img
                    src={cabin.images?.[0] ? `${API_URL}/${cabin.images[0].replace(/\\/g, "/")}` : PLACEHOLDER_IMAGE}
                    alt={cabin.name}
                    className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 right-3 z-30">
                    <button
                      onClick={(e) => handleDelete(e, cabin._id)}
                      className="p-2.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                      title="Delete Cabin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold uppercase text-slate-900 mb-1 tracking-tight">{cabin.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-4">
                    <MapPin size={14} className="text-emerald-600" />
                    <span className="truncate">{cabin.address}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-900">₹{cabin.price}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">/mo</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Users size={12} />
                      {cabin.capacity} Seats
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Cabin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#22c55e] to-[#3b82f6] px-8 py-5 text-white relative">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Home size={22} /> Add New Cabin
                </h2>
                <p className="text-emerald-100 text-sm mt-0.5">Create a new workspace listing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors absolute right-4 top-4"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Building Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Tech Hub Alpha"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="address"
                        placeholder="e.g. Floor 4, Suite 10"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cabin & Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cabin Spec</label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        name="cabin"
                        placeholder="e.g. Private Office B"
                        value={formData.cabin}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Capacity</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="number"
                        name="capacity"
                        placeholder="Seats"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Price per Month (₹)</label>
                  <div className="relative">
                    <IndianRupee size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="number"
                      name="price"
                      placeholder="e.g. 5000"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Included Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: "wifi", label: "Wi-Fi" },
                      { key: "parking", label: "Parking" },
                      { key: "lockers", label: "Lockers" },
                      { key: "privateWashroom", label: "Private Washroom" },
                      { key: "secureAccess", label: "Secure Access" },
                      { key: "comfortSeating", label: "Comfort Seating" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleAmenity(item.key)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${formData.amenities[item.key]
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Space Description</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <textarea
                      name="description"
                      placeholder="Share details about this unique workspace..."
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm custom-scrollbar"
                    />
                  </div>
                </div>

                {/* Photos */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Photo Gallery</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/50 hover:border-emerald-300 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <Upload size={32} />
                      <span className="text-xs font-bold uppercase tracking-tight">Upload Images</span>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-[2] py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${submitting
                      ? "bg-emerald-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-[#22c55e] to-[#3b82f6] text-white hover:shadow-emerald-200"
                      }`}
                  >
                    {submitting ? (
                      <span className="animate-pulse">Saving...</span>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Confirm Add Cabin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCabins;