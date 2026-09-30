# Messagefy

Projeto SaaS inicial para gestão de contatos, campanhas, mídia e créditos.

## Rodar
1. Node.js 20+
2. `npm install`
3. Copie `.env.example` para `.env.local`
4. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. `npm run dev`

## Supabase
O banco e o bucket `messagefy-media` devem estar configurados conforme os SQLs executados no projeto Supabase.

## Próximas integrações
WhatsApp Business Cloud API, webhooks, pagamentos, filas de envio e painel administrativo.

Nunca coloque chaves secretas no frontend.
