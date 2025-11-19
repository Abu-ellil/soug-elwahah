import { create } from "zustand";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import apiService from "../services/api";

interface Coordinates {
  lat: number;
  lng: number;
}

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

interface StoreApplicationState {
  storeName: string;
  storeDescription: string;
  storeImage: string | undefined;
  coordinates: Coordinates | null;
  documents: string[];
  selectedCategory: Category | null;
  categories: Category[];
  isCategoriesLoading: boolean;
  isLoading: boolean;
  isLocationLoading: boolean;
  setStoreName: (name: string) => void;
  setStoreDescription: (description: string) => void;
  setStoreImage: (image: string | undefined) => void;
  setCoordinates: (coords: Coordinates | null) => void;
  setSelectedCategory: (category: Category | null) => void;
  setCategories: (categories: Category[]) => void;
  setIsCategoriesLoading: (loading: boolean) => void;
  setDocuments: (docs: string[]) => void;
  setIsLocationLoading: (loading: boolean) => void;
  loadCategories: () => Promise<void>;
  pickImage: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  submitApplication: () => Promise<{ success: boolean; message?: string }>;
  reset: () => void;
}

export const useStoreApplicationStore = create<StoreApplicationState>(
  (set, get) => ({
    storeName: "",
    storeDescription: "",
    storeImage: undefined,
    coordinates: null,
    selectedCategory: null,
    categories: [],
    isCategoriesLoading: false,
    documents: [],
    isLoading: false,
    isLocationLoading: false,

    setStoreName: (name) => set({ storeName: name }),
    setStoreDescription: (description) =>
      set({ storeDescription: description }),
    setStoreImage: (image) => set({ storeImage: image }),
    setCoordinates: (coords) => set({ coordinates: coords }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setCategories: (categories) => set({ categories }),
    setIsCategoriesLoading: (loading) => set({ isCategoriesLoading: loading }),
    setDocuments: (docs) => set({ documents: docs }),
    setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),

    pickImage: async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى مكتبة الصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        set({ storeImage: result.assets[0].uri });
      }
    },

    loadCategories: async () => {
      try {
        set({ isCategoriesLoading: true });
        const response = await apiService.getCategories();
        if (response.success) {
          set({ categories: response.data.categories });
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        set({ isCategoriesLoading: false });
      }
    },

    getCurrentLocation: async () => {
      try {
        set({ isLocationLoading: true });
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى موقعك");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newCoordinates = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        set({ coordinates: newCoordinates });
        Alert.alert("تم", "تم الحصول على موقعك بنجاح");
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("خطأ", "حدث خطأ أثناء الحصول على موقعك");
      } finally {
        set({ isLocationLoading: false });
      }
    },

    submitApplication: async () => {
      const {
        storeName,
        storeDescription,
        coordinates,
        documents,
        storeImage,
        selectedCategory,
      } = get();

      if (!storeName.trim()) {
        Alert.alert("خطأ", "يرجى إدخال اسم المتجر");
        return { success: false, message: "يرجى إدخال اسم المتجر" };
      }

      if (!coordinates) {
        Alert.alert("خطأ", "يرجى تحذير موقع المتجر");
        return { success: false, message: "يرجى تحذير موقع المتجر" };
      }

      if (!selectedCategory) {
        Alert.alert("خطأ", "يرجى اختيار فئة المتجر");
        return { success: false, message: "يرجى اختيار فئة المتجر" };
      }

      set({ isLoading: true });
      try {
        const result = await apiService.createStoreApplication({
          name: storeName.trim(),
          description: storeDescription.trim(),
          coordinates,
          documents,
          image: storeImage,
          categoryId: selectedCategory._id, // Add selected category ID (no optional chaining since we validated it exists)
        });

        if (result.success) {
          Toast.show({
            type: "success",
            text1: "تم",
            text2: "تم تقديم طلب إنشاء المتجر بنجاح، في انتظار موافقة الإدارة",
          });
          return { success: true };
        } else {
          Alert.alert("خطأ", result.message || "حدث خطأ أثناء تقديم الطلب");
          return {
            success: false,
            message: result.message || "حدث خطأ أثناء تقديم الطلب",
          };
        }
      } catch (error) {
        Alert.alert("خطأ", "حدث خطأ أثناء تقديم الطلب");
        return { success: false, message: "حدث خطأ أثناء تقديم الطلب" };
      } finally {
        set({ isLoading: false });
      }
    },

    reset: () =>
      set({
        storeName: "",
        storeDescription: "",
        storeImage: undefined,
        coordinates: null,
        selectedCategory: null, // Reset selected category
        categories: [], // Reset categories
        isCategoriesLoading: false, // Reset loading state
        documents: [],
        isLoading: false,
      }),
  })
);
