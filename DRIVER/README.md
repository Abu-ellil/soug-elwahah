# Driver Delivery App 🚗

A modern React Native delivery driver application built with Expo, allowing drivers to view nearby delivery requests, negotiate prices, and manage active deliveries.

## ✨ Features

### 1. **Authentication**
- Simple driver login/signup screens
- Mock authentication for development

### 2. **Home Screen - Order Feed**
- View nearby delivery orders
- See pickup/dropoff locations, distance, and customer price
- Statistics dashboard showing:
  - Available orders
  - Today's earnings
  - Completed deliveries
- Beautiful animated cards with smooth transitions

### 3. **Bidding System**
- **Accept**: Accept customer's offered price immediately
- **Counter-Offer**: Propose a different price
- Input validation for bid amounts
- Visual feedback for actions

### 4. **Active Delivery Tracking**
- Real-time delivery status tracking
- Step-by-step progress timeline:
  1. Order Accepted
  2. Picked Up
  3. In Transit
  4. Delivered
- Visual progress bar
- Detailed order information
- Earnings display

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated
- **State Management**: React Context API
- **Language**: TypeScript

## 📁 Project Structure

```
DRIVER/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── home.tsx       # Order feed screen
│   │   ├── active.tsx     # Active delivery screen
│   │   └── _layout.tsx    # Tab layout
│   ├── order/
│   │   └── [id].tsx       # Order details & bidding
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   ├── index.tsx          # Entry point
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── OrderCard.tsx      # Order card component
│   └── StatCard.tsx       # Statistics card
├── context/               # React Context
│   └── OrderContext.tsx   # Order state management
├── constants/             # Constants & data
│   └── data.ts            # Mock order data
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
└── assets/                # Images and fonts

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
cd DRIVER
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app

## 📱 Usage

### For Drivers:

1. **Login**: Use the login screen (mock authentication)
2. **Browse Orders**: View available delivery requests on the home screen
3. **View Details**: Tap on any order to see full details
4. **Accept or Bid**:
   - Accept the customer's price immediately, or
   - Enter your counter-offer price
5. **Track Delivery**: Once accepted, track your delivery progress in the Active tab
6. **Complete Delivery**: Mark each step as you progress through the delivery

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Color Scheme**: 
  - Primary: Blue (#2563eb)
  - Success: Green (#16a34a)
  - Warning: Amber (#f59e0b)
  - Danger: Red (#dc2626)
- **Animations**: Smooth fade-in and slide animations using Reanimated
- **Responsive**: Works on various screen sizes

## 🔄 State Management

The app uses React Context API for managing:
- Active order state
- Order status updates
- Shared state across screens

## 📝 Mock Data

The app includes sample orders for testing:
- Cairo Festival City → Maadi City Center (12 km, 50 EGP)
- Nasr City → Heliopolis (5 km, 25 EGP)
- Zamalek → Dokki (3 km, 20 EGP)

## 🔮 Future Enhancements

- [ ] Real-time location tracking with maps
- [ ] Push notifications for new orders
- [ ] Backend integration with API
- [ ] Payment processing
- [ ] Driver ratings and reviews
- [ ] Order history
- [ ] Earnings analytics
- [ ] Multi-language support (Arabic/English)

## 🧪 Testing

### Manual Testing
1. Start the app with `npx expo start`
2. Test the navigation between screens
3. Test the counter-offer flow:
   - Open an order
   - Click "Propose a Price"
   - Enter a price
   - Submit and verify UI update
4. Test the active delivery flow:
   - Accept an order
   - Navigate to Active tab
   - Progress through delivery steps

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

Built with ❤️ using React Native and Expo

---

**Note**: This is a development version with mock data. For production use, integrate with a real backend API and implement proper authentication.
