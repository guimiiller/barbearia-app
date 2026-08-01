import express from "express";
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

export default router;
