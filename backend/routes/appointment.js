import express from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/barber/:barberId", async (req, res) => {
  try {
    const barberId = Number(req.params.barberId);

    if (!barberId) {
      return res.status(400).json({
        error: "Barbeiro inválido.",
      });
    }

    const appointments = await Appointment.find({
      barberId,
      status: {
        $ne: "cancelado",
      },
    })
      .populate("userId", "name phone email")
      .sort({
        date: 1,
        time: 1,
      });

    res.json(appointments);
  } catch (error) {
    console.log("❌ ERRO AO BUSCAR AGENDA DO BARBEIRO:", error);

    res.status(500).json({
      error: "Erro ao buscar agenda do barbeiro.",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    console.log("👤 USER ID:", req.params.userId);

    const data = await Appointment.find({
      userId: req.params.userId,
    });

    console.log(
      "📋 AGENDAMENTOS ENCONTRADOS:",
      data.map((appointment) => ({
        id: appointment._id,
        userId: appointment.userId,
        status: appointment.status,
        date: appointment.date,
        time: appointment.time,
      })),
    );

    res.json(data);
  } catch (error) {
    console.log("❌ ERRO:", error);

    res.status(500).json({
      error: "Erro ao buscar agendamentos",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, services, date, time, barberId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "Cliente não encontrado.",
      });
    }

    const now = new Date();

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      user.cancelCountMonth !== currentMonth ||
      user.cancelCountYear !== currentYear
    ) {
      user.cancelCount = 0;
      user.cancelCountMonth = currentMonth;
      user.cancelCountYear = currentYear;

      await user.save();

      console.log("🔄 CONTADOR DE CANCELAMENTOS RESETADO:", user._id);
    }

    if (user.blockedUntil && user.blockedUntil > now) {
      const remainingMs = user.blockedUntil.getTime() - now.getTime();

      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));

      return res.status(400).json({
        error: `Você atingiu o limite de cancelamentos. Não é possível realizar novos agendamentos por enquanto. Tente novamente em ${remainingHours} hora(s).`,
        blocked: true,
        blockedUntil: user.blockedUntil,
        cancelCount: user.cancelCount,
        cancelLimit: 3,
      });
    }

    if (user.blockedUntil && user.blockedUntil <= now) {
      user.blockedUntil = null;

      await user.save();

      console.log("🔓 BLOQUEIO DE 24 HORAS EXPIRADO:", user._id);
    }

    const userAppointments = await Appointment.countDocuments({
      userId,
      status: { $ne: "cancelado" },
    });

    if (userAppointments >= 1) {
      return res.status(400).json({
        error: "Você já possui um agendamento ativo.",
      });
    }

    const exists = await Appointment.findOne({
      date,
      time,
      barberId,
      status: { $ne: "cancelado" },
    });

    if (exists) {
      return res.status(400).json({
        error: "Horário já ocupado.",
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

    console.log("✅ AGENDAMENTO CRIADO:", appointment._id);

    res.json(appointment);
  } catch (err) {
    console.log("❌ ERRO AO CRIAR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await Appointment.find().populate("userId", "name");

    res.json(data);
  } catch (error) {
    console.log("❌ ERRO AO LISTAR:", error);

    res.status(500).json({
      error: "Erro ao listar",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado.",
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Agendamento removido.",
    });
  } catch (error) {
    console.log("❌ ERRO AO DELETAR:", error);

    res.status(500).json({
      error: "Erro ao deletar",
    });
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

    if (!updated) {
      return res.status(404).json({
        error: "Agendamento não encontrado.",
      });
    }

    res.json(updated);
  } catch (err) {
    console.log("❌ ERRO AO ATUALIZAR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const { cancelledBy } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado.",
      });
    }

    if (appointment.status === "cancelado") {
      return res.status(400).json({
        error: "Este agendamento já foi cancelado.",
      });
    }

    const user = await User.findById(appointment.userId);

    if (!user) {
      return res.status(404).json({
        error: "Cliente não encontrado.",
      });
    }

    const now = new Date();

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      user.cancelCountMonth !== currentMonth ||
      user.cancelCountYear !== currentYear
    ) {
      user.cancelCount = 0;
      user.cancelCountMonth = currentMonth;
      user.cancelCountYear = currentYear;
      user.blockedUntil = null;

      await user.save();

      console.log("🔄 CONTADOR RESETADO PARA NOVO MÊS:", user._id);
    }

    if (user.cancelCount < 0) {
      user.cancelCount = 0;
    }

    appointment.status = "cancelado";

    appointment.cancelledBy = cancelledBy === "admin" ? "admin" : "client";

    await appointment.save();

    console.log("❌ AGENDAMENTO CANCELADO:", appointment._id);
    console.log("👤 CANCELADO POR:", appointment.cancelledBy);

    if (appointment.cancelledBy === "client") {
      user.cancelCount += 1;

      user.cancelCountMonth = currentMonth;
      user.cancelCountYear = currentYear;

      console.log("📊 CANCELAMENTOS:", `${user.cancelCount}/3`);

      let blockedUntil = null;

      if (user.cancelCount >= 3) {
        blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        user.blockedUntil = blockedUntil;

        console.log("🚨 LIMITE DE CANCELAMENTOS ATINGIDO");
        console.log("🔒 CLIENTE BLOQUEADO POR 24 HORAS");
        console.log("👤 CLIENTE:", user._id);
        console.log("🔒 BLOQUEADO ATÉ:", blockedUntil);
      }

      await user.save();

      if (user.cancelCount >= 3) {
        return res.json({
          message:
            "Agendamento cancelado. Você atingiu o limite de 3 cancelamentos e ficará 24 horas sem poder realizar novos agendamentos.",

          appointmentId: appointment._id,

          status: "cancelado",

          cancelledBy: appointment.cancelledBy,

          cancelCount: user.cancelCount,

          cancelLimit: 3,

          blocked: true,

          blockedUntil: user.blockedUntil,
        });
      }

      return res.json({
        message: "Agendamento cancelado com sucesso.",

        appointmentId: appointment._id,

        status: "cancelado",

        cancelledBy: appointment.cancelledBy,

        cancelCount: user.cancelCount,

        cancelLimit: 3,

        blocked: false,

        blockedUntil: null,
      });
    }

    return res.json({
      message: "Agendamento cancelado pelo administrador.",

      appointmentId: appointment._id,

      status: "cancelado",

      cancelledBy: "admin",

      cancelCount: user.cancelCount,

      cancelLimit: 3,

      blocked: false,

      blockedUntil: user.blockedUntil || null,
    });
  } catch (error) {
    console.log("❌ ERRO AO CANCELAR:", error);

    res.status(500).json({
      error: "Erro ao cancelar agendamento.",
    });
  }
});

router.delete("/concluir/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado.",
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Agendamento concluído e removido.",
    });
  } catch (error) {
    console.log("❌ ERRO AO CONCLUIR:", error);

    res.status(500).json({
      error: "Erro ao concluir agendamento.",
    });
  }
});

export default router;
