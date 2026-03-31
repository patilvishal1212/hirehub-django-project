import api from "./api";
import { setAccessToken, clearAccessToken } from "./api";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login/", credentials);
  const { access, user } = response.data;
  setAccessToken(access);
  return { access, user };
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout/", {});
  } finally {
    clearAccessToken();
  }
};

export const refreshSession = async () => {
  const response = await api.post("/auth/token/refresh/", {});
  const { access } = response.data;
  setAccessToken(access);
  return { access };
};

export const fetchMe = async () => {
  const response = await api.get("/auth/me/");
  return response.data;
};

export const updateProfile = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await api.patch("/auth/me/", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};