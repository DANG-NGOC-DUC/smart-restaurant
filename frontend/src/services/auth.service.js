import { api } from "./api";

export const login = async (data) => {
  try {
    const response = await api.post("auth/login", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (data) => {
  try {
    const response = await api.post("auth/register", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("auth/forgot-password", { email });
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (password, token) => {
  try {
    const response = await api.post("auth/reset-password", {
      password,
      token,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
