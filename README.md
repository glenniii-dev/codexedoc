my-next-app/
├── features/                     # ROOT-LEVEL FEATURES (your domains)
│   ├── auth/                     # Feature: Authentication
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── actions/
│   │   │   ├── login.action.ts
│   │   │   └── register.action.ts
│   │   └── routes/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── register/
│   │           └── page.tsx
│   │
│   ├── dashboard/                # Feature: Dashboard
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── actions/
│   │   │   └── refreshData.action.ts
│   │   └── routes/
│   │       ├── layout.tsx
│   │       ├── page.tsx         # /dashboard
│   │       └── profile/
│   │           └── page.tsx     # /dashboard/profile
│   │
│   └── billing/                  # Feature: Billing
│       ├── components/
│       │   └── InvoiceTable.tsx
│       ├── actions/
│       │   └── createInvoice.action.ts
│       └── routes/
│           └── page.tsx         # /billing
│
├── app/                          # App Router entry
│   ├── layout.tsx                # Root layout (imports from features/dashboard/routes/layout.tsx if needed)
│   ├── page.tsx                  # Home (/)
│   ├── (auth)/                   # Route group (no URL impact)
│   ├── (dashboard)/              # Protected group
│   └── api/                      # Only external APIs
│       └── webhook/
│           └── stripe/
│               └── route.ts
│
├── ui/                           # GLOBAL reusable UI
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── table.tsx
│
├── server/
│   ├── auth/
│   ├── db/
│   ├── mutations/
│   ├── queries/
│   └── services/
│
├── lib/
│   ├── cache.ts
│   ├── logger.ts
│   ├── upload.ts
│   └── utils.ts
│
├── middleware.ts                 # Auth + route protection
├── public/
├── .env
├── next.config.ts
└── tsconfig.json