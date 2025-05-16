import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/Logo.png';
import api from '../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const baseUrl = api + "reset-password/";

  const usernameRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(baseUrl, {
        username,
        new_password: newPassword,
      });

      if (response.data.message === "Password reset successful") {
        setSuccessMessage("Password has been reset successfully!");
        setError("");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password.");
        errorRef.current?.focus();
      }
    } catch (error) {
      console.error("Reset error:", error);
      setError("An error occurred. Please try again.");
      errorRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-[280px]">
        {/* Logo */}
        <div className="mb-6 text-center">
          <img src={Logo} alt="App Logo" className="mx-auto h-18" />
        </div>

        {/* Reset Password Card */}
        <div className="bg-white px-6 py-4 rounded-lg shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold mb-1">Reset Password</h1>
            <p className="text-gray-600 text-sm">Enter your username and new password</p>
          </div>

          {/* Error or Success Message */}
          {error && (
            <p
              ref={errorRef}
              className="text-red-500 text-center text-sm"
              role="alert"
              aria-live="assertive"
              tabIndex="-1"
            >
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 text-center text-sm" role="status">
              {successMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-sm mb-1">Username</label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                ref={usernameRef}
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#79A657] text-white py-2 rounded-md text-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
            >
              Reset Password
            </button>

            <div className="text-center text-sm">
              <a
                href="/login"
                className="text-[#79A657] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
              >
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
