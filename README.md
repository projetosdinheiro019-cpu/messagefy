# Messagefy — redesign visual

Esta versão redesenha a interface do Messagefy com foco em aparência SaaS premium, sem usar imagens geradas.

## Principais mudanças
- Nova identidade visual e logotipo em SVG, integrado diretamente no código.
- Sidebar e navegação redesenhadas.
- Topbar com status do sistema e ação de nova campanha.
- Cards, tabelas, formulários, botões, carrinho e área PIX com novo visual.
- Login e cadastro redesenhados.
- Responsividade para desktop e telas menores.
- Ícones vetoriais inline, sem biblioteca externa e sem imagens.
- Mantida a integração existente com Supabase e PanteraPay.
- Mantido o carrinho de créditos.
- Campanhas continuam usando grupo de destino.

## Pacotes comerciais
Execute `supabase_credits_cart.sql` no SQL Editor do Supabase para aplicar os pacotes:
- Inicial — R$ 10,00 — 100 créditos
- Básico — R$ 19,90 — 250 créditos
- Profissional — R$ 39,90 — 600 créditos
- Business — R$ 79,90 — 1.500 créditos
- Premium — R$ 119,90 — 2.500 créditos

## Deploy
Não altere as variáveis secretas existentes. Suba o conteúdo deste projeto para o repositório e deixe o Vercel fazer um novo deploy.
