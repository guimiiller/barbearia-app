import express from "express";
import { firebaseMessaging } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

const router = express.Router();

// =====================================================
// TESTE DE PUSH NOTIFICATION
// TEMPORÁRIO - remover depois dos testes
// =====================================================

router.post("/test/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({
        error: "Este usuário não possui dispositivos registrados.",
      });
    }

    console.log(
      `🔔 Enviando notificação para ${user.fcmTokens.length} dispositivo(s)...`,
    );

    const message = {
      notification: {
        title: "Barão Barber 🔔",
        body: "Notificação enviada pelo backend com sucesso!",
      },

      webpush: {
        notification: {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        },
      },

      tokens: user.fcmTokens,
    };

    const response = await firebaseMessaging.sendEachForMulticast(message);

    console.log("✅ Notificações enviadas:", response.successCount);
    console.log("❌ Falhas:", response.failureCount);

    res.json({
      message: "Teste de notificação executado.",
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ Erro ao enviar notificação:", error);

    res.status(500).json({
      error: "Erro ao enviar notificação.",
    });
  }
});

export default router;
