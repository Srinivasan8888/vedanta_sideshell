import React, { useState, useEffect } from "react";
import loginbg from "../../Assets/images/loginbg.png";
import xyma from "../../Assets/images/Xyma-Logo.png";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState("");
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check existing cooldown
    const storedCooldown = localStorage.getItem("loginCooldown");
    if (storedCooldown && Date.now() < parseInt(storedCooldown)) {
      const remaining = Math.ceil(
        (parseInt(storedCooldown) - Date.now()) / 1000,
      );
      setErrorMessage(
        `Too many attempts. Try again in ${formatTime(remaining)}`,
      );
      setCooldownTime(parseInt(storedCooldown));
    }

    const token = localStorage.getItem("accessToken");
    const token2 = localStorage.getItem("refreshToken");

    // const token3 = document.cookie
    //   .split("; ")
    //   .find((row) => row.startsWith("accessToken="));
    // const token4 = document.cookie
    //   .split("; ")
    //   .find((row) => row.startsWith("refreshToken="));
    // if (token && token2 && token3 && token4) {
    if (token && token2) {
      navigate("/Dashboard");
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!cooldownTime) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownTime(0);
        setErrorMessage("");
        localStorage.removeItem("loginCooldown");
        clearInterval(interval);
      } else {
        setErrorMessage(
          `Too many attempts. Try again in ${formatTime(remaining)}`,
        );
        localStorage.setItem("loginCooldown", cooldownTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownTime]);

  const Loginuser = async (event) => {
    event.preventDefault();

    // Disable button during cooldown
    if (cooldownTime > Date.now()) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}auth/login`,
        { email, password },
        {
          headers: {
            "X-Client-IP": "", // Server should track attempts by IP
            "X-Client-ID": "", // Or device fingerprint
          },
        },
      );

      // Reset success state
      localStorage.removeItem("failedAttempts");
      setSuccessMessage("Login Successful");
      navigate("/Dashboard");

      const { accessToken, refreshToken } = response.data;
      
      // Decode the accessToken to get the role
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const userRole = tokenPayload.role;

      // Store tokens and role
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", userRole);
      localStorage.setItem("id", "1604");
      localStorage.setItem("email", email);
      
      // Set cookies
      document.cookie = `accessToken=${accessToken}; path=/; secure`;
      document.cookie = `refreshToken=${refreshToken}; path=/; secure`;
      document.cookie = `role=${userRole}; path=/; secure`;
      document.cookie = `email=${email}; path=/; secure`;
    } catch (error) {
      if (error.response?.status === 429) {
        // Get cooldown time from server response
        const retryAfter = error.response.headers["retry-after"] || 900; // 15min default
        const cooldownEnd = Date.now() + retryAfter * 1000;
        setErrorMessage(
          `Too many attempts. Try again in ${formatTime(retryAfter)}`,
        );
        setCooldownTime(cooldownEnd);
      } else {
        const errorMsg =
          error.response?.data?.message ||
          "Check your email and password and try again.";
        setErrorMessage(errorMsg);
      }
      console.error("Error during login:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!cooldownTime) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((cooldownTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownTime(0);
        setErrorMessage("");
        localStorage.removeItem("loginCooldown");
        clearInterval(interval);
      } else {
        setErrorMessage(
          `Too many attempts. Try again in ${formatTime(remaining)}`,
        );
        localStorage.setItem("loginCooldown", cooldownTime); // Update storage
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownTime]);

  return (
    <div className="h-screen">
      <section
        className="relative flex items-center justify-center w-full h-full bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${loginbg})` }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-6">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img className="w-32 h-auto mr-2" src={xyma} alt="logo" />
          </a>
          <div className="w-full bg-white rounded-lg shadow sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6 space-y-4 sm:p-8 md:space-y-6">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={Loginuser}>
                <div>
                  <label
                    for="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="name@company.com"
                    required=""
                  />
                </div>
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5 text-gray-500" />
                      ) : (
                        <FaEye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="text-red-700 error-message">
                      {errorMessage || successMessage}
                    </div>
                    {/* <div className="flex items-center h-5">
                                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                        </div> 
                                         <div className="ml-3 text-sm">
                                            <label for="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                                        </div> */}
                  </div>
                  {/* <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a> */}
                </div>
                <button
                  onClick={() => setErrorMessage("")}
                  type="submit"
                  className="w-full rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  disabled={cooldownTime > Date.now()}
                >
                  {cooldownTime > Date.now() ? "Please wait..." : "Sign in"}
                </button>
                {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Don't have an account yet? <a href="/Signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                                </p> */}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
