-- Pacotes comerciais do Messagefy + suporte ao carrinho.
-- Execute no Supabase SQL Editor.

UPDATE public.credit_packages SET name='Inicial', credits=100, price=10.00, description='100 créditos para começar', active=true, featured=false WHERE name='Essencial' OR name='Inicial';
UPDATE public.credit_packages SET name='Básico', credits=250, price=19.90, description='250 créditos para campanhas menores', active=true, featured=false WHERE name='Profissional' OR name='Básico';
INSERT INTO public.credit_packages (name, credits, price, description, active, featured) SELECT 'Business',1500,79.90,'1.500 créditos para uso recorrente',true,true WHERE NOT EXISTS (SELECT 1 FROM public.credit_packages WHERE name='Business');
UPDATE public.credit_packages SET credits=1500, price=79.90, description='1.500 créditos para uso recorrente', active=true, featured=true WHERE name='Business';

INSERT INTO public.credit_packages (name, credits, price, description, active, featured)
SELECT 'Profissional', 600, 39.90, '600 créditos para campanhas frequentes', true, false
WHERE NOT EXISTS (SELECT 1 FROM public.credit_packages WHERE name='Profissional');

UPDATE public.credit_packages SET credits=600, price=39.90, description='600 créditos para campanhas frequentes', active=true, featured=false WHERE name='Profissional';

INSERT INTO public.credit_packages (name, credits, price, description, active, featured)
SELECT 'Premium', 2500, 119.90, '2.500 créditos para maior volume', true, false
WHERE NOT EXISTS (SELECT 1 FROM public.credit_packages WHERE name='Premium');

UPDATE public.credit_packages SET credits=2500, price=119.90, description='2.500 créditos para maior volume', active=true, featured=false WHERE name='Premium';

UPDATE public.credit_packages SET active=false, featured=false WHERE name='Teste';

ALTER TABLE public.panterapay_payments ALTER COLUMN package_id DROP NOT NULL;
ALTER TABLE public.panterapay_payments ADD COLUMN IF NOT EXISTS items jsonb;

NOTIFY pgrst, 'reload schema';
