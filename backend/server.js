import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import appointmentRoutes from "./routes/appointment.js";
import authRoutes from "./routes/auth.js";
import scheduleRoutes from "./routes/schedule.js";
import serviceRoutes from "./routes/service.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("🔥 MongoDB CONECTADO");
  })
  .catch((err) => {
    console.log("❌ ERRO MONGODB:", err);
  });

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/users", userRoutes);
app.use("/schedule", scheduleRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
