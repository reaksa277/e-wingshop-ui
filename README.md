# E-WingShop Dashboard

A Next.js 14 dashboard application for multi-branch retail management with role-based access control. The frontend fetches data from a Spring Boot backend REST API.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [User Roles & Permissions](#user-roles--permissions)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Frontend Routes](#frontend-routes)

---

## Tech Stack

| Layer                | Technology                             |
| -------------------- | -------------------------------------- |
| **Framework**        | Next.js 14 App Router (TypeScript)     |
| **Backend**          | Spring Boot REST API                   |
| **Authentication**   | NextAuth.js v5 with JWT sessions       |
| **UI Components**    | shadcn/ui + Radix UI                   |
| **Styling**          | Tailwind CSS v4                        |
| **State Management** | Zustand (client), React Query (server) |
| **Charts**           | Recharts                               |
| **Forms**            | react-hook-form + Zod validation       |
| **Notifications**    | Sonner                                 |

---

## Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js 14    │      │  Spring Boot     │      │   PostgreSQL    │
│   Frontend      │◄────►│   Backend API    │◄────►│   Database      │
│   (Port 3000)   │ REST │   (Port 8080)    │  SQL │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
       │
       └─► NextAuth.js (JWT)
       └─► Role-Based Access Control
       └─► React Query (Caching)
```

---

## User Roles & Permissions

| Role           | Permissions                                                                                                 | Description                              |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **superadmin** | All permissions                                                                                             | Full system access, manage users & roles |
| **manager**    | manage_branches, manage_products, view_inventory, process_orders, view_sales_reports, dismiss_expiry_alerts | Branch management, reports access        |
| **staff**      | manage_products, view_inventory, process_orders                                                             | Daily operations, inventory management   |
| **viewer**     | view_inventory                                                                                              | Read-only inventory access               |

### Permission Matrix

| Permission            | superadmin | manager | staff | viewer |
| --------------------- | ---------- | ------- | ----- | ------ |
| manage_users          | ✅         | ❌      | ❌    | ❌     |
| manage_roles          | ✅         | ❌      | ❌    | ❌     |
| manage_branches       | ✅         | ✅      | ❌    | ❌     |
| manage_products       | ✅         | ✅      | ✅    | ❌     |
| view_inventory        | ✅         | ✅      | ✅    | ✅     |
| process_orders        | ✅         | ✅      | ✅    | ❌     |
| view_sales_reports    | ✅         | ✅      | ❌    | ❌     |
| dismiss_expiry_alerts | ✅         | ✅      | ❌    | ❌     |

---

## API Endpoints

### Authentication

| Method | Endpoint            | Description              | Auth Required |
| ------ | ------------------- | ------------------------ | ------------- |
| POST   | `/api/auth/signin`  | Sign in with credentials | ❌            |
| POST   | `/api/auth/signout` | Sign out                 | ✅            |
| GET    | `/api/auth/session` | Get current session      | ✅            |

### Products

| Method | Endpoint                   | Description                  | Auth Required | Permission      |
| ------ | -------------------------- | ---------------------------- | ------------- | --------------- |
| GET    | `/api/products`            | Get all products (paginated) | ✅            | manage_products |
| GET    | `/api/products/sku/{sku}`  | Get product by SKU           | ✅            | manage_products |
| GET    | `/api/products/categories` | Get all categories           | ✅            | manage_products |
| POST   | `/api/products`            | Create new product           | ✅            | manage_products |
| PUT    | `/api/products/{id}`       | Update product               | ✅            | manage_products |
| DELETE | `/api/products/{id}`       | Delete product               | ✅            | manage_products |
| DELETE | `/api/products/bulk`       | Bulk delete products         | ✅            | manage_products |

**Query Parameters:**

- `search` - Search by name or SKU
- `category` - Filter by category
- `status` - Filter by active/inactive
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Branches

| Method | Endpoint                  | Description                 | Auth Required | Permission      |
| ------ | ------------------------- | --------------------------- | ------------- | --------------- |
| GET    | `/api/branches`           | Get all branches            | ✅            | manage_branches |
| GET    | `/api/branches/{id}`      | Get branch by ID            | ✅            | manage_branches |
| POST   | `/api/branches`           | Create new branch           | ✅            | manage_branches |
| PUT    | `/api/branches/{id}`      | Update branch               | ✅            | manage_branches |
| DELETE | `/api/branches/{id}`      | Delete branch               | ✅            | manage_branches |
| GET    | `/api/users?role=MANAGER` | Get managers for assignment | ✅            | manage_branches |

#### Create Branch

**Request:**

```http
POST /api/branches
Content-Type: application/json
Authorization: Bearer {token}
```

```json
{
  "name": "Downtown Branch",
  "address": "789 Downtown Street, Phnom Penh",
  "phone": "+855-12-345-678",
  "managerId": "user-2",
  "isActive": true
}
```

**Request Fields:**

| Field       | Type    | Required | Description                          |
| ----------- | ------- | -------- | ------------------------------------ |
| `name`      | string  | ✅       | Branch name (min 3 characters)       |
| `address`   | string  | ✅       | Full address of the branch           |
| `phone`     | string  | ✅       | Contact phone number                 |
| `managerId` | string  | ❌       | ID of assigned manager (can be null) |
| `isActive`  | boolean | ❌       | Branch active status (default: true) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "branch-4",
    "name": "Downtown Branch",
    "address": "789 Downtown Street, Phnom Penh",
    "phone": "+855-12-345-678",
    "managerId": "user-2",
    "isActive": true,
    "manager": {
      "id": "user-2",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "_count": {
      "orders": 0,
      "inventory": 0
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Branch

**Request:**

```http
PUT /api/branches/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

```json
{
  "name": "Main Branch - Updated",
  "address": "123 Main Street, Phnom Penh",
  "phone": "+855-12-345-678",
  "managerId": "user-3",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "branch-1",
    "name": "Main Branch - Updated",
    "address": "123 Main Street, Phnom Penh",
    "phone": "+855-12-345-678",
    "managerId": "user-3",
    "isActive": true,
    "manager": {
      "id": "user-3",
      "name": "Bob Wilson",
      "email": "bob@example.com"
    },
    "_count": {
      "orders": 25,
      "inventory": 3
    }
  }
}
```

#### Assign Manager to Branch

To assign or change a branch manager, use the update endpoint with the `managerId` field:

**Request:**

```http
PUT /api/branches/branch-1
Content-Type: application/json
Authorization: Bearer {token}
```

```json
{
  "managerId": "user-1"
}
```

**To remove a manager**, set `managerId` to `null`:

```json
{
  "managerId": null
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "branch-1",
    "name": "Main Branch",
    "managerId": "user-1",
    "manager": {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MANAGER"
    }
  }
}
```

#### Get Available Managers

Fetch all users with MANAGER role for the dropdown selection:

**Request:**

```http
GET /api/users?role=MANAGER
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MANAGER"
    },
    {
      "id": "user-2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "MANAGER"
    },
    {
      "id": "user-3",
      "name": "Bob Wilson",
      "email": "bob@example.com",
      "role": "MANAGER"
    }
  ]
}
```

#### Delete Branch

**Request:**

```http
DELETE /api/branches/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

**Validation Rules:**

- Branch cannot be deleted if it has active orders or inventory records
- Must be superadmin or manager with appropriate permissions

### Inventory

| Method | Endpoint                     | Description                       | Auth Required | Permission     |
| ------ | ---------------------------- | --------------------------------- | ------------- | -------------- |
| GET    | `/api/inventory`             | Get inventory records             | ✅            | view_inventory |
| POST   | `/api/inventory/{id}/adjust` | Adjust stock quantity             | ✅            | view_inventory |
| POST   | `/api/inventory/transfer`    | Transfer stock between branches   | ✅            | view_inventory |
| GET    | `/api/branches?active=true`  | Get active branches for inventory | ✅            | view_inventory |

**Query Parameters:**

- `branchId` - Filter by branch
- `category` - Filter by product category
- `status` - Filter by stock status (ok, low, out)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

### Orders

| Method | Endpoint                  | Description                     | Auth Required | Permission     |
| ------ | ------------------------- | ------------------------------- | ------------- | -------------- |
| GET    | `/api/orders`             | Get all orders                  | ✅            | process_orders |
| GET    | `/api/orders/{id}`        | Get order by ID                 | ✅            | process_orders |
| POST   | `/api/orders`             | Create new order                | ✅            | process_orders |
| PUT    | `/api/orders/{id}/status` | Update order status             | ✅            | process_orders |
| GET    | `/api/branches`           | Get branches for order creation | ✅            | process_orders |

**Query Parameters:**

- `status` - Filter by status (PENDING, CONFIRMED, FULFILLED, CANCELLED)
- `branchId` - Filter by branch
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Reports

| Method | Endpoint       | Description            | Auth Required | Permission         |
| ------ | -------------- | ---------------------- | ------------- | ------------------ |
| GET    | `/api/reports` | Get sales reports data | ✅            | view_sales_reports |

**Query Parameters:**

- `range` - Date range (today, 7d, 30d, month)
- `interval` - Grouping (daily, weekly, monthly)

**Response:**

```json
{
  "summary": {
    "totalRevenue": 1050.0,
    "totalOrders": 15,
    "averageOrderValue": 70.0,
    "topProduct": {
      "productId": "prod-1",
      "revenue": 250.0
    }
  },
  "revenueOverTime": [{ "date": "2024-01-01", "revenue": 150.0 }],
  "topProducts": [
    {
      "productId": "prod-1",
      "name": "Milk 1L",
      "sku": "MLK-001",
      "revenue": 250.0,
      "quantity": 15
    }
  ],
  "salesByBranch": [
    {
      "branchId": "branch-1",
      "name": "Main Branch",
      "revenue": 750.0,
      "orders": 10
    }
  ]
}
```

### Alerts

| Method | Endpoint                      | Description                   | Auth Required | Permission            |
| ------ | ----------------------------- | ----------------------------- | ------------- | --------------------- |
| GET    | `/api/alerts`                 | Get expiry alerts             | ✅            | dismiss_expiry_alerts |
| GET    | `/api/alerts/count`           | Get active alerts count       | ✅            | dismiss_expiry_alerts |
| POST   | `/api/alerts/{id}/dismiss`    | Dismiss an alert              | ✅            | dismiss_expiry_alerts |
| POST   | `/api/alerts/process-expired` | Process expired alerts (cron) | ✅            | system                |

**Query Parameters:**

- `branchId` - Filter by branch
- `status` - Filter by status (ACTIVE, DISMISSED, EXPIRED)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

---

## Data Models

### Product

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  inventory?: Array<{
    branchId: string;
    quantity: number;
  }>;
  totalStock?: number;
}
```

### Branch

```typescript
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string | null;
  isActive: boolean;
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    orders: number;
    inventory: number;
  };
}
```

### Inventory

```typescript
interface Inventory {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  lowStockThreshold: number;
  product?: Product;
  branch?: Branch;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  branchId: string;
  branch?: { id: string; name: string };
  status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  total: number;
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}
```

### ExpiryAlert

```typescript
interface ExpiryAlert {
  id: string;
  productId: string;
  branchId: string;
  expiryDate: Date;
  status: 'ACTIVE' | 'DISMISSED' | 'EXPIRED';
  daysRemaining?: number;
  product?: Product;
  branch?: Branch;
  dismissedBy?: string | null;
  dismissedAt?: Date | null;
  note?: string | null;
}
```

### User (Session)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager' | 'staff' | 'viewer';
  branchId?: string | null;
  image?: string;
}
```

---

## Project Structure

```
e-wingshop/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx        # Login page with mock credentials
│   │   └── error/
│   │       └── page.tsx        # Auth error page
│   ├── api/                    # API routes (NextAuth & backend proxy)
│   │   ├── auth/
│   │   │   └── [...nextauth]/  # NextAuth endpoints
│   │   ├── alerts/
│   │   │   └── count/
│   │   │       └── route.ts    # Alerts count endpoint
│   │   └── reports/
│   │       └── route.ts        # Sales reports endpoint
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── page.tsx            # Dashboard home
│   │   ├── products/
│   │   │   └── page.tsx        # Product management
│   │   ├── branches/
│   │   │   └── page.tsx        # Branch management
│   │   ├── inventory/
│   │   │   └── page.tsx        # Inventory tracking
│   │   ├── orders/
│   │   │   └── page.tsx        # Order processing
│   │   ├── reports/
│   │   │   └── page.tsx        # Sales reports
│   │   └── alerts/
│   │       └── page.tsx        # Expiry alerts
│   └── page.tsx                # Landing page
├── components/
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Top header
│   │   └── ...
│   ├── providers/              # Context providers
│   │   ├── ReactQueryProvider.tsx
│   │   └── ThemeProvider.tsx
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── auth-types.ts           # TypeScript type extensions
│   ├── mock-users.ts           # Mock user data for testing
│   ├── permissions.ts          # RBAC permission system
│   ├── store.ts                # Zustand stores
│   └── utils.ts                # Utility functions
├── middleware.ts               # Route protection middleware
├── .env                        # Environment variables
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Spring Boot backend running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Configure environment
# Edit .env file with your settings:
# NEXT_PUBLIC_API_URL="http://localhost:8080/api"
# NEXTAUTH_SECRET="your-secret-key-min-32-chars"
# NEXTAUTH_URL="http://localhost:3000"

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Credentials

