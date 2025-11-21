# Development Guide - دليل التطوير

## 🔧 Adding New Features - إضافة ميزات جديدة

### Adding a New Screen - إضافة شاشة جديدة

1. Create a new file in the `app/` directory:
```tsx
// app/profile.tsx
import { View, Text } from "react-native";

export default function ProfileScreen() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text>Profile Screen</Text>
        </View>
    );
}
```

2. Add navigation to the screen from any component:
```tsx
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/profile");
```

### Adding a New Component - إضافة مكون جديد

1. Create a new file in `components/`:
```tsx
// components/MyComponent.tsx
import { View, Text } from "react-native";

interface MyComponentProps {
    title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
    return (
        <View className="p-4 bg-white rounded-xl">
            <Text className="text-lg font-bold">{title}</Text>
        </View>
    );
}
```

2. Import and use it:
```tsx
import MyComponent from "../../components/MyComponent";

<MyComponent title="Hello World" />
```

### Adding New Types - إضافة أنواع جديدة

Edit `types/index.ts`:
```typescript
export interface Driver {
    id: string;
    name: string;
    phone: string;
    rating: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
}
```

### Extending the Order Context - توسيع سياق الطلبات

Edit `context/OrderContext.tsx`:
```tsx
interface OrderContextType {
    activeOrder: Order | null;
    setActiveOrder: (order: Order | null) => void;
    updateOrderStatus: (status: Order['status']) => void;
    // Add new properties
    orderHistory: Order[];
    addToHistory: (order: Order) => void;
}
```

## 🎨 Styling Guide - دليل التنسيق

### Using NativeWind Classes

Common utility classes:
```tsx
// Layout
<View className="flex-1 items-center justify-center">

// Spacing
<View className="p-4 m-2 px-6 py-3">

// Colors
<Text className="text-blue-600 bg-gray-50">

// Typography
<Text className="text-lg font-bold">

// Borders
<View className="border border-gray-300 rounded-xl">

// Shadows
<View className="shadow-lg shadow-sm">
```

### Custom Colors

Add to `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#16a34a',
      }
    }
  }
}
```

## 🔄 State Management - إدارة الحالة

### Using the Order Context

```tsx
import { useOrder } from "../../context/OrderContext";

function MyComponent() {
    const { activeOrder, setActiveOrder, updateOrderStatus } = useOrder();
    
    // Set active order
    setActiveOrder(order);
    
    // Update status
    updateOrderStatus('IN_TRANSIT');
    
    // Access active order
    console.log(activeOrder?.price);
}
```

### Creating a New Context

```tsx
// context/DriverContext.tsx
import { createContext, useContext, useState } from 'react';

interface DriverContextType {
    driver: Driver | null;
    setDriver: (driver: Driver | null) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export function DriverProvider({ children }) {
    const [driver, setDriver] = useState<Driver | null>(null);
    
    return (
        <DriverContext.Provider value={{ driver, setDriver }}>
            {children}
        </DriverContext.Provider>
    );
}

export function useDriver() {
    const context = useContext(DriverContext);
    if (!context) throw new Error('useDriver must be used within DriverProvider');
    return context;
}
```

## 📡 API Integration - دمج API

### Setting Up API Client

Create `services/api.ts`:
```typescript
const API_URL = 'https://your-api.com';

export async function fetchOrders() {
    const response = await fetch(`${API_URL}/orders`);
    return response.json();
}

export async function acceptOrder(orderId: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
}

export async function submitBid(orderId: string, price: number) {
    const response = await fetch(`${API_URL}/orders/${orderId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
    });
    return response.json();
}
```

### Using API in Components

```tsx
import { useEffect, useState } from 'react';
import { fetchOrders } from '../../services/api';

function HomeScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadOrders();
    }, []);
    
    async function loadOrders() {
        try {
            const data = await fetchOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    }
    
    if (loading) return <Text>Loading...</Text>;
    
    return (
        // Render orders
    );
}
```

## 🗺️ Adding Maps - إضافة الخرائط

### Install React Native Maps

```bash
npx expo install react-native-maps
```

### Basic Map Component

```tsx
import MapView, { Marker } from 'react-native-maps';

function OrderMap({ pickup, dropoff }) {
    return (
        <MapView
            className="w-full h-64 rounded-xl"
            initialRegion={{
                latitude: 30.0444,
                longitude: 31.2357,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            }}
        >
            <Marker coordinate={pickup} title="Pickup" pinColor="blue" />
            <Marker coordinate={dropoff} title="Dropoff" pinColor="red" />
        </MapView>
    );
}
```

## 🔔 Push Notifications - الإشعارات

### Install Expo Notifications

```bash
npx expo install expo-notifications
```

### Setup Notifications

```tsx
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Send local notification
async function sendNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null, // Send immediately
    });
}
```

## 🧪 Testing - الاختبار

### Unit Testing with Jest

Install dependencies:
```bash
npm install --save-dev jest @testing-library/react-native
```

Create test file `components/__tests__/OrderCard.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import OrderCard from '../OrderCard';

describe('OrderCard', () => {
    it('renders order information correctly', () => {
        const order = {
            id: '1',
            pickup: 'Location A',
            dropoff: 'Location B',
            distance: '5 km',
            price: 25,
            status: 'PENDING',
        };
        
        const { getByText } = render(
            <OrderCard order={order} onPress={() => {}} />
        );
        
        expect(getByText('Location A')).toBeTruthy();
        expect(getByText('Location B')).toBeTruthy();
        expect(getByText('25 EGP')).toBeTruthy();
    });
});
```

## 📦 Building for Production - البناء للإنتاج

### Android APK

```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## 🐛 Debugging Tips - نصائح التصحيح

### Enable Debug Mode

```tsx
// In any component
console.log('Debug info:', data);
console.warn('Warning message');
console.error('Error message');
```

### React DevTools

```bash
# Install standalone React DevTools
npm install -g react-devtools

# Run it
react-devtools
```

### Expo DevTools

Press `j` in the terminal to open the debugger.

## 📚 Useful Resources - مصادر مفيدة

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [Lucide Icons](https://lucide.dev/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🤝 Contributing - المساهمة

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---

**Happy Coding! 🚀**
