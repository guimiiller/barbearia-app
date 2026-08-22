import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        error: "Email já cadastrado",
      });
    }

    if (!phone) {
      return res.status(400).json({
        error: "Telefone é obrigatório",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,

      role: "client",

      barberId: null,
    });

    res.json({
      message: "Usuário criado com sucesso",
    });
  } catch (err) {
    console.log("❌ ERRO REGISTER:", err);

    res.status(500).json({
      error: "Erro ao criar usuário",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        error: "Usuário não encontrado",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Senha incorreta",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        barberId: user.barberId,
      },
      process.env.JWT_SECRET || "segredo_super_secreto",
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login realizado com sucesso",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,

        barberId: user.barberId,
      },
    });
  } catch (err) {
    console.log("❌ ERRO LOGIN:", err);

    res.status(500).json({
      error: "Erro ao realizar login",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        error: "Digite seu e-mail",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.json({
        message:
          "Se existir uma conta com este e-mail, um código será enviado.",
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCodeHash = codeHash;
    user.resetCodeExpiresAt = expiresAt;
    user.resetCodeAttempts = 0;

    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    await transporter.sendMail({
      from: `"Barão Barbearia" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject: "Código para redefinir sua senha",

      text: `Seu código para redefinir a senha é: ${code}. Este código expira em 10 minutos.`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background: #080808;
          padding: 30px;
          color: #fff;
        ">
          <div style="
            max-width: 500px;
            margin: auto;
            background: #141414;
            padding: 30px;
            border-radius: 12px;
          ">

            <h1 style="
              text-align: center;
              letter-spacing: 4px;
            ">
              BARÃO
            </h1>

            <p style="
              text-align: center;
              color: #aaa;
            ">
              BARBEARIA
            </p>

            <p>
              Recebemos uma solicitação para redefinir sua senha.
            </p>

            <p>
              Seu código de recuperação é:
            </p>

            <div style="
              background: #fff;
              color: #000;
              text-align: center;
              font-size: 30px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 15px;
              border-radius: 8px;
              margin: 25px 0;
            ">
              ${code}
            </div>

            <p style="color: #aaa;">
              Este código expira em 10 minutos.
            </p>

            <p style="color: #aaa;">
              Se você não solicitou a redefinição de senha,
              ignore este e-mail.
            </p>

          </div>
        </div>
      `,
    });

    console.log("📧 Código enviado para:", user.email);

    res.json({
      message: "Se existir uma conta com este e-mail, um código será enviado.",
    });
  } catch (err) {
    console.log("❌ ERRO FORGOT PASSWORD:", err);

    res.status(500).json({
      error: "Não foi possível enviar o código",
    });
  }
});

router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({
        error: "E-mail e código são obrigatórios",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        error: "Código inválido ou expirado",
      });
    }

    if (user.resetCodeAttempts >= 5) {
      return res.status(400).json({
        error: "Número máximo de tentativas atingido. Solicite um novo código.",
      });
    }

    if (!user.resetCodeHash || !user.resetCodeExpiresAt) {
      return res.status(400).json({
        error: "Código inválido ou expirado",
      });
    }

    if (user.resetCodeExpiresAt < new Date()) {
      return res.status(400).json({
        error: "Código expirado. Solicite um novo código.",
      });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    if (codeHash !== user.resetCodeHash) {
      user.resetCodeAttempts += 1;

      await user.save();

      return res.status(400).json({
        error: "Código incorreto",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetTokenHash = resetTokenHash;

    user.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCodeHash = null;
    user.resetCodeExpiresAt = null;
    user.resetCodeAttempts = 0;

    await user.save();

    res.json({
      message: "Código validado com sucesso",
      resetToken,
    });
  } catch (err) {
    console.log("❌ ERRO VERIFY CODE:", err);

    res.status(500).json({
      error: "Erro ao validar código",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, resetToken, password } = req.body;

  try {
    if (!email || !resetToken || !password) {
      return res.status(400).json({
        error: "Dados incompletos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        error: "Token inválido",
      });
    }

    if (!user.resetTokenHash || !user.resetTokenExpiresAt) {
      return res.status(400).json({
        error: "Token inválido ou expirado",
      });
    }

    if (user.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({
        error: "Token expirado. Solicite um novo código.",
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    if (resetTokenHash !== user.resetTokenHash) {
      return res.status(400).json({
        error: "Token inválido",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    res.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (err) {
    console.log("❌ ERRO RESET PASSWORD:", err);

    res.status(500).json({
      error: "Não foi possível redefinir a senha",
    });
  }
});

export default router;
