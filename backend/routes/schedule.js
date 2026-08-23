import express from "express";
import Schedule from "../models/Schedule.js";

const router = express.Router();

router.get("/:barberId/:date", async (req, res) => {
  try {
    const barberId = Number(req.params.barberId);
    const { date } = req.params;

    if (!barberId) {
      return res.status(400).json({
        error: "Barbeiro inválido.",
      });
    }

    const schedule = await Schedule.findOne({
      barberId,
      date,
    });

    if (!schedule) {
      return res.json({
        barberId,
        date,
        slots: [],
      });
    }

    // =====================================================
    // HORÁRIO DE SÃO PAULO
    // =====================================================

    const now = new Date();

    const saoPauloParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);

    const getPart = (type) =>
      saoPauloParts.find((part) => part.type === type)?.value;

    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");

    const currentHours = Number(getPart("hour"));
    const currentMinutes = Number(getPart("minute"));

    const today = `${year}-${month}-${day}`;

    console.log("🕒 HORÁRIO SÃO PAULO:", {
      today,
      currentHours,
      currentMinutes,
    });

    // Faz uma cópia dos slots salvos
    let slots = [...schedule.slots];

    // =====================================================
    // SOMENTE SE FOR HOJE:
    // REMOVER HORÁRIOS QUE REALMENTE JÁ PASSARAM
    // =====================================================

    if (date === today) {
      const currentMinutesTotal = currentHours * 60 + currentMinutes;

      slots = slots.filter((slot) => {
        const [hours, minutes] = slot.time.split(":").map(Number);

        const slotMinutes = hours * 60 + minutes;

        return slotMinutes > currentMinutesTotal;
      });
    }

    console.log("📅 AGENDA ENCONTRADA:", {
      barberId,
      date,
      slots: slots.map((slot) => slot.time),
    });

    return res.json({
      ...schedule.toObject(),

      barberId,

      slots,
    });
  } catch (error) {
    console.log("❌ ERRO AO BUSCAR HORÁRIOS:", error);

    return res.status(500).json({
      error: "Erro ao buscar horários",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { barberId, date, slots } = req.body;

    if (!barberId) {
      return res.status(400).json({
        error: "Barbeiro é obrigatório.",
      });
    }

    if (!date) {
      return res.status(400).json({
        error: "Data é obrigatória.",
      });
    }

    const normalizedBarberId = Number(barberId);

    const updated = await Schedule.findOneAndUpdate(
      {
        barberId: normalizedBarberId,
        date,
      },

      {
        barberId: normalizedBarberId,
        date,
        slots,
      },

      {
        upsert: true,
        new: true,
      },
    );

    console.log("💈 AGENDA SALVA", {
      barberId: normalizedBarberId,
      date,
      slots,
    });

    res.json(updated);
  } catch (error) {
    console.log("❌ ERRO AO SALVAR HORÁRIOS:", error);

    res.status(500).json({
      error: "Erro ao salvar horários",
    });
  }
});

router.post("/remove-slot", async (req, res) => {
  try {
    const { barberId, date, time } = req.body;

    if (!barberId || !date || !time) {
      return res.status(400).json({
        error: "barberId, data e horário são obrigatórios.",
      });
    }

    await Schedule.updateOne(
      {
        barberId: Number(barberId),
        date,
      },

      {
        $pull: {
          slots: {
            time,
          },
        },
      },
    );

    console.log("🗑 HORÁRIO REMOVIDO:", {
      barberId,
      date,
      time,
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.log("❌ ERRO AO REMOVER HORÁRIO:", error);

    res.status(500).json({
      error: "Erro ao remover horário",
    });
  }
});

export default router;
