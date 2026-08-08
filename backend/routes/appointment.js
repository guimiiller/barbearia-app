import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// BUSCAR AGENDAMENTOS DO USUÁRIO
router.get("/:userId", async (req, res) => {
  try {
    const data = await Appointment.find({
      userId: req.params.userId,
    });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// CRIAR
router.post("/", async (req, res) => {
  try {
    const { userId, services, date, time, barberId } = req.body;

    const exists = await Appointment.findOne({ date, time, barberId });

    if (exists) {
      return res.status(400).json({ error: "Horário já ocupado" });
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

// LISTAR TODOS
router.get("/", async (req, res) => {
  try {
    const data = await Appointment.find().populate("userId", "name");
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao listar" });
  }
});

// DELETAR
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Removido" });
  } catch {
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

// ATUALIZAR
router.put("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCELAR
router.patch("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: "Não encontrado" });
    }

    appointment.status = "cancelado";
    await appointment.save();

    res.json({ message: "Cancelado" });
  } catch {
    res.status(500).json({ error: "Erro ao cancelar" });
  }
});

router.delete("/concluir/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: "Agendamento concluído e removido" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao concluir agendamento" });
  }
});

export default router;
