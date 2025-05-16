import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";

const SignUpPage = () => {
  const navigate = useNavigate();

  
  const baseUrl = api+"create_student/";
  const authUrl = api+"register/";

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    course_name: "",
    password: "",
    retypePassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "This field is required";
      }
    });

    if (formData.password !== formData.retypePassword) {
      newErrors.retypePassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { username, password, name, email, course_name } = formData;

      // register user and get token
      const registerRes = await axios.post(authUrl, { username, password });
      const token = registerRes.data.token;
      localStorage.setItem("token", token);

      // create student using token
      await axios.post(
        baseUrl,
        { name, email, course_name },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      alert("Registration successful!");
      navigate("/dashboard");

    } catch (error) {
      setLoading(false);
      if(error.response && error.response.data){
        const backendErrors = error.response.data;
        const newErrors = {};
        
        Object.entries(backendErrors).forEach(([key, messages]) => {
          newErrors[key] = Array.isArray(messages) ? messages.join("") : messages;
        });

        setErrors(newErrors);
        
      }
      alert("Registration failed. Try again");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-[400px] mx-4">
        <div className="bg-white p-9 rounded-lg shadow-2xl mt-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Sign Up</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "username", label: "Username", type: "text", placeholder: "Enter your username" },
              { id: "name", label: "Name", type: "text", placeholder: "Enter your name" },
              { id: "email", label: "Email", type: "email", placeholder: "Enter your email" },
              { id: "course_name", label: "Course", type: "text", placeholder: "Enter your course name" },
              { id: "password", label: "Password", type: "password", placeholder: "Enter your password" },
              { id: "retypePassword", label: "Re-Type Password", type: "password", placeholder: "Re-enter your password" },
            ].map(({ id, label, type, placeholder }, index) => (
              <div key={id}>
                <label htmlFor={id} className="block mb-1 text-sm">
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-[#79A657] ${errors[id] ? "border-red-500" : ""}`}
                  placeholder={placeholder}
                  value={formData[id]}
                  onChange={handleChange}
                  required
                  aria-invalid={errors[id] ? "true" : "false"}
                  aria-describedby={errors[id] ? `${id}-error` : undefined}
                  autoFocus={index === 0}
                />
                {errors[id] && (
                  <p id={`${id}-error`} className="text-red-500 text-xs mt-1" aria-live="assertive">
                    {errors[id]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-[#79A657] text-white p-2 rounded-md text-sm focus:ring-2 focus:ring-[#79A657]"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            Have an account?{" "}
            <a href="/login" className="text-[#79A657] hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;