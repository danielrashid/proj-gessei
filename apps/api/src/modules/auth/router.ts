import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { signToken } from "../../security/auth.js";
import type { User } from "../../types.js";

const router = Router();

const users: Array<User & { passwordHash: string }> = [
  {
    id: "u1",
    name: "Admin SERINCCI",
    email: "admin@serincci.gov.br",
    role: "admin",
    passwordHash: bcrypt.hashSync("Pilot@2026", 10)
  },
  {
    id: "u2",
    name: "Gestor SERINCCI",
    email: "gestor@serincci.gov.br",
    role: "gestor",
    passwordHash: bcrypt.hashSync("Pilot@2026", 10)
  }
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Credenciais inválidas" });
  }

  const user = users.find((item) => item.email === parsed.data.email);
  if (!user) {
    return res.status(401).json({ message: "Usuário ou senha inválidos" });
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Usuário ou senha inválidos" });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export default router;
