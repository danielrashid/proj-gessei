import type { ProcessItem } from "../../types.js";

const seed: ProcessItem[] = [
  {
    id: "p1",
    seiRef: "SEI-10001/2026",
    titulo: "Cooperação internacional - cidade irmã",
    interessadoNome: "Maria da Silva",
    interessadoDoc: "12345678900",
    secretaria: "SERINCCI",
    responsavel: "Marina Alves",
    status: "em_analise",
    urgencia: "media",
    prazo: "2026-03-15",
    dataCriacao: "2026-02-10",
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "p2",
    seiRef: "SEI-10002/2026",
    titulo: "Evento de cidadania internacional",
    interessadoNome: "Associação Cidadania Global",
    secretaria: "SERINCCI",
    responsavel: "João Nunes",
    status: "pendente",
    urgencia: "critica",
    prazo: "2026-02-21",
    dataCriacao: "2026-02-08",
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "p3",
    seiRef: "SEI-10003/2026",
    titulo: "Parecer jurídico sobre memorando",
    interessadoNome: "João da Silva Santos",
    secretaria: "SERINCCI",
    responsavel: "Dr. Silva",
    status: "atrasado",
    urgencia: "alta",
    prazo: "2026-02-18",
    dataCriacao: "2026-01-25",
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "p4",
    seiRef: "SEI-10004/2026",
    titulo: "Documentação bilateral simples",
    interessadoNome: "Ministério das Relações Exteriores",
    secretaria: "SERINCCI",
    responsavel: "Ana Costa",
    status: "novo",
    urgencia: "baixa",
    prazo: "2026-03-30",
    dataCriacao: "2026-02-19",
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "p5",
    seiRef: "SEI-10005/2026",
    titulo: "Protocolo de intenções com país parceiro",
    secretaria: "SERINCCI",
    responsavel: "Carlos Mendes",
    status: "concluido",
    urgencia: "media",
    prazo: "2026-02-15",
    dataCriacao: "2026-02-01",
    atualizadoEm: new Date().toISOString()
  }
];

export class ProcessRepository {
  private data = [...seed];

  list() {
    return this.data;
  }

  create(item: ProcessItem) {
    this.data.unshift(item);
    return item;
  }
}
