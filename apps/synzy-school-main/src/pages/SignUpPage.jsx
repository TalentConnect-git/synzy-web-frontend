import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // Added ArrowLeft here
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../api/authService';
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/authService";

const signUpSchema = z.object({
  name: z.string().min(1, { message: "School name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setAuthSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  // =====================
  // EMAIL SIGNUP (SCHOOL)
  // =====================
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        userType: "school", 
        authProvider: "email",
      };

      const res = await registerUser(payload);

      if (res.data.status === "success") {
        const { token, user } = res.data.data;

        setAuthSession(user, token);

        toast.success("School account created successfully!");
        
        navigate("/school-portal/register", { replace: true });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================
  // GOOGLE SIGNUP (SCHOOL)
  // =====================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const tokenId = credentialResponse.credential;

      if (!tokenId) {
        toast.error('Google token missing');
        return;
      }

      const payload = {
        tokenId,
        authProvider: 'google',
        userType: 'school',
      };

      const res = await googleLogin(payload);

      if (res.data.status === "success") {
        const { token, auth } = res.data.data; 

        if (token && auth) {
          setAuthSession(auth, token); 
          
          toast.success('Google signup successful!');
          
          navigate('/school-portal/register', { replace: true });
        } else {
          throw new Error("Missing token or user data from server");
        }
      }
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error(
        error.response?.data?.message || 'Google signup failed. Please try again.'
      );
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-up was cancelled");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            School Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your school account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SCHOOL NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              School Name
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-3 py-2 mt-1 border rounded-md ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Delhi Public School"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 mt-1 border rounded-md ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="school@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-3 py-2 mt-1 border rounded-md ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* REGISTER */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Register School"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-2">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* GOOGLE SIGNUP */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="300"
          />
        </div>

        {/* SIGN IN LINK */}
        <p className="text-sm text-center text-gray-600">
          Already have a school account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;