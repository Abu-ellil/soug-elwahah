import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  __v: number;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-4">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">جاري تحميل الفئات...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center py-4">
        <Text className="text-red-500 mb-2">حدث خطأ أثناء تحميل الفئات</Text>
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="mb-3 text-sm font-semibold text-gray-700">
        فئة المتجر *
      </Text>
      {categories.length === 0 ? (
        <View className="items-center justify-center py-4">
          <Text className="text-gray-600">لا توجد فئات متاحة</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row">
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                onPress={() => onCategorySelect(category)}
                className={`items-center p-4 m-2 rounded-xl border-2 ${
                  selectedCategory?._id === category._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                style={{ minWidth: 100 }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: category.color + "40" }}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text className="text-center text-sm font-medium text-gray-800">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {selectedCategory && (
        <View className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <Text className="text-green-800 text-center">
            تم اختيار فئة:{" "}
            <Text className="font-bold">{selectedCategory.name}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export default CategorySelector;
