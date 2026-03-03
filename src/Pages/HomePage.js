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
  Smile
} from "lucide-react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../Images/Timely-Health-Logo.png"

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const navigate = useNavigate()

  // Handle card click - navigate to login
  const handleCardClick = () => {
    navigate("/login")
  }

  // Odoo jaisi services
  const services = [
    { name: "HR", icon: <Users size={20} strokeWidth={1.5} />, color: "bg-pink-100 text-pink-600", gradient: "from-pink-500 to-pink-600" },
    { name: "Attendance", icon: <Clock size={20} strokeWidth={1.5} />, color: "bg-blue-100 text-blue-600", gradient: "from-blue-500 to-blue-600" },
    { name: "Co-Working", icon: <Building2 size={20} strokeWidth={1.5} />, color: "bg-purple-100 text-purple-600", gradient: "from-purple-500 to-purple-600" },
    { name: "Projects", icon: <Briefcase size={20} strokeWidth={1.5} />, color: "bg-orange-100 text-orange-600", gradient: "from-orange-500 to-orange-600" },
    { name: "Appointments", icon: <CalendarDays size={20} strokeWidth={1.5} />, color: "bg-green-100 text-green-600", gradient: "from-green-500 to-green-600" },
    { name: "Wellness", icon: <HeartPulse size={20} strokeWidth={1.5} />, color: "bg-red-100 text-red-600", gradient: "from-red-500 to-red-600" },
    { name: "Support", icon: <MessageCircle size={20} strokeWidth={1.5} />, color: "bg-indigo-100 text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
    { name: "Security", icon: <ShieldCheck size={20} strokeWidth={1.5} />, color: "bg-teal-100 text-teal-600", gradient: "from-teal-500 to-teal-600" },
    { name: "Accounting", icon: <FileText size={20} strokeWidth={1.5} />, color: "bg-amber-100 text-amber-600", gradient: "from-amber-500 to-amber-600" },
    { name: "Knowledge", icon: <BookOpen size={20} strokeWidth={1.5} />, color: "bg-cyan-100 text-cyan-600", gradient: "from-cyan-500 to-cyan-600" },
    { name: "Sign", icon: <User size={20} strokeWidth={1.5} />, color: "bg-lime-100 text-lime-600", gradient: "from-lime-500 to-lime-600" },
    { name: "CRM", icon: <Users size={20} strokeWidth={1.5} />, color: "bg-rose-100 text-rose-600", gradient: "from-rose-500 to-rose-600" },
    { name: "Studio", icon: <Settings size={20} strokeWidth={1.5} />, color: "bg-fuchsia-100 text-fuchsia-600", gradient: "from-fuchsia-500 to-fuchsia-600" },
    { name: "Subscriptions", icon: <Coffee size={20} strokeWidth={1.5} />, color: "bg-violet-100 text-violet-600", gradient: "from-violet-500 to-violet-600" },
    { name: "Rental", icon: <Home size={20} strokeWidth={1.5} />, color: "bg-yellow-100 text-yellow-600", gradient: "from-yellow-500 to-yellow-600" },
    { name: "POS", icon: <DollarSign size={20} strokeWidth={1.5} />, color: "bg-orange-100 text-orange-600", gradient: "from-orange-500 to-orange-600" },
    { name: "Discuss", icon: <MessageCircle size={20} strokeWidth={1.5} />, color: "bg-emerald-100 text-emerald-600", gradient: "from-emerald-500 to-emerald-600" },
    { name: "Documents", icon: <FileText size={20} strokeWidth={1.5} />, color: "bg-sky-100 text-sky-600", gradient: "from-sky-500 to-sky-600" },
    { name: "Project", icon: <Briefcase size={20} strokeWidth={1.5} />, color: "bg-indigo-100 text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
    { name: "Timesheets", icon: <Clock size={20} strokeWidth={1.5} />, color: "bg-purple-100 text-purple-600", gradient: "from-purple-500 to-purple-600" },
    { name: "Purchase", icon: <ShoppingBag size={20} strokeWidth={1.5} />, color: "bg-pink-100 text-pink-600", gradient: "from-pink-500 to-pink-600" },
    { name: "Inventory", icon: <Package size={20} strokeWidth={1.5} />, color: "bg-blue-100 text-blue-600", gradient: "from-blue-500 to-blue-600" },
    { name: "Manufacturing", icon: <Settings size={20} strokeWidth={1.5} />, color: "bg-green-100 text-green-600", gradient: "from-green-500 to-green-600" },
    { name: "Sales", icon: <TrendingUp size={20} strokeWidth={1.5} />, color: "bg-red-100 text-red-600", gradient: "from-red-500 to-red-600" },
    { name: "Dashboard", icon: <Activity size={20} strokeWidth={1.5} />, color: "bg-yellow-100 text-yellow-600", gradient: "from-yellow-500 to-yellow-600" },
  ]

  // Stats for hero section
  const stats = [
    { value: "15K+", label: "Active Users" },
    { value: "98%", label: "Satisfaction" },
    { value: "24/7", label: "Support" },
    { value: "100+", label: "Integrations" }
  ]

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] text-gray-800">

      {/* NAVBAR with gradient hover */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-1 group cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Timely Health" className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-light group-hover:text-[#714b67] transition">timely</span>
            <span className="text-lg font-bold text-[#714b67]">health</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-[#714b67] transition relative group">
              Apps
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#714b67] transition relative group">
              Industries
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#714b67] transition relative group">
              Community
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#714b67] transition relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-[#714b67] transition relative group">
              Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate("/login")} className="hidden sm:block text-sm text-gray-600 hover:text-[#714b67] transition relative group">
              Sign in
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#714b67] transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => navigate("/login")} className="px-4 py-1.5 bg-gradient-to-r from-[#714b67] to-[#8a6b8a] text-white rounded-md text-sm hover:shadow-lg hover:scale-105 transition-all duration-300">Try it free</button>
            <button className="md:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-2 space-y-1 bg-white/95 backdrop-blur-md">
            <a href="#" className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Apps</a>
            <a href="#" className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Industries</a>
            <a href="#" className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Community</a>
            <a href="#" className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Pricing</a>
            <a href="#" className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Help</a>
            <button onClick={() => navigate("/login")} className="block py-1.5 text-sm text-gray-600 hover:text-[#714b67]">Sign in</button>
          </div>
        )}
      </nav>

      {/* HERO SECTION with animated gradient background */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 animate-gradient"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Trust badge */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6 border border-gray-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-xs text-gray-600">Trusted by 15,000+ healthcare providers</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4">
            All your healthcare on<br />
            <span className="font-bold bg-gradient-to-r from-[#714b67] to-[#a67c9e] bg-clip-text text-transparent">
              one platform.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">Simple, efficient, yet affordable!</p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button onClick={() => navigate("/login")} className="group px-6 py-3 bg-gradient-to-r from-[#714b67] to-[#8a6b8a] text-white rounded-lg text-sm md:text-base hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center">
              Start now - It's free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group px-6 py-3 border-2 border-[#714b67] text-[#714b67] rounded-lg text-sm md:text-base hover:bg-[#714b67] hover:text-white transition-all duration-300 flex items-center">
              <Phone className="mr-2 w-4 h-4" />
              Meet an advisor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-[#714b67]">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-center">
              <span className="text-2xl md:text-3xl font-bold text-[#714b67]">₹580.00</span>
              <span className="ml-1 text-sm text-gray-500">/ month</span>
            </div>
            <p className="text-sm text-gray-500">for ALL apps</p>
          </div>

          <div className="flex items-center justify-center mt-4 space-x-2 text-sm md:text-base bg-white/80 backdrop-blur-sm p-2 rounded-full inline-flex mx-auto">
            <span className="text-gray-600">Business Show: Indore (India)</span>
            <span className="text-[#714b67] font-medium">Mar 12, 2026</span>
            <button className="text-[#714b67] hover:underline flex items-center">
              Register <ArrowRight className="ml-1 w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES GRID with click handlers */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Explore Our Solutions</h2>
            <p className="text-sm text-gray-500">Click on any app to get started</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-1 gap-y-3 justify-items-center">
            {services.slice(0, 18).map((item, i) => (
              <div
                key={i}
                onClick={handleCardClick}
                className="bg-white rounded-xl p-2 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full max-w-[90px] group relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className={`w-11 h-11 mx-auto mb-1 flex items-center justify-center rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <p className="text-[10px] font-medium text-gray-700 group-hover:text-[#714b67] transition">
                  {item.name}
                </p>
                
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Click to open
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="group inline-flex items-center text-sm text-[#714b67] font-medium hover:underline">
              View all Apps
              <ChevronDown className="ml-1 w-4 h-4 rotate-180 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="text-center mt-6 max-w-2xl mx-auto bg-white/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Imagine a vast collection of business apps at your disposal.</span>
              <br />
              Got something to improve? There is an app for that.
              <br />
              <span className="text-xs text-gray-400">No complexity, no cost, just a click install!</span>
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED SECTION with cards */}
      <section className="py-12 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "All operations under 90ms" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure by Default", desc: "Enterprise-grade security" },
              { icon: <Globe className="w-6 h-6" />, title: "Global Access", desc: "Available 24/7 anywhere" }
            ].map((feature, i) => (
              <div key={i} onClick={() => navigate("/login")} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100">
                <div className="w-10 h-10 bg-[#714b67] text-white rounded-lg flex items-center justify-center mb-2">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Businesses share their financial data with you.</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  {["Accounting", "Knowledge", "Sign in", "CRM"].map((item, i) => (
                    <div key={i} onClick={() => navigate("/login")} className="flex items-center space-x-2 mb-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 hover:text-[#714b67]">{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  {["Studio", "Education", "Projects", "Contact details"].map((item, i) => (
                    <div key={i} onClick={() => navigate("/login")} className="flex items-center space-x-2 mb-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 hover:text-[#714b67]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-32 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate("/login")}>
              <span className="text-sm text-gray-500">Interactive Dashboard Preview</span>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-sm text-gray-600 text-center">
            <p>Imagine a vast collection of business apps at your disposal.<br />Get something to improve? There is an app for that.<br />No complexity, no cost: just a simple click install.</p>
            <p>Each app simplifies a process and empowers more people.<br />Imagine the impact when everyone gets the right tool for the job, with perfect integration.</p>
            <p className="text-base font-medium text-gray-900">If you simplify everything, you can do anything.</p>
            <p className="text-[#714b67] text-sm">- All Business Tools, from CRM to SCM</p>
            <p className="text-lg font-medium text-gray-900">Level up your quality of work</p>
          </div>
        </div>
      </section>

      {/* OPTIMIZED SECTION */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white px-3 py-1 rounded-full shadow-sm mb-4">
            <span className="text-xs text-[#714b67]">⚡ Performance First</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3"># Optimized for productivity</h2>
          <p className="text-sm text-gray-600 mb-4 max-w-2xl mx-auto">Experience true speed, reduced data entry, smart AI, and a fast UI. All operations are done in less than 90ms - faster than a blink.</p>
          <button onClick={() => navigate("/login")} className="text-sm text-[#714b67] mb-6 hover:underline">- Compare with SAP</button>

          <h2 className="text-2xl font-bold text-gray-900 mb-4"># All the tech in one platform</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {["Shop Floor", "Experiences", "Point of Sale", "IoT", "Front desk", "Inventory", "Kiosk"].map((item, i) => (
              <div key={i} onClick={() => navigate("/login")} className="text-sm text-gray-600 bg-white p-2 rounded shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer">
                {item}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enterprise software done right.</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div onClick={() => navigate("/login")} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <h3 className="text-base font-semibold mb-1 group-hover:text-[#714b67]">Open source</h3>
              <p className="text-sm text-gray-600">Behind the technology is a community of 100+ developers collaborating worldwide. We're united by the spirit of open source.</p>
            </div>
            <div onClick={() => navigate("/login")} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <h3 className="text-base font-semibold mb-1 group-hover:text-[#714b67]">No vendor lock-in</h3>
              <p className="text-sm text-gray-600">No proprietary data format, just PostgreSQL: you own your data. No software lock-in: you get what you pay for.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS with animation */}
      <section className="py-10 bg-white px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-sm font-medium text-center mb-4">What brings you here today?</h3>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Your name" className="text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition" />
              <input type="tel" placeholder="WhatsApp" className="text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition" />
              <select className="text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition">
                <option>I am a...</option>
                <option>Individual</option>
                <option>RWA Head</option>
                <option>Clinic Owner</option>
              </select>
              <select className="text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#714b67] focus:border-transparent transition">
                <option>Looking for...</option>
                <option>Doctor</option>
                <option>Camp</option>
                <option>Wellness</option>
              </select>
            </div>
            <button onClick={() => navigate("/login")} className="mt-4 w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-sm py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <MessageCircle size={16} className="mr-2" />
              Start Free Chat on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER with hover effects */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <h4 className="text-xs font-semibold mb-3 text-gray-300">Community</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Tutorials
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Documentation
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Forum
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3 text-gray-300">Open Source</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Download
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Github
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Runbot
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Translations
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3 text-gray-300">Services</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Odoo.sh Hosting
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Support
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Upgrade
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Custom Developments
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Education
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Find a Partner
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3 text-gray-300">About us</h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Our company
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Brand Assets
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Contact us
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Jobs
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Events
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Blog
                </a></li>
                <li><a href="#" onClick={() => navigate("/login")} className="text-gray-500 hover:text-white transition flex items-center group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 mr-1 transition" />
                  Legal • Privacy
                </a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Timely Health is a suite of open source healthcare apps that cover all your practice needs: CRM, appointments, wellness, inventory, point of sale, project management, etc.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Timely Health's unique value proposition is to be at the same time very easy to use and fully integrated.
              </p>
              <div className="flex justify-center space-x-4 text-gray-600">
                <a href="#" onClick={() => navigate("/login")} className="hover:text-white transition hover:scale-110"><Facebook size={16} /></a>
                <a href="#" onClick={() => navigate("/login")} className="hover:text-white transition hover:scale-110"><Twitter size={16} /></a>
                <a href="#" onClick={() => navigate("/login")} className="hover:text-white transition hover:scale-110"><Instagram size={16} /></a>
                <a href="#" onClick={() => navigate("/login")} className="hover:text-white transition hover:scale-110"><Linkedin size={16} /></a>
                <a href="#" onClick={() => navigate("/login")} className="hover:text-white transition hover:scale-110"><Youtube size={16} /></a>
              </div>
              <div className="mt-4 text-xs text-gray-700 flex items-center justify-center space-x-2">
                <span>English</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage