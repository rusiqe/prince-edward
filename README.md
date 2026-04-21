# Prince Edward Daily Calendar

A white-label school calendar and communication app for Android and iOS. Each school gets a branded build (their crest as the app icon) from a single shared codebase.

## What it does

Parents, students, teachers, and alumni at a school use this app to:

- View school events and class timetables
- Receive push notifications for announcements and urgent alerts
- Stay connected to the school community

School admins and teachers manage all content through a web-based admin dashboard.

---

## Who it is for

| User | Access |
|---|---|
| **School Admin** | Full dashboard — events, announcements, users, ads, fundraising campaigns |
| **Teacher** | Create and manage events, moderate student content |
| **Parent** | View calendar, receive push notifications, post business ads (school-moderated) |
| **Student 13+** | View calendar, comment on events, post event photos (moderated) |
| **Student under 13** | View only — no comments or photo posting (age-gate compliance) |
| **Alumni** | View school news, donate to school fundraising campaigns |

---

## Business model

- **Free for schools** — lowers the barrier to adoption; the goal is to reach as many schools as possible
- **Developer donations** — in-app donation flow (Stripe) so the community can support continued development
- **Parent business ads** — parents can advertise their business to other parents in the school network; ads are moderated and approved by the school admin before going live
- **Alumni fundraising** — alumni donate directly to school-created campaigns via Stripe; funds go to the school, not the developer

---

## Multi-tenancy and white-labelling

The app is designed to serve many schools from one codebase. When a school signs up:

1. The developer uploads the school crest, sets the school colours and name in a per-school config file
2. An EAS Build is triggered that produces a uniquely branded APK/IPA for that school
3. The school gets their own app in the app stores with their crest as the icon

This is preferable to a single generic app because each school's identity is preserved in the app store listing.

---

## Tech stack

| Layer | Technology | Reason |
|---|---|---|
| Mobile | React Native + Expo | Cross-platform, strong ecosystem, white-label builds via EAS |
| White-label builds | Expo EAS Build | Per-school config JSON triggers separate branded builds from one repo |
| Backend | Node.js + Supabase | Postgres, Auth, Storage, and Realtime in one service; fast to start, scales well |
| Admin web panel | Next.js | Serves as both the teacher/admin dashboard and a web calendar view |
| Push notifications | Expo Push + FCM/APNS | Single API abstracts both Android and iOS notification delivery |
| Payments | Stripe | Handles developer donations and school campaign donations |
| Image storage | Supabase Storage | Student event photos and business ad images |

PhoneGap/Cordova (the original scaffold) was replaced because it is no longer actively maintained and lacks the ecosystem support needed for push notifications, white-label builds, and a modern developer experience.

---

## Data model (overview)

```
schools              → id, name, crest, colours, city, region, slug
users                → id, email, role, school_id, dob, push_token
students             → id, name, dob, grade, class, school_id
parent_student       → parent_id, student_id  (many-to-many)
invite_codes         → code, school_id, student_ids[], used, expires_at
alumni               → id, user_id, school_id, grad_year, status
events               → id, title, description, start, end, category, recurrence, target_grades, school_id, created_by
event_photos         → id, event_id, student_id, url, status
comments             → id, event_id, student_id, body, status
announcements        → id, title, body, urgent, target_role, school_id, created_by
campaigns            → id, school_id, title, description, goal, raised, deadline, status
campaign_donations   → id, campaign_id, donor_id, amount, stripe_id, anonymous, message
ads                  → id, parent_id, business_name, logo, description, reach, status, expires_at
donations            → id, user_id, amount, stripe_id, created_at
notifications_log    → id, user_id, title, body, sent_at
```

---

## Parent onboarding flow

School admin creates student records and assigns parent emails. Each family receives a unique invite code. The parent signs up using that code and is automatically linked to their children — no manual linking or approval step needed.

---

## Student content moderation

Students aged 13 and over can comment on events and post photos. All student-generated content enters a moderation queue and is reviewed by a teacher or school admin before it becomes visible to others. Students under 13 have view-only access.

---

## Build order

1. Supabase schema and backend API (auth, schools, events, announcements, push)
2. Next.js admin web panel (school admin and teacher dashboard)
3. React Native + Expo mobile app (parent and student views)
4. Developer onboarding portal (white-label config + EAS build trigger)
5. v2 — student social layer, parent business ads, alumni donations

---

## Author

Taurai Rusike — [twitter.com/rusiqe](http://www.twitter.com/rusiqe)
