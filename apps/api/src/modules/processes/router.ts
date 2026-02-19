import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../../security/auth.js";
import type { ProcessItem } from "../../types.js";
import { ProcessRepository } from "./repository.js";

const router = Router();
const repository = new ProcessRepository();

const processSchema = z.object({
  seiRef: z.string().optional(),
  titulo: z.string().min(5),
  interessadoNome: z.string().min(3).optional(),
  interessadoDoc: z.string().min(11).optional(),
  secretaria: z.string().min(2),
  responsavel: z.string().min(3),
  status: z.enum(["novo", "em_analise", "pendente", "concluido", "atrasado"]),
  urgencia: z.enum(["baixa", "media", "alta", "critica"]),
  prazo: z.string().date()
});

router.get("/", (req, res) => {
  const items = repository.list();
  return res.json(items);
});

router.post("/", requireRole(["admin", "gestor"]), (req, res) => {
  const parsed = processSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.issues });
  }

  const payload: ProcessItem = {
    id: randomUUID(),
    ...parsed.data,
    dataCriacao: new Date().toISOString().slice(0, 10),
    atualizadoEm: new Date().toISOString()
  };

  const created = repository.create(payload);
  console.info({ actor: req.user?.email, processId: created.id, action: "create_process" });

  return res.status(201).json(created);
});

export default router;
