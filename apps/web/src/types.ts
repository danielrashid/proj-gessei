export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "gestor" | "operador";
};

export type ProcessItem = {
  id: string;
  seiRef?: string;
  titulo: string;
  interessadoNome?: string;
  interessadoDoc?: string;
  secretaria: string;
  responsavel: string;
  status: "novo" | "em_analise" | "pendente" | "concluido" | "atrasado";
  urgencia: "baixa" | "media" | "alta" | "critica";
  prazo: string;
  dataCriacao: string;
  atualizadoEm: string;
};
