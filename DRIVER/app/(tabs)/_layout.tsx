import { Tabs } from "expo-router";
import { Home, Package, Navigation2 } from "lucide-react-native";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: "#2563eb" }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "الطلبات القريبة",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="active"
                options={{
                    title: "التوصيل الجاري",
                    tabBarIcon: ({ color }) => <Package size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tracking"
                options={{
                    title: "التتبع المباشر",
                    tabBarIcon: ({ color }) => <Navigation2 size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}

