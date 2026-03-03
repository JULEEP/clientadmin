import axios from "axios";
import { useState, useEffect } from "react";
import { FaChevronDown, FaHeartbeat, FaClock, FaBuilding, FaUsers, FaCalendarAlt, FaFileAlt, FaMapMarkerAlt, FaUserMd } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  FileText, 
  MapPin, 
  LogOut, 
  Settings,
  ChevronRight,
  Home,
  Briefcase,
  Activity,
  Heart,
  Building2,
  Coffee,
  Zap,
  Sparkles,
  Shield,
  Award,
  UserCheck,
  UserPlus,
  FileCheck,
  ClipboardList,
  FolderOpen,
  ChevronDown,
  DollarSign
} from "lucide-react";

const Sidebar = ({ isCollapsed, isMobile, onLinkClick }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState({}); // For nested dropdowns like Recruitment
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected product and user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    // For client, get the selected product from localStorage
    if (role === 'client') {
      // Try to get from location state first
      if (location.state?.selectedProduct) {
        setSelectedProduct(location.state.selectedProduct);
        localStorage.setItem('selectedProduct', location.state.selectedProduct);
      } else {
        // Fallback to localStorage
        const savedProduct = localStorage.getItem('selectedProduct');
        setSelectedProduct(savedProduct);
      }
    }
  }, [location]);

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleSubDropdown = (e, parentName, subName) => {
    e.stopPropagation();
    setOpenSubDropdown(prev => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [subName]: !prev[parentName]?.[subName]
      }
    }));
  };

  const handleAnyClick = () => {
    if (onLinkClick) onLinkClick();
    setOpenDropdown(null);
    setOpenSubDropdown({});
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      navigate("/admin-login");
    } catch (error) {
      localStorage.clear();
      navigate("/admin-login");
    }
  };

  // All sections defined
  const attendanceSection = {
    icon: <Clock className="w-5 h-5" />,
    name: "Attendance",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    dropdown: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: "Employees", path: "/employeelist", icon: <Users className="w-4 h-4" /> },
      { name: "Attendance Summary", path: "/attedancesummary", icon: <FileText className="w-4 h-4" /> },
      { name: "Attendance Records", path: "/attendancelist", icon: <Clock className="w-4 h-4" /> },
      { name: "Today Attendance", path: "/today-attendance", icon: <Calendar className="w-4 h-4" /> },
      { name: "Absent Today", path: "/absent-today", icon: <Users className="w-4 h-4" /> },
      { name: "Leave Management", path: "/leavelist", icon: <Calendar className="w-4 h-4" /> },
      { name: "Payroll", path: "/payroll", icon: <FileText className="w-4 h-4" /> },
      { name: "Reports", path: "/leaves-report", icon: <FileText className="w-4 h-4" /> },
      { name: "User Activity", path: "/useractivity", icon: <FileText className="w-4 h-4" /> },
      { name: "User Access Mang", path: "/useraccess", icon: <FileText className="w-4 h-4" /> },
      { name: "Locations", path: "/locationlist", icon: <MapPin className="w-4 h-4" /> },
      { name: "Shifts", path: "/shiftlist", icon: <Clock className="w-4 h-4" /> },
            { name: "Expensives", path: "/all-expensives", icon: <DollarSign className="w-4 h-4" /> },

      // Recruitment Section as a submenu inside Attendance
     { 
  name: "Recruitment", 
  icon: <Briefcase className="w-4 h-4" />,
  hasSubmenu: true,
  submenu: [
    { name: "Dashboard", path: "/recruitment-dashboard", icon: <LayoutDashboard className="w-3 h-3" /> },
    { name: "Job Posts", path: "/jobpost", icon: <FileText className="w-3 h-3" /> },
    { name: "Job Applicants", path: "/job-applicants", icon: <Users className="w-3 h-3" /> },
    { name: "Score Board", path: "/score", icon: <ClipboardList className="w-3 h-3" /> },
    { name: "Assessments", path: "/assessment-manager", icon: <FileCheck className="w-3 h-3" /> },
    { name: "Documents", path: "/personaldocuments", icon: <FolderOpen className="w-3 h-3" /> },
    { name: "Employee Journey", path: "/employee-journey", icon: <UserCheck className="w-3 h-3" /> },
  ]
},
    ],
  };

  const bmiSection = {
    icon: <Heart className="w-5 h-5" />,
    name: "BMI & Health",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    dropdown: [
      { name: "BMI Dashboard", path: "/bmi-dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { name: "Patient Records", path: "/add-patient", icon: <Users className="w-4 h-4" /> },
      { name: "Health Camps", path: "/camp", icon: <Users className="w-4 h-4" /> },
    ],
  };

  const coworkingSection = {
    icon: <Building2 className="w-5 h-5" />,
    name: "Co-Working",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    dropdown: [
      { name: "Add Space", path: "/add-cabin", icon: <Home className="w-4 h-4" /> },
      { name: "My Spaces", path: "/mycabins", icon: <Building2 className="w-4 h-4" /> },
      { name: "All Bookings", path: "/allbookings", icon: <Calendar className="w-4 h-4" /> },
    ],
  };

  // All sections for admin
  const allSections = [attendanceSection, bmiSection, coworkingSection];

  // Filter sections based on selected product for client
  const getFilteredSections = () => {
    if (userRole === 'client' && selectedProduct) {
      const productMap = {
        'attendance': attendanceSection,
        'coworking': coworkingSection,
        'bmi': bmiSection,
        'health': bmiSection
      };
      const selectedSection = productMap[selectedProduct.toLowerCase()];
      return selectedSection ? [selectedSection] : [];
    }
    return allSections;
  };

  const sectionsToShow = getFilteredSections();

  // Logout element
  const logoutElement = {
    icon: <LogOut className="w-5 h-5" />,
    name: "Logout",
    action: handleLogout,
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black"
          onClick={handleAnyClick}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isMobile ? (isCollapsed ? 0 : 280) : (isCollapsed ? 80 : 280),
          x: isMobile ? (isCollapsed ? -280 : 0) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white z-50 shadow-2xl overflow-y-auto overflow-x-hidden
          ${isMobile ? 'shadow-xl' : ''}`}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
        </div>

        {/* Header with logo */}
        <div className="relative flex items-center justify-between h-20 px-4 overflow-hidden border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <motion.div 
            animate={{ opacity: isCollapsed && !isMobile ? 0 : 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-70"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TH</span>
              </div>
            </div>
            
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Timely Health
                </h2>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {userRole === 'client' ? 'Client Portal' : 'Admin Portal'}
                  {selectedProduct && (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      <span className="capitalize">{selectedProduct}</span>
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Collapse indicator for desktop */}
          {!isMobile && (
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              className="text-gray-400"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* User role badge for client */}
        {userRole === 'client' && selectedProduct && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300">
                Active Product: <span className="text-white font-semibold capitalize">{selectedProduct}</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Menu */}
        <nav className="relative px-3 py-4 pb-32 min-h-[calc(100%-5rem)]">
          <div className="space-y-2">
            {sectionsToShow.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-2"
              >
                {/* Section Header with Dropdown */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer overflow-hidden
                    ${openDropdown === item.name ? 'bg-gradient-to-r ' + item.color : 'hover:bg-gray-700/50'}`}
                  onClick={(e) => toggleDropdown(e, item.name)}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${item.color}`}></div>
                  
                  <div className="flex items-center gap-3 z-10">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {(!isCollapsed || isMobile) && (
                    <motion.div
                      animate={{ rotate: openDropdown === item.name ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="text-xs text-gray-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Dropdown Items */}
                <AnimatePresence>
                  {openDropdown === item.name && (!isCollapsed || isMobile) && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-11 mt-1 space-y-0.5 overflow-hidden"
                    >
                      {item.dropdown.map((sub, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          {sub.hasSubmenu ? (
                            // Submenu item (like Recruitment)
                            <div className="space-y-0.5">
                              <div
                                onClick={(e) => toggleSubDropdown(e, item.name, sub.name)}
                                className={`flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-lg transition-all duration-200 cursor-pointer
                                  ${openSubDropdown[item.name]?.[sub.name] 
                                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="opacity-70">{sub.icon}</span>
                                  <span className="no-underline">{sub.name}</span>
                                </div>
                                <motion.div
                                  animate={{ rotate: openSubDropdown[item.name]?.[sub.name] ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </motion.div>
                              </div>
                              
                              {/* Submenu items */}
                              <AnimatePresence>
                                {openSubDropdown[item.name]?.[sub.name] && (
                                  <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-6 space-y-0.5 overflow-hidden"
                                  >
                                    {sub.submenu.map((subItem, j) => (
                                      <motion.li
                                        key={`sub-${j}`}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: j * 0.03 }}
                                      >
                                        <Link
                                          to={subItem.path}
                                          onClick={handleAnyClick}
                                          className={`flex items-center gap-2 py-1.5 px-3 text-xs rounded-lg transition-all duration-200 no-underline
                                            ${location.pathname === subItem.path 
                                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}
                                        >
                                          <span className="opacity-60">{subItem.icon}</span>
                                          <span className="no-underline">{subItem.name}</span>
                                          
                                          {/* Active indicator for sub-items */}
                                          {location.pathname === subItem.path && (
                                            <motion.div
                                              layoutId="subActiveIndicator"
                                              className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                            />
                                          )}
                                        </Link>
                                      </motion.li>
                                    ))}
                                  </motion.ul>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            // Regular menu item
                            <Link
                              to={sub.path}
                              onClick={handleAnyClick}
                              className={`flex items-center gap-2 py-2 px-3 text-sm rounded-lg transition-all duration-200 no-underline
                                ${location.pathname === sub.path 
                                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                            >
                              <span className="opacity-70">{sub.icon}</span>
                              <span className="no-underline">{sub.name}</span>
                              
                              {/* Active indicator */}
                              {location.pathname === sub.path && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                />
                              )}
                            </Link>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Logout Button with margin top */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-4 border-t border-gray-700/50"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                logoutElement.action();
                handleAnyClick();
              }}
              className="group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer overflow-hidden hover:bg-red-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="p-2 rounded-lg bg-red-500/20 group-hover:scale-110 transition-transform">
                {logoutElement.icon}
              </div>
              
              {(!isCollapsed || isMobile) && (
                <span className="text-sm font-medium text-red-400 group-hover:text-red-300 no-underline">
                  {logoutElement.name}
                </span>
              )}
            </motion.div>
          </motion.div>
        </nav>

        {/* Footer */}
        <motion.div 
          animate={{ opacity: isCollapsed && !isMobile ? 0 : 1 }}
          className="sticky bottom-0 left-0 right-0 px-4 py-3 text-xs text-gray-400 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm"
        >
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-300">v2.0</p>
                <p className="text-[10px]">© 2026 Timely Health</p>
              </div>
              <Award className="w-5 h-5 text-gray-500" />
            </div>
          ) : (
            <span className="block text-center">v2</span>
          )}
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { transform: translateX(0%) scale(1); }
          50% { transform: translateX(100%) scale(1.5); }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;