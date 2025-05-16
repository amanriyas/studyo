import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { DarkModeToggle } from "./DarkModeToggle";
import { useTheme } from './ThemeProvider';
import FontSizeControls from './FontSizeControls';

function Header({ title, pageIcon }) {
    const { isDark } = useTheme();
    const [fontSizeLevel, setFontSizeLevel] = useState(() => {
        const storedLevel = localStorage.getItem('fontSizeLevel');
        const parsedLevel = parseInt(storedLevel, 10);
        // Explicitly handle valid levels (0, 1, 2), default to 1 if invalid
        return Number.isInteger(parsedLevel) && [0, 1, 2].includes(parsedLevel) ? parsedLevel : 1;
    });

    useEffect(() => {
        // Ensure local storage is updated with the current fontSizeLevel
        localStorage.setItem('fontSizeLevel', fontSizeLevel.toString());
        // Set the CSS custom property for font size scaling
        document.documentElement.style.setProperty('--font-size-multiplier', 
            fontSizeLevel === 0 ? 0.85 : fontSizeLevel === 1 ? 1 : 1.2
        );
    }, [fontSizeLevel]);

    // Set the initial font size multiplier on mount to prevent flicker
    useEffect(() => {
        document.documentElement.style.setProperty('--font-size-multiplier', 
            fontSizeLevel === 0 ? 0.85 : fontSizeLevel === 1 ? 1 : 1.2
        );
    }, []);

    return (
      <header className="header">
        <div className="flex items-center gap-4 pl-5">
          {pageIcon && (
            <img 
              src={pageIcon} 
              className={`w-10 h-10 isDark ? "filter brightness-0 invert" : ""
                }`} 
              alt="Page icon"
            />
          )}
          <h1 className="header-title">{title}</h1>
        </div>
        <div className="header-actions">
          <FontSizeControls 
            fontSizeLevel={fontSizeLevel} 
            setFontSizeLevel={setFontSizeLevel} 
          />
          <DarkModeToggle />
        </div>
      </header>
    );
}

export default Header;