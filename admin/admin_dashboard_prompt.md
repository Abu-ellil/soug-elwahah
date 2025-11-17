# Prompt للتطبيق الخامس: Admin Dashboard (Next.js)

## 🎯 Project Overview
أنت Senior Full-Stack Developer متخصص في Next.js. مطلوب منك تطوير لوحة تحكم Admin كاملة لإدارة تطبيق توصيل القرى المصرية. اللوحة ستكون Web-based باستخدام Next.js 14+ (App Router) مع TypeScript.

---

## 📋 Technical Requirements

### Core Technologies:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Zustand (optional)
- **API Integration**: Fetch API / Axios
- **Authentication**: JWT (stored in httpOnly cookies)
- **Charts**: Recharts or Chart.js
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Language**: Arabic RTL support

### Project Structure:
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
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── StatusBadge.tsx
│       └── ActionDropdown.tsx
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

---

## 🎨 Design System

### Color Palette (Professional Admin):
```javascript
const COLORS = {
  primary: '#3B82F6',      // أزرق
  secondary: '#8B5CF6',    // بنفسجي
  success: '#10B981',      // أخضر
  warning: '#F59E0B',      // برتقالي
  danger: '#EF4444',       // أحمر
  info: '#06B6D4',         // سماوي
  
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF'
  },
  
  // Status Colors
  active: '#10B981',
  inactive: '#6B7280',
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
};
```

### Typography (Tailwind):
- Font: Inter or Cairo for Arabic
- Sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### UI Guidelines:
- Border Radius: rounded-lg للكاردات، rounded-md للأزرار
- Shadows: shadow-sm, shadow-md, shadow-lg
- Spacing: استخدام Tailwind spacing scale
- RTL Support: dir="rtl" على الـ HTML
- Responsive: Mobile-first design

---

## 📱 Pages Detailed Specifications

### 1. Login Page (`/login`)
**Features:**
- Logo + عنوان النظام
- Form:
  - Email/Phone
  - Password (مع show/hide)
  - Remember me checkbox
- زر "تسجيل الدخول"
- رسائل خطأ واضحة
- Loading state

**Logic:**
- التحقق من البيانات (Zod validation)
- إرسال طلب للـ API
- حفظ Token في httpOnly cookie
- Redirect للـ Dashboard

**UI:**
- Background gradient
- Centered card
- Animations smooth

---

### 2. Dashboard Home (`/`)
**Features:**
- **Stats Cards** (4 في صف):
  - إجمالي الطلبات (مع نسبة التغيير)
  - إجمالي الإيرادات (مع نسبة التغيير)
  - عدد المستخدمين (مع نسبة التغيير)
  - عدد السائقين النشطين
  
- **Charts Section**:
  - Revenue Chart (Line/Bar - آخر 7 أيام)
  - Orders by Status (Pie/Doughnut)
  - Top 5 Stores (Bar Chart)
  
- **Recent Orders Table** (آخر 10 طلبات):
  - Order ID
  - Customer
  - Store
  - Driver
  - Amount
  - Status
  - Date
  - Actions (View)
  
- **Quick Actions**:
  - Pending Store Approvals (عدد + رابط)
  - Pending Driver Approvals (عدد + رابط)
  - Active Issues (optional)

**Logic:**
- Fetch analytics data
- Real-time updates (optional)
- Date range filter

---

### 3. Users Management (`/users`)

#### Users List Page
**Features:**
- **Header**:
  - عنوان الصفحة + Badge بالعدد
  - Search bar
  - Filter dropdown (Active/Inactive/All)
  - زر "Export CSV"
  
- **Data Table**:
  - Avatar + Name
  - Phone
  - Email (optional)
  - Total Orders
  - Total Spent
  - Status (Active/Inactive)
  - Registered Date
  - Actions (View, Block/Unblock, Delete)
  
- **Pagination**
- **Empty State**

