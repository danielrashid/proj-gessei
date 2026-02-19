# Arquitetura - Piloto SERINCCI

## Contexto

O sistema nasce como camada de gestão sobre o fluxo operacional que permanece no SEI.

## Princípios

- Evolução incremental orientada a valor
- Segurança por padrão
- LGPD by design
- Escalabilidade horizontal na API
- Observabilidade desde o piloto

## Componentes

- Front-end Web (React): operação e visão executiva
- API (Node.js): regras de negócio, autenticação e auditoria
- Banco de dados (fase 2): PostgreSQL
- Integrações (fase 2): importadores de dados SEI

## Estratégia de implantação

1. Piloto SERINCCI com escopo controlado e usuários-chave
2. Medição de SLA, tempo de ciclo e satisfação
3. Hardening + expansão para demais secretarias
