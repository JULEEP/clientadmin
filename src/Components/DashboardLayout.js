import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, User, Settings, Clock, Calendar, FileText, Users,
  Briefcase, Building2, DollarSign, MessageCircle, TrendingUp,
  LogOut, Menu, X, Activity
} from "lucide-react";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeProduct, setActiveProduct] = useState('attendance');
  const [productDisplayName, setProductDisplayName] = useState('Attendance System');

  useEffect(() => {
    let productType = location.state?.selectedProduct || localStorage.getItem('activeProductType');
    let displayName = location.state?.selectedProductName || localStorage.getItem('activeProductName');
    
    if (!productType) {
      const path = location.pathname;
      if (path.includes('coworking')) {
        productType = 'coworking';
        displayName = 'Coworking Space';
      } else if (path.includes('recruitment')) {
        productType = 'recruitment';
        displayName = 'Recruitment System';
      } else {
        productType = 'attendance';
        displayName = 'Attendance System';
      }
    }
    
    setActiveProduct(productType);
    setProductDisplayName(displayName);
    localStorage.setItem('activeProductType', productType);
    localStorage.setItem('activeProductName', displayName);
  }, [location]);

  const getSidebarMenus = () => {
    switch(activeProduct) {
      case 'attendance':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, path: '/client-dashboard' },
          { name: 'Mark Attendance', icon: <Clock size={20} />, path: '/attendance-capture' },
          { name: 'My Attendance', icon: <Calendar size={20} />, path: '/myattendance' },
          { name: 'Today Attendance', icon: <Users size={20} />, path: '/today-attendance' },
          { name: 'Leaves', icon: <FileText size={20} />, path: '/myleaves' },
          { name: 'My Shift', icon: <Clock size={20} />, path: '/my-shift' },
          { name: 'Settings', icon: <Settings size={20} />, path: '/setting' },
        ];
      
      case 'coworking':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, path: '/client-dashboard/coworking' },
          { name: 'Spaces', icon: <Building2 size={20} />, path: '/spaces' },
          { name: 'My Bookings', icon: <Calendar size={20} />, path: '/all-bookings' },
          { name: 'My Cabins', icon: <Home size={20} />, path: '/mycabins' },
        ];
      
      case 'recruitment':
        return [
          { name: 'Dashboard', icon: <Home size={20} />, path: '/client-dashboard/recruitment' },
          { name: 'All Jobs', icon: <Briefcase size={20} />, path: '/all-jobs' },
          { name: 'Applied Jobs', icon: <Users size={20} />, path: '/applied-jobs' },
          { name: 'Interviews', icon: <Calendar size={20} />, path: '/interview' },
        ];
      
      default:
        return [
          { name: 'Dashboard', icon: <Home size={20} />, path: '/client-dashboard' },
        ];
    }
  };

  const sidebarMenus = getSidebarMenus();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gray-900 text-white transition-all duration-300 fixed h-full z-20`}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          {sidebarOpen && <span className="font-bold text-lg">{productDisplayName}</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="p-4">
          {sidebarMenus.map((menu, idx) => (
            <button
              key={idx}
              onClick={() => navigate(menu.path)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 mb-1"
            >
              {menu.icon}
              {sidebarOpen && <span className="text-sm">{menu.name}</span>}
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 mt-10"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </nav>
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <div className="bg-white shadow p-4">
          <h1 className="text-xl font-bold">{productDisplayName}</h1>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;