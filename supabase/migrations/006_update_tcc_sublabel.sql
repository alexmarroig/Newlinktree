-- Atualiza o texto do botão de download do TCC
-- de "Ansiedade na Contemporaneidade" para
-- "Estudo de uso excessivo de redes sociais".
UPDATE public.links
SET sublabel = regexp_replace(
  sublabel,
  'Ansiedade na Contemporaneidade',
  'Estudo de uso excessivo de redes sociais',
  'gi'
),
    updated_at = now()
WHERE sublabel ILIKE '%Ansiedade na Contemporaneidade%';
