import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authAxios from "../authAxios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardCard from "./DashboardCard";
import "./Dashboard.css";
import { useTheme } from "./ThemeProvider";
import Rockets from "../assets/Rockets.png";
import Timer from "../assets/timer.png";
import FlashcardsIcon from "../assets/notes_broken.png";

const modulePageTooltips = ["Launch Lesson", "View Timer", "View Flashcards"];

function ModulePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const moduleId = new URLSearchParams(location.search).get("module_id");

  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  const defaultIcons = [Rockets, Timer, FlashcardsIcon];

  useEffect(() => {
    if (!moduleId) return;
    fetchModuleDetails();
    fetchLessons();
  }, [moduleId]);

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchModuleDetails = async () => {
    try {
      const res = await authAxios.get(`dashboard-modules/${moduleId}/`);
      setModule(res.data?.data || null);
    } catch (err) {
      handleAuthError(err);
      console.error("Error fetching module:", err);
    }
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const res = await authAxios.get(`lessons/module/${moduleId}/`);
      setLessons(res.data?.data || []);
    } catch (err) {
      handleAuthError(err);
      console.error("Error fetching lessons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    try {
      await authAxios.post("lessons/create/", {
        dashboard_module: parseInt(moduleId),
        title: lessonTitle,
        description: lessonDesc,
      });
      setLessonTitle("");
      setLessonDesc("");
      fetchLessons();
    } catch (err) {
      handleAuthError(err);
      console.error("Error creating lesson:", err);
    }
  };

  const handleLaunchLesson = (lessonId) => navigate(`/lesson?lesson_id=${lessonId}`);
  const handleTimerClick = () => navigate("/timer");
  const handleFlashcardsClick = (lessonId) => navigate(`/flashcards?lesson_id=${lessonId}`);

  if (isLoading || !module) {
    return (
      <div className={`shared-container ${isDark ? "dark" : ""}`}>
        <Sidebar />
        <div className="shared-wrapper">
          <Header title="Module" />
          <p className="loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`shared-container ${isDark ? "dark" : ""}`}>
      <Sidebar />
      <div className="shared-wrapper">
        <Header title={module.title} />

        <form onSubmit={handleCreateLesson} className="form-wrapper">
          <input
            type="text"
            className="styled-textbox"
            placeholder="New Lesson Title"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
          />
          <input
            type="text"
            className="styled-textbox"
            placeholder="Lesson Description"
            value={lessonDesc}
            onChange={(e) => setLessonDesc(e.target.value)}
          />
          <button type="submit" className="styled-button">Create Lesson</button>
        </form>

        <div className="scroll-container" style={{ maxHeight: "55vh", marginBottom: "20px" }}>
          <div className="dashboard">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <DashboardCard
                  key={lesson.id}
                  title={lesson.title}
                  icons={defaultIcons}
                  tooltips={modulePageTooltips}
                  onRocketClick={() => handleLaunchLesson(lesson.id)}
                  onTimerClick={handleTimerClick}
                  onFlashcardsClick={() => handleFlashcardsClick(lesson.id)}
                />
              ))
            ) : (
              <p className="no-modules-msg">No lessons found for this module.</p>
            )}
          </div>
        </div>

        {module.saved_study_plan && (
          <div className="study-plan-container">
            <div className="study-plan-toggle" onClick={() => setShowPlan(!showPlan)}>
              <span className="toggle-label">
                {showPlan ? "Hide Study Plan" : "Show Study Plan"}
              </span>
              <span className={`chevron ${showPlan ? "up" : "down"}`} />
            </div>
            {showPlan && (
              <div className="saved-plan-box">
                <h3>Saved Study Plan</h3>
                <pre>{module.saved_study_plan.plan_content}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModulePage;