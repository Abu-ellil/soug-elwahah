import { calculateDistance } from './distance';
import { VILLAGES } from '../data/villages';
import { STORES } from '../data/stores';
import { PRODUCTS } from '../data/products';

// Validate coordinate array [longitude, latitude]
export const isValidCoordinate = (coord) => {
  return (
    coord &&
    typeof coord[0] === 'number' && // longitude
    typeof coord[1] === 'number' && // latitude
    !isNaN(coord[0]) &&
    !isNaN(coord[1])
  );
};

// Check if coordinates are within delivery zone
export const isInDeliveryZone = (coordinates, villageId) => {
  const village = VILLAGES.find((v) => v.id === villageId);
  if (!village) return false;

  // For now, use center coordinates as zone center
  const distance = calculateDistance(
    coordinates.lat,
    coordinates.lng,
    village.coordinates.lat,
    village.coordinates.lng
  );

  return distance <= village.deliveryRadius;
};

// Get available villages for a given location
export const getAvailableVillages = (userLocation, radius = 50) => {
  if (!VILLAGES) {
    return [];
  }
  return VILLAGES.filter((village) => {
    if (!village.isActive) return false;

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      village.coordinates.lat,
      village.coordinates.lng
    );

    return distance <= radius;
  })
    .map((village) => ({
      ...village,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        village.coordinates.lat,
        village.coordinates.lng
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Get stores filtered by village
export const getStoresByVillage = (stores, villageId) => {
  return stores.filter((store) => store.villageId === villageId);
};

// Get delivery estimate based on distance
export const getDeliveryEstimate = (distance) => {
  if (distance <= 5) return '10-15 دقيقة';
  if (distance <= 10) return '15-25 دقيقة';
  if (distance <= 15) return '20-30 دقيقة';
  return '30-45 دقيقة';
};

// Get delivery fee based on distance
export const getDeliveryFee = (distance, baseFee = 10) => {
  if (distance <= 5) return baseFee;
  if (distance <= 10) return baseFee + 5;
  if (distance <= 15) return baseFee + 8;
  return baseFee + 12;
};

// Get stores within a given radius from user location
export const getStoresWithinRadius = (userLocation, radius = 5) => {
  if (!userLocation || !STORES) {
    return [];
  }

  return STORES.filter((store) => {
    if (!store.isOpen) return false;

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      store.coordinates.lat,
      store.coordinates.lng
    );

    return distance <= radius;
  })
    .map((store) => ({
      ...store,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.coordinates.lat,
        store.coordinates.lng
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Get products from stores within radius
export const getProductsWithinRadius = (userLocation, radius = 5) => {
  const nearbyStores = getStoresWithinRadius(userLocation, radius);
  const storeIds = nearbyStores.map(store => store.id);

  return PRODUCTS.filter((product) => {
    return product.isAvailable && storeIds.includes(product.storeId);
  });
};

// Get stores by category within radius
export const getStoresByCategoryWithinRadius = (userLocation, categoryId, radius = 5) => {
  return getStoresWithinRadius(userLocation, radius).filter(store =>
    store.categoryId === categoryId
  );
};

// Get nearest village to user location
export const getNearestVillage = (userLocation) => {
  if (!userLocation || !VILLAGES) {
    return null;
  }

  let nearestVillage = null;
  let minDistance = Infinity;

  VILLAGES.filter(v => v.isActive).forEach((village) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      village.coordinates.lat,
      village.coordinates.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestVillage = { ...village, distance };
    }
  });

  return nearestVillage;
};

// Check if user location is within any village's delivery radius
export const isWithinAnyVillageRadius = (userLocation) => {
  if (!userLocation || !VILLAGES) {
    return false;
  }

  return VILLAGES.some((village) => {
    if (!village.isActive) return false;

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      village.coordinates.lat,
      village.coordinates.lng
    );

    return distance <= village.deliveryRadius;
  });
};
