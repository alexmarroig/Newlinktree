-- Remove qualquer botao de download do TCC, independente de maiusculas/minusculas.
WITH removed AS (
  DELETE FROM public.links
  WHERE type = 'download'
    AND (
      COALESCE(label, '') ILIKE '%tcc%'
      OR COALESCE(sublabel, '') ILIKE '%tcc%'
    )
  RETURNING page_id, block_id, position
),
reorder AS (
  SELECT
    links.id,
    COUNT(*) AS removed_before
  FROM public.links AS links
  JOIN removed
    ON links.page_id = removed.page_id
   AND links.block_id IS NOT DISTINCT FROM removed.block_id
   AND links.position > removed.position
  GROUP BY links.id
)
UPDATE public.links AS links
SET position = links.position - reorder.removed_before::int
FROM reorder
WHERE links.id = reorder.id;

-- Remove o card equivalente no bloco "Comece por Aqui", caso exista.
UPDATE public.blocks AS blocks
SET content_json = jsonb_set(
  blocks.content_json,
  '{cards}',
  COALESCE((
    SELECT jsonb_agg(item.card ORDER BY item.ord)
    FROM jsonb_array_elements(blocks.content_json->'cards') WITH ORDINALITY AS item(card, ord)
    WHERE COALESCE(item.card->>'title', '') NOT ILIKE '%tcc%'
  ), '[]'::jsonb)
)
WHERE blocks.type = 'start_here'
  AND jsonb_typeof(blocks.content_json->'cards') = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(blocks.content_json->'cards') AS item(card)
    WHERE COALESCE(item.card->>'title', '') ILIKE '%tcc%'
  );
