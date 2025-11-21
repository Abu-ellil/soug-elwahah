import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useOrder } from "../../context/OrderContext";
import { MapPin, Package, Truck, CheckCircle, ArrowRight } from "lucide-react-native";
import { useState } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function ActiveScreen() {
    const { activeOrder, updateOrderStatus } = useOrder();
    const [currentStep, setCurrentStep] = useState<number>(0);

    if (!activeOrder) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Package size={64} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 text-lg">No active deliveries</Text>
                <Text className="text-gray-400 mt-2 text-sm">Accept an order to start delivering</Text>
            </View>
        );
    }

    const steps = [
        { id: 0, label: "Order Accepted", status: "ACCEPTED", icon: CheckCircle, color: "#16a34a" },
        { id: 1, label: "Picked Up", status: "PICKED_UP", icon: Package, color: "#2563eb" },
        { id: 2, label: "In Transit", status: "IN_TRANSIT", icon: Truck, color: "#f59e0b" },
        { id: 3, label: "Delivered", status: "DELIVERED", icon: CheckCircle, color: "#16a34a" },
    ];

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            updateOrderStatus(steps[nextStep].status as any);
        }
    };

    const StepIcon = steps[currentStep].icon;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-6">
                {/* Header */}
                <Animated.View entering={FadeIn.duration(400)} className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <View className="items-center mb-4">
                        <View className="bg-blue-100 p-4 rounded-full mb-3">
                            <StepIcon size={40} color={steps[currentStep].color} />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{steps[currentStep].label}</Text>
                        <Text className="text-gray-500 mt-1">Step {currentStep + 1} of {steps.length}</Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </View>
                </Animated.View>

                {/* Order Details */}
                <Animated.View entering={FadeInDown.delay(200)} className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Delivery Details</Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <View className="bg-blue-100 p-2 rounded-full">
                                <MapPin size={16} color="#2563eb" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-500 text-xs">Pickup Location</Text>
                                <Text className="text-gray-900 font-semibold text-base">{activeOrder.pickup}</Text>
                            </View>
                        </View>

                        <View className="ml-5 border-l-2 border-dashed border-gray-300 h-6" />

                        <View className="flex-row items-center">
                            <View className="bg-red-100 p-2 rounded-full">
                                <MapPin size={16} color="#dc2626" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-500 text-xs">Dropoff Location</Text>
                                <Text className="text-gray-900 font-semibold text-base">{activeOrder.dropoff}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
                        <View>
                            <Text className="text-gray-500 text-sm">Distance</Text>
                            <Text className="text-gray-900 font-bold text-lg">{activeOrder.distance}</Text>
                        </View>
                        <View>
                            <Text className="text-gray-500 text-sm">Earnings</Text>
                            <Text className="text-green-600 font-bold text-lg">{activeOrder.price} EGP</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Timeline */}
                <Animated.View entering={FadeInDown.delay(400)} className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Progress Timeline</Text>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <View key={step.id}>
                                <View className="flex-row items-center">
                                    <View className={`p-2 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <Icon size={20} color={isCompleted ? step.color : '#9ca3af'} />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </Text>
                                        {isCurrent && (
                                            <Text className="text-blue-600 text-xs mt-1">Current Step</Text>
                                        )}
                                    </View>
                                    {isCompleted && (
                                        <CheckCircle size={20} color="#16a34a" />
                                    )}
                                </View>
                                {index < steps.length - 1 && (
                                    <View className={`ml-5 border-l-2 ${isCompleted ? 'border-green-400' : 'border-gray-200'} h-8`} />
                                )}
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Action Button */}
                {currentStep < steps.length - 1 && (
                    <Animated.View entering={FadeInDown.delay(600)}>
                        <TouchableOpacity
                            className="bg-blue-600 p-5 rounded-2xl flex-row items-center justify-center shadow-lg"
                            onPress={handleNextStep}
                        >
                            <Text className="text-white font-bold text-lg mr-2">
                                {currentStep === 0 ? "Mark as Picked Up" :
                                    currentStep === 1 ? "Start Transit" :
                                        "Complete Delivery"}
                            </Text>
                            <ArrowRight size={20} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {currentStep === steps.length - 1 && (
                    <Animated.View entering={FadeInDown.delay(600)} className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
                        <View className="items-center">
                            <CheckCircle size={48} color="#16a34a" />
                            <Text className="text-green-800 font-bold text-xl mt-3">Delivery Completed!</Text>
                            <Text className="text-green-600 mt-2 text-center">
                                Great job! You've earned {activeOrder.price} EGP
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </ScrollView>
    );
}
