import express from "express";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

router.post("/", async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);

    await Appointment.updateMany(
      {},
      { $pull: { services: { _id: req.params.id } } },
    );

    res.json({ message: "Serviço deletado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
