// This file is kept for reference but not actively used
// All components use the centralized 'api' instance from axios.js
// Keeping this file for potential future use

import api from "./axios";

/* =======================
   ISSUES
======================= */

// Create issue
export const createIssue = (data) => api.post("/issues", data);

// Get feed (local issues) - according to reference: GET /issues/feed
export const getFeed = () => api.get("/issues/feed");

// Get explore (all city issues) - according to reference: GET /issues/explore
export const getExplore = () => api.get("/issues/explore");

// Upload issue media - according to reference: POST /issues/{issueId}/media
export const uploadMedia = (issueId, formData) =>
  api.post(`/issues/${issueId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

/* =======================
   CATEGORIES
======================= */

// Get categories - according to reference: GET /issues/categories
export const getCategories = () => api.get("/issues/categories");
