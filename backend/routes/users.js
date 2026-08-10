import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true },
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

export default router;
