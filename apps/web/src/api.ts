import type { ProcessItem, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

type LoginResult = {
  token: string;
  user: User;
};

type CreateProcessInput = {
  seiRef: string;
  titulo: string;
  interessadoNome?: string;
  interessadoDoc?: string;
  secretaria: string;
  responsavel: string;
  status: ProcessItem["status"];
  urgencia: ProcessItem["urgencia"];
  prazo: string;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Falha de autenticação");
  }

  return response.json();
}

export async function getProcesses(token: string): Promise<ProcessItem[]> {
  const response = await fetch(`${API_BASE_URL}/processes`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Falha ao carregar processos");
  }

  return response.json();
}

export async function createProcess(token: string, payload: CreateProcessInput): Promise<ProcessItem> {
  const response = await fetch(`${API_BASE_URL}/processes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Falha ao criar processo");
  }

  return response.json();
}
