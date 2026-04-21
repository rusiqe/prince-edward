-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── SCHOOLS ────────────────────────────────────────────────────────────────

create table schools (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  crest_url        text,
  primary_colour   text not null default '#003087',
  secondary_colour text not null default '#FFD700',
  city             text not null,
  region           text not null,
  created_at       timestamptz not null default now()
);

-- ─── USERS ──────────────────────────────────────────────────────────────────

create type user_role as enum (
  'super_admin', 'school_admin', 'teacher', 'parent', 'student', 'alumni'
);

-- extends Supabase auth.users
create table users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  role          user_role not null,
  school_id     uuid references schools(id) on delete set null,
  date_of_birth date,
  push_token    text,
  created_at    timestamptz not null default now()
);

-- ─── STUDENTS ───────────────────────────────────────────────────────────────

create table students (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  dob        date not null,
  grade      text not null,
  class      text not null,
  school_id  uuid not null references schools(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table parent_student (
  parent_id  uuid not null references users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- ─── INVITE CODES ───────────────────────────────────────────────────────────

create table invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  school_id   uuid not null references schools(id) on delete cascade,
  student_ids uuid[] not null default '{}',
  used        boolean not null default false,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ─── ALUMNI ─────────────────────────────────────────────────────────────────

create type alumni_status as enum ('pending', 'approved', 'rejected');

create table alumni (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  school_id       uuid not null references schools(id) on delete cascade,
  graduation_year integer not null,
  status          alumni_status not null default 'pending',
  created_at      timestamptz not null default now()
);

-- ─── EVENTS ─────────────────────────────────────────────────────────────────

create type event_category as enum (
  'academic', 'sport', 'social', 'exam', 'holiday', 'meeting', 'other'
);

create table events (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references schools(id) on delete cascade,
  title         text not null,
  description   text,
  start_at      timestamptz not null,
  end_at        timestamptz not null,
  category      event_category not null default 'other',
  recurrence    jsonb,           -- RecurrenceRule shape
  target_grades text[],         -- null = all grades
  created_by    uuid not null references users(id),
  created_at    timestamptz not null default now()
);

create index events_school_start on events(school_id, start_at);

-- ─── CONTENT MODERATION ─────────────────────────────────────────────────────

create type moderation_status as enum ('pending', 'approved', 'rejected');

create table event_photos (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  url        text not null,
  status     moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  student_id uuid not null references users(id) on delete cascade,
  body       text not null,
  status     moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────

create type announcement_target as enum ('all', 'parents', 'students', 'teachers');

create table announcements (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  title       text not null,
  body        text not null,
  urgent      boolean not null default false,
  target_role announcement_target not null default 'all',
  created_by  uuid not null references users(id),
  created_at  timestamptz not null default now()
);

-- ─── FUNDRAISING CAMPAIGNS ──────────────────────────────────────────────────

create type campaign_status as enum ('active', 'completed', 'cancelled');

create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references schools(id) on delete cascade,
  title         text not null,
  description   text not null,
  goal_amount   numeric(10,2) not null,
  raised_amount numeric(10,2) not null default 0,
  deadline      date not null,
  status        campaign_status not null default 'active',
  created_at    timestamptz not null default now()
);

create table campaign_donations (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid not null references campaigns(id) on delete cascade,
  donor_id         uuid not null references users(id),
  amount           numeric(10,2) not null,
  stripe_payment_id text not null unique,
  anonymous        boolean not null default false,
  message          text,
  created_at       timestamptz not null default now()
);

-- update raised_amount automatically
create or replace function increment_raised_amount()
returns trigger language plpgsql as $$
begin
  update campaigns
  set raised_amount = raised_amount + new.amount
  where id = new.campaign_id;
  return new;
end;
$$;

create trigger on_campaign_donation
  after insert on campaign_donations
  for each row execute function increment_raised_amount();

-- ─── ADS ────────────────────────────────────────────────────────────────────

create type ad_reach as enum ('school', 'city', 'region');

create table ads (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references users(id) on delete cascade,
  school_id     uuid not null references schools(id) on delete cascade,
  business_name text not null,
  logo_url      text,
  description   text not null,
  reach         ad_reach not null default 'school',
  status        moderation_status not null default 'pending',
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

-- ─── DEVELOPER DONATIONS ────────────────────────────────────────────────────

create table developer_donations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id),
  amount           numeric(10,2) not null,
  stripe_payment_id text not null unique,
  created_at       timestamptz not null default now()
);

-- ─── NOTIFICATIONS LOG ──────────────────────────────────────────────────────

create table notifications_log (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references users(id) on delete cascade,
  title    text not null,
  body     text not null,
  data     jsonb,
  sent_at  timestamptz not null default now()
);
