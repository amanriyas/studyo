import React from "react";
import { useTheme } from "./ThemeProvider";
function DashboardCard({
  title,
  icons,
  tooltips,
  onRocketClick,
  onLeaderboardClick,
  onFlashcardsClick,
  onTimerClick,
  darkMode,
}) {
  const { isDark } = useTheme();

  const handleIconClick = (index) => {
    if (index === 0 && onRocketClick) onRocketClick();
    else if (index === 1 && onLeaderboardClick) onLeaderboardClick();
    else if (index === 1 && onTimerClick) onTimerClick();
    else if (index === 2 && onFlashcardsClick) onFlashcardsClick();
  };

  return (
    <div className={`dashboard-card ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-[#79A657] hover:bg-[#79A657]/90"}`}>
      <h2 className="card-title">{title}</h2>
      <div className="icons">
        {icons.map((icon, index) => (
          <div key={index} className="icon-container" data-tooltip={tooltips[index]}>
            <button className="icon-button" onClick={() => handleIconClick(index)}>
              <img src={icon} alt={`icon-${index}`} className={`card-icon ${isDark ? "filter brightness-0 invert" : ""}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardCard;