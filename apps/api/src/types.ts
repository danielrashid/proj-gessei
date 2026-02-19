export type UserRole = "admin" | "gestor" | "operador";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ProcessStatus = "novo" | "em_analise" | "pendente" | "concluido" | "atrasado";

export type ProcessItem = {
  id: string;
  seiRef?: string;
  titulo: string;
  interessadoNome?: string;
  interessadoDoc?: string;
  secretaria: string;
  responsavel: string;
  status: ProcessStatus;
  prazo: string;
  atualizadoEm: string;
};
