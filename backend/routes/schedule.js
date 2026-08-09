import express from "express";
import Schedule from "../models/Schedule.js";

const router = express.Router();

router.get("/:date", async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ date: req.params.date });
    res.json(schedule || { date: req.params.date, slots: [] });
  } catch {
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, slots } = req.body;

    const updated = await Schedule.findOneAndUpdate(
      { date },
      { slots },
      { upsert: true, new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/remove-slot", async (req, res) => {
  const { date, time } = req.body;

  await Schedule.updateOne(
    { date },
    {
      $pull: {
        slots: { time: time },
      },
    },
  );

  res.json({ success: true });
});

export default router;
