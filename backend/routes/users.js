import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true },
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

export default router;
