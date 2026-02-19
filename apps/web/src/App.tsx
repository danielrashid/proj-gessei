import { useMemo, useState } from "react";
import { createProcess, getProcesses, login } from "./api";
import type { ProcessItem, User } from "./types";

function metricByStatus(items: ProcessItem[], status: ProcessItem["status"]) {
  return items.filter((item) => item.status === status).length;
}

type TimelineStep = {
  setor: string;
  status: "concluido" | "pendente";
  data: string;
  msg: string;
};

function formatProcessNumber(value?: string) {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  if (!/^\d+$/.test(raw)) {
    return raw;
  }

  const digits = raw;
  if (digits.length < 19) {
    return digits;
  }

  const p1 = digits.slice(0, 5);
  const middle = digits.slice(5, 13);
  const year = digits.slice(13, 17);
  const check = digits.slice(17);

  if (!middle || !year || !check) {
    return digits;
  }

  return `${p1}-${middle}/${year}-${check}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function defaultDueDate() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function daysUntilDue(prazoStr: string): number {
  const prazo = new Date(prazoStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  prazo.setHours(0, 0, 0, 0);
  const diff = prazo.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isOverdue(prazoStr: string): boolean {
  return daysUntilDue(prazoStr) < 0;
}

function isUrgentDeadline(prazoStr: string): boolean {
  const days = daysUntilDue(prazoStr);
  return days >= 0 && days < 3;
}

function buildTimeline(item: ProcessItem): TimelineStep[] {
  const sectors = ["GABINETE", "SERINCCI", "ANÁLISE TÉCNICA", "DESPACHO FINAL"];

  const currentIndexMap: Record<ProcessItem["status"], number> = {
    novo: 0,
    em_analise: 2,
    pendente: 2,
    atrasado: 2,
    concluido: 3
  };

  const currentIndex = currentIndexMap[item.status];
  const today = new Date();

  return sectors.map((setor, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (sectors.length - index));

    const isDone = index < currentIndex || item.status === "concluido";
    const isCurrent = index === currentIndex && item.status !== "concluido";

    let message = "Etapa concluída com sucesso.";
    if (isCurrent && item.status === "atrasado") {
      message = "Aguardando movimentação. Processo em atraso nesta etapa.";
    } else if (isCurrent) {
      message = "Etapa atual aguardando ação da equipe.";
    } else if (index > currentIndex && item.status !== "concluido") {
      message = "Etapa futura após conclusão da fase anterior.";
    }

    return {
      setor,
      status: isDone ? "concluido" : "pendente",
      data: formatDate(date.toISOString()),
      msg: message
    };
  });
}

export default function App() {
  type FilterKey = "todos" | "ativos" | "atrasados" | "proximosVencer" | "pendentes" | "analise" | "concluidos";

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState("admin@serincci.gov.br");
  const [password, setPassword] = useState("Pilot@2026");
  const [items, setItems] = useState<ProcessItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [processNumberRaw, setProcessNumberRaw] = useState("");
  const [interessadoNome, setInteressadoNome] = useState("");
  const [interessadoDoc, setInteressadoDoc] = useState("");
  const [prazo, setPrazo] = useState(defaultDueDate());
  const [urgencia, setUrgencia] = useState<"baixa" | "media" | "alta" | "critica">("media");
  const [description, setDescription] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("todos");

  const metrics = useMemo(
    () => {
      const ativos = items.filter((item) => item.status !== "concluido");
      const atrasados = ativos.filter((item) => isOverdue(item.prazo));
      const proximosVencer = ativos.filter(
        (item) => !isOverdue(item.prazo) && isUrgentDeadline(item.prazo)
      );
      return {
        ativos: ativos.length,
        pendentes: metricByStatus(items, "pendente") + metricByStatus(items, "atrasado"),
        concluidos: metricByStatus(items, "concluido"),
        atencao: metricByStatus(items, "em_analise"),
        atrasados: atrasados.length,
        proximosVencer: proximosVencer.length
      };
    },
    [items]
  );

  const filteredItems = useMemo(() => {
    let result: ProcessItem[];
    if (selectedFilter === "atrasados") {
      const ativos = items.filter((item) => item.status !== "concluido");
      result = ativos.filter((item) => isOverdue(item.prazo));
    } else if (selectedFilter === "proximosVencer") {
      const ativos = items.filter((item) => item.status !== "concluido");
      result = ativos.filter((item) => !isOverdue(item.prazo) && isUrgentDeadline(item.prazo));
    } else if (selectedFilter === "ativos") {
      result = items.filter((item) => item.status !== "concluido");
    } else if (selectedFilter === "pendentes") {
      result = items.filter((item) => item.status === "pendente" || item.status === "atrasado");
    } else if (selectedFilter === "analise") {
      result = items.filter((item) => item.status === "em_analise");
    } else if (selectedFilter === "concluidos") {
      result = items.filter((item) => item.status === "concluido");
    } else {
      result = items;
    }

    // Reordenar por criticidade
    return result.sort((a, b) => {
      // 1. Atrasado vem primeiro
      const aOverdue = isOverdue(a.prazo) ? 0 : 1;
      const bOverdue = isOverdue(b.prazo) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;

      // 2. Depois por urgência (crítica > alta > media > baixa)
      const urgencyOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
      const aUrgency = urgencyOrder[a.urgencia];
      const bUrgency = urgencyOrder[b.urgencia];
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;

      // 3. Depois por dias até prazo (mais próximo primeiro)
      const aDays = daysUntilDue(a.prazo);
      const bDays = daysUntilDue(b.prazo);
      return aDays - bDays;
    });
  }, [items, selectedFilter]);

  function toggleFilter(filter: FilterKey) {
    setSelectedFilter((current) => (current === filter ? "todos" : filter));
  }

  function statusLabel(status: ProcessItem["status"]) {
    if (status === "atrasado") return "Atrasado";
    if (status === "pendente") return "Pendente";
    if (status === "em_analise") return "Em análise";
    if (status === "concluido") return "Concluído";
    return "Novo";
  }

  function statusClass(status: ProcessItem["status"]) {
    if (status === "atrasado") return "badge badge-danger";
    if (status === "pendente") return "badge badge-warning";
    if (status === "concluido") return "badge badge-success";
    return "badge badge-info";
  }

  function rowHighlightClass(item: ProcessItem): string {
    if (isOverdue(item.prazo)) return "row-overdue";
    if (item.urgencia === "critica") return "row-critical";
    if (isUrgentDeadline(item.prazo)) return "row-urgent-deadline";
    return "";
  }

  function urgenciaLabel(urgencia: ProcessItem["urgencia"]): string {
    switch (urgencia) {
      case "critica":
        return "Crítica";
      case "alta":
        return "Alta";
      case "media":
        return "Média";
      default:
        return "Baixa";
    }
  }

  function urgenciaClass(urgencia: ProcessItem["urgencia"]): string {
    return `urgencia-badge urgencia-${urgencia}`;
  }

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      setToken(result.token);
      setUser(result.user);
      const data = await getProcesses(result.token);
      setItems(data);
    } catch {
      setError("Não foi possível autenticar ou carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncSei() {
    if (!token) return;
    setActionError("");
    setSyncLoading(true);
    try {
      const data = await getProcesses(token);
      setItems(data);
    } catch {
      setActionError("Não foi possível sincronizar os processos agora.");
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleImportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !user) return;

    if (!processNumberRaw || !description.trim() || !interessadoNome.trim() || !prazo) {
      setActionError("Preencha número do processo, interessado, descrição e prazo.");
      return;
    }

    setActionError("");
    setImportLoading(true);
    try {
      await createProcess(token, {
        seiRef: processNumberRaw,
        titulo: description.trim(),
        interessadoNome: interessadoNome.trim(),
        interessadoDoc: interessadoDoc.trim() || undefined,
        secretaria: "SERINCCI",
        responsavel: user.name,
        status: "novo",
        urgencia,
        prazo
      });

      const data = await getProcesses(token);
      setItems(data);
      setProcessNumberRaw("");
      setInteressadoNome("");
      setInteressadoDoc("");
      setPrazo(defaultDueDate());
      setUrgencia("media");
      setDescription("");
      setImportOpen(false);
    } catch {
      setActionError("Não foi possível importar o processo neste momento.");
    } finally {
      setImportLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="auth-screen center">
        <section className="card auth-card">
          <h1>GESSEI · Piloto SERINCCI</h1>
          <p>Painel executivo de processos com foco em gestão, SLA e LGPD.</p>
          <label>
            E-mail
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen app-bg">
      <header className="topbar">
        <div>
          <p className="topbar-sub">SERINCCI</p>
          <h1 className="topbar-title">Sistema de Gestão de Processos</h1>
        </div>
        <div className="topbar-user">
          <span>{user.name}</span>
          <span className="user-role">{user.role}</span>
        </div>
      </header>

      <section className="metrics executive-grid">
        <button
          className={`card metric-card critical-alert ${metrics.atrasados > 0 ? "pulse" : ""} ${selectedFilter === "atrasados" ? "filter-active" : ""}`}
          onClick={() => toggleFilter("atrasados")}
        >
          <p>⚠️ Atrasados</p>
          <strong>{metrics.atrasados}</strong>
          {metrics.atrasados > 0 && <span className="alert-badge">AÇÃO IMEDIATA</span>}
        </button>
        <button
          className={`card metric-card urgent-alert ${metrics.proximosVencer > 0 ? "pulse" : ""} ${selectedFilter === "proximosVencer" ? "filter-active" : ""}`}
          onClick={() => toggleFilter("proximosVencer")}
        >
          <p>⏰ Próximos a Vencer</p>
          <strong>{metrics.proximosVencer}</strong>
          {metrics.proximosVencer > 0 && <span className="alert-badge">EM &lt; 3 DIAS</span>}
        </button>
        <button
          className={`card metric-card filter-card ${selectedFilter === "ativos" ? "filter-active filter-blue" : ""}`}
          onClick={() => toggleFilter("ativos")}
        >
          <p>Processos Ativos</p>
          <strong>{metrics.ativos}</strong>
        </button>
        <button
          className={`card metric-card warning-left filter-card ${selectedFilter === "analise" ? "filter-active filter-amber" : ""}`}
          onClick={() => toggleFilter("analise")}
        >
          <p>Em Análise</p>
          <strong>{metrics.atencao}</strong>
        </button>
        <button
          className={`card metric-card filter-card ${selectedFilter === "concluidos" ? "filter-active filter-green" : ""}`}
          onClick={() => toggleFilter("concluidos")}
        >
          <p>Concluídos</p>
          <strong>{metrics.concluidos}</strong>
        </button>
      </section>

      <section className="actions-grid">
        <button className="card action-card" onClick={handleSyncSei} disabled={syncLoading}>
          <span className="action-title">Sincronizar SEI</span>
          <span className="action-subtitle">importa atualização dos processos salvos</span>
          <span className="action-state">{syncLoading ? "Sincronizando..." : "Clique para atualizar"}</span>
        </button>

        <button className="card action-card primary" onClick={() => setImportOpen(true)}>
          <span className="action-title">Nova Importação Processo SEI</span>
          <span className="action-subtitle">Cadastrar processo com número, interessado, prazo e descrição</span>
          <span className="action-state">Abrir formulário</span>
        </button>
      </section>

      {actionError && <p className="error action-error">{actionError}</p>}

      <section className="card table-card">
        <div className="table-header">
          <h2>Tramitação Atual</h2>
          <span className="table-tip">
            {selectedFilter === "todos" ? "Dados do piloto • sincronização simulada" : `Filtro ativo: ${selectedFilter}`}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>SEI</th>
              <th>Título</th>
              <th>Responsável</th>
              <th>Urgência</th>
              <th>Status SLA</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedProcess(item)}
                className={`clickable-row ${rowHighlightClass(item)}`}
              >
                <td className="mono">{item.seiRef ? formatProcessNumber(item.seiRef) : "-"}</td>
                <td>{item.titulo}</td>
                <td>{item.responsavel}</td>
                <td>
                  <span className={urgenciaClass(item.urgencia)}>{urgenciaLabel(item.urgencia)}</span>
                </td>
                <td>
                  <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                </td>
                <td>
                  {new Date(item.prazo).toLocaleDateString("pt-BR")}
                  {isOverdue(item.prazo) && <span className="overdue-warning"> (ATRASADO)</span>}
                  {!isOverdue(item.prazo) && isUrgentDeadline(item.prazo) && (
                    <span className="urgent-warning"> (&lt;3 dias)</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  Nenhum processo encontrado para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="note token">Sessão ativa: {token.slice(0, 18)}...</p>

      {importOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <section className="modal-card">
            <header className="modal-header">
              <h3>Nova Importação Processo SEI</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  if (importLoading) return;
                  setImportOpen(false);
                }}
              >
                ✕
              </button>
            </header>

            <form className="modal-form" onSubmit={handleImportSubmit}>
              <label>
                Número do processo (apenas números)
                <input
                  value={formatProcessNumber(processNumberRaw)}
                  onChange={(event) => setProcessNumberRaw(event.target.value.replace(/\D/g, ""))}
                  placeholder="Ex: 0004000012345202489"
                  inputMode="numeric"
                  required
                />
              </label>

              <label>
                Nome do interessado
                <input
                  value={interessadoNome}
                  onChange={(event) => setInteressadoNome(event.target.value)}
                  placeholder="Ex: Maria da Silva"
                  required
                />
              </label>

              <label>
                CPF/CNPJ do interessado (se houver)
                <input
                  value={interessadoDoc}
                  onChange={(event) => setInteressadoDoc(event.target.value.replace(/[^\d./-]/g, ""))}
                  placeholder="Ex: 123.456.789-00"
                />
              </label>

              <label>
                Prazo
                <input type="date" value={prazo} onChange={(event) => setPrazo(event.target.value)} required />
              </label>

              <label>
                Nível de Urgência
                <select value={urgencia} onChange={(event) => setUrgencia(event.target.value as any)} required>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </label>

              <label>
                Descrição simples
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex: Pedido de vistoria técnica"
                  required
                />
              </label>

              <footer className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    if (importLoading) return;
                    setImportOpen(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={importLoading}>
                  {importLoading ? "Importando..." : "Importar"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {selectedProcess && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <section className="modal-card detail-modal">
            <header className="modal-header dark">
              <div>
                <h3>Processo {selectedProcess.seiRef ? formatProcessNumber(selectedProcess.seiRef) : selectedProcess.id}</h3>
                <p className="detail-sub">Última atualização: {formatDate(selectedProcess.atualizadoEm)}</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setSelectedProcess(null);
                  setShowSensitive(false);
                }}
              >
                ✕
              </button>
            </header>

            <div className="detail-content">
              <section className="lgpd-box">
                <div className="lgpd-top">
                  <h4>Dados do Interessado (LGPD)</h4>
                  <button type="button" className="lgpd-toggle" onClick={() => setShowSensitive((value) => !value)}>
                    {showSensitive ? "Ocultar dados" : "Visualizar dados"}
                  </button>
                </div>

                <div className="lgpd-grid">
                  <div>
                    <span>Nome / Razão Social</span>
                    <strong>{showSensitive ? (selectedProcess.interessadoNome ?? "Não informado") : "DADO PROTEGIDO *******"}</strong>
                  </div>
                  <div>
                    <span>CPF / CNPJ</span>
                    <strong>{showSensitive ? (selectedProcess.interessadoDoc ?? "Não informado") : "***.***.***-**"}</strong>
                  </div>
                </div>

                {showSensitive && (
                  <p className="audit-log">
                    Acesso registrado no log de auditoria: {new Date().toLocaleString("pt-BR")} - usuário {user.email}
                  </p>
                )}
              </section>

              <section className="subject-box">
                <h4>Objeto do Processo</h4>
                <p>{selectedProcess.titulo}</p>
              </section>

              <section className="timeline-box">
                <h4>Tramitação</h4>
                <div className="timeline-line">
                  {buildTimeline(selectedProcess).map((step, index) => (
                    <article key={`${selectedProcess.id}-${step.setor}-${index}`} className="timeline-item">
                      <span className={`timeline-dot ${step.status}`} />
                      <div className="timeline-card">
                        <div className="timeline-head">
                          <strong>{step.setor}</strong>
                          <span>{step.data}</span>
                        </div>
                        <p>{step.msg}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <footer className="modal-actions detail-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setSelectedProcess(null);
                  setShowSensitive(false);
                }}
              >
                Fechar
              </button>
              <button type="button">Enviar Cobrança via SEI</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
