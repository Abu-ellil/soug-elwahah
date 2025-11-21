import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, DollarSign } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Order } from "../types";

interface OrderCardProps {
    order: Order;
    onPress: () => void;
    index?: number;
}

export default function OrderCard({ order, onPress, index = 0 }: OrderCardProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="mb-4"
        >
            <TouchableOpacity
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                onPress={onPress}
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <MapPin size={16} color="#2563eb" />
                            <Text className="text-gray-900 font-bold ml-2">{order.pickup}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MapPin size={16} color="#dc2626" />
                            <Text className="text-gray-900 font-bold ml-2">{order.dropoff}</Text>
                        </View>
                    </View>
                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 font-bold">{order.distance}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                    <View className="flex-row items-center">
                        <DollarSign size={20} color="#16a34a" />
                        <Text className="text-green-600 font-bold text-xl ml-1">
                            {order.price} ج.م
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-sm">اضغط للتفاصيل</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