**Logic:**
- Fetch users with pagination
- Search functionality
- Filter by status
- Block/Unblock user
- Delete user (with confirmation)

#### User Details Page (`/users/[id]`)
**Features:**
- **User Info Card**:
  - Avatar (large)
  - Name, Phone, Email
  - Status badge
  - Member since
  - زر "Block/Unblock"
  - زر "Delete User"
  
- **Statistics Cards**:
  - Total Orders
  - Total Spent
  - Average Order Value
  - Last Order Date
  
- **Orders History Table**
- **Addresses List**
- **Activity Log** (optional)

---

### 4. Stores Management (`/stores`)

#### Stores List Page
**Features:**
- **Header**:
  - عنوان + Badge
  - Search bar
  - Filter (Category, Status, Verification)
  - زر "Add Store" (optional)
  
- **Data Table**:
  - Store Image + Name
  - Owner Name + Phone
  - Category
  - Rating (⭐)
  - Total Orders
  - Status (Open/Closed)
  - Verification (Verified/Pending)
  - Actions (View, Edit, Delete)
  
- **Pagination**

#### Pending Stores Page (`/stores/pending`)
**Features:**
- قائمة المحلات المنتظرة الموافقة
- كل Store Card يحتوي على:
  - **Store Info**:
    - صورة المحل
    - اسم المحل
    - الفئة
    - العنوان + الموقع
    - ساعات العمل
  - **Owner Info**:
    - الاسم
    - رقم الموبايل
    - البريد الإلكتروني (إن وجد)
  - **Documents Section**:
    - صورة السجل التجاري (عرض + تحميل)
    - صورة البطاقة الضريبية (عرض + تحميل)
    - صورة البطاقة الشخصية للمالك (عرض + تحميل)
  - **Actions**:
    - زر "Approve" (أخضر كبير)
    - زر "Reject" (أحمر) → يفتح modal لإدخال سبب الرفض
  
- **Filters**:
  - Sort by date (الأحدث، الأقدم)
  - Filter by category

**Logic:**
- عرض المحلات بحالة `pending` فقط
- مراجعة المستندات (عرض الصور بحجم كبير)
- **Approve Store**:
  - تحديث حالة المحل لـ `approved`
  - تفعيل حساب المالك (isActive = true)
  - إرسال إشعار للمالك "تم قبول محلك"
  - Email notification (optional)
- **Reject Store**:
  - فتح Modal لإدخال سبب الرفض
  - تحديث الحالة لـ `rejected`
  - إرسال إشعار للمالك مع السبب
  - Email مع السبب
- **View Documents**: عرض الصور في modal أو في tab جديد

#### Store Details Page (`/stores/[id]`)
**Features:**
- **Store Info Card**:
  - Image (كبيرة) مع زر "Change Image"
  - Name, Category, Rating
  - Owner info + contact
  - Address + coordinates (map optional)
  - Working hours
  - **Verification Status Badge**:
    - Pending (برتقالي)
    - Approved (أخضر)
    - Rejected (أحمر)
  - **Documents Section** (إذا كان pending):
    - السجل التجاري
    - البطاقة الضريبية
    - البطاقة الشخصية
    - أزرار عرض/تحميل
  - **Status Controls**:
    - Toggle "Open/Close" (للمحلات المفعّلة)
    - زر "Approve Store" (إذا pending)
    - زر "Reject Store" (إذا pending)
    - زر "Suspend Store" (إذا approved) - تعليق مؤقت
    - زر "Delete Store" (أحمر)
  
- **Statistics Cards**:
  - Total Products
  - Total Orders
  - Total Revenue
  - Average Rating
  - Completion Rate
  
- **Tabs Section**:
  - **Products Tab**: جدول المنتجات
  - **Orders Tab**: جدول الطلبات
  - **Reviews Tab**: التقييمات (optional)
  - **Activity Log Tab**: سجل النشاط

