import axios from "axios";
import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const API_URL = "http://localhost:5000";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

const Spaces = () => {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/cabins`)
      .then((res) => {
        setCabins(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCabins = cabins.filter(cabin =>
    cabin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cabin.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <AdminNavbar />

      {/* Hero / Header Section */}
      <div className="w-full px-4 pt-28 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 mb-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-2 text-2xl font-black tracking-tight uppercase text-slate-900">
              Find your perfect spaces
            </h2>

            <p className="max-w-lg text-base font-medium leading-relaxed text-slate-500">
              Discover professionally equipped cabins and desks designed for focus, collaboration, and growth.
            </p>
          </div>

          {/* Refined Search Bar */}
          <div className="w-full md:w-[380px]">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="transition-colors text-slate-400 group-focus-within:text-emerald-500" />
              </div>
              <input
                type="text"
                placeholder="Search location or cabin name..."
                className="w-full py-3 pl-10 pr-4 text-sm transition-all bg-white border shadow-sm border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 pb-16 mx-auto sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-t-4 rounded-full animate-spin border-emerald-600 border-r-transparent"></div>
          </div>
        ) : filteredCabins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-xl mx-auto">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-bold uppercase text-slate-900">No spaces found</h3>
            <p className="text-sm text-slate-500">We couldn't find any cabins matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCabins.map((cabin) => (
              <div
                key={cabin._id}
                onClick={() => navigate(`/cabin/${cabin._id}`)}
                className="group bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-44">
                  <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                  <img
                    src={cabin.images?.[0] ? `${API_URL}/${cabin.images[0].replace(/\\/g, "/")}` : PLACEHOLDER_IMAGE}
                    alt={cabin.name}
                    className="relative z-10 object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-40" />

                  <div className="absolute top-3 right-3 z-30 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Available
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-grow p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Coworking Space</p>
                    <h3 className="text-base font-bold leading-tight uppercase transition-colors text-slate-900 group-hover:text-emerald-600 line-clamp-1">{cabin.name}</h3>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50 shrink-0 text-emerald-600">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{cabin.address?.split(',')[0] || "Location"}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{cabin.address}</p>
                    </div>
                  </div>

                  <p className="mb-4 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {cabin.description || "Experience a premium workspace designed for focus and collaboration, featuring modern amenities."}
                  </p>

                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-50">
                    <div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-bold text-slate-900">₹{cabin.price || '0'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">/ Month</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 mt-0.5">
                        <Users size={10} />
                        {cabin.capacity} Seats
                      </div>
                    </div>

                    <button className="flex items-center justify-center w-10 h-10 transition-colors rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Spaces;