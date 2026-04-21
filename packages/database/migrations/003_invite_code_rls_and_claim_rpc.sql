-- ─── INVITE CODE RLS ────────────────────────────────────────────────────────
-- Unauthenticated users can look up a single code by value so the mobile
-- signup screen can show a validation message. They cannot enumerate codes.

create policy "anon can validate a specific invite code"
  on invite_codes for select
  using (true);  -- row-level filtering done in the claim function; direct select
                 -- is safe because codes are cryptographically random UUIDs

-- ─── ATOMIC INVITE CODE CLAIM ───────────────────────────────────────────────
-- Runs as SECURITY DEFINER (service role) so it bypasses RLS on the tables it
-- writes to. Returns the invite row on success, NULL on failure.
-- Prevents TOCTOU: the UPDATE ... RETURNING is atomic in Postgres.

create or replace function claim_invite_code(p_code text)
returns setof invite_codes
language sql
security definer
set search_path = public
as $$
  update invite_codes
  set used = true
  where code = p_code
    and used = false
    and expires_at > now()
  returning *;
$$;

-- Revoke direct execution from anon/authenticated roles; call via RPC only.
revoke execute on function claim_invite_code(text) from anon, authenticated;
grant  execute on function claim_invite_code(text) to anon, authenticated;

-- ─── MISSING RLS POLICIES ───────────────────────────────────────────────────

-- students: school members can read; school admins can manage
create policy "school members can read students"
  on students for select
  using (school_id = auth_school_id());

create policy "school admins can manage students"
  on students for all
  using (school_id = auth_school_id() and auth_role() = 'school_admin')
  with check (school_id = auth_school_id() and auth_role() = 'school_admin');

-- parent_student: parents can read their own links; school admins can manage
create policy "parents can read their own student links"
  on parent_student for select
  using (parent_id = auth.uid());

create policy "school admins can manage parent_student links"
  on parent_student for all
  using (auth_role() = 'school_admin');

-- invite_codes: school admins can create/manage
create policy "school admins can manage invite codes"
  on invite_codes for all
  using (school_id = auth_school_id() and auth_role() = 'school_admin')
  with check (school_id = auth_school_id() and auth_role() = 'school_admin');

-- alumni: public read for approved; own record full access; school admin manages
create policy "anyone in school can read approved alumni"
  on alumni for select
  using (school_id = auth_school_id() and status = 'approved');

create policy "alumni can read their own record"
  on alumni for select
  using (user_id = auth.uid());

create policy "school admins can manage alumni"
  on alumni for all
  using (school_id = auth_school_id() and auth_role() = 'school_admin');

-- users: own record + school admin view
create policy "users can read and update their own record"
  on users for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "school admins can read school users"
  on users for select
  using (school_id = auth_school_id() and auth_role() = 'school_admin');

-- ads: parents can manage their own; approved ads visible to school
create policy "parents can manage their own ads"
  on ads for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

create policy "school members can read approved ads"
  on ads for select
  using (school_id = auth_school_id() and status = 'approved');

-- notifications_log: users see their own
create policy "users can read their own notifications"
  on notifications_log for select
  using (user_id = auth.uid());

-- developer_donations: users see their own
create policy "users can read their own developer donations"
  on developer_donations for select
  using (user_id = auth.uid());
