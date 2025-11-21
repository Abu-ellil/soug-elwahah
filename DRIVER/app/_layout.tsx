import "../global.css";
import { Stack } from "expo-router";
import { OrderProvider } from "../context/OrderContext";

export default function Layout() {
    return (
        <OrderProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
            </Stack>
        </OrderProvider>
    );
}
