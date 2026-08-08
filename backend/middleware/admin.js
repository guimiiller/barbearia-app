import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "segredo_super_secreto");

    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};
