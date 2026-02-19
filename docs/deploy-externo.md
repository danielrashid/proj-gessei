# Deploy externo seguro (piloto)

## Objetivo

Publicar o sistema com acesso externo mantendo segurança, rastreabilidade e conformidade.

## Camadas recomendadas

1. Front-end e API atrás de WAF/reverse proxy
2. TLS obrigatório (HTTPS com HSTS)
3. Banco em rede privada (sem exposição pública)
4. Segredos em cofre (Key Vault)

## Controles obrigatórios

- MFA para perfis de gestão e administração
- Limite de tentativas de login e bloqueio temporário
- CORS restrito aos domínios oficiais
- Logs centralizados com retenção e auditoria
- Backup diário com teste de restauração

## Trilha de evolução

1. Piloto em ambiente controlado
2. Hardening de autenticação (SSO + MFA)
3. Publicação gradual por perfis/unidades
4. Revisão de LGPD e segurança a cada ciclo
