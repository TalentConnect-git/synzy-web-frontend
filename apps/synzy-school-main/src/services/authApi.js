import forgotPasswordClient from "../api/forgotPasswordClient";

/**
 * SEND OTP
 */
export const sendForgotPasswordOtp = (email) => {
  return forgotPasswordClient.post(
    "/auth/forgot-password/send-otp",
    { email }
  );
};

/**
 * VERIFY OTP & RESET PASSWORD
 */
export const verifyForgotPasswordOtp = ({
  email,
  otp,
  newPassword,
}) => {
  return forgotPasswordClient.post(
    "/auth/forgot-password/verify-otp",
    {
      email,
      otp,
      newPassword,
    }
  );
};
