-- RLS: users can only read data belonging to their school
-- Super admins bypass all policies via service role key

alter table schools enable row level security;
alter table users enable row level security;
alter table students enable row level security;
alter table parent_student enable row level security;
alter table invite_codes enable row level security;
alter table alumni enable row level security;
alter table events enable row level security;
alter table event_photos enable row level security;
alter table comments enable row level security;
alter table announcements enable row level security;
alter table campaigns enable row level security;
alter table campaign_donations enable row level security;
alter table ads enable row level security;
alter table notifications_log enable row level security;

-- helper: get the current user's school_id
create or replace function auth_school_id()
returns uuid language sql stable as $$
  select school_id from users where id = auth.uid()
$$;

-- helper: get the current user's role
create or replace function auth_role()
returns user_role language sql stable as $$
  select role from users where id = auth.uid()
$$;

-- ─── SCHOOLS ────────────────────────────────────────────────────────────────

create policy "school admins can manage their school"
  on schools for all
  using (id = auth_school_id() and auth_role() in ('school_admin'))
  with check (id = auth_school_id() and auth_role() in ('school_admin'));

create policy "authenticated users can read their school"
  on schools for select
  using (id = auth_school_id());

-- ─── EVENTS ─────────────────────────────────────────────────────────────────

create policy "school members can read events"
  on events for select
  using (school_id = auth_school_id());

create policy "teachers and admins can manage events"
  on events for all
  using (school_id = auth_school_id() and auth_role() in ('school_admin', 'teacher'))
  with check (school_id = auth_school_id() and auth_role() in ('school_admin', 'teacher'));

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────

create policy "school members can read announcements"
  on announcements for select
  using (school_id = auth_school_id());

create policy "admins and teachers can manage announcements"
  on announcements for all
  using (school_id = auth_school_id() and auth_role() in ('school_admin', 'teacher'))
  with check (school_id = auth_school_id() and auth_role() in ('school_admin', 'teacher'));

-- ─── STUDENT CONTENT ────────────────────────────────────────────────────────

-- approved photos are visible to school members; pending/rejected only to uploader + admins
create policy "school members can read approved photos"
  on event_photos for select
  using (
    status = 'approved' or
    student_id = auth.uid() or
    auth_role() in ('school_admin', 'teacher')
  );

create policy "students can post photos"
  on event_photos for insert
  with check (student_id = auth.uid() and auth_role() = 'student');

create policy "admins and teachers can moderate photos"
  on event_photos for update
  using (auth_role() in ('school_admin', 'teacher'));

create policy "school members can read approved comments"
  on comments for select
  using (
    status = 'approved' or
    student_id = auth.uid() or
    auth_role() in ('school_admin', 'teacher')
  );

create policy "students can post comments"
  on comments for insert
  with check (student_id = auth.uid() and auth_role() = 'student');

create policy "admins and teachers can moderate comments"
  on comments for update
  using (auth_role() in ('school_admin', 'teacher'));

-- ─── CAMPAIGNS ──────────────────────────────────────────────────────────────

create policy "school members can read campaigns"
  on campaigns for select
  using (school_id = auth_school_id());

create policy "school admins can manage campaigns"
  on campaigns for all
  using (school_id = auth_school_id() and auth_role() = 'school_admin')
  with check (school_id = auth_school_id() and auth_role() = 'school_admin');

create policy "authenticated users can donate"
  on campaign_donations for insert
  with check (donor_id = auth.uid());

create policy "donors and admins can read donations"
  on campaign_donations for select
  using (
    donor_id = auth.uid() or
    auth_role() in ('school_admin', 'super_admin')
  );
