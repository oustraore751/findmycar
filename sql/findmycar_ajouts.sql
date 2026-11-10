-- FindMyCar - tables et règles de sécurité ajoutées au projet de base
-- (profiles, voitures, locations et le trigger handle_new_user existent déjà).
--
-- À lancer dans Supabase > SQL Editor.
-- Le script peut être relancé sans problème : il ne crée rien en double.


-- Fonction qui dit si la personne connectée est admin.
-- "security definer" pour qu'elle puisse lire profiles même avec la RLS activée.
create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;


-- ===================== Voitures =====================
-- Tout le monde peut voir le catalogue (règle déjà présente dans le projet de base).
-- L'admin peut en plus voir les voitures indisponibles et gérer le parc.

drop policy if exists "voitures : lecture admin" on public.voitures;
create policy "voitures : lecture admin"
    on public.voitures for select
    to authenticated
    using (public.est_admin());

drop policy if exists "voitures : ajout admin" on public.voitures;
create policy "voitures : ajout admin"
    on public.voitures for insert
    to authenticated
    with check (public.est_admin());

drop policy if exists "voitures : modification admin" on public.voitures;
create policy "voitures : modification admin"
    on public.voitures for update
    to authenticated
    using (public.est_admin())
    with check (public.est_admin());

drop policy if exists "voitures : suppression admin" on public.voitures;
create policy "voitures : suppression admin"
    on public.voitures for delete
    to authenticated
    using (public.est_admin());


-- ===================== Photos des voitures =====================
-- Une ligne par photo. La photo avec le plus petit "ordre" est la photo principale.

create table if not exists public.voitures_photos (
    id         bigint generated always as identity primary key,
    voiture_id bigint not null references public.voitures (id) on delete cascade,
    url        text   not null,
    ordre      int    not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists voitures_photos_voiture_idx
    on public.voitures_photos (voiture_id, ordre);

alter table public.voitures_photos enable row level security;

drop policy if exists "photos : lecture publique" on public.voitures_photos;
create policy "photos : lecture publique"
    on public.voitures_photos for select
    to anon, authenticated
    using (true);

drop policy if exists "photos : gestion admin" on public.voitures_photos;
create policy "photos : gestion admin"
    on public.voitures_photos for all
    to authenticated
    using (public.est_admin())
    with check (public.est_admin());


-- Les fichiers sont rangés dans le bucket "voitures" (public pour que tout le monde voie les images).
-- 5 Mo max par fichier, images seulement.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voitures', 'voitures', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
    set allowed_mime_types = excluded.allowed_mime_types,
        file_size_limit    = excluded.file_size_limit;

-- seul l'admin peut envoyer, remplacer ou supprimer des fichiers
drop policy if exists "photos storage : lecture admin" on storage.objects;
create policy "photos storage : lecture admin"
    on storage.objects for select
    to authenticated
    using (bucket_id = 'voitures' and public.est_admin());

drop policy if exists "photos storage : envoi admin" on storage.objects;
create policy "photos storage : envoi admin"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'voitures' and public.est_admin());

drop policy if exists "photos storage : modification admin" on storage.objects;
create policy "photos storage : modification admin"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'voitures' and public.est_admin());

drop policy if exists "photos storage : suppression admin" on storage.objects;
create policy "photos storage : suppression admin"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'voitures' and public.est_admin());


-- ===================== Messages de contact =====================

create table if not exists public.messages_contact (
    id         bigint generated always as identity primary key,
    nom        text not null check (char_length(nom)     between 1 and 100),
    email      text not null check (char_length(email)   between 3 and 200),
    sujet      text not null check (char_length(sujet)   between 1 and 150),
    contenu    text not null check (char_length(contenu) between 1 and 2000),
    user_id    uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.messages_contact enable row level security;

-- un client connecté peut envoyer un message, mais seulement à son nom
drop policy if exists "contact : envoi par tous" on public.messages_contact;   -- ancienne règle
drop policy if exists "contact : envoi par les connectés" on public.messages_contact;
create policy "contact : envoi par les connectés"
    on public.messages_contact for insert
    to authenticated
    with check (user_id = auth.uid());

drop policy if exists "contact : lecture admin" on public.messages_contact;
create policy "contact : lecture admin"
    on public.messages_contact for select
    to authenticated
    using (public.est_admin());

drop policy if exists "contact : suppression admin" on public.messages_contact;
create policy "contact : suppression admin"
    on public.messages_contact for delete
    to authenticated
    using (public.est_admin());


-- L'ancienne colonne image_url a été remplacée par la table voitures_photos
alter table public.voitures drop column if exists image_url;
