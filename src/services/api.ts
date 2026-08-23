import axios from "axios";

export const api = axios.create({
  baseURL: "https://barao-barbearia-api.onrender.com",
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
  phone: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const verifyResetCode = async (email: string, code: string) => {
  const response = await api.post("/auth/verify-reset-code", {
    email,
    code,
  });

  return response.data;
};

export const resetPassword = async (
  email: string,
  resetToken: string,
  password: string,
) => {
  const response = await api.post("/auth/reset-password", {
    email,
    resetToken,
    password,
  });

  return response.data;
};

export const getServices = async () => {
  const response = await api.get("/services");

  return response.data;
};

export const createService = async (data: { name: string; price: number }) => {
  const response = await api.post("/services", data);

  return response.data;
};

export const updateService = async (id: string, data: any) => {
  const response = await api.put(`/services/${id}`, data);

  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/services/${id}`);

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

export const cancelAppointment = async (
  id: string,
  cancelledBy: "client" | "admin",
) => {
  const response = await api.patch(`/appointments/${id}/cancel`, {
    cancelledBy,
  });

  return response.data;
};
export const concludeAppointment = async (id: string) => {
  const response = await api.delete(`/appointments/concluir/${id}`);

  return response.data;
};

// =====================================================
// USERS
// =====================================================

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);

  return response.data;
};

// =====================================================
// SCHEDULE
// =====================================================
// =====================================================
// SCHEDULE
// =====================================================

export const getSchedule = async (date: string, barberId: number | string) => {
  const response = await api.get(`/schedule/${barberId}/${date}`);

  return response.data;
};

export const saveSchedule = async (data: {
  barberId: number | string;
  date: string;
  slots: {
    time: string;
  }[];
}) => {
  const response = await api.post("/schedule", data);

  return response.data;
};

export const removeSlot = async (
  date: string,
  time: string,
  barberId: number | string,
) => {
  const response = await api.post("/schedule/remove-slot", {
    barberId,
    date,
    time,
  });

  return response.data;
};

export const getBarberAppointments = async (barberId: number) => {
  const response = await api.get(`/appointments/barber/${barberId}`);

  return response.data;
};
