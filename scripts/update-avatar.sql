-- ============================================================
-- Atualizar avatar_url para o perfil da Camila Freitas
-- ============================================================

-- Atualiza todos os perfis que não têm avatar_url definido
UPDATE public.profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
WHERE avatar_url IS NULL OR avatar_url = '';

-- Confirma a atualização
SELECT name, avatar_url FROM public.profiles;
