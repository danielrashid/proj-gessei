# GESSEI (Piloto SERINCCI)

Sistema de gestão executiva de processos, complementar ao SEI, com foco em escalabilidade, segurança e LGPD.

## Objetivo do piloto

- Melhorar visão gerencial de processos (status, prazos, responsáveis e gargalos)
- Reduzir operação em planilhas e retrabalho
- Garantir rastreabilidade e conformidade mínima LGPD desde o início

## Arquitetura inicial

- `apps/api`: API Node.js (TypeScript + Express) com hardening básico
- `apps/web`: Front-end React (Vite + TypeScript) para operação e gestão
- `docs`: diretrizes de arquitetura, LGPD e roadmap

## Requisitos

- Node.js 18+ (recomendado 20+ em produção)
- npm 8+ (funciona com npm 6 usando scripts `--prefix`)

## Executando localmente

1. Copie `apps/api/.env.example` para `apps/api/.env`
2. Copie `apps/web/.env.example` para `apps/web/.env`
3. Instale dependências:

```bash
npm run install:all
```

4. Rode API + Web:

```bash
npm run dev
```

- API: `http://localhost:3333`
- Web: `http://localhost:5173`

## Segurança já aplicada na API

- `helmet` para headers de segurança
- `express-rate-limit` para proteção básica contra abuso
- CORS restritivo por variáveis de ambiente
- Validação de entrada com `zod`
- Autenticação JWT com perfil de acesso (`role`)
- Log estruturado e trilha de auditoria mínima de ações

## Próxima fase recomendada

1. Substituir repositório em memória por PostgreSQL (Prisma)
2. Criar trilha de auditoria persistente e imutável
3. Integrar importação/sincronização com dados do SEI
4. Aplicar MFA e SSO institucional
