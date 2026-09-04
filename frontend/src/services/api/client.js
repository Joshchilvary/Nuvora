const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const STORAGE_KEYS = {
  accessToken: "nuvora-access-token",
  refreshToken: "nuvora-refresh-token",
};

let refreshPromise = null;

function getAccessToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  } catch {
    return null;
  }
}

function getRefreshToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  } catch {
    return null;
  }
}

function setAccessToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.accessToken, token);
    else localStorage.removeItem(STORAGE_KEYS.accessToken);
  } catch {
    /* ignore */
  }
}

function setRefreshToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.refreshToken, token);
    else localStorage.removeItem(STORAGE_KEYS.refreshToken);
  } catch {
    /* ignore */
  }
}

function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    const error = new Error("No refresh token available");
    error.status = 401;
    throw error;
  }

  refreshPromise = fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })
    .then(async (response) => {
      refreshPromise = null;
      if (!response.ok) {
        clearTokens();
        const error = new Error("Token refresh failed");
        error.status = response.status;
        throw error;
      }
      const data = await response.json();
      setAccessToken(data.access);
      return data.access;
    })
    .catch((error) => {
      refreshPromise = null;
      clearTokens();
      throw error;
    });

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && accessToken) {
      try {
        const newAccessToken = await refreshAccessToken();
        headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } catch {
        const error = new Error("Session expired. Please log in again.");
        error.status = 401;
        throw error;
      }
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const error = new Error(data?.detail || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to fetch") {
      const networkError = new Error("Unable to reach the server. Please check your connection and try again.");
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  }
}

export {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  STORAGE_KEYS,
};