All test accounts use password: **`password123`**

| Role       | Email                    |
| ---------- | ------------------------ |
| Superadmin | superadmin@ewingshop.com |
| Manager    | manager1@ewingshop.com   |
| Staff      | staff1@ewingshop.com     |
| Viewer     | viewer@ewingshop.com     |

---

## Frontend Routes

| Route                     | Description              | Required Permission   |
| ------------------------- | ------------------------ | --------------------- |
| `/`                       | Landing page             | None                  |
| `/login`                  | Login page               | None                  |
| `/dashboard`              | Dashboard overview       | Authenticated         |
| `/dashboard/products`     | Product management       | manage_products       |
| `/dashboard/branches`     | Branch management        | manage_branches       |
| `/dashboard/inventory`    | Inventory tracking       | view_inventory        |
| `/dashboard/orders`       | Order processing         | process_orders        |
| `/dashboard/reports`      | Sales reports            | view_sales_reports    |
| `/dashboard/alerts`       | Expiry alerts            | dismiss_expiry_alerts |
| `/dashboard/unauthorized` | Unauthorized access page | -                     |

---

## Environment Variables

```env
# Spring Boot Backend API
NEXT_PUBLIC_API_URL="http://localhost:8080/api"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-change-this-in-production-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Available Scripts

```bash
npm run dev          # Start development server (Port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## Key Features

