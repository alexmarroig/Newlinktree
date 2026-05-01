-- Remove o botao de download do TCC da pagina publica.
WITH removed AS (
  DELETE FROM public.links
  WHERE label = 'Baixar meu TCC'
    AND type = 'download'
  RETURNING page_id, block_id, position
),
affected AS (
  SELECT
    page_id,
    block_id,
    MIN(position) AS removed_position,
    COUNT(*) AS removed_count
  FROM removed
  GROUP BY page_id, block_id
)
UPDATE public.links AS links
SET position = links.position - affected.removed_count::int
FROM affected
WHERE links.page_id = affected.page_id
  AND links.block_id IS NOT DISTINCT FROM affected.block_id
  AND links.position > affected.removed_position;

-- Remove o card equivalente no bloco "Comece por Aqui", caso exista.
UPDATE public.blocks AS blocks
SET content_json = jsonb_set(
  blocks.content_json,
  '{cards}',
  COALESCE((
    SELECT jsonb_agg(item.card ORDER BY item.ord)
    FROM jsonb_array_elements(blocks.content_json->'cards') WITH ORDINALITY AS item(card, ord)
    WHERE item.card->>'title' <> 'Baixar meu TCC'
  ), '[]'::jsonb)
)
WHERE blocks.type = 'start_here'
  AND jsonb_typeof(blocks.content_json->'cards') = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(blocks.content_json->'cards') AS item(card)
    WHERE item.card->>'title' = 'Baixar meu TCC'
  );
