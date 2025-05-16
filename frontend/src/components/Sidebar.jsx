import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from './ThemeProvider';
import Logo from "../assets/Logo.png";
import Dashboard from "../assets/Dashboard.png";
import Pencil from "../assets/Pencil.png";
import Study_Room from "../assets/Study_Room.png";
import Calendar from "../assets/Calendar.png";
import Wellness from "../assets/Wellness.png";
import Profile from "../assets/Profile.png";
import Flashcards from "../assets/notes_broken.png";
import Leaderboard from "../assets/ph_medal-thin.png";
import timer from "../assets/timer.png";

const menuItems = [
  { icon: Profile, text: "Profile", path: "/profile" },
  { icon: Dashboard, text: "Dashboard", path: "/dashboard" },
  { icon: Pencil, text: "Techniques", path: "/techniques" },
  { icon: Study_Room, text: "Rooms", path: "/studyroom" },
  { icon: Calendar, text: "Calendar", path: "/calendar" },
  { icon: Wellness, text: "Wellness", path: "/wellness" },
  { icon: Flashcards, text: "Flashcards", path: "/flashcards"},
  { icon: timer, text: "Timer", path: "/timer"},
  { icon: Leaderboard, text: "Leaderboard", path: "/leaderboard"}
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme(); 
  const specialPages = ["/flashcards", "/dashboard","/modules","/profile", "/friends","/block"];
  const isSpecialPage = specialPages.includes(location.pathname);
  
  // Track which item is currently selected with keyboard
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const menuRefs = useRef([]);
  
  // Track content navigation mode
  const [isContentMode, setIsContentMode] = useState(false);
  const [contentElements, setContentElements] = useState([]);
  const [contentIndex, setContentIndex] = useState(-1);

  // Initial setup - find current page in menu
  useEffect(() => {
    const currentIndex = menuItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
    
    // Reset content mode when page changes
    setIsContentMode(false);
    setContentIndex(-1);
  }, [location.pathname]);

  // Find all focusable elements in the main content
  const findFocusableElements = () => {
    // Define focusable elements
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Find the main content area - we're looking for elements outside the sidebar
    const mainContent = document.querySelector('main') || 
                        document.querySelector('#root > div > div:not([role="navigation"])') ||
                        document.body;
    
    // Get all focusable elements
    return Array.from(mainContent.querySelectorAll(selector))
      // Filter out elements in the sidebar (to avoid focusing those again)
      .filter(el => !document.querySelector('[role="navigation"]')?.contains(el))
      // Filter out hidden elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return !(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0');
      });
  };

  // Function to focus on a specific element in the content area
  const focusContentElement = (index) => {
    if (contentElements.length === 0) {
      const elements = findFocusableElements();
      setContentElements(elements);
      
      if (elements.length > 0 && index >= 0 && index < elements.length) {
        elements[index].focus();
        setContentIndex(index);
        return true;
      }
      return false;
    }
    
    if (index >= 0 && index < contentElements.length) {
      contentElements[index].focus();
      setContentIndex(index);
      return true;
    }
    
    return false;
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Content navigation mode
      if (isContentMode) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          // Move to next element
          const nextIndex = contentIndex < contentElements.length - 1 ? contentIndex + 1 : 0;
          focusContentElement(nextIndex);
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          // Move to previous element or back to sidebar
          if (contentIndex > 0) {
            focusContentElement(contentIndex - 1);
            e.preventDefault();
          } else if (e.key === 'ArrowLeft') {
            // Return to sidebar navigation mode
            setIsContentMode(false);
            setContentElements([]);
            setContentIndex(-1);
            // Focus on the current sidebar item
            menuRefs.current[selectedIndex]?.focus();
            e.preventDefault();
          } else {
            // Wrap to the end in content mode
            focusContentElement(contentElements.length - 1);
            e.preventDefault();
          }
        } else if (e.key === 'Escape') {
          // Exit content mode with Escape key
          setIsContentMode(false);
          setContentElements([]);
          setContentIndex(-1);
          // Focus on the current sidebar item
          menuRefs.current[selectedIndex]?.focus();
          e.preventDefault();
        }
      } 
      // Sidebar navigation mode
      else {
        if (e.key === 'ArrowDown') {
          // Move selection to next item (or first if at end)
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex < menuItems.length - 1 ? prevIndex + 1 : 0;
            // Scroll the item into view if needed
            menuRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return nextIndex;
          });
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          // Move selection to previous item (or last if at beginning)
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex > 0 ? prevIndex - 1 : menuItems.length - 1;
            // Scroll the item into view if needed
            menuRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return nextIndex;
          });
          e.preventDefault();
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          // Navigate to the selected page when Enter is pressed
          navigate(menuItems[selectedIndex].path);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          // Enter content navigation mode
          const elements = findFocusableElements();
          setContentElements(elements);
          setIsContentMode(true);
          
          if (elements.length > 0) {
            // Focus the first element
            elements[0].focus();
            setContentIndex(0);
            e.preventDefault();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, selectedIndex, isContentMode, contentElements, contentIndex]);

  // Function to handle logo click and navigate to landing page
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div
      className={`w-46 h-full p-4 rounded-tr-3xl rounded-br-3xl overflow-y-auto transition-all 
        ${isSpecialPage ? "fixed left-0 top-0 z-10" : ""}
        ${isDark ? "bg-gray-800" : "bg-gray-300"}`} 
      role="navigation"
      aria-label="Main menu"
    >
      
      {/* Clickable logo that redirects to landing page */}
      <div 
        onClick={handleLogoClick}
        className={`flex justify-center mb-6 p-3 rounded-lg cursor-pointer ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
        }`}
        role="button"
        aria-label="Go to home page"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleLogoClick();
          }
        }}
      >
        <img 
          src={Logo} 
          alt="logo" 
          className="w-24 h-24 hover:scale-105 transition-transform no-invert" 
        />
      </div>

      {/* Menu Items */}
      <ul className="flex flex-col gap-2 w-full">
        {menuItems.map((item, index) => (
          <li key={index} className="w-full">
            <Link
              ref={el => menuRefs.current[index] = el}
              to={item.path}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-all cursor-pointer ${
                isDark 
                  ? "hover:bg-gray-700 text-white" 
                  : "hover:bg-gray-200 text-gray-800"
              } ${
                location.pathname === item.path 
                  ? isDark ? "bg-gray-700" : "bg-gray-200"
                  : ""
              } ${
                selectedIndex === index && location.pathname !== item.path
                  ? isDark ? "bg-gray-600 ring-2 ring-white" : "bg-gray-300 ring-2 ring-gray-800"
                  : ""
              }`}
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              <img 
                src={item.icon} 
                alt={item.text} 
                className={`w-6 h-6 mr-3 ${
                  isDark ? "filter brightness-0 invert" : ""
                }`} 
              />
              <span 
                className="font-medium"
                style={{ fontSize: `calc(15px * var(--font-size-multiplier))` }}
              >
                {item.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;