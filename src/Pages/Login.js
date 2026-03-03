import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  Building2,
  Briefcase,
  CalendarDays,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Search,
  Calendar,
  User,
  Settings,
  Bell,
  LogIn,
  UserPlus,
  FileText,
  BookOpen,
  Home,
  DollarSign,
  ShoppingBag,
  Package,
  Activity,
  TrendingUp,
  Coffee,
  Gift,
  Award,
  Globe,
  Zap,
  Smile,
  Sparkles,
  Rocket,
  Shield,
  Lock,
  Key,
  Heart
} from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [loginType, setLoginType] = useState('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [clientData, setClientData] = useState(null);
  const navigate = useNavigate();

  // Check localStorage on component mount
  useEffect(() => {
    const storedShowProducts = localStorage.getItem('showProducts');
    const storedClientData = localStorage.getItem('clientData');
    
    if (storedShowProducts === 'true' && storedClientData) {
      setShowProducts(true);
      setClientData(JSON.parse(storedClientData));
    }
  }, []);

  // Product icons mapping - UPDATED to include camp mapping to health/bmi
  const productIcons = {
    // Attendance Section
    attendance: { icon: <Clock size={24} />, color: "bg-blue-100 text-blue-600", name: "Attendance", section: "attendance" },
    
    // Co-Working Section
    coworking: { icon: <Building2 size={24} />, color: "bg-purple-100 text-purple-600", name: "Co-Working", section: "coworking" },
    
    // BMI & Health Section - Multiple keywords map to same section
    bmi: { icon: <Heart size={24} />, color: "bg-red-100 text-red-600", name: "BMI", section: "bmi" },
    health: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Health", section: "bmi" },
    wellness: { icon: <HeartPulse size={24} />, color: "bg-red-100 text-red-600", name: "Wellness", section: "bmi" },
    camp: { icon: <Users size={24} />, color: "bg-red-100 text-red-600", name: "Health Camp", section: "bmi" }, // CAMP maps to BMI section
    
    // Other products
    hr: { icon: <Users size={24} />, color: "bg-pink-100 text-pink-600", name: "HR", section: "hr" },
    projects: { icon: <Briefcase size={24} />, color: "bg-orange-100 text-orange-600", name: "Projects", section: "projects" },
    appointments: { icon: <CalendarDays size={24} />, color: "bg-green-100 text-green-600", name: "Appointments", section: "appointments" },
    support: { icon: <MessageCircle size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Support", section: "support" },
    security: { icon: <ShieldCheck size={24} />, color: "bg-teal-100 text-teal-600", name: "Security", section: "security" },
    accounting: { icon: <FileText size={24} />, color: "bg-amber-100 text-amber-600", name: "Accounting", section: "accounting" },
    knowledge: { icon: <BookOpen size={24} />, color: "bg-cyan-100 text-cyan-600", name: "Knowledge", section: "knowledge" },
    sign: { icon: <User size={24} />, color: "bg-lime-100 text-lime-600", name: "Sign", section: "sign" },
    crm: { icon: <Users size={24} />, color: "bg-rose-100 text-rose-600", name: "CRM", section: "crm" },
    studio: { icon: <Settings size={24} />, color: "bg-fuchsia-100 text-fuchsia-600", name: "Studio", section: "studio" },
    subscriptions: { icon: <Coffee size={24} />, color: "bg-violet-100 text-violet-600", name: "Subscriptions", section: "subscriptions" },
    rental: { icon: <Home size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Rental", section: "rental" },
    pos: { icon: <DollarSign size={24} />, color: "bg-orange-100 text-orange-600", name: "POS", section: "pos" },
    discuss: { icon: <MessageCircle size={24} />, color: "bg-emerald-100 text-emerald-600", name: "Discuss", section: "discuss" },
    documents: { icon: <FileText size={24} />, color: "bg-sky-100 text-sky-600", name: "Documents", section: "documents" },
    project: { icon: <Briefcase size={24} />, color: "bg-indigo-100 text-indigo-600", name: "Project", section: "project" },
    timesheets: { icon: <Clock size={24} />, color: "bg-purple-100 text-purple-600", name: "Timesheets", section: "timesheets" },
    purchase: { icon: <ShoppingBag size={24} />, color: "bg-pink-100 text-pink-600", name: "Purchase", section: "purchase" },
    inventory: { icon: <Package size={24} />, color: "bg-blue-100 text-blue-600", name: "Inventory", section: "inventory" },
    manufacturing: { icon: <Settings size={24} />, color: "bg-green-100 text-green-600", name: "Manufacturing", section: "manufacturing" },
    sales: { icon: <TrendingUp size={24} />, color: "bg-red-100 text-red-600", name: "Sales", section: "sales" },
    dashboard: { icon: <Activity size={24} />, color: "bg-yellow-100 text-yellow-600", name: "Dashboard", section: "dashboard" }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. First Attempt: Admin Login
      const adminResponse = await fetch('https://attendancebackend-5cgn.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        localStorage.setItem('adminToken', adminData.token);
        localStorage.setItem('adminId', adminData.admin.id);
        localStorage.setItem('adminName', adminData.admin.name);
        localStorage.setItem('userRole', 'admin');
        localStorage.removeItem('showProducts');
        localStorage.removeItem('clientData');
        navigate('/dashboard');
        return;
      }

      // 2. Second Attempt: Employee Login
      const empResponse = await fetch("https://api.timelyhealth.in/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const empData = await empResponse.json();

      if (empResponse.ok) {
        localStorage.setItem("employeeData", JSON.stringify(empData.employee));
        localStorage.setItem("employeeId", empData.employee._id);
        localStorage.setItem("employeeEmail", empData.employee.email);
        localStorage.setItem("employeeName", empData.employee.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.removeItem('showProducts');
        localStorage.removeItem('clientData');
        navigate("/employeedashboard", { state: { email: empData.employee.email } });
        return;
      }

      // 3. Third Attempt: Client Login
      let clientPayload = {};
      
      if (loginType === 'email') {
        clientPayload = { email, password };
      } else {
        clientPayload = { clientId, password };
      }

      const clientResponse = await fetch('http://localhost:5001/api/clients/clientlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      });

      const clientData = await clientResponse.json();

      if (clientResponse.ok) {
        // Store client data
        setClientData(clientData.client);
        localStorage.setItem('clientToken', clientData.token);
        localStorage.setItem('clientId', clientData.client._id);
        localStorage.setItem('clientCustomId', clientData.client.clientId);
        localStorage.setItem('clientName', clientData.client.name);
        localStorage.setItem('clientEmail', clientData.client.email);
        localStorage.setItem('clientData', JSON.stringify(clientData.client));
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('showProducts', 'true');
        
        // Show products page instead of directly navigating
        setShowProducts(true);
        return;
      }

      throw new Error(clientData.message || empData.message || adminData.message || 'Invalid credentials');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Get the section mapping for the product
    const productInfo = productIcons[product.toLowerCase()];
    const sectionToNavigate = productInfo?.section || product.toLowerCase();
    
    // Navigate to dashboard with product info
    localStorage.removeItem('showProducts'); // Clear products page flag
    navigate('/dashboard', { 
      state: { 
        client: clientData,
        selectedProduct: sectionToNavigate, // Use the mapped section
        userType: 'client'
      } 
    });
  };

  const handleBackToLogin = () => {
    setShowProducts(false);
    setClientData(null);
    localStorage.removeItem('showProducts');
    localStorage.removeItem('clientData');
  };

  // If showing products page
  if (showProducts && clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-12">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-600">Welcome back, {clientData.name}!</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Purchased Products</span>
            </h1>
            <p className="text-gray-600">Select a product to access your dashboard</p>
          </motion.div>

          {/* Client Info Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Client ID</p>
                <p className="text-sm font-medium text-gray-800">{clientData.clientId}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{clientData.email}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-800">{clientData.companyName}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-800">{clientData.location}</p>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {clientData.accessibleProducts.map((product, index) => {
              // Normalize product name to lowercase for lookup
              const productKey = product.toLowerCase();
              const productInfo = productIcons[productKey] || {
                icon: <Rocket size={24} />,
                color: "bg-gray-100 text-gray-600",
                name: product.charAt(0).toUpperCase() + product.slice(1),
                section: productKey
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${productInfo.color.replace('100', '500')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className={`w-14 h-14 mx-auto mb-3 flex items-center justify-center rounded-xl ${productInfo.color} group-hover:scale-110 transition-transform duration-300`}>
                    {productInfo.icon}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 group-hover:text-[#714b67] transition">
                    {productInfo.name}
                  </p>
                  
                  <p className="text-[10px] text-gray-400 mt-1">
                    Click to access
                  </p>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-8"
          >
            <button
              onClick={handleBackToLogin}
              className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center justify-center mx-auto"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Login Page
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Left Side - Login Form */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full mb-2">
              <Lock className="w-3 h-3 text-blue-600 mr-1" />
              <span className="text-xs text-gray-600">Secure Access</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-xs mt-1">Sign in to continue your journey</p>
          </motion.div>

          {/* Login Type Toggle */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'email' 
                    ? 'bg-white shadow text-blue-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('clientId')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                  loginType === 'clientId' 
                    ? 'bg-white shadow text-purple-600 scale-105' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client ID
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2 text-red-600 bg-red-50 rounded-md text-xs mb-3 border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {loginType === 'email' ? (
                <motion.div
                  key="email-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="clientid-field"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="clientId">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="CLIENT-XXXXXX"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 transition"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn size={14} className="mr-2" />
                  Sign In
                </>
              )}
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center"
            >
              <p className="text-xs text-gray-400">
                Need help? <a href="mailto:support@domain.com" className="text-blue-600 hover:underline">support@domain.com</a>
              </p>
            </motion.div>
          </form>
        </div>

        {/* Right Side - Info Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col items-center justify-center p-6 md:p-8 text-white"
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Attendance Illustration"
            className="max-w-full h-40 object-contain rounded-lg shadow-xl mb-4"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-lg font-semibold mb-3">Quick Guide</h3>
            <div className="space-y-2">
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center space-x-2 bg-white/20 rounded-lg p-2 backdrop-blur-sm"
              >
                <Mail size={14} />
                <p className="text-xs">Admin/Employee: Use email</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center space-x-2 bg-white/20 rounded-lg p-2 backdrop-blur-sm"
              >
                <Key size={14} />
                <p className="text-xs">Client: Email or Client ID</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center space-x-2 bg-white/20 rounded-lg p-2 backdrop-blur-sm"
              >
                <Shield size={14} />
                <p className="text-xs">Select product after login</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shine {
          100% { left: 150%; }
        }
        .animate-shine {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;