**Logic:**
- Fetch store details with all related data
- **Approve Store**: 
  - تحديث verification status
  - إرسال notification للمالك
- **Reject Store**:
  - Modal لإدخال السبب
  - إرسال notification مع السبب
- **Suspend Store**:
  - تعليق مؤقت (can be reactivated)
  - إرسال notification
- **Delete Store**:
  - Confirmation modal
  - Soft delete (recommended)
  - إرسال notification
- **Edit Store Info** (inline editing)

---

### 5. Drivers Management (`/drivers`)

#### Drivers List Page
**Features:**
- **Header**:
  - عنوان + Badge
  - Search bar
  - Filter (Available, Busy, Offline, Verification)
  - زر "Export CSV"
  
- **Data Table**:
  - Avatar + Name
  - Phone
  - Vehicle Type + Number
  - Rating
  - Total Orders
  - Total Earnings
  - Status (Available/Busy/Offline)
  - Verification (Verified/Pending)
  - Actions (View, Approve, Block, Delete)

#### Pending Drivers Page (`/drivers/pending`)
**Features:**
- قائمة السائقين المنتظرين الموافقة
- كل Driver Card:
  - معلومات السائق
  - Vehicle info
  - Documents (National ID, Driving License)
  - زر "Approve"
  - زر "Reject"

**Logic:**
- عرض السائقين pending
- مراجعة المستندات
- Approve/Reject

#### Driver Details Page (`/drivers/[id]`)
**Features:**
- **Driver Info**:
  - Avatar
  - Name, Phone
  - Vehicle info
  - Rating + Reviews count
  - Status badge
  - Documents viewer
  - زر "Approve/Block"
  - زر "Delete"
  
- **Statistics**:
  - Total Orders
  - Total Earnings
  - Average Rating
  - Acceptance Rate
  - Completion Rate
  
- **Orders History Table**
- **Earnings Chart** (last 30 days)
- **Current Location** (map - if online)

---

### 6. Orders Management (`/orders`)

#### Orders List Page
**Features:**
- **Header**:
  - عنوان + Badge
  - Search (by Order ID, Customer, Store)
  - Filters:
    - Status (All, Pending, Accepted, Confirmed, etc.)
    - Date Range
    - Payment Method
  - زر "Export CSV"
  
- **Data Table**:
  - Order ID
  - Customer Name + Phone
  - Store Name
  - Driver Name (if assigned)
  - Amount
  - Payment Method
  - Status (with color badge)
  - Date & Time
  - Actions (View, Track, Cancel)
  
- **Pagination**
- **Real-time Updates** (optional - WebSocket)

**Logic:**
- Fetch orders with filters
- Search functionality
- Status filter
- Cancel order (with reason)
- Export to CSV

#### Order Details Page (`/orders/[id]`)
**Features:**
- **Order Info Card**:
  - Order ID + Status
  - Timeline (visual)
  - Created at
  
- **Customer Info**:
  - Name + Phone (clickable)
  - Delivery Address
  - Payment Method
  
- **Store Info**:
  - Store name + phone
  - Store address
  
- **Driver Info** (if assigned):
  - Name + Phone
  - Vehicle info
  - Current location (map)
  - زر "Track in Real-time"
  
- **Order Items Table**:
  - Product image + name
  - Price
  - Quantity
  - Subtotal
  
- **Order Summary**:
  - Subtotal
  - Delivery Fee
  - Total
  
- **Actions**:
  - Cancel Order
  - Refund (optional)
  - Contact Customer/Store/Driver

---

### 7. Products Management (`/products`)

#### Products List Page
**Features:**
- **Header**:
  - عنوان + Badge (total count)
  - Search bar
  - Filters:
    - Store
    - Category
    - Availability
  
- **Data Table**:
  - Product Image + Name
  - Store Name
  - Category
  - Price
  - Availability (Available/Out of Stock)
  - Total Sold
  - Actions (View, Edit, Delete)
  
