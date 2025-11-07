# Festify Database Schema - Visual Reference

## 🗂️ Complete Table Structure

### 1. **profiles** (User Accounts)
```
┌─────────────────────────────────────┐
│ profiles                            │
├─────────────────────────────────────┤
│ id                  UUID PK         │ → References auth.users
│ email               TEXT UNIQUE     │
│ full_name           TEXT            │
│ role                user_role       │ → 'admin' | 'attendee' | 'organizer'
│ avatar_url          TEXT?           │
│ phone               TEXT?           │
│ bio                 TEXT?           │
│ organization_name   TEXT?           │
│ website             TEXT?           │
│ college_id          UUID?           │ → FK: colleges.id
│ created_at          TIMESTAMPTZ     │
│ updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘
```

### 2. **colleges** (Universities/Colleges)
```
┌─────────────────────────────────────┐
│ colleges                            │
├─────────────────────────────────────┤
│ id                  UUID PK         │
│ name                TEXT UNIQUE     │
│ location            TEXT            │
│ description         TEXT?           │
│ logo_url            TEXT?           │
│ website             TEXT?           │
│ established_year    INTEGER?        │
│ contact_email       TEXT?           │
│ contact_phone       TEXT?           │
│ created_at          TIMESTAMPTZ     │
│ updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘
```

### 3. **categories** (Event Categories)
```
┌─────────────────────────────────────┐
│ categories                          │
├─────────────────────────────────────┤
│ id                  UUID PK         │
│ name                TEXT UNIQUE     │
│ description         TEXT?           │
│ icon_name           TEXT?           │
│ created_at          TIMESTAMPTZ     │
│ updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘

Seed Data:
  • Tech
  • Cultural
  • Sports
  • Workshop
  • Seminar
```

### 4. **events** (Main Event Information)
```
┌──────────────────────────────────────────────┐
│ events                                       │
├──────────────────────────────────────────────┤
│ id                        UUID PK            │
│ title                     TEXT               │
│ description               TEXT               │
│ organizer_id              UUID               │ → FK: profiles.id
│ college_id                UUID?              │ → FK: colleges.id
│ category_id               UUID               │ → FK: categories.id
│ event_status              event_status       │ → 'draft' | 'published' | 'cancelled' | 'completed'
│ participation_type        participation_type │ → 'individual' | 'team' | 'both'
│ team_size_min             INTEGER?           │
│ team_size_max             INTEGER?           │
│ start_date                TIMESTAMPTZ        │
│ end_date                  TIMESTAMPTZ        │
│ location                  TEXT               │
│ venue_details             TEXT?              │
│ image_url                 TEXT?              │
│ max_attendees             INTEGER?           │
│ current_attendees         INTEGER            │ → Auto-updated
│ registration_deadline     TIMESTAMPTZ?       │
│ is_featured               BOOLEAN            │
│ is_global                 BOOLEAN            │ → true=everyone, false=college only
│ tags                      TEXT[]             │
│ ━━━━━━ Pricing Fields ━━━━━━               │
│ individual_price          DECIMAL(10,2)      │
│ team_base_price           DECIMAL(10,2)      │
│ price_per_member          DECIMAL(10,2)      │
│ has_custom_team_pricing   BOOLEAN            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│ created_at                TIMESTAMPTZ        │
│ updated_at                TIMESTAMPTZ        │
└──────────────────────────────────────────────┘
```

### 5. **team_pricing_tiers** (Custom Team Pricing)
```
┌─────────────────────────────────────┐
│ team_pricing_tiers                  │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ event_id        UUID                │ → FK: events.id
│ min_members     INTEGER             │
│ max_members     INTEGER             │
│ price           DECIMAL(10,2)       │
│ created_at      TIMESTAMPTZ         │
└─────────────────────────────────────┘

Example:
  Event has custom tiers:
  • 2-3 members: ₹1200
  • 4-5 members: ₹2000
  • 6-8 members: ₹2800
```

### 6. **registrations** (Event Registrations)
```
┌──────────────────────────────────────────────┐
│ registrations                                │
├──────────────────────────────────────────────┤
│ id                        UUID PK            │
│ event_id                  UUID               │ → FK: events.id
│ user_id                   UUID               │ → FK: profiles.id
│ registration_status       registration_status│ → 'pending' | 'confirmed' | 'cancelled' | 'attended'
│ registration_date         TIMESTAMPTZ        │
│ attended_at               TIMESTAMPTZ?       │
│ notes                     TEXT?              │
│ ━━━━━━ Team Fields ━━━━━━                   │
│ is_team                   BOOLEAN            │ → false=individual, true=team
│ team_size                 INTEGER            │
│ team_name                 TEXT?              │
│ team_leader_name          TEXT?              │
│ team_leader_phone         TEXT?              │
│ team_leader_email         TEXT?              │
│ team_leader_university_reg TEXT?             │
│ ━━━━━━ Payment Fields ━━━━━━                │
│ payment_status            payment_status     │ → 'pending' | 'completed' | etc.
│ payment_amount            DECIMAL(10,2)      │
│ payment_method            TEXT?              │ → 'razorpay' | 'stripe' | 'bypass'
│ transaction_id            TEXT?              │
│ paid_at                   TIMESTAMPTZ?       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━       │
│ created_at                TIMESTAMPTZ        │
│ updated_at                TIMESTAMPTZ        │
└──────────────────────────────────────────────┘

UNIQUE: (event_id, user_id) - One registration per user per event
```

