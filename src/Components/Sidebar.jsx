import axios from "axios";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isMobile, onLinkClick, isCollapsed, setIsCollapsed }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState({});
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/dashboard");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Get user role and selected product
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    if (role === 'client') {
      if (location.state?.selectedProduct) {
        setSelectedProduct(location.state.selectedProduct);
        localStorage.setItem('selectedProduct', location.state.selectedProduct);
      } else {
        const savedProduct = localStorage.getItem('selectedProduct');
        setSelectedProduct(savedProduct);
      }
    }
  }, [location]);

  // Detect active page
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
    setCurrentPage(getPageNameFromPath(path));
  }, [location]);

  const getPageNameFromPath = (path) => {
    const pathMap = {
      // Common
      "/dashboard": "Dashboard",
      
      // Attendance Section
      "/attendance-dashboard": "Attendance Dashboard",
      "/employeelist": "Employees",
      "/attedancesummary": "Attendance Summary",
      "/attendancelist": "Attendance Records",
      "/today-attendance": "Today Attendance",
      "/absent-today": "Absent Today",
      "/leavelist": "Leaves",
      "/payroll": "Payroll",
      "/permissions": "Permissions",
      "/all-expensives": "Expenses",
      "/shift": "Shifts",
      "/shiftlist": "Shifts",
      "/locationlist": "Locations",
      
      // Coworking Section
      "/coworking-dashboard": "Coworking Dashboard",
      "/add-cabin": "Add Cabin",
      "/all-cabins": "All Cabins",
      "/all-bookings": "All Bookings",
      "/my-bookings": "My Bookings",
      "/coworking-members": "Members",
      "/coworking-payments": "Payments",
      "/coworking-reports": "Reports",
      "/coworking-settings": "Settings",
      
      // BMI/Health Section
      "/bmi-dashboard": "BMI Dashboard",
      "/health-camps": "Health Camps",
      "/camp-registrations": "Camp Registrations",
      "/camp-attendance": "Camp Attendance",
      "/bmi-records": "BMI Records",
      "/health-reports": "Health Reports",
      "/wellness-programs": "Wellness Programs",
      "/health-tips": "Health Tips",
      
      // Other sections
      "/useractivity": "User Activity",
      "/useraccess": "User Access",
      "/jobpost": "Job Posts",
      "/addemployee": "Add Employee",
      "/editemployee": "Edit Employee",
      "/departmentdashboard": "Departments",
      "/roledashboard": "Roles",
      "/addlocation": "Add Location",
      "/empmanagement": "Employee Management",
      "/job-applicants": "Job Applicants",
      "/score": "Score Board",
      "/assessment-manager": "Assessments",
      "/documents": "Documents",
      "/personaldocuments": "Documents",
      "/leaves-report": "Leaves Report",
      "/recruitment-dashboard": "Recruitment Dashboard",
      "/employee-journey": "Employee Journey"
    };
    return pathMap[path] || "Dashboard";
  };

  // Desktop Hover Expand
  const handleMouseEnterSidebar = () => {
    if (!isMobile && setIsCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (!isMobile && setIsCollapsed) {
      if (!openDropdown) {
        setIsCollapsed(true);
      }
    }
  };

  // Tooltip position
  const handleMouseMove = (e, itemName) => {
    setTooltipPosition({
      x: e.clientX + 15,
      y: e.clientY - 10,
    });
    setHoveredItem(itemName);
  };

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (openDropdown !== name) {
      if (!isMobile && isCollapsed && setIsCollapsed) {
        setIsCollapsed(false);
      }
      setOpenDropdown(name);
    } else {
      setOpenDropdown(null);
    }
  };

  const toggleSubDropdown = (e, parentName, subName) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenSubDropdown(prev => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [subName]: !prev[parentName]?.[subName]
      }
    }));
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {}
    localStorage.clear();
    navigate("/admin-login");
  };

  const isActive = (path) => activeItem === path;

  const isDropdownActive = (dropdownItems) =>
    dropdownItems?.some((item) => {
      if (item.submenu) {
        return item.submenu.some(sub => isActive(sub.path));
      }
      return isActive(item.path);
    });

  // Dynamic elements based on selected product
  const getElements = () => {
    // If client with selected product, show product-specific sidebar
    if (userRole === 'client' && selectedProduct) {
      switch(selectedProduct) {
        case 'attendance':
          return [
            {
              icon: <i className="ri-dashboard-fill"></i>,
              name: "Dashboard",
              path: "/attendance-dashboard",
            },
            {
              icon: <i className="ri-user-fill"></i>,
              name: "Employees",
              path: "/employeelist",
            },
            {
              icon: <i className="ri-calendar-check-fill"></i>,
              name: "Attendance",
              dropdown: [
                { name: "Attendance Summary", path: "/attedancesummary" },
                { name: "Attendance Records", path: "/attendancelist" },
                { name: "Today Attendance", path: "/today-attendance" },
                { name: "Absent Today", path: "/absent-today" },
              ],
            },
            {
              icon: <i className="ri-calendar-close-fill"></i>,
              name: "Leaves",
              path: "/leavelist",
            },
            {
              icon: <i className="ri-shield-keyhole-fill"></i>,
              name: "Permissions",
              path: "/permissions",
            },
            {
              icon: <i className="ri-money-dollar-box-fill"></i>,
              name: "Payroll",
              path: "/payroll",
            },
            {
              icon: <i className="ri-money-dollar-box-fill"></i>,
              name: "Expensives",
              path: "/all-expensives"
            },
            {
              icon: <i className="ri-time-fill"></i>,
              name: "Shifts",
              path: "/shift",
            },
            {
              icon: <i className="ri-map-pin-2-fill"></i>,
              name: "Locations",
              path: "/locationlist",
            },
            {
              icon: <i className="ri-logout-box-r-line"></i>,
              name: "Logout",
              action: handleLogout,
            },
          ];
          
        case 'coworking':
          return [
            {
              icon: <i className="ri-dashboard-fill"></i>,
              name: "Dashboard",
              path: "/coworking-dashboard",
            },
            {
              icon: <i className="ri-building-4-fill"></i>,
              name: "Cabins",
              dropdown: [
                { name: "All Cabins", path: "/mycabins" },
              ],
            },
            {
              icon: <i className="ri-calendar-book-fill"></i>,
              name: "Bookings",
              dropdown: [
                { name: "All Bookings", path: "/all-bookings" },
              ],
            },
            {
              icon: <i className="ri-logout-box-r-line"></i>,
              name: "Logout",
              action: handleLogout,
            },
          ];
          
        case 'bmi':
          return [
            {
              icon: <i className="ri-dashboard-fill"></i>,
              name: "Dashboard",
              path: "/bmi-dashboard",
            },
            {
              icon: <i className="ri-heart-pulse-fill"></i>,
              name: "Health Camps",
              dropdown: [
                { name: "All Camps", path: "/health-camps" },
                { name: "Registrations", path: "/camp-registrations" },
                { name: "Camp Attendance", path: "/camp-attendance" },
              ],
            },
            {
              icon: <i className="ri-body-scan-fill"></i>,
              name: "BMI Records",
              path: "/bmi-records",
            },
            {
              icon: <i className="ri-file-chart-fill"></i>,
              name: "Health Reports",
              path: "/health-reports",
            },
            {
              icon: <i className="ri-leaf-fill"></i>,
              name: "Wellness",
              dropdown: [
                { name: "Wellness Programs", path: "/wellness-programs" },
                { name: "Health Tips", path: "/health-tips" },
              ],
            },
            {
              icon: <i className="ri-team-fill"></i>,
              name: "Camp Members",
              path: "/camp-members",
            },
            {
              icon: <i className="ri-logout-box-r-line"></i>,
              name: "Logout",
              action: handleLogout,
            },
          ];
          
        default:
          return [];
      }
    }
    
    // Default full sidebar for admin/employee
    return [
      {
        icon: <i className="ri-dashboard-fill"></i>,
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: <i className="ri-user-fill"></i>,
        name: "Employees",
        path: "/employeelist",
      },
      {
        icon: <i className="ri-calendar-check-fill"></i>,
        name: "Attendance",
        dropdown: [
          { name: "Attendance Summary", path: "/attedancesummary" },
          { name: "Attendance Records", path: "/attendancelist" },
          { name: "Today Attendance", path: "/today-attendance" },
          { name: "Absent Today", path: "/absent-today" },
        ],
      },
      {
        icon: <i className="ri-calendar-close-fill"></i>,
        name: "Leaves",
        path: "/leavelist",
      },
      {
        icon: <i className="ri-shield-keyhole-fill"></i>,
        name: "Permissions",
        path: "/permissions",
      },
      {
        icon: <i className="ri-money-dollar-box-fill"></i>,
        name: "Payroll",
        path: "/payroll",
      },
      {
        icon: <i className="ri-money-dollar-box-fill"></i>,
        name: "Expensives",
        path: "/all-expensives"
      },
      {
        icon: <i className="ri-history-fill"></i>,
        name: "User Activity",
        path: "/useractivity",
      },
      {
        icon: <i className="ri-shield-user-fill"></i>,
        name: "User Access",
        path: "/useraccess",
      },
      {
        icon: <i className="ri-briefcase-fill"></i>,
        name: "Recruitment",
        dropdown: [
          { name: "Dashboard", path: "/recruitment-dashboard" },
          { name: "Job Posts", path: "/jobpost" },
          { name: "Job Applicants", path: "/job-applicants" },
          { name: "Score Board", path: "/score" },
          { name: "Assessments", path: "/assessment-manager" },
          { name: "Documents", path: "/personaldocuments" },
          { name: "Employee Journey", path: "/employee-journey" },
        ],
      },
      {
        icon: <i className="ri-map-pin-2-fill"></i>,
        name: "Locations",
        path: "/locationlist",
      },
      {
        icon: <i className="ri-time-fill"></i>,
        name: "Shifts",
        path: "/shift",
      },
      {
        icon: <i className="ri-logout-box-r-line"></i>,
        name: "Logout",
        action: handleLogout,
      },
    ];
  };

  const elements = getElements();

  // Handle item click
  const handleItemClick = (path, action) => {
    if (path) {
      navigate(path);
    }
    
    if (action) {
      action();
    }
    
    setOpenDropdown(null);
    setOpenSubDropdown({});
    
    if (onLinkClick) {
      onLinkClick();
    }
    
    setHoveredItem(null);
  };

  // Handle dropdown item click
  const handleDropdownItemClick = (path) => {
    navigate(path);
    setOpenDropdown(null);
    setOpenSubDropdown({});
    
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Get header title based on selected product
  const getHeaderTitle = () => {
    if (isCollapsed && !isMobile) {
      switch(selectedProduct) {
        case 'attendance': return 'AM';
        case 'coworking': return 'CW';
        case 'bmi': return 'BM';
        default: return 'TM';
      }
    }
    
    switch(selectedProduct) {
      case 'attendance': return 'Attendance Management';
      case 'coworking': return 'Coworking Space';
      case 'bmi': return 'BMI & Health';
      default: return 'Team Management';
    }
  };

  // Get footer text
  const getFooterText = () => {
    switch(selectedProduct) {
      case 'attendance': return 'Attendance v2.0';
      case 'coworking': return 'Coworking v1.0';
      case 'bmi': return 'Health v1.0';
      default: return 'System v2.0';
    }
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => {
            if (onLinkClick) onLinkClick();
            setOpenDropdown(null);
            setOpenSubDropdown({});
          }}
        />
      )}

      {isCollapsed && hoveredItem && !isMobile && (
        <div
          className="fixed z-[100] bg-[#1E40AF] text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none border border-blue-700"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {hoveredItem}
        </div>
      )}

      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-50 transition-all duration-300 border-r border-blue-800/50
        ${
          isMobile
            ? isCollapsed
              ? "-translate-x-full w-52"
              : "translate-x-0 w-52"
            : isCollapsed
            ? "w-16"
            : "w-52"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
          {isCollapsed && !isMobile ? (
            <span className="text-xl text-emerald-300">{getHeaderTitle()}</span>
          ) : (
            <div className="flex flex-col w-full">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
                {getHeaderTitle()}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-medium truncate text-blue-100/80">
                  {currentPage}
                </span>
                {userRole === 'client' && selectedProduct && (
                  <>
                    <span className="text-blue-300">·</span>
                    <span className="text-[10px] text-emerald-300 capitalize">{selectedProduct}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 7rem)' }}>
          {elements.map((item, idx) => (
            <div key={idx}>
              {item.dropdown ? (
                <>
                  <div
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                      isDropdownActive(item.dropdown)
                        ? "bg-emerald-600/80 text-white shadow-lg"
                        : openDropdown === item.name
                        ? "bg-blue-700/70"
                        : "hover:bg-blue-700/60"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.dropdown && item.dropdown.length > 0) {
                        navigate(item.dropdown[0].path);
                        setOpenDropdown(null);
                        setOpenSubDropdown({});
                        if (onLinkClick) onLinkClick();
                      }
                    }}
                    onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg transition-colors duration-200 ${
                        isDropdownActive(item.dropdown)
                          ? "text-white"
                          : openDropdown === item.name
                          ? "text-emerald-300"
                          : "text-blue-100 group-hover:text-emerald-300"
                      }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-[14px] font-medium leading-none">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        {isDropdownActive(item.dropdown) && (
                          <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                        )}
                        <FaChevronDown
                          onClick={(e) => toggleDropdown(e, item.name)}
                          className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${
                            isDropdownActive(item.dropdown)
                              ? "text-white"
                              : openDropdown === item.name
                              ? "text-emerald-300"
                              : "text-blue-300 hover:text-white"
                          } ${openDropdown === item.name ? "rotate-180" : ""}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            minWidth: '20px',
                            minHeight: '20px'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN ITEMS */}
                  {openDropdown === item.name && !isCollapsed && (
                    <ul className="mt-0.5 space-y-0.5">
                      {item.dropdown.map((sub, i) => (
                        <li key={i}>
                          {sub.submenu ? (
                            // Handle submenu
                            <div>
                              <div
                                onClick={(e) => toggleSubDropdown(e, item.name, sub.name)}
                                className={`flex items-center justify-between py-1 text-[13px] transition-colors pl-8 pr-2 rounded cursor-pointer ${
                                  sub.submenu?.some(s => isActive(s.path))
                                    ? "text-emerald-300 font-semibold"
                                    : "text-blue-100 hover:text-emerald-300"
                                }`}
                              >
                                <span>{sub.name}</span>
                                <FaChevronDown
                                  className={`text-[10px] transition-transform duration-200 ${
                                    openSubDropdown[item.name]?.[sub.name] ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                              {openSubDropdown[item.name]?.[sub.name] && (
                                <ul className="ml-4 space-y-0.5">
                                  {sub.submenu.map((subItem, j) => (
                                    <li key={j}>
                                      <Link
                                        to={subItem.path}
                                        onClick={() => handleDropdownItemClick(subItem.path)}
                                        className={`block py-1 text-[12px] transition-colors pl-8 no-underline ${
                                          isActive(subItem.path)
                                            ? "text-emerald-300 font-semibold"
                                            : "text-blue-100/80 hover:text-emerald-300"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {isActive(subItem.path) && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                          )}
                                          {subItem.name}
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ) : (
                            <Link
                              to={sub.path}
                              onClick={() => handleDropdownItemClick(sub.path)}
                              className={`block py-1 text-[13px] transition-colors pl-8 no-underline ${
                                isActive(sub.path)
                                  ? "text-emerald-300 font-semibold"
                                  : "text-blue-100 hover:text-emerald-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isActive(sub.path) && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                )}
                                {sub.name}
                              </div>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div
                  onClick={() => handleItemClick(item.path, item.action)}
                  onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-emerald-600/80 text-white shadow-lg"
                      : "hover:bg-blue-700/60"
                  }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-blue-100 group-hover:text-emerald-300"
                  }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-[14px] font-medium leading-none truncate">
                        {item.name}
                      </span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 ml-auto rounded-full bg-emerald-300 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
          {!isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wider uppercase text-blue-200/80">{getFooterText()}</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-[9px] text-emerald-300 font-medium">Active</span>
                </div>
              </div>
              <p>© 2026 Timely Health</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>©</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Global fix for all links in sidebar */
        :global(.no-underline) {
          text-decoration: none !important;
        }
        
        :global(a) {
          text-decoration: none !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;