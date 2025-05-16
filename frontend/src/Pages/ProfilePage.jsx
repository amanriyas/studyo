import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserCircle,
  FaCog,
  FaBell,
  FaQuestionCircle,
  FaUserFriends,
  FaBan
} from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Profile from '../assets/Profile.png';
import { useTheme } from '../components/ThemeProvider';
import authAxios from '../authAxios'; 
import api from '../api';

export default function ProfilePage() {
  const { isDark } = useTheme();
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    course_name: "",
    userid: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = api;

  const nameInputRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAxios.get(`${BASE_URL}get_user_and_student_details/`);
      const { user, student } = response.data;

      setUserData({
        username: user.username,
        name: student.name,
        email: student.email,
        course_name: student.course_name,
        userid: student.id, 
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await authAxios.put(`${BASE_URL}update_student/${userData.userid}/`, {
        name: userData.name,
        email: userData.email,
        course_name: userData.course_name,
      });

      alert("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    if (isEditing) {
      updateProfile();
    } else {
      setIsEditing(true);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  };

  const handleLogout = async () => {
    try {
      await authAxios.post("logout/");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your profile?");
    if (confirmDelete) {
      try {
        await authAxios.delete(`${BASE_URL}delete_student/${userData.userid}/`);
        alert("Profile deleted successfully.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } catch (error) {
        console.error("Error deleting profile:", error);
        errorRef.current?.focus();
      }
    }
  };

  return (
    <div className={`profile-layout ${isDark ? 'dark' : ''}`}>
      <Header title="Profile" pageIcon={Profile} />
      <Sidebar />
      <div className="profile-container">
        <div className={`green-container ${isDark ? 'dark-container' : ''}`}>
          <div className="profile-picture">
            <FaUserCircle size={100} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </div>

          <div className="profile-actions mb-5 flex gap-4">
            <Link to="/friends">
              <button className={`profile-button ${isDark ? 'dark-button' : 'green-button'} flex items-center`}>
                <FaUserFriends className="mr-2" />
                Friendships
              </button>
            </Link>
            <Link to="/block">
              <button className={`profile-button ${isDark ? 'dark-button' : 'green-button'} flex items-center`}>
                <FaBan className="mr-2" />
                Block List
              </button>
            </Link>
          </div>

          <div className="profile-info flex flex-col gap-3">
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`profile-input ${isEditing ? 'border p-2' : ''} ${isDark ? 'dark-input' : ''}`}
              placeholder="Full Name"
            />
            <input
              type="text"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`profile-input ${isEditing ? 'border p-2' : ''} ${isDark ? 'dark-input' : ''}`}
              placeholder="Email"
            />
            <input
              type="text"
              name="course_name"
              value={userData.course_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`profile-input ${isEditing ? 'border p-2' : ''} ${isDark ? 'dark-input' : ''}`}
              placeholder="Course Name"
            />
          </div>

          {/* <div className="profile-icons flex gap-4 mt-4">
            <FaCog className={`icon ${isDark ? 'dark-icon' : ''}`} title="Settings" />
            <FaBell className={`icon ${isDark ? 'dark-icon' : ''}`} title="Notifications" />
            <FaQuestionCircle className={`icon ${isDark ? 'dark-icon' : ''}`} title="Help" />
          </div> */}

          <div className="profile-actions flex justify-center gap-4 mt-6">
            <button
              className={`${isDark ? 'dark-primary-button' : 'bg-blue-600'} text-white px-6 py-3 rounded hover:opacity-90`}
              onClick={handleEditClick}
            >
              {isEditing ? "Save" : "Update Data"}
            </button>
            <button
              className={`${isDark ? 'dark-danger-button' : 'bg-red-600'} text-white px-6 py-3 rounded hover:opacity-90`}
              onClick={handleDeleteClick}
            >
              Delete Profile
            </button>
          </div>

          <div className="profile-actions mt-4">
            <button onClick={handleLogout} className={`sign-out-button ${isDark ? 'dark-sign-out' : ''}`}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}