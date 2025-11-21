import { View, FlatList, Text } from "react-native";
import { useRouter } from "expo-router";
import { ORDERS } from "../../constants/data";
import OrderCard from "../../components/OrderCard";
import { Package, DollarSign, TrendingUp } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
    const router = useRouter();

    const stats = [
        { label: "متاح", value: ORDERS.length, icon: Package, color: "#2563eb" },
        { label: "أرباح اليوم", value: "0 ج.م", icon: DollarSign, color: "#16a34a" },
        { label: "مكتملة", value: "0", icon: TrendingUp, color: "#f59e0b" },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={ORDERS}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View className="bg-blue-600 px-6 pt-12 pb-8 rounded-b-3xl">
                            <Text className="text-white text-3xl font-bold mb-2">أهلاً بك يا كابتن!</Text>
                            <Text className="text-blue-100 text-base">ابحث عن طلبك القادم</Text>
                        </View>

                        {/* Stats Cards */}
                        <View className="px-4 -mt-6 mb-4">
                            <View className="bg-white rounded-2xl p-4 shadow-sm flex-row justify-between">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Animated.View
                                            key={stat.label}
                                            entering={FadeInDown.delay(index * 100)}
                                            className="items-center flex-1"
                                        >
                                            <View className="bg-gray-50 p-3 rounded-full mb-2">
                                                <Icon size={20} color={stat.color} />
                                            </View>
                                            <Text className="text-gray-900 font-bold text-lg">{stat.value}</Text>
                                            <Text className="text-gray-500 text-xs">{stat.label}</Text>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Section Title */}
                        <View className="px-6 mb-3">
                            <Text className="text-gray-900 text-xl font-bold">طلبات قريبة</Text>
                            <Text className="text-gray-500 text-sm">اضغط للتفاصيل وقدم عرضك</Text>
                        </View>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <View className="px-4">
                        <OrderCard
                            order={item}
                            index={index}
                            onPress={() => router.push(`/order/${item.id}`)}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}
