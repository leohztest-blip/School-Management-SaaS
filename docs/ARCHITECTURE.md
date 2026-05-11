# SHIKSHA ERP — Phase 2 Architecture & Scaling Guide

> Enterprise-grade multi-tenant School ERP SaaS — Architecture Reference for Phase 2

---

## 1. MULTI-BRANCH ARCHITECTURE

### Data Model
```
schools (tenant root)
  └── branches (branch_id partitioning)
        ├── staff (branch_staff pivot)
        ├── classes → sections
        ├── students
        ├── attendance
        └── analytics_snapshots (branch-level)
```

### Branch Isolation Strategy
- Every `branch_id` is scoped under `school_id`
- RLS policies enforce `school_id` isolation at PostgreSQL level
- Branch-level queries always include both `school_id` AND `branch_id`
- Branch admins can only see their own branch data
- School owners see across all branches

### Branch Permission Matrix
| Action | School Owner | Branch Admin | Teacher |
|--------|-------------|--------------|---------|
| View all branches | ✅ | ❌ Own only | ❌ |
| Cross-branch reports | ✅ | ❌ | ❌ |
| Transfer students | ✅ | ✅ (with approval) | ❌ |
| Branch finance | ✅ | ✅ Own only | ❌ |

---

## 2. DATABASE SCALING STRATEGY

### Partitioning Plan
| Table | Partition Key | Strategy |
|-------|--------------|----------|
| `attendance` | `date` | RANGE by month/year |
| `message_logs` | `created_at` | RANGE by quarter |
| `activity_logs` | `created_at` | RANGE by year |
| `ledger` | `entry_date` | RANGE by year |
| `analytics_snapshots` | `snapshot_date` | RANGE by year |

### Indexing Strategy
```sql
-- Critical hot-path indexes
CREATE INDEX CONCURRENTLY idx_students_school_active
  ON students(school_id, is_active, deleted_at)
  WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_attendance_school_date
  ON attendance(school_id, date DESC);

CREATE INDEX CONCURRENTLY idx_invoices_school_status
  ON invoices(school_id, status, due_date)
  WHERE status IN ('unpaid', 'partial', 'overdue');

CREATE INDEX CONCURRENTLY idx_payments_school_date
  ON payments(school_id, payment_date DESC);

-- Full-text search
CREATE INDEX CONCURRENTLY idx_students_name_fts
  ON students USING GIN(to_tsvector('simple', full_name));
```

### Connection Pooling
- Use Supabase connection pooler (PgBouncer) in transaction mode
- Configure `POOL_SIZE=20` per service
- Separate read replicas for analytics queries (Supabase read replicas)

---

## 3. SAAS BILLING ARCHITECTURE

### Plan Enforcement Flow
```
Request → Middleware → check_feature_gate()
  → query subscriptions + plan_features
  → compare usage_metrics vs limits
  → 402 Payment Required if over limit
  → proceed if within limits
```

### Usage Tracking
- `usage_metrics` table updated daily via cron job
- Enforced at: student creation, staff creation, branch creation, storage upload
- Soft limits: warn at 80%, hard block at 100%
- Grace period: 7 days before service suspension

### Billing Events
```
School signs up → trial subscription (14 days)
Trial expires → downgrade to free OR upgrade prompt
Subscription payment → saas_invoice generated
Payment confirmed → subscription extended
Addon purchased → addon_purchases record + usage limit updated
```

### Revenue Metrics Tracked
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate (schools that cancel/downgrade)
- ARPU (Average Revenue Per User/School)
- LTV (Lifetime Value estimation)
- CAC (Customer Acquisition Cost — marketing integration)

---

## 4. COMMUNICATION ARCHITECTURE

### Message Flow
```
Trigger Event (attendance, fee, exam, manual)
  → communicationService.send*()
  → Insert into message_logs (status: 'queued')
  → Insert into job_queue (type: 'send_sms'/'send_email')
  → Job Worker picks up job
  → Calls SMS/Email Gateway API
  → Updates message_logs (status: 'sent'/'delivered'/'failed')
  → Updates campaign stats
```

### Gateway Priority Chain (SMS)
1. SSL Wireless (primary — Bangladesh)
2. Muthofun (secondary)
3. Twilio (international fallback)

### Email Provider Stack
1. Resend (primary — developer-friendly)
2. AWS SES (high volume)
3. SendGrid (fallback)

### Delivery Rate Monitoring
- Track delivery rates per provider per day
- Auto-switch provider if delivery rate drops below 90%
- Alert super admin if SMS credits below threshold

---

## 5. REPORTING SYSTEM ARCHITECTURE

### Report Generation Pipeline
```
Request → reportingService.generateReport()
  → Fetch data from Supabase
  → Transform to ReportResult format
  → For PDF: queue job → Puppeteer/PDFKit → upload to Storage
  → For Excel: SheetJS in-browser OR server-side ExcelJS
  → For CSV: client-side streaming download
  → Email link to requester (if scheduled)
```

