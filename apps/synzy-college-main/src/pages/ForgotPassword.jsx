import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "../services/authApi";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Clear autofill leftovers on mount
  useEffect(() => {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  }, []);

  // STEP 1: SEND OTP
  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      await sendForgotPasswordOtp(email);
      toast.success("OTP sent successfully");

      // ✅ FIX: Clear fields before step 2
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);

      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP & RESET PASSWORD
  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await verifyForgotPasswordOtp({
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Forgot Password
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="email"
                name="forgot-email"              // ✅ FIX
                autoComplete="email"             // ✅ FIX
                placeholder="Email"
                className="w-full outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {/* Email (readonly) */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4 bg-gray-100">
              <Mail className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full outline-none bg-transparent"
              />
            </div>

            {/* OTP */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
              <span className="mr-2 text-gray-500">***</span>
              <input
                type="text"
                name="reset-otp"                 // ✅ FIX
                autoComplete="off"               // ✅ FIX
                placeholder="Enter OTP"
                className="w-full outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
              <Lock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="new-password"              // ✅ FIX
                autoComplete="new-password"      // ✅ FIX (CRITICAL)
                placeholder="New Password"
                className="w-full outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-6">
              <Lock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirm-new-password"      // ✅ FIX
                autoComplete="new-password"      // ✅ FIX
                placeholder="Confirm Password"
                className="w-full outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
