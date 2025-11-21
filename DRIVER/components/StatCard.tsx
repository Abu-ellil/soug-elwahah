import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color: string;
}

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
    return (
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mx-1">
            <View className="flex-row items-center mb-2">
                <View className="bg-gray-50 p-2 rounded-full">
                    <Icon size={20} color={color} />
                </View>
            </View>
            <Text className="text-gray-900 font-bold text-xl">{value}</Text>
            <Text className="text-gray-500 text-sm">{label}</Text>
        </View>
    );
}