### PDF Generation Stack
- **Server-side**: Puppeteer (headless Chrome) via Supabase Edge Function
- **Client-side**: jsPDF for quick print-friendly output
- **Template engine**: HTML templates with Handlebars variables
- **Storage**: Supabase Storage `reports/` bucket with 30-day TTL

### Report Caching
```
Cache key: sha256(school_id + report_type + filter_hash)
Cache store: Supabase Storage (pre-generated PDFs)
Cache TTL: 1 hour for financial reports, 24 hours for static reports
Invalidation: On underlying data change (webhook/trigger)
```

---

## 6. AI INTEGRATION ROADMAP

### Phase 2A — AI Utilities (Now)
- ✅ Notice text generation (Claude API)
- ✅ Personalized fee reminders
- ✅ Risk score computation (rule-based)
- ✅ AI insights table and service

### Phase 2B — Predictive Analytics (Q2)
- Dropout risk prediction (ML model via Python microservice)
- Fee default prediction
- Attendance anomaly detection
- Performance trend forecasting

### Phase 2C — Conversational AI (Q3)
- AI Assistant chatbot for staff ("How many students are absent today?")
- Natural language report queries
- AI-generated exam questions
- Automated parent communication drafts

### Phase 2D — Advanced AI (Q4)
- Computer vision for attendance (face recognition)
- Handwriting recognition for assignments
- AI-powered admission screening
- Real-time performance monitoring

### AI Data Requirements
```
For ML models, we need:
- student_performance_snapshots (min 6 months history)
- attendance records (daily, all students)
- fee_payment_history (invoice + payment correlation)
- exam_results (per subject, per term)
- assignment_submissions (completion rates)

All stored in PostgreSQL → exportable to BigQuery/S3 for ML training
```

---

## 7. MOBILE APP ARCHITECTURE

### API Design for Mobile
```
Base URL: https://api.shiksha-erp.com/v1
Authentication: JWT Bearer token (Supabase Auth)
Rate Limiting: 100 req/min per user, 1000 req/min per school
Response format: JSON with standard envelope
Pagination: Cursor-based for large lists
```

### Mobile-Specific Endpoints Needed
```
GET  /v1/guardian/children                    — Child list
GET  /v1/guardian/children/:id/attendance     — Attendance summary
GET  /v1/guardian/children/:id/fees           — Fee status
GET  /v1/guardian/children/:id/results        — Exam results
POST /v1/guardian/payments                    — Initiate payment
GET  /v1/teacher/sections/:id/attendance      — Today's attendance form
POST /v1/teacher/attendance                   — Mark attendance
GET  /v1/student/timetable                    — Class timetable
GET  /v1/student/assignments                  — Active assignments
POST /v1/student/assignments/:id/submit       — Submit assignment
GET  /v1/notifications                        — Push notifications list
```

### Push Notification Architecture
```
FCM (Firebase Cloud Messaging) for Android
APNs (Apple Push Notification service) for iOS
OneSignal as abstraction layer (optional)

Device token stored in: users.settings.push_tokens[]
Topic subscriptions: school_{id}, class_{id}, student_{id}
```

### Offline Support Strategy
- Attendance marking: offline-first with sync queue
- Fee lookup: cached for 24 hours
- Timetable: cached indefinitely until changed
- Notifications: stored locally, mark-read synced

---

## 8. DEVOPS & DEPLOYMENT PLAN

### Environment Tiers
```
development  → local Supabase CLI + Next.js dev
staging      → Supabase project (staging) + Vercel preview
production   → Supabase project (prod) + Vercel production
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
on: [push to main]
jobs:
  lint:       ESLint + TypeScript check
  test:       Vitest unit tests
  build:      Next.js production build
  migrate:    Supabase DB migrations (on tag only)
  deploy:     Vercel deployment (auto on Vercel integration)
```

### Database Migration Strategy
```
/supabase/migrations/
  ├── 001_initial_schema.sql        (Phase 1)
  ├── 002_indexes.sql               (Phase 1)
  ├── 003_rls_policies.sql          (Phase 1)
  ├── 004_phase2_branches.sql       (Phase 2)
  ├── 005_phase2_hr.sql             (Phase 2)
  ├── 006_phase2_library.sql        (Phase 2)
  ├── 007_phase2_transport.sql      (Phase 2)
  ├── 008_phase2_communication.sql  (Phase 2)
  └── 009_phase2_billing.sql        (Phase 2)

Rules:
- Never modify existing migrations
- Always test on staging first
- Use CONCURRENTLY for index creation
- Include rollback scripts
```

### Monitoring Stack
```
Application: Vercel Analytics + Web Vitals
Database: Supabase Dashboard + pg_stat_statements
Error tracking: Sentry (frontend + edge functions)
Uptime: Better Uptime / UptimeRobot
Business metrics: Custom dashboard (Supabase + Recharts)
Alerts: PagerDuty or Slack webhooks
```

### Performance Targets
| Metric | Target |
|--------|--------|
| Dashboard load (LCP) | < 1.5s |
| API response (p95) | < 200ms |
| Report generation | < 30s |
| Database query (p95) | < 50ms |
| Uptime SLA | 99.9% |