- **Pagination**

**Logic:**
- Fetch all products (across all stores)
- Search & Filter
- Delete product (confirmation)
- Edit product (inline or modal)

---

### 8. Categories Management (`/categories`)
**Features:**
- **Header**:
  - عنوان
  - زر "Add Category"
  
- **Categories Table/Grid**:
  - Icon + Name (Arabic & English)
  - Color
  - Order (for sorting)
  - Total Stores
  - Status (Active/Inactive)
  - Actions (Edit, Delete, Reorder)
  
- **Add/Edit Category Modal**:
  - Name (Arabic)
  - Name (English)
  - Icon picker
  - Color picker
  - Order number
  - Status toggle

**Logic:**
- CRUD operations
- Drag & drop reorder (optional)
- Icon picker component

---

### 9. Villages Management (`/villages`)
**Features:**
- **Header**:
  - عنوان
  - زر "Add Village"
  
- **Villages Table**:
  - Name
  - Coordinates (Lat, Lng)
  - Total Stores
  - Total Users
  - Total Drivers
  - Actions (Edit, Delete)
  
- **Add/Edit Village Modal**:
  - Village Name
  - Coordinates (Lat, Lng)
  - Map picker (optional)

---

### 10. Analytics Page (`/analytics`)
**Features:**
- **Date Range Picker** (top)
  
- **Key Metrics** (Cards):
  - Total Revenue
  - Total Orders
  - Average Order Value
  - Total Users
  - Total Stores
  - Total Drivers
  
- **Charts**:
  - Revenue Over Time (Line)
  - Orders by Status (Pie)
  - Orders by Payment Method (Doughnut)
  - Top 10 Stores (Bar)
  - Top 10 Drivers (Bar)
  - Orders by Hour (Bar - peak times)
  - Orders by Day of Week (Bar)
  
- **Tables**:
  - Top Selling Products
  - Most Active Users
  - Store Performance

**Logic:**
- Fetch analytics with date range
- Export charts as images
- Export data as CSV

---

### 11. Settings Page (`/settings`)
**Features:**
- **Tabs**:
  - General Settings
  - Delivery Settings
  - Payment Settings
  - Notifications Settings
  - System Settings
  
- **General Settings**:
  - App Name
  - Logo
  - Support Email
  - Support Phone
  
- **Delivery Settings**:
  - Default Delivery Fee
  - Max Delivery Radius
  - Delivery Time Estimates
  
- **Payment Settings**:
  - Enable/Disable Payment Methods
  - Commission Rate
  
- **Notifications Settings**:
  - Firebase Config
  - Email Templates
  
- **System Settings**:
  - Maintenance Mode
  - API Rate Limits
  - Backup & Restore

---

## 🧩 Reusable Components

### 1. DataTable Component (TanStack Table)
```typescript
interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  filterOptions?: FilterOption[];
  onRowClick?: (row: T) => void;
  pagination?: PaginationState;
  loading?: boolean;
}
```

