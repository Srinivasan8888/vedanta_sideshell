import React, { useState, useEffect } from "react";
import loginbg from "../../Assets/images/loginbg.png";
import xyma from "../../Assets/images/Xyma-Logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from '../../Assets/components/Axios/AxiosInterceptor'

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const [passkey, setPasskey] = useState("");
   const [name, setName] = useState("");
   const [phoneno, setPhoneno] = useState("");
   const [empid, setEmpid] = useState("");
  const navigate = useNavigate();

  console.log("role", role);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const token2 = localStorage.getItem("refreshToken");

    if (token && token2) {
      navigate("/Dashboard");
    }
  }, [navigate]);


  const registerUser = async (event) => {
    event.preventDefault();
    if (confirmpassword === password) {
      if (passkey !== process.env.REACT_APP_SIGNUP_SECRET_KEY) {
        setErrorMessage("Invalid passkey");
        return;
      }
      try {
        const response = await API.post(
          `${process.env.REACT_APP_SERVER_URL}auth/register`,
          {
            name,
            email,
            password,
            phoneno,
            role,
            empid
          },
        );

        if (response.data.email) {
          alert("user created successfully");
          window.location.href = `${process.env.REACT_APP_URL}`;
        } else {
          alert("Unknown error has occurred");
        }
      } catch (error) {
        setErrorMessage(
          `Failed to register: ${error.response?.data?.error?.message || error.message}`,
        );
      }
    } else {
      alert("Password is not matching");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginbg})` }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl">
          {/* Left Side - Logo and Welcome */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white lg:w-1/2">
            <div className="w-full max-w-xs">
              <img 
                src={xyma} 
                alt="Xyma Logo" 
                className="w-40 h-auto mb-8 mx-auto"
              />
              <h2 className="text-3xl font-bold mb-4 text-center">Welcome to Vedanta</h2>
              <p className="text-blue-100 text-center">
                Create your account and start your journey with us today.
              </p>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full bg-white dark:bg-gray-800 p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="md:hidden mb-6 text-center">
              <img 
                src={xyma} 
                alt="Xyma Logo" 
                className="w-32 h-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h1>
            </div>

            <form onSubmit={registerUser} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneno"
                    value={phoneno}
                    onChange={(e) => setPhoneno(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="empid"
                    value={empid}
                    onChange={(e) => setEmpid(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="EMP12345"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    value={confirmpassword}
                    onChange={(e) => setconfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                </div>

                {/* User Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 appearance-none"
                    required
                  >
                    <option value="" disabled hidden>
                      Select a role
                    </option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {/* Pass Key */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pass Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="passkey"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200"
                    placeholder="Enter your pass key"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                onClick={() => setErrorMessage('')}
                className="w-full px-6 py-3 mt-4 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                Create Account
              </button>

              {/* Sign In Link */}
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <a 
                  href="/" 
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in here
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
