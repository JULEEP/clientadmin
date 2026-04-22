// import {
//   LogOut,
//   Menu,
//   Shield,
//   X
// } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import Logo from "../assets/Logo.png";

// function AdminNavbar() {
//   const [open, setOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 10);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const isActive = (path) => location.pathname === path;

//   // Clear admin session
//   const handleLogout = () => {
//     localStorage.removeItem("admin");
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const navLinks = [
//     { name: "Dashboard", path: "/coworking-dashboard" },
//     { name: "Bookings", path: "/all-bookings" },
//     { name: "My Cabins", path: "/mycabins" },
//     { name: "Add Cabin", path: "/add-cabin" }
//   ];

//   return (
//     <nav
//       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
//         ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
//         : "bg-transparent py-4"
//         }`}
//     >
//       <div className="w-full px-4 sm:px-6 lg:px-10">
//         <div className="flex items-center justify-between gap-4">
//           {/* Logo */}
//           <Link to="/admindashboard" className="flex items-center gap-2">
//             <img src={Logo} alt="TimelyHealth" className="object-contain w-auto h-12" />
//           </Link>

//           {/* Desktop Menu */}
//           <div className="items-center hidden gap-8 md:flex">
//             <div className="flex gap-1.5">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.path}
//                   to={link.path}
//                   className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight uppercase transition-all duration-300 ${isActive(link.path)
//                     ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
//                     : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
//                     }`}
//                 >
//                   {link.name}
//                 </Link>
//               ))}
//             </div>

//             <div className="w-px h-6 bg-slate-200"></div>

//             {/* PROFILE / LOGOUT */}
//             <div className="relative group">
//               <div className="flex items-center justify-center w-10 h-10 transition-colors bg-white border-2 rounded-full cursor-pointer border-slate-100 group-hover:border-emerald-200">
//                 <Shield size={20} className="text-slate-600 group-hover:text-emerald-600" />
//               </div>

//               <div className="absolute right-0 z-50 invisible w-48 mt-4 transition-all duration-200 origin-top-right transform bg-white border shadow-xl opacity-0 border-slate-100 rounded-2xl group-hover:opacity-100 group-hover:visible">
//                 <div className="p-1">
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
//                   >
//                     <LogOut size={16} />
//                     Log Out
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="p-2 transition md:hidden text-slate-600 hover:text-emerald-600"
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-transform duration-300 md:hidden pt-28 ${open ? "translate-x-0" : "translate-x-full"
//           }`}
//         style={{ top: "0" }}
//       >
//         <button
//           onClick={() => setOpen(false)}
//           className="absolute p-2 rounded-full top-6 right-6 bg-slate-100 text-slate-500 hover:bg-slate-200"
//         >
//           <X size={20} />
//         </button>

//         <div className="flex justify-center mb-8">
//           <img src={Logo} alt="TimelyHealth" className="object-contain w-auto h-16" />
//         </div>

//         <div className="flex flex-col px-8 space-y-4">
//           {navLinks.map((link) => (
//             <Link
//               key={link.path}
//               to={link.path}
//               onClick={() => setOpen(false)}
//               className={`p-4 rounded-2xl text-lg font-semibold transition ${isActive(link.path)
//                 ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
//                 : "text-slate-600 hover:bg-slate-50"
//                 }`}
//             >
//               {link.name}
//             </Link>
//           ))}

//           <div className="h-px my-4 bg-slate-100"></div>

//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-4 p-4 text-lg font-semibold text-red-500 transition-colors hover:bg-red-50 rounded-2xl"
//           >
//             <LogOut size={20} /> Log Out
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default AdminNavbar;


import {
  LogOut,
  Menu,
  Shield,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Clear session
  const handleLogout = () => {
    localStorage.removeItem("clientId");
    localStorage.removeItem("clientName");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/coworking-dashboard" },
    { name: "Space", path: "/spaces" },
    { name: "Bookings", path: "/my-bookings" },
    { name: "My Cabins", path: "/mycabins" }
    // { name: "Add Cabin", path: "/add-cabin" }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/coworking-dashboard" className="flex items-center gap-2">
            <img src={Logo} alt="TimelyHealth" className="object-contain w-auto h-12" />
          </Link>

          {/* Desktop Menu */}
          <div className="items-center hidden gap-8 md:flex">
            <div className="flex gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight uppercase transition-all duration-300 ${
                    isActive(link.path)
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200"></div>

            {/* PROFILE / LOGOUT */}
            <div className="relative group">
              <div className="flex items-center justify-center w-10 h-10 transition-colors bg-white border-2 rounded-full cursor-pointer border-slate-100 group-hover:border-emerald-200">
                <Shield size={20} className="text-slate-600 group-hover:text-emerald-600" />
              </div>

              <div className="absolute right-0 z-50 invisible w-48 mt-4 transition-all duration-200 origin-top-right transform bg-white border shadow-xl opacity-0 border-slate-100 rounded-2xl group-hover:opacity-100 group-hover:visible">
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 transition md:hidden text-slate-600 hover:text-emerald-600"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-transform duration-300 md:hidden pt-28 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "0" }}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute p-2 rounded-full top-6 right-6 bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-8">
          <img src={Logo} alt="TimelyHealth" className="object-contain w-auto h-16" />
        </div>

        <div className="flex flex-col px-8 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`p-4 rounded-2xl text-lg font-semibold transition ${
                isActive(link.path)
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="h-px my-4 bg-slate-100"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 text-lg font-semibold text-red-500 transition-colors hover:bg-red-50 rounded-2xl"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;