### 7. **teams** (Detailed Team Information)
```
┌─────────────────────────────────────┐
│ teams                               │
├─────────────────────────────────────┤
│ id                      UUID PK     │
│ registration_id         UUID UNIQUE │ → FK: registrations.id
│ team_name               TEXT        │
│ team_leader_id          UUID?       │ → FK: profiles.id
│ team_leader_name        TEXT        │
│ team_leader_phone       TEXT?       │
│ team_leader_email       TEXT?       │
│ team_leader_university_reg TEXT?    │
│ event_id                UUID        │ → FK: events.id
│ created_at              TIMESTAMPTZ │
│ updated_at              TIMESTAMPTZ │
└─────────────────────────────────────┘
```

### 8. **team_members** (Individual Team Members)
```
┌─────────────────────────────────────┐
│ team_members                        │
├─────────────────────────────────────┤
│ id                          UUID PK │
│ team_id                     UUID    │ → FK: teams.id
│ member_name                 TEXT    │
│ member_email                TEXT?   │
│ member_phone                TEXT?   │
│ university_registration_number TEXT?│
│ is_leader                   BOOLEAN │ → true for team leader
│ joined_at                   TIMESTAMPTZ │
└─────────────────────────────────────┘
```

### 9. **tickets** (Event Tickets)
```
┌─────────────────────────────────────┐
│ tickets                             │
├─────────────────────────────────────┤
│ id                  UUID PK         │
│ event_id            UUID            │ → FK: events.id
│ registration_id     UUID?           │ → FK: registrations.id
│ ticket_type         ticket_type     │ → 'free' | 'paid' | 'vip' | 'early_bird'
│ price               DECIMAL(10,2)   │
│ ticket_code         TEXT UNIQUE     │ → QR code data
│ is_valid            BOOLEAN         │
│ issued_at           TIMESTAMPTZ     │
│ used_at             TIMESTAMPTZ?    │
│ created_at          TIMESTAMPTZ     │
│ updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘
```

### 10. **payments** (Payment Records)
```
┌─────────────────────────────────────┐
│ payments                            │
├─────────────────────────────────────┤
│ id                  UUID PK         │
│ registration_id     UUID            │ → FK: registrations.id
│ ticket_id           UUID?           │ → FK: tickets.id
│ amount              DECIMAL(10,2)   │
│ payment_status      payment_status  │
│ payment_method      TEXT?           │
│ transaction_id      TEXT?           │
│ payment_date        TIMESTAMPTZ?    │
│ created_at          TIMESTAMPTZ     │
│ updated_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘
```

### 11. **event_updates** (Announcements)
```
┌─────────────────────────────────────┐
│ event_updates                       │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ event_id        UUID                │ → FK: events.id
│ title           TEXT                │
│ content         TEXT                │
│ posted_by       UUID                │ → FK: profiles.id
│ created_at      TIMESTAMPTZ         │
│ updated_at      TIMESTAMPTZ         │
└─────────────────────────────────────┘
```

### 12. **reviews** (Event Reviews)
```
┌─────────────────────────────────────┐
│ reviews                             │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ event_id        UUID                │ → FK: events.id
│ user_id         UUID                │ → FK: profiles.id
│ rating          INTEGER             │ → 1-5 stars
│ comment         TEXT?               │
│ created_at      TIMESTAMPTZ         │
│ updated_at      TIMESTAMPTZ         │
└─────────────────────────────────────┘

UNIQUE: (event_id, user_id) - One review per user per event
```

### 13. **favorites** (Saved Events)
```
┌─────────────────────────────────────┐
│ favorites                           │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ user_id         UUID                │ → FK: profiles.id
│ event_id        UUID                │ → FK: events.id
│ created_at      TIMESTAMPTZ         │
└─────────────────────────────────────┘

UNIQUE: (user_id, event_id)
```

