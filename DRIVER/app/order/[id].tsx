import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ORDERS } from "../../constants/data";
import { MapPin, DollarSign, ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useOrder } from "../../context/OrderContext";

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { setActiveOrder } = useOrder();
  const order = ORDERS.find((o) => o.id === id);
  const [bidPrice, setBidPrice] = useState("");

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>الطلب غير موجود</Text>
      </View>
    );
  }

  const handleAccept = () => {
    const acceptedOrder = { ...order, status: 'ACCEPTED' as const };
    setActiveOrder(acceptedOrder);
    Alert.alert("تم بنجاح", "لقد قبلت الطلب بسعر " + order.price + " ج.م", [
      { text: "حسناً", onPress: () => router.replace("/(tabs)/active") },
    ]);
  };

  const handleBid = () => {
    if (!bidPrice || parseFloat(bidPrice) <= 0) {
      Alert.alert("سعر غير صالح", "يرجى إدخال سعر صالح");
      return;
    }
    Alert.alert("تم تقديم العرض", "لقد عرضت " + bidPrice + " ج.م. في انتظار رد العميل...", [
      { text: "حسناً", onPress: () => router.replace("/(tabs)/home") },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">تفاصيل الطلب</Text>
      </View>

      <View className="p-6">
        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-4">
            <MapPin size={20} color="#2563eb" />
            <View className="ml-3">
              <Text className="text-gray-500 text-sm">الاستلام</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {order.pickup}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <MapPin size={20} color="#dc2626" />
            <View className="ml-3">
              <Text className="text-gray-500 text-sm">التسليم</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {order.dropoff}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-gray-500 text-lg">سعر العميل</Text>
          <Text className="text-3xl font-bold text-green-600">
            {order.price} ج.م
          </Text>
        </View>

        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl mb-4"
          onPress={handleAccept}
        >
          <Text className="text-white text-center font-bold text-lg">
            قبول بسعر {order.price} ج.م
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-400">أو</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <Text className="text-gray-700 font-bold mb-2">اقترح سعراً</Text>
        <View className="flex-row space-x-4">
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-4 text-lg"
            placeholder="أدخل المبلغ"
            keyboardType="numeric"
            value={bidPrice}
            onChangeText={setBidPrice}
          />
          <TouchableOpacity
            className="bg-gray-900 justify-center px-6 rounded-xl"
            onPress={handleBid}
          >
            <Text className="text-white font-bold">قدم عرضاً</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
