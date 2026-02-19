export type UserRole = "admin" | "gestor" | "operador";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ProcessStatus = "novo" | "em_analise" | "pendente" | "concluido" | "atrasado";

export type Urgencia = "baixa" | "media" | "alta" | "critica";

export type ProcessItem = {
  id: string;
  seiRef?: string;
  titulo: string;
  interessadoNome?: string;
  interessadoDoc?: string;
  secretaria: string;
  responsavel: string;
  status: ProcessStatus;
  urgencia: Urgencia;
  prazo: string;
  dataCriacao: string;
  atualizadoEm: string;
};
