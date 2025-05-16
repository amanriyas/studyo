import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';
import { DarkModeToggle } from '../components/DarkModeToggle';
// Import the logo
import Logo from '../assets/Logo.png';

const LandingPage = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${
      isDark 
        ? "bg-gray-900 text-white" 
        : "bg-gradient-to-b from-white to-[#f5f9f0] text-gray-800"
    }`}>
      {/* Navigation */}
      <nav className={`${isDark ? "bg-gray-800" : "bg-white"} shadow-sm py-4`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={Logo} 
              alt="Studyo Logo" 
              className="h-10 w-auto" 
            />
            <span className={`ml-2 text-2xl font-bold ${isDark ? "text-white" : "text-[#79A657]"}`}>Studyo</span>
          </div>
          
          <div className="flex items-center gap-4">
          <a
              href="https://team76.bham.team/admin/"
              className={`px-4 py-2 ${isDark ? "text-white" : "text-[#79A657]"} font-medium hover:underline`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Admin
            </a>

            <Link
              to="/api"
              className={`px-4 py-2 ${isDark ? "text-white" : "text-[#79A657]"} font-medium hover:underline`}
              aria-label="API Documentation"
            >
              API
            </Link>
            <a
              href="/GDPR.html"
              className={`px-4 py-2 ${isDark ? "text-white" : "text-[#79A657]"} font-medium hover:underline`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GDPR Policy
            </a>
           <Link 
              to="/login" 
              className={`px-4 py-2 ${isDark ? "text-white" : "text-[#79A657]"} font-medium hover:underline`}
              aria-label="Login or sign up"
            >
              Login / Sign Up
            </Link>
            <DarkModeToggle />
            
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 flex-grow flex flex-col md:flex-row items-center py-12 md:py-24">
        <div className="md:w-1/2 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your Study Success <span className="text-[#79A657]">Starts Here</span>
          </h1>
          
          <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"} mb-8 max-w-md`}>
            Studyo is the all-in-one study planner that helps you organize materials, collaborate with peers, and master new techniques to achieve academic excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/techniques" 
              className={`px-8 py-3 bg-[#79A657] text-white font-semibold rounded-lg shadow-md hover:bg-[#658a48] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#79A657] focus:ring-opacity-50`}
              aria-label="Get started with Studyo"
            >
              Get Started
            </Link>
            
            <Link 
              to="/login" 
              className={`px-8 py-3 border border-[#79A657] ${isDark ? "text-white" : "text-[#79A657]"} font-semibold rounded-lg hover:bg-${isDark ? "gray-800" : "[#f5f9f0]"} transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#79A657] focus:ring-opacity-50`}
              aria-label="Log in to your account"
            >
              Login
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
          {/* App illustration/screenshot placeholder */}
          <div className="relative w-full max-w-md">
            <div className={`absolute inset-0 bg-[#79A657] rounded-lg transform rotate-3 scale-105 opacity-20`}></div>
            <div className={`relative ${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-xl overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              {/* Stylized app preview */}
              <div className="p-6">
                <div className="h-8 w-24 bg-[#9ec67f] rounded-full mb-4"></div>
                <div className="space-y-2">
                  <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-3/4`}></div>
                  <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-full`}></div>
                  <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-5/6`}></div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className={`h-20 ${isDark ? "bg-gray-700" : "bg-[#f5f9f0]"} rounded p-3`}>
                    <div className="h-3 w-12 bg-[#79A657] rounded mb-2"></div>
                    <div className={`h-3 w-16 ${isDark ? "bg-gray-600" : "bg-gray-200"} rounded`}></div>
                  </div>
                  <div className={`h-20 ${isDark ? "bg-gray-700" : "bg-[#f5f9f0]"} rounded p-3`}>
                    <div className="h-3 w-12 bg-[#79A657] rounded mb-2"></div>
                    <div className={`h-3 w-16 ${isDark ? "bg-gray-600" : "bg-gray-200"} rounded`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className={`${isDark ? "bg-gray-800" : "bg-[#f5f9f0]"} py-16`}>
        <div className="container mx-auto px-6">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDark ? "text-white" : "text-gray-800"}`}>
            Why Students Love <span className="text-[#79A657]">Studyo</span>
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Feature 1 - Dashboard */}
            <div className={`${isDark ? "bg-gray-700" : "bg-white"} p-6 rounded-lg shadow-md`}>
              <div className="bg-[#79A657]/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#79A657]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Dashboard</h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Track your progress, access all your study tools, and organize your learning journey from one central hub.</p>
            </div>
            
            {/* Feature 2 - Techniques */}
            <div className={`${isDark ? "bg-gray-700" : "bg-white"} p-6 rounded-lg shadow-md`}>
              <div className="bg-[#79A657]/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#79A657]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Learning Techniques</h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Discover and apply proven study methods and techniques to improve retention and understanding.</p>
            </div>
            
            {/* Feature 3 - Flashcards */}
            <div className={`${isDark ? "bg-gray-700" : "bg-white"} p-6 rounded-lg shadow-md`}>
              <div className="bg-[#79A657]/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#79A657]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Flashcards</h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Create and study with customizable flashcards to master any subject effectively.</p>
            </div>
            
            {/* Feature 4 - Timer */}
            <div className={`${isDark ? "bg-gray-700" : "bg-white"} p-6 rounded-lg shadow-md`}>
              <div className="bg-[#79A657]/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#79A657]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Study Timer</h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>Stay focused with our customizable study timer that helps you implement techniques like Pomodoro for maximum productivity.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={`py-16 ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
            Ready to Elevate Your Study Experience?
          </h2>
          <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Join thousands of students who have transformed their learning journey with Studyo.
          </p>
          <Link 
            to="/techniques" 
            className="px-8 py-3 bg-[#79A657] text-white font-semibold rounded-lg shadow-md hover:bg-[#658a48] transition duration-300 ease-in-out inline-block focus:outline-none focus:ring-2 focus:ring-[#79A657] focus:ring-opacity-50"
            aria-label="Get started with Studyo"
          >
            Get Started For Free
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#79A657] font-bold text-sm">
                S
              </div>
              <span className="ml-2 text-xl font-bold">Studyo</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Studyo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;