### 14. **notifications** (User Notifications)
```
┌─────────────────────────────────────┐
│ notifications                       │
├─────────────────────────────────────┤
│ id                  UUID PK         │
│ user_id             UUID            │ → FK: profiles.id
│ title               TEXT            │
│ message             TEXT            │
│ notification_type   notification_type│
│ read                BOOLEAN         │
│ link                TEXT?           │
│ event_id            UUID?           │ → FK: events.id
│ registration_id     UUID?           │ → FK: registrations.id
│ team_id             UUID?           │ → FK: teams.id
│ action_url          TEXT?           │
│ created_at          TIMESTAMPTZ     │
└─────────────────────────────────────┘
```

## 🔗 Relationship Diagram

```
                   ┌────────────┐
                   │   auth     │
                   │   .users   │
                   └──────┬─────┘
                          │
                    ┌─────▼─────┐
           ┌────────┤ profiles  │◄─────┐
           │        └─────┬─────┘      │
           │              │            │
    ┌──────▼──────┐       │     ┌──────┴──────┐
    │  colleges   │       │     │ categories  │
    └──────┬──────┘       │     └──────┬──────┘
           │              │            │
           │        ┌─────▼─────┐      │
           └────────►   events  ◄──────┘
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐   ┌─────▼──────┐  ┌────▼────────┐
    │team_pricing│   │registrations│  │event_updates│
    │   _tiers   │   └─────┬───────┘  └─────────────┘
    └────────────┘         │
                ┌──────────┼──────────┐
                │          │          │
         ┌──────▼───┐  ┌───▼────┐ ┌──▼─────┐
         │  teams   │  │tickets │ │payments│
         └──────┬───┘  └────────┘ └────────┘
                │
         ┌──────▼───────┐
         │ team_members │
         └──────────────┘

    Additional:
    - reviews (from profiles + events)
    - favorites (from profiles + events)
    - notifications (from profiles + events/registrations/teams)
```

## 📊 Data Flow Examples

### Individual Registration Flow
```
1. User browses events
   └─→ Query: events (WHERE event_status = 'published')

2. User registers
   └─→ INSERT: registrations
       ├─ is_team = false
       ├─ team_size = 1
       └─ payment_amount = individual_price

3. Calculate price
   └─→ Function: calculate_registration_price(event_id, false, 1)
       └─→ Returns: events.individual_price

4. Process payment
   └─→ UPDATE: registrations
       ├─ payment_status = 'completed'
       ├─ transaction_id = 'xxx'
       └─ paid_at = NOW()

5. Generate ticket
   └─→ INSERT: tickets
       └─ ticket_code = QR code data

6. Create notification
   └─→ INSERT: notifications
       └─ type = 'registration_confirmed'
```

### Team Registration Flow
```
1. User registers as team
   └─→ INSERT: registrations
       ├─ is_team = true
       ├─ team_size = 4
       ├─ team_name = 'Team Alpha'
       └─ team_leader_name/email/phone/university_reg

2. Calculate team price
   └─→ Function: calculate_registration_price(event_id, true, 4)
       ├─ If has_custom_team_pricing:
       │  └─→ Query: team_pricing_tiers (WHERE team_size BETWEEN min/max)
       └─ Else:
          └─→ team_base_price + (team_size × price_per_member)

3. Create team record
   └─→ Function: create_team_with_members(...)
       ├─→ INSERT: teams
       │   └─ registration_id, team_name, leader info, event_id
       └─→ INSERT: team_members (for each member)
           ├─ Leader (is_leader = true)
           └─ Other members (is_leader = false)

4. Process payment & ticket
   (Same as individual)
```

## 🔐 Row Level Security Summary

### Public Access (No Auth Required)
- ✅ View published events
- ✅ View categories
- ✅ View colleges
- ✅ View public profiles

### Authenticated Users
- ✅ Create registrations (for themselves)
- ✅ View own registrations
- ✅ View own tickets
- ✅ View own payments
- ✅ Update own profile
- ✅ Manage own favorites
- ✅ View own notifications

### Organizers
- ✅ Create events
- ✅ Update/delete own events
- ✅ View all registrations for their events
- ✅ View all teams for their events
- ✅ Post event updates
- ✅ Manage pricing tiers

### Admins
- ✅ Full access to all tables
- ✅ Manage categories
- ✅ Manage colleges
- ✅ View all data

## 🎯 Key Indexes

Performance optimizations:
- `events.organizer_id` - Fast organizer queries
- `events.category_id` - Fast category filtering
- `events.start_date` - Fast date sorting
- `registrations.event_id` - Fast registration lookups
- `registrations.user_id` - Fast user registrations
- `teams.registration_id` - Fast team queries
- `team_members.team_id` - Fast member lookups
- `notifications.user_id` - Fast notification queries

---

**Schema Version:** 1.0.0  
**Last Updated:** November 7, 2024  
**Compatible With:** Festify Frontend (all versions)
