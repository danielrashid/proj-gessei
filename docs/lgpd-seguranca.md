# LGPD e Segurança - Diretrizes Iniciais

## Controles mínimos

- Minimização de dados pessoais
- Definição de base legal por tipo de processo
- Controle de acesso por perfil (RBAC)
- Criptografia em trânsito (TLS obrigatório em produção)
- Registro de auditoria para ações críticas
- Política de retenção e descarte

## Dados sensíveis

- Evitar dados sensíveis quando não estritamente necessários
- Se necessário, aplicar classificação e restrição por função

## Operação segura

- Segredos em cofre (Azure Key Vault na fase cloud)
- Rotação de chaves e tokens
- Backups com testes de restauração
- Plano de resposta a incidentes
