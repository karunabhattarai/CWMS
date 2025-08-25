// Common constants and utilities for onboarding
export const ONBOARDING_STORAGE_KEY = "cwmis_onboarding_draft";
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Common API headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };
};

// Redirect helper
export const redirectToDashboard = () => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  window.location.href = "/dashboard";
};

// Draft management
export const saveDraft = (data) => {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
};

export const loadDraft = () => {
  const draft = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
};

export const clearDraft = () => {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
};

// Common validation patterns
export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) {
    return `${fieldName} is required.`;
  }
  return "";
};

export const validateEmail = (email) => {
  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
};
