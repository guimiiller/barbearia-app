import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.7:3000",
});

export type AppointmentData = {
  userId: string;
  services: any[];
  date: string;
  time: string;
  barberId: string | number;
};

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

export const getAllAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const createAppointment = async (data: AppointmentData) => {
  const response = await api.post("/appointments", data);
  return response.data;
};

export const updateAppointment = async (id: string, data: AppointmentData) => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};

export const cancelAppointment = async (id: string) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const concludeAppointment = async (id: string) => {
  const response = await api.delete(`/appointments/concluir/${id}`);
  return response.data;
};

export const createService = async (data: { name: string; price: number }) => {
  const response = await api.post("/services", data);
  return response.data;
};
