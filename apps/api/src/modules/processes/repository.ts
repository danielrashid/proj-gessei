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
    prazo: "2026-03-15",
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
    prazo: "2026-03-01",
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