---

## 9. SECURITY ARCHITECTURE

### Defense in Depth
```
Layer 1: Network — Vercel WAF, DDoS protection
Layer 2: Auth — Supabase Auth (JWT, refresh tokens, MFA)
Layer 3: API — Rate limiting, input validation (Zod)
Layer 4: Database — RLS policies, parameterized queries
Layer 5: Application — RBAC, permission guards
Layer 6: Storage — Signed URLs, bucket policies
Layer 7: Audit — activity_logs, audit_logs
```

### Compliance Readiness
- **PDPA (Bangladesh)**: Data minimization, consent, right to erasure (soft delete)
- **GDPR (future international)**: Data portability, DPA contracts
- **ISO 27001 readiness**: Audit logs, access controls, encryption at rest
- **Financial compliance**: Double-entry bookkeeping via journal_entries

### Secret Management
```
Supabase service role key → Server-side only (Edge Functions)
Payment gateway keys → Supabase secrets / environment variables
SMS API keys → Supabase secrets
AI API keys → Supabase secrets (never in client bundle)
```

---

## 10. FOLDER STRUCTURE (Phase 2 Complete)

```
shiksha-erp/
├── src/
│   ├── app/
│   │   ├── (auth)/               login, register, forgot-password
│   │   ├── dashboard/            main school dashboard
│   │   │   ├── students/
│   │   │   ├── staff/
│   │   │   ├── classes/
│   │   │   ├── attendance/
│   │   │   ├── fees/
│   │   │   ├── payments/
│   │   │   ├── payroll/
│   │   │   ├── exams/
│   │   │   ├── reports/
│   │   │   ├── notifications/
│   │   │   ├── leave/            ← Phase 2
│   │   │   ├── library/          ← Phase 2
│   │   │   ├── transport/        ← Phase 2
│   │   │   ├── hostel/           ← Phase 2
│   │   │   ├── inventory/        ← Phase 2
│   │   │   ├── admission/        ← Phase 2
│   │   │   ├── calendar/         ← Phase 2
│   │   │   ├── communication/    ← Phase 2
│   │   │   ├── analytics/        ← Phase 2
│   │   │   └── settings/
│   │   ├── portal/
│   │   │   ├── parent/           ← Phase 2 (mobile-first)
│   │   │   ├── student/          ← Phase 2
│   │   │   └── teacher/          ← Phase 2
│   │   └── admin/                super admin panel
│   │       ├── schools/
│   │       ├── analytics/        ← Phase 2
│   │       ├── billing/          ← Phase 2
│   │       ├── support/          ← Phase 2
│   │       └── system/           ← Phase 2
│   ├── components/
│   │   ├── ui/                   base components
│   │   ├── layout/               sidebar, navbar, layout
│   │   └── shared/               reusable feature components
│   ├── services/
│   │   ├── students.service.ts
│   │   ├── attendance.service.ts
│   │   ├── fees.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── hr/hr.service.ts       ← Phase 2
│   │   ├── billing/billing.service.ts ← Phase 2
│   │   ├── analytics/analytics.service.ts ← Phase 2
│   │   ├── reporting/reporting.service.ts ← Phase 2
│   │   └── communication/communication.service.ts ← Phase 2
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── ai/ai.service.ts      ← Phase 2
│   ├── hooks/
│   │   ├── use-permissions.ts    ← Phase 2
│   │   └── use-async.ts          ← Phase 2
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   ├── types/
│   │   ├── index.ts              Phase 1 types
│   │   └── phase2.ts             Phase 2 types
│   ├── config/
│   │   └── permissions.ts
│   └── utils/
│       └── index.ts
├── supabase/
│   ├── schema.sql                Phase 1 complete schema
│   ├── schema_phase2.sql         Phase 2 extensions
│   ├── seed.sql                  Demo data
│   └── storage.sql               Storage buckets
└── docs/
    └── ARCHITECTURE.md           This document
```

---

## 11. SCALABILITY PROJECTIONS

### Current Architecture Capacity
| Scale | Supported |
|-------|-----------|
| Schools | Up to 50,000 |
| Students per school | Up to 10,000 |
| Total students | Up to 100M records |
| Concurrent users | Up to 10,000 |
| SMS per month | 5M+ (with batching) |
| Storage per school | Up to 100GB |
| API requests/day | 10M+ (with CDN) |

### Horizontal Scaling Plan (if needed)
```
Phase 1: Supabase + Vercel (current)
Phase 2: Supabase Pro + Vercel Pro + CDN
Phase 3: Supabase Enterprise + Multiple regions
Phase 4: Microservices migration
  - Auth service (Supabase)
  - Core API (Next.js API routes)
  - Report service (Node.js)
  - AI service (Python FastAPI)
  - Worker service (BullMQ + Redis)
  - Notification service (Node.js)
```

### Database Sharding Strategy (10M+ schools)
```
Not needed for initial scale.
When needed: shard by school_id hash
Supabase branching supports logical isolation
Consider PlanetScale or Neon for massive horizontal scale
```
