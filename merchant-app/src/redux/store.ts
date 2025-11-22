import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import storeApplicationReducer from "./slices/storeApplicationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    storeApplication: storeApplicationReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Add this to make the store available globally if needed
declare global {
  var __store__: typeof store;
}

// Only set global store reference in web environments
if (typeof window !== "undefined" && typeof document !== "undefined") {
  (window as any).__store__ = store;
}

export default store;
