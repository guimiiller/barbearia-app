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
    const { name, price } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (price === undefined || isNaN(price)) {
      return res.status(400).json({ error: "Preço inválido" });
    }

    if (price <= 0) {
      return res.status(400).json({ error: "Preço deve ser maior que zero" });
    }

    const service = await Service.create({
      name: name.trim(),
      price,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (price === undefined || isNaN(price)) {
      return res.status(400).json({ error: "Preço inválido" });
    }

    if (price <= 0) {
      return res.status(400).json({ error: "Preço deve ser maior que zero" });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        price,
      },
      { new: true },
    );

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
