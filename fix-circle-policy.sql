drop policy if exists "Circle owners can add accepted members" on public.circle_members;
drop policy if exists "Accepted users can keep their circle membership" on public.circle_members;
drop policy if exists "Authenticated users can join circles with invite code" on public.circle_members;
create policy "Authenticated users can join circles with invite code" on public.circle_members for insert to authenticated with check (user_id = (select auth.uid()));