### 🔐 Role-Based Access Control

- Middleware-level route protection
- Server-side permission verification
- Client-side UI element hiding via `RoleGuard`

### 📦 Product Management

- Searchable, filterable data table
- CRUD operations with Zod validation
- Bulk actions (activate, deactivate, delete)
- CSV export functionality

### 🏪 Branch Management

- Card grid view with statistics
- Manager assignment
- Branch detail view with inventory and orders

### 📊 Inventory Tracking

- Real-time stock levels per branch
- Low-stock alerts (configurable threshold)
- Stock transfer between branches
- Audit logging for adjustments

### 🛒 Order Processing

- Status workflow: PENDING → CONFIRMED → FULFILLED
- Inventory deduction on fulfillment
- Transaction-based operations

### 📈 Sales Reports

- Revenue charts (daily/weekly/monthly)
- Top products by revenue
- Sales comparison by branch
- Date range filtering

### ⚠️ Expiry Alerts

- Color-coded urgency:
  - 🔴 Red: ≤7 days remaining
  - 🟠 Amber: 8-30 days remaining
- Dismiss functionality with audit log
- Notification bell with count badge

---

## Notes

- All API responses follow `{ success, data?, error? }` format
- Form validation uses react-hook-form + Zod
- Toast notifications use Sonner
- Permission checks use `can(role, permission)` helper
- Mock data is used until Spring Boot API integration
