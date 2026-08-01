import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.6:3000",
});

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

export const getAppointments = async (userId: string) => {
  const response = await api.get(`/appointments/${userId}`);
  return response.data;
};

export const createAppointment = async (data: {
  userId: string;
  services: any[];
  date: string;
  time: string;
}) => {
  const response = await api.post("/appointments", data);
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const cancelAppointment = async (id: string) => {
  return api.delete(`/appointments/${id}`);
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};