### 2. StatsCard Component
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // percentage
  changeType?: 'increase' | 'decrease';
  color?: string;
}
```

### 3. StatusBadge Component
```typescript
interface StatusBadgeProps {
  status: OrderStatus | UserStatus | DriverStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

### 4. ConfirmModal Component
```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}
```

---

## 🔐 Authentication & Authorization

### Middleware (middleware.ts)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  // Public paths
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Auth Hook (useAuth.ts)
```typescript
interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  avatar?: string;
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include' // للـ cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.data.admin);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAdmin(data.data.admin);
    return data;
  };

  const logout = async () => {
    // Clear cookie
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setAdmin(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions.includes(permission);
  };

  return { admin, isLoading, login, logout, hasPermission };
}
```

---

## 📊 API Client Setup

### API Client (lib/api/client.ts)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile(endpoint: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
```

---

## 🎨 shadcn/ui Components Setup

### Installation:
```bash
npx shadcn-ui@latest init
```

### Components to install:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
```

---

## 📦 Dependencies (package.json)

```json
{
  "name": "admin-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-switch": "^1.0.3",
    
    "lucide-react": "^0.312.0",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    
    "@tanstack/react-table": "^8.11.7",
    "recharts": "^2.10.4",
    "date-fns": "^3.2.0",
    "react-hot-toast": "^2.4.1",
    
    "zustand": "^4.5.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

---

## ✅ Acceptance Criteria

### Functionality:
- [ ] Login/Logout يعمل
- [ ] Dashboard stats تعرض بيانات صحيحة
- [ ] Charts تعمل وتعرض البيانات
- [ ] جميع الجداول تدعم Search, Filter, Sort, Pagination
- [ ] Approve/Reject للمحلات والسائقين يعمل
- [ ] CRUD operations تعمل لكل الأقسام
- [ ] Real-time updates (optional)
- [ ] Export to CSV يعمل
- [ ] RTL يعمل بشكل كامل
- [ ] Responsive على كل الشاشات

### UI/UX:
- [ ] التصميم professional ونظيف
- [ ] Animations سلسة
- [ ] Loading states واضحة
- [ ] Error handling شامل
- [ ] Toast notifications تعمل
- [ ] Modals تعمل بشكل صحيح
- [ ] Forms validation تعمل
- [ ] Empty states جذابة
- [ ] Sidebar collapsible

### Security:
- [ ] Authentication middleware يعمل
- [ ] Permissions system يعمل
- [ ] httpOnly cookies للـ tokens
- [ ] Input validation شاملة
- [ ] XSS protection
- [ ] CSRF protection

### Code Quality:
- [ ] TypeScript بدون errors
- [ ] Component structure منظمة
- [ ] Reusable components
- [ ] Custom hooks
- [ ] Code نظيف ومنظم
- [ ] Comments واضحة

---

## 🚀 Deliverables

1. **كامل كود المشروع** مع Next.js 14
2. **README.md** يشرح:
   - Setup instructions
   - Environment variables
   - Features list
   - Screenshots
   - Deployment guide
3. **جميع الـ Components جاهزة**
4. **API Integration كاملة**
5. **كود جاهز للـ deploy**

---

## 📝 Environment Variables (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## 🎯 Key Features Recap

### ✅ **Store Approval System**:
- View pending stores with documents
- Approve/Reject with reasons
- Notifications sent automatically
- Suspend/Reactivate stores

### ✅ **Driver Approval System**:
- View pending drivers with documents
- Verify documents (National ID, License)
- Approve/Reject with reasons
- Block/Unblock drivers

### ✅ **Complete CRUD**:
- Users, Stores, Drivers, Orders, Products
- Categories, Villages, Admins
- Settings management

### ✅ **Analytics & Reports**:
- Real-time dashboard stats
- Charts & visualizations
- Date range filtering
- Export to CSV

### ✅ **Permissions System**:
- Role-based access (Super Admin, Admin, Moderator)
- Granular permissions
- Permission checks on routes

---

## 💡 Important Notes

### For Next.js 14 (App Router):
- استخدم Server Components حيث ممكن
- Client Components فقط عند الحاجة ('use client')
- API Routes في app/api (optional)
- Middleware للـ authentication

### For TypeScript:
- Define types لكل الـ API responses
- Use strict type checking
- Avoid `any` type

### For RTL Support:
```tsx
// في layout.tsx
<html lang="ar" dir="rtl">
  <body>{children}</body>
</html>

// في tailwind.config.ts
module.exports = {
  // ...
  plugins: [require('tailwindcss-rtl')],
}
```

### Performance:
- Use Next.js Image component
- Lazy load components
- Debounce search inputs
- Optimize table rendering
- Cache API responses

**ابدأ بإنشاء Admin Dashboard الآن! 🚀**