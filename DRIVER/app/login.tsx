import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // Mock login
        console.log("Logging in with:", email, password);
        router.replace("/(tabs)/home");
    };

    return (
        <View className="flex-1 bg-gray-50 p-6 justify-center">
            <Text className="text-3xl font-bold text-gray-900 mb-8 text-center">
                تسجيل دخول السائق
            </Text>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 mb-1 font-medium">البريد الإلكتروني</Text>
                    <TextInput
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-1 font-medium">كلمة المرور</Text>
                    <TextInput
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    className="bg-blue-600 rounded-lg p-4 mt-4"
                    onPress={handleLogin}
                >
                    <Text className="text-white text-center font-bold text-lg">
                        تسجيل الدخول
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4"
                    onPress={() => router.push("/register")}
                >
                    <Text className="text-blue-600 text-center font-medium">
                        ليس لديك حساب؟ سجل الآن
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
