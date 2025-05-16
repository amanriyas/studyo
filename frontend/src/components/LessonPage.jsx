import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authAxios from "../authAxios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import { useTheme } from "./ThemeProvider";

function LessonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const lessonId = new URLSearchParams(location.search).get("lesson_id");

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchLesson = async () => {
    setIsLoading(true);
    try {
      const res = await authAxios.get(`lessons/${lessonId}/`);
      setLesson(res.data?.data || null);
      setEditedDesc(res.data?.data?.description || "");
    } catch (err) {
      handleAuthError(err);
      console.error("Failed to fetch lesson:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await authAxios.put(`lessons/${lessonId}/`, {
        description: editedDesc,
      });
      setLesson(res.data.data);
      setIsEditing(false);
    } catch (err) {
      handleAuthError(err);
      console.error("Error saving lesson description:", err);
    }
  };

  return (
    <div className={`shared-container ${isDark ? "dark" : ""}`}>
      <Sidebar />
      <div className="shared-wrapper">
        <Header title="Lesson Detail" />
        <div className="scroll-container">
          <div className="lesson-wrapper">
            {!isEditing ? (
              <>
                <p className="lesson-description">
                  {lesson?.description || "No description available."}
                </p>
                <div className="lesson-button-row">
                  <button className="styled-button" onClick={() => setIsEditing(true)}>
                    Edit Description
                  </button>
                  <button className="back-button" onClick={() => navigate(-1)}>
                    Back to Module
                  </button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  className="lesson-description-box"
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  rows={8}
                />
                <div className="lesson-button-row">
                  <button className="styled-button" onClick={handleSave}>Save</button>
                  <button className="back-button" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="back-button" onClick={() => navigate(-1)}>Back to Module</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPage;