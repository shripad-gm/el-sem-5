import api from "./axios";

export const getAdminIssues = () => api.get("/admin/issues");

export const updateStatus = (id, data) =>
  api.patch(`/admin/issues/${id}/status`, data);
