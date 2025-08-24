import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const apiCall = async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError("");

    try {
      const config = {
        method,
        url: `${API_BASE}${url}`,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      };

      if (
        data &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const get = (url, options = {}) => apiCall("GET", url, null, options);
  const post = (url, data, options = {}) => apiCall("POST", url, data, options);
  const put = (url, data, options = {}) => apiCall("PUT", url, data, options);
  const patch = (url, data, options = {}) =>
    apiCall("PATCH", url, data, options);
  const del = (url, options = {}) => apiCall("DELETE", url, null, options);

  const clearError = () => setError("");

  return {
    loading,
    error,
    clearError,
    get,
    post,
    put,
    patch,
    del,
    apiCall,
  };
}
