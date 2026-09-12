import express from "express";
import { firebaseMessaging } from "../config/firebaseAdmin.js";
import Appointment from "../models/Appointment.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";

const router = express.Router();

// =====================================================
// BUSCAR AGENDAMENTOS DO BARBEIRO
// =====================================================

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

// =====================================================
// BUSCAR AGENDAMENTOS DO CLIENTE
// =====================================================

router.get("/:userId", async (req, res) => {
  try {
    const data = await Appointment.find({
      userId: req.params.userId,
    });

    res.json(data);
  } catch (error) {
    console.log("❌ ERRO:", error);

    res.status(500).json({
      error: "Erro ao buscar agendamentos",
    });
  }
});

// =====================================================
// CRIAR AGENDAMENTO
// =====================================================

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

    // =====================================================
    // RESETAR CONTADOR SE MUDOU O MÊS
    // =====================================================

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

    // =====================================================
    // VERIFICAR BLOQUEIO DO CLIENTE
    // =====================================================

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

    // =====================================================
    // REMOVER BLOQUEIO EXPIRADO
    // =====================================================

    if (user.blockedUntil && user.blockedUntil <= now) {
      user.blockedUntil = null;

      await user.save();

      console.log("🔓 BLOQUEIO DE 24 HORAS EXPIRADO:", user._id);
    }

    // =====================================================
    // CLIENTE SÓ PODE TER 1 AGENDAMENTO ATIVO
    // =====================================================

    const userAppointments = await Appointment.countDocuments({
      userId,
      status: {
        $ne: "cancelado",
      },
    });

    if (userAppointments >= 1) {
      return res.status(400).json({
        error: "Você já possui um agendamento ativo.",
      });
    }

    // =====================================================
    // VERIFICAR SE O HORÁRIO JÁ ESTÁ OCUPADO
    // =====================================================

    const exists = await Appointment.findOne({
      date,
      time,
      barberId,
      status: {
        $ne: "cancelado",
      },
    });

    if (exists) {
      return res.status(400).json({
        error: "Horário já ocupado.",
      });
    }

    // =====================================================
    // CRIAR AGENDAMENTO
    // =====================================================

    const appointment = await Appointment.create({
      userId,
      services,
      barberId,
      date,
      time,
      status: "agendado",
    });

    console.log("✅ AGENDAMENTO CRIADO:", appointment._id);

    // =====================================================
    // 🔔 NOTIFICAR BARBEIRO SOBRE NOVO AGENDAMENTO
    // =====================================================

    try {
      const barber = await User.findOne({
        role: "admin",
        barberId: Number(barberId),
      });

      if (barber?.fcmTokens?.length) {
        const serviceNames = services
          .map((service) => service.name)
          .filter(Boolean)
          .join(", ");

        const message = {
          notification: {
            title: "Novo agendamento ✂️",
            body: `${user.name} agendou ${
              serviceNames || "um serviço"
            } para ${date} às ${time}.`,
          },

          webpush: {
            notification: {
              icon: "/icon-192.png",
              badge: "/icon-192.png",
            },
          },

          tokens: barber.fcmTokens,
        };

        const notificationResult =
          await firebaseMessaging.sendEachForMulticast(message);

        console.log(
          `🔔 NOTIFICAÇÃO NOVO AGENDAMENTO: ${notificationResult.successCount} enviada(s), ${notificationResult.failureCount} falha(s)`,
        );
      } else {
        console.log(
          "🔕 Barbeiro não possui dispositivo registrado para notificações.",
        );
      }
    } catch (notificationError) {
      console.error(
        "⚠️ Agendamento criado, mas houve erro ao enviar a notificação:",
        notificationError,
      );
    }

    res.json(appointment);
  } catch (err) {
    console.log("❌ ERRO AO CRIAR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// LISTAR TODOS OS AGENDAMENTOS
// =====================================================

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

// =====================================================
// DELETAR AGENDAMENTO
// =====================================================

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

// =====================================================
// ATUALIZAR AGENDAMENTO
// =====================================================

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

// =====================================================
// CANCELAR AGENDAMENTO
// =====================================================

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

    // =====================================================
    // RESETAR CONTADOR NO NOVO MÊS
    // =====================================================

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

    // =====================================================
    // CANCELAMENTO FEITO PELO CLIENTE
    // =====================================================

    if (appointment.cancelledBy === "client") {
      user.cancelCount += 1;

      user.cancelCountMonth = currentMonth;
      user.cancelCountYear = currentYear;

      console.log("📊 CANCELAMENTOS:", `${user.cancelCount}/3`);

      let blockedUntil = null;

      // =====================================================
      // 🔔 NOTIFICAR BARBEIRO SOBRE CANCELAMENTO
      // =====================================================

      try {
        const barber = await User.findOne({
          role: "admin",
          barberId: Number(appointment.barberId),
        });

        if (barber?.fcmTokens?.length) {
          const serviceNames =
            appointment.services
              ?.map((service) => service.name)
              .filter(Boolean)
              .join(", ") || "";

          const message = {
            notification: {
              title: "Agendamento cancelado ❌",
              body: `${user.name} cancelou ${
                serviceNames || "o agendamento"
              } de ${appointment.date} às ${appointment.time}.`,
            },

            webpush: {
              notification: {
                icon: "/icon-192.png",
                badge: "/icon-192.png",
              },
            },

            tokens: barber.fcmTokens,
          };

          const notificationResult =
            await firebaseMessaging.sendEachForMulticast(message);

          console.log(
            `🔔 NOTIFICAÇÃO CANCELAMENTO CLIENTE: ${notificationResult.successCount} enviada(s), ${notificationResult.failureCount} falha(s)`,
          );
        } else {
          console.log(
            "🔕 Barbeiro não possui dispositivo registrado para notificações.",
          );
        }
      } catch (notificationError) {
        console.error(
          "⚠️ Agendamento cancelado, mas houve erro ao notificar o barbeiro:",
          notificationError,
        );
      }

      // =====================================================
      // BLOQUEAR APÓS 3 CANCELAMENTOS
      // =====================================================

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

    // =====================================================
    // CANCELAMENTO FEITO PELO ADMIN
    // =====================================================

    // =====================================================
    // 🔔 NOTIFICAR CLIENTE SOBRE CANCELAMENTO DO ADMIN
    // =====================================================

    try {
      if (user?.fcmTokens?.length) {
        const serviceNames =
          appointment.services
            ?.map((service) => service.name)
            .filter(Boolean)
            .join(", ") || "";

        const message = {
          notification: {
            title: "Agendamento cancelado ❌",
            body: `Seu agendamento${
              serviceNames ? ` de ${serviceNames}` : ""
            } do dia ${appointment.date} às ${
              appointment.time
            } foi cancelado pelo Barão.`,
          },

          webpush: {
            notification: {
              icon: "/icon-192.png",
              badge: "/icon-192.png",
            },
          },

          tokens: user.fcmTokens,
        };

        const notificationResult =
          await firebaseMessaging.sendEachForMulticast(message);

        console.log(
          `🔔 NOTIFICAÇÃO CANCELAMENTO ADMIN → CLIENTE: ${notificationResult.successCount} enviada(s), ${notificationResult.failureCount} falha(s)`,
        );
      } else {
        console.log(
          "🔕 Cliente não possui dispositivo registrado para notificações.",
        );
      }
    } catch (notificationError) {
      // O CANCELAMENTO NÃO DEVE FALHAR SE O PUSH FALHAR
      console.error(
        "⚠️ Agendamento cancelado pelo admin, mas houve erro ao notificar o cliente:",
        notificationError,
      );
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

// =====================================================
// CONCLUIR AGENDAMENTO
// =====================================================

router.delete("/concluir/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado.",
      });
    }

    console.log("✂️ CONCLUINDO AGENDAMENTO:", {
      id: appointment._id,
      barberId: appointment.barberId,
      date: appointment.date,
      time: appointment.time,
    });

    const scheduleResult = await Schedule.updateOne(
      {
        barberId: Number(appointment.barberId),
        date: appointment.date,
      },
      {
        $pull: {
          slots: {
            time: appointment.time,
          },
        },
      },
    );

    console.log("🗑️ RESULTADO REMOÇÃO DO HORÁRIO:", scheduleResult);

    await Appointment.findByIdAndDelete(req.params.id);

    console.log("✅ ATENDIMENTO CONCLUÍDO:", appointment._id);

    console.log("🕒 HORÁRIO REMOVIDO:", appointment.time);

    return res.json({
      success: true,

      message: "Agendamento concluído e horário removido.",

      removedSlot: {
        barberId: appointment.barberId,
        date: appointment.date,
        time: appointment.time,
      },
    });
  } catch (error) {
    console.log("❌ ERRO AO CONCLUIR:", error);

    return res.status(500).json({
      error: "Erro ao concluir agendamento.",
    });
  }
});

export default router;
