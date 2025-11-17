# Admin Dashboard - Egyptian Villages Delivery System

This is a comprehensive admin dashboard for managing the Egyptian villages delivery application. Built with Next.js 14, TypeScript, and Tailwind CSS with RTL support.

## Features

- **Authentication System**: Secure login with JWT tokens stored in httpOnly cookies
- **User Management**: Full CRUD operations for users with search, filter, and pagination
- **Store Management**: Manage stores with approval workflow for new registrations
- **Driver Management**: Manage drivers with approval workflow for new registrations
- **Order Management**: Complete order tracking and management system
- **Product Management**: Manage products across all stores
- **Categories Management**: Manage product categories
- **Villages Management**: Manage delivery villages
- **Analytics**: Comprehensive dashboard with charts and reports
- **Settings**: System configuration panel

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Zustand (optional)
- **API Integration**: Fetch API
- **Authentication**: JWT (stored in httpOnly cookies)
- **Charts**: Recharts
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Language**: Arabic RTL support

## Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── users/
│   │   │   ├── page.tsx                # Users list
│   │   │   └── [id]/
│   │   │       └── page.tsx            # User details
│   │   ├── stores/
│   │   │   ├── page.tsx                # Stores list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # Store details
│   │   │   └── pending/
│   │   │       └── page.tsx            # Pending approvals
│   │   ├── drivers/
│   │   │   ├── page.tsx                # Drivers list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx            # Driver details
│   │   │   └── pending/
│   │   │       └── page.tsx            # Pending approvals
│   │   ├── orders/
│   │   │   ├── page.tsx                # Orders list
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Order details
│   │   ├── products/
│   │   │   ├── page.tsx                # Products list
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Product details
│   │   ├── categories/
│   │   │   └── page.tsx                # Manage categories
│   │   ├── villages/
│   │   │   └── page.tsx                # Manage villages
│   │   ├── analytics/
│   │   │   └── page.tsx                # Analytics & reports
│   │   └── settings/
│   │       └── page.tsx                # System settings
│   ├── api/                            # API routes (if needed)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RecentOrders.tsx
│   │   ├── RevenueChart.tsx
│   │   └── TopStores.tsx
│   ├── tables/
│   │   ├── DataTable.tsx
│   │   ├── UsersTable.tsx
│   │   ├── StoresTable.tsx
│   │   ├── DriversTable.tsx
│   │   └── OrdersTable.tsx
│   ├── forms/
│   │   ├── StoreForm.tsx
│   │   ├── DriverForm.tsx
│   │   ├── CategoryForm.tsx
│   │   └── VillageForm.tsx
│   ├── modals/
│   │   ├── ConfirmModal.tsx
│   │   ├── ViewImageModal.tsx
│   │   └── OrderDetailsModal.tsx
│   └── shared/
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ActionDropdown.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                   # API client setup
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── stores.ts
│   │   ├── drivers.ts
│   │   ├── orders.ts
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useStores.ts
│   │   └── useOrders.ts
│   ├── store/                          # Zustand stores (optional)
│   │   └── authStore.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   ├── user.ts
│   ├── store.ts
│   ├── driver.ts
│   └── order.ts
├── middleware.ts                       # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is ready for deployment to any platform that supports Next.js applications (Vercel, Netlify, etc.).

## Key Features Implemented

### Store Approval System:
- View pending stores with documents
- Approve/Reject with reasons
- Notifications sent automatically
- Suspend/Reactivate stores

### Driver Approval System:
- View pending drivers with documents
- Verify documents (National ID, License)
- Approve/Reject with reasons
- Block/Unblock drivers

### Complete CRUD:
- Users, Stores, Drivers, Orders, Products
- Categories, Villages, Admins
- Settings management

### Analytics & Reports:
- Real-time dashboard stats
- Charts & visualizations
- Date range filtering
- Export to CSV

### Permissions System:
- Role-based access (Super Admin, Admin, Moderator)
- Granular permissions
- Permission checks on routes

## License

This project is licensed under the MIT License.