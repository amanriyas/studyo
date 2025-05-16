import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import Logo from '../assets/Logo.png'; 
import api from '../api';

const Login = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const baseUrl = api+"login/";

  // Refs for accessibility
  const usernameRef = useRef(null);
  const errorRef = useRef(null);

  // Set focus to username field on mount
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit function triggered!");

    try {
      const response = await axios.post(baseUrl, { username, password });

      if (response.data.message === "Login successful") {
        localStorage.setItem("token", response.data.token);
        alert("Welcome, user " + username);
        setError("");
        navigate('/techniques'); 
      } else {
        setError(response.data.message);
        errorRef.current?.focus(); // Move focus to error message
      }
    } catch (error) {
      console.error("Login error:", error);
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

        {/* Login Card */}
        <div className="bg-white px-6 py-4 rounded-lg shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold mb-1">Login</h1>
            <p className="text-gray-600 text-sm">Sign in to your account</p>
          </div>

          {/* Error Message with ARIA live region */}
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
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#79A657] text-white py-2 rounded-md text-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
            >
              Login
            </button>

            <div className="text-center text-sm">
              <a 
                href="/forgot-password" 
                className="text-[#79A657] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
              >
                Forgot Password?
              </a>
            </div>
          </form>

          <div className="text-center text-sm mt-2">
               <a 
                 href="/" 
                 className="text-[#79A657] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
               >
                 Return Home
               </a>
          </div>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a 
              href="/signup" 
              className="text-[#79A657] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
            >
              Register
            </a>
          </div>
        </div>
      </div>

      {/* GDPR Policy */}
      <div className="mt-4 text-center text-xs text-gray-600">
        <a 
          href="/GDPR.html"
          className="text-[#79A657] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#79A657]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Our GDPR privacy policy
        </a>
      </div>
    </div>
  );
};

export default Login;
