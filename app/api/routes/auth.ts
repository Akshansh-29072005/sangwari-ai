/**
 * Auth Routes — OTP, MPIN, Login/Register
 */
import { apiFetch } from '../api';

export const authRoutes = {
  /** Send OTP to phone number */
  sendOTP: (phone: string) =>
    apiFetch('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  /** Verify OTP */
  verifyOTP: (phone: string, otp: string) =>
    apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  /** Set MPIN after registration */
  setMPIN: (phone: string, mpin: string) =>
    apiFetch('/auth/set-mpin', {
      method: 'POST',
      body: JSON.stringify({ phone, mpin }),
    }),

  /** Login with MPIN */
  loginWithMPIN: (phone: string, mpin: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, mpin }),
    }),

  /** Change MPIN (requires OTP verification first) */
  changeMPIN: (phone: string, newMpin: string, otpToken: string) =>
    apiFetch('/auth/change-mpin', {
      method: 'POST',
      body: JSON.stringify({ phone, new_mpin: newMpin, otp_token: otpToken }),
    }),
};
