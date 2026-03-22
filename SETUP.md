# E-WingShop Dashboard - Setup Guide

A Next.js 14 dashboard application that fetches data from a Spring Boot backend API.

## Tech Stack

- **Framework**: Next.js 14 App Router (TypeScript)
- **Backend**: Spring Boot REST API
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: Zustand for client state, React Query for server state
- **Charts**: Recharts

## Prerequisites

- Node.js 18+
- Spring Boot backend running

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update the `.env` file with your backend API URL:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Role Permissions

| Permission | Superadmin | Manager | Staff | Viewer |
|------------|------------|---------|-------|--------|
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| Manage branches | ✅ | ✅ | ❌ | ❌ |
| Manage products | ✅ | ✅ | ✅ | ❌ |
| View inventory | ✅ | ✅ | ✅ | ✅ |
| Process orders | ✅ | ✅ | ✅ | ❌ |
| View sales reports | ✅ | ✅ | ❌ | ❌ |
| Dismiss expiry alerts | ✅ | ✅ | ❌ | ❌ |

## Project Structure

```
├── app/
│   ├── (auth)/          # Auth pages (login, error)
│   └── dashboard/       # Protected dashboard pages
│       ├── products/
│       ├── branches/
│       ├── inventory/
│       ├── orders/
│       ├── reports/
│       └── alerts/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── providers/       # React Query, Theme providers
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── api.ts           # API client for Spring Boot backend
│   ├── permissions.ts   # RBAC permission system
│   └── store.ts         # Zustand stores
└── middleware.ts        # Route protection middleware
```

## Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
npm run format  # Format code with Prettier
```

## Key Features

### Role-Based Access Control
- Enforcement at middleware level (route protection)
- Permission checks on API responses
- Client-side `RoleGuard` component for UI elements

### Product Management
- Searchable, filterable data table
- CRUD operations with validation
- Bulk actions (activate, deactivate, delete)
- CSV export

### Branch Management
- Card grid view with stats
- Manager assignment
- Branch detail page with inventory and orders

### Inventory Tracking
- Real-time stock levels per branch
- Low-stock alerts
- Stock transfer between branches
- Audit logging

### Order Processing
- Status workflow (Pending → Confirmed → Fulfilled)
- Inventory deduction on fulfillment
- Transaction-based operations

### Sales Reports
- Revenue charts (daily/weekly/monthly)
- Top products by revenue
- Sales by branch comparison
- Date range filtering

### Expiry Alerts
- Color-coded urgency (red ≤7 days, amber 8-30 days)
- Dismiss functionality with audit log
- Notification bell with count badge

## API Integration

All data is fetched from the Spring Boot backend:
- Products, branches, inventory, orders via REST endpoints
- Authentication handled by backend
- Role-based permissions enforced by backend responses

## Notes

- All API responses are handled with error boundaries
- Form validation uses react-hook-form + zod
- Toast notifications use sonner
- All permission checks use the `can(role, permission)` helper
