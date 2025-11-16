import { calculateDistance } from './distance';

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
export const getStoresWithinRadius = (stores, userLocation, radius = 5) => {
  if (!userLocation || !stores) {
    return [];
  }

  return stores
    .filter((store) => {
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
export const getProductsWithinRadius = (products, stores, userLocation, radius = 5) => {
  const nearbyStores = getStoresWithinRadius(stores, userLocation, radius);
  const storeIds = nearbyStores.map((store) => store.id);

  return products.filter((product) => {
    return product.isAvailable && storeIds.includes(product.storeId);
  });
};

// Get stores by category within radius
export const getStoresByCategoryWithinRadius = (stores, userLocation, categoryId, radius = 5) => {
  return getStoresWithinRadius(stores, userLocation, radius).filter(
    (store) => store.categoryId === categoryId
  );
};

// Get villages within a given radius from user location
export const getAvailableVillages = (villages, userLocation, radius = 50) => {
  if (!userLocation || !villages) {
    return [];
  }

  return villages
    .filter((village) => {
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
