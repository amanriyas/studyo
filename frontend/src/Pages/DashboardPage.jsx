import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authAxios from "../authAxios"; 
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import "../components/Dashboard.css";
import DashboardIcon from "../assets/Dashboard.png";
import RocketIcon from "../assets/Rockets.png";
import MedalIcon from "../assets/ph_medal-thin.png";
import BookmarkIcon from "../assets/vector.png";

const dashboardTooltips = ["Launch Module", "View Leaderboard", "Remove Module"];

function DashboardPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardModules();
    fetchAvailableModules();
  }, []);

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchDashboardModules = async () => {
    setIsLoading(true);
    try {
      const res = await authAxios.get("dashboard-modules/");
      setModules(res.data?.data || []);
    } catch (err) {
      handleAuthError(err);
      console.error("Failed to fetch dashboard modules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableModules = async () => {
    try {
      const res = await authAxios.get("dashboard-modules/available/");
      setAvailableModules(res.data?.data || []);
    } catch (err) {
      handleAuthError(err);
      console.error("Failed to fetch available modules:", err);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    setIsLoading(true);
    try {
      await authAxios.post("dashboard-modules/create/", { title: newModuleTitle });
      setNewModuleTitle("");
      fetchDashboardModules();
      fetchAvailableModules();
    } catch (err) {
      handleAuthError(err);
      console.error("Error creating module:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = async (moduleId) => {
    try {
      await authAxios.post(`dashboard-modules/toggle/${moduleId}/`);
      fetchDashboardModules();
      fetchAvailableModules();
    } catch (err) {
      handleAuthError(err);
      console.error("Error toggling module:", err);
    }
  };

  const handleLaunchModule = (moduleId) => navigate(`/modules?module_id=${moduleId}`);
  const handleLeaderboardClick = () => navigate("/leaderboard");

  if (isLoading) {
    return (
      <div className="shared-container">
        <Sidebar />
        <Header title="Dashboard" pageIcon={DashboardIcon} />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="shared-container">
      <Sidebar />
      <div className="shared-wrapper">
        <Header title="Dashboard" pageIcon={DashboardIcon} />

        <form onSubmit={handleCreateModule} className="form-wrapper">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Enter new module title"
            className="styled-textbox"
          />
          <select className="module-dropdown" onChange={(e) => handleToggleModule(e.target.value)}>
            <option value="">Add a module...</option>
            {availableModules.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button type="submit" className="styled-button">
            Create Module
          </button>
        </form>

        <div className="scroll-container">
          <div className="dashboard">
            {modules.length > 0 ? (
              modules.map((item) => (
                <DashboardCard
                  key={item.id}
                  title={item.title}
                  icons={[RocketIcon, MedalIcon, BookmarkIcon]}
                  tooltips={dashboardTooltips}
                  onRocketClick={() => handleLaunchModule(item.id)}
                  onLeaderboardClick={handleLeaderboardClick}
                  onFlashcardsClick={() => handleToggleModule(item.id)}
                />
              ))
            ) : (
              <p className="no-modules-msg">No modules on dashboard</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;