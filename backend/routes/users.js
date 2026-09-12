import express from "express";
import User from "../models/User.js";

const router = express.Router();

// -----------------------------------------------------
// ATUALIZAR PERFIL
// -----------------------------------------------------

router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);

    res.status(500).json({
      error: "Erro ao atualizar usuário",
    });
  }
});

// -----------------------------------------------------
// SALVAR TOKEN FCM
// -----------------------------------------------------

router.post("/:id/fcm-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Token FCM inválido",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          fcmTokens: token,
        },
      },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    console.log(`🔔 Token FCM salvo para ${user.email}`);

    res.json({
      message: "Token FCM salvo com sucesso",
      devices: user.fcmTokens.length,
    });
  } catch (error) {
    console.error("❌ Erro ao salvar token FCM:", error);

    res.status(500).json({
      error: "Erro ao salvar token FCM",
    });
  }
});

export default router;
