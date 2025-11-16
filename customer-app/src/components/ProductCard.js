import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatPrice } from '../utils/helpers';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';
import ImageWithFallback from './ImageWithFallback';
import LoginPromptModal from './LoginPromptModal';

const ProductCard = ({ product, onPress, onAddToCart, navigation }) => {
  const animation = useRef(new Animated.Value(0)).current;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    try {
      onAddToCart(product);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Trigger animation
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      if (error.message === 'يجب تسجيل الدخول أولاً') {
        setShowLoginModal(true);
      } else {
        // Handle other errors as needed
        console.error('Error adding to cart:', error);
      }
    }
  };

  const handleLogin = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.5],
    }),
  };

  return (
    <>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageWithFallback
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {!product.isAvailable && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>غير متوفر</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.description} numberOfLines={1}>
            {product.description}
          </Text>

          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(product.price)}
          </Text>

          {product.isAvailable ? (
            <Animated.View style={animatedStyle}>
              <TouchableOpacity onPress={handleAddToCart} style={styles.addButton}>
                <MaterialIcons name="add-shopping-cart" size={16} color={COLORS.card} />
                <Text style={styles.addButtonText}>أضف للسلة</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.unavailableButton}>
              <Text style={styles.unavailableButtonText}>غير متوفر</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        message="يجب تسجيل الدخول أولاً لإضافة المنتج إلى السلة"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: COLORS.card,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.base,
  },
  name: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  description: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'right',
  },
  price: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.card,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unavailableButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    alignItems: 'center',
  },
  unavailableButtonText: {
    color: COLORS.gray,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
});

export default ProductCard;
