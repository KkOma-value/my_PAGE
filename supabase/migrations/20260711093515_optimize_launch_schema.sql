create index if not exists checkins_region_city_idx
  on public.checkins (region_id, city_id);

create index if not exists recommendation_snapshots_user_idx
  on public.recommendation_snapshots (user_id);

drop policy if exists "checkins owner select" on public.checkins;
drop policy if exists "checkins public select" on public.checkins;

create policy "checkins authenticated read"
  on public.checkins for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (
      visibility = 'public'
      and publish_status = 'published'
      and moderation_status = 'visible'
      and not exists (
        select 1
        from public.blocks
        where blocker_id = (select auth.uid())
          and blocked_id = checkins.user_id
      )
    )
  );

drop policy if exists "public snapshots read" on public.recommendation_snapshots;
drop policy if exists "personal snapshots read" on public.recommendation_snapshots;

create policy "snapshots authenticated read"
  on public.recommendation_snapshots for select to authenticated
  using (user_id is null or (select auth.uid()) = user_id);
