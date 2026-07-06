-- 0006_blog_images_bucket — Stockage des images de blog.
-- Bucket PUBLIC (les images s'affichent sur le site) pour :
--   • les couvertures d'article ;
--   • les illustrations insérées pendant la rédaction (aperçu live côté admin).
-- Lecture publique ; écriture/màj/suppression réservées aux administrateurs (is_admin()).
-- L'éditeur de blog retombe automatiquement sur l'insertion par URL tant que ce
-- bucket n'existe pas — cette migration active simplement l'upload direct.

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Lecture publique des objets du bucket.
drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Écriture réservée aux admins.
drop policy if exists "blog_images_admin_insert" on storage.objects;
create policy "blog_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "blog_images_admin_update" on storage.objects;
create policy "blog_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "blog_images_admin_delete" on storage.objects;
create policy "blog_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and public.is_admin());
