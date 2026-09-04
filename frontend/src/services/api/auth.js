import { apiRequest, clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from "./client.js";

export async function loginUser({ email, password }) {
  const response = await apiRequest("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (response?.access) {
    setAccessToken(response.access);
    setRefreshToken(response.refresh);
  }
  return response;
}

export async function getCurrentUser() {
  return apiRequest("/auth/me/", { method: "GET" });
}

export async function logoutUser() {
  const refreshToken = getRefreshToken();
  try {
    await apiRequest("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
  } catch {
    // Backend logout can fail if token is already invalid; still clear local state.
  } finally {
    clearTokens();
  }
}

export async function registerUser({ firstName, lastName, email, phoneNumber, password }) {
  return apiRequest("/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber || "",
      password,
      password_confirm: password,
    }),
  });
}

export async function verifyEmail({ token }) {
  return apiRequest("/auth/verify-email/", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification({ email }) {
  return apiRequest("/auth/resend-verification/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset({ email }) {
  return apiRequest("/auth/password-reset/request/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset({ token, password, passwordConfirm }) {
  return apiRequest("/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
  });
}

export async function changePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  return apiRequest("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });
}
