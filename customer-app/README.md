# Soug Elwahah Customer App

## Overview

The Soug Elwahah Customer App is a mobile application built with React Native and Expo, designed to provide a seamless shopping experience for customers. It features product browsing, cart management, order placement, and user profile management, all with a focus on a vibrant and user-friendly interface.

## Features

-   **Authentication:** User login and registration.
-   **Home Screen:** Displays available stores, categories, and a search bar.
-   **Store Details:** View products from a specific store, filter by category, and add items to the cart.
-   **Cart Management:** Add, remove, and update product quantities in the cart.
-   **Checkout Process:** Place orders with customer information, delivery details, and payment method selection.
-   **Order Tracking:** View past and current orders with status updates.
-   **User Profile/Settings:** Manage addresses and other application settings.
-   **Localization:** Full Arabic language support with RTL (Right-to-Left) layout.
-   **UI/UX Enhancements:**
    -   "Add to Cart" button scale and fade animation.
    -   Cart badge bounce animation in the tab bar.
    -   Smooth slide screen transitions.
    -   Fade-in animations for empty states.
    -   Skeleton loaders for `HomeScreen` and `StoreDetailsScreen`.
    -   Haptic feedback on button presses.
    -   Toast messages for success/error actions.

## Getting Started

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn
-   Expo CLI (`npm install -g expo-cli`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/soug-elwahah-customer-app.git
    cd soug-elwahah-customer-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Project

1.  **Start the Expo development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
2.  **Open on your device/emulator:**
    -   Scan the QR code with the Expo Go app on your physical device (iOS or Android).
    -   Run on an Android emulator or iOS simulator.

## Mock Data Structure

The application uses mock data for stores, products, categories, users, orders, and addresses. These are located in the `src/data/` directory.

-   `categories.js`: Defines product categories.
-   `customers.js`: Mock customer data.
-   `orders.js`: Mock order history, including `statusHistory` and `deliveryAddress`.
-   `products.js`: Mock product listings with details like price, image, and availability.
-   `stores.js`: Mock store information, including coordinates and delivery details.
-   `users.js`: Mock user accounts for authentication.
-   `villages.js`: Defines available villages with delivery fees and times.
-   `addresses.js`: Mock user addresses.

## Screenshots

*(Screenshots will be added here once the UI is fully developed and stable)*

## Project Structure

```
.
├── App.tsx
├── app.json
├── babel.config.js
├── global.css
├── index.js
├── metro.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── components/
    │   ├── CartItem.js
    │   ├── CategoryCard.js
    │   ├── EmptyState.js
    │   ├── Header.js
    │   ├── LoadingSpinner.js
    │   ├── OrderCard.js
    │   ├── ProductCard.js
    │   ├── RTLText.js
    │   ├── SearchBar.js
    │   ├── SkeletonLoader.js
    │   ├── HomeScreenSkeleton.js
    │   ├── StoreDetailsScreenSkeleton.js
    │   ├── StoreCard.js
    │   └── VillagePicker.js
    ├── constants/
    │   ├── colors.js
    │   └── sizes.js
    ├── context/
    │   ├── AuthContext.js
    │   ├── CartContext.js
    │   ├── LocalizationContext.js
    │   └── LocationProvider.js
    ├── data/
    │   ├── addresses.js
    │   ├── categories.js
    │   ├── customers.js
    │   ├── index.js
    │   ├── orders.js
    │   ├── products.js
    │   ├── stores.js
    │   ├── users.js
    │   └── villages.js
    ├── navigation/
    │   ├── AppNavigator.js
    │   ├── AuthNavigator.js
    │   └── MainTabNavigator.js
    ├── screens/
    │   ├── Auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   ├── Cart/
    │   │   └── CartScreen.js
    │   ├── Categories/
    │   │   └── CategoryStoresScreen.js
    │   ├── Checkout/
    │   │   └── CheckoutScreen.js
    │   ├── Customers/
    │   │   └── CustomerSearchScreen.js
    │   ├── Dashboard/
    │   │   └── DashboardScreen.js
    │   ├── Home/
    │   │   ├── HomeScreen.js
    │   │   └── StoreDetailsScreen.js
    │   ├── Orders/
    │   │   ├── OrderDetailsScreen.js
    │   │   └── OrdersScreen.js
    │   └── Settings/
    │       ├── SettingsScreen.js
    │       └── AddressesScreen.js
    ├── types/
    │   └── css.d.ts
    └── utils/
        ├── arabicLocalization.js
        ├── auth.js
        ├── customerManager.js
        ├── dataExportImport.js
        ├── dataValidation.js
        ├── distance.js
        ├── helpers.js
        ├── localization.js
        ├── locationHelpers.js
        ├── offlineDataManager.js
        ├── paymentService.js
        ├── STORAGE_README.md
        └── storage.js
```
