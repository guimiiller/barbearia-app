import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const data = await Appointment.find({
    userId: req.params.userId,
  });

  res.json(data);
});

router.post("/", async (req, res) => {
  try {
    const { userId, services, date, time, barberId } = req.body;

    const exists = await Appointment.findOne({
      date,
      time,
      barberId,
    });

    if (exists) {
      return res.status(400).json({
        error: "Horário já ocupado",
      });
    }

    const appointment = await Appointment.create({
      userId,
      services,
      barberId,
      date,
      time,
      status: "agendado",
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const data = await Appointment.find();
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await Appointment.findByIdAndDelete(id);

    res.json({ message: "Agendamento cancelado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
      },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
