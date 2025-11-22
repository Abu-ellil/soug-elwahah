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

      let storeLat, storeLng;
      if (store.coordinates && store.coordinates.coordinates && Array.isArray(store.coordinates.coordinates)) {
        storeLat = store.coordinates.coordinates[1];
        storeLng = store.coordinates.coordinates[0];
      } else if (store.coordinates) {
        storeLat = store.coordinates.lat;
        storeLng = store.coordinates.lng;
      } else {
        return false;
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        storeLat,
        storeLng
      );

      return distance <= radius;
    })
    .map((store) => {
      let storeLat, storeLng;
      if (store.coordinates && store.coordinates.coordinates && Array.isArray(store.coordinates.coordinates)) {
        storeLat = store.coordinates.coordinates[1];
        storeLng = store.coordinates.coordinates[0];
      } else {
        storeLat = store.coordinates.lat;
        storeLng = store.coordinates.lng;
      }

      return {
        ...store,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          storeLat,
          storeLng
        ),
      };
    })
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

      let villageLat, villageLng;
      if (village.coordinates && village.coordinates.coordinates && Array.isArray(village.coordinates.coordinates)) {
        villageLat = village.coordinates.coordinates[1];
        villageLng = village.coordinates.coordinates[0];
      } else if (village.coordinates) {
        villageLat = village.coordinates.lat;
        villageLng = village.coordinates.lng;
      } else {
        return false;
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        villageLat,
        villageLng
      );

      return distance <= radius;
    })
    .map((village) => {
      let villageLat, villageLng;
      if (village.coordinates && village.coordinates.coordinates && Array.isArray(village.coordinates.coordinates)) {
        villageLat = village.coordinates.coordinates[1];
        villageLng = village.coordinates.coordinates[0];
      } else {
        villageLat = village.coordinates.lat;
        villageLng = village.coordinates.lng;
      }

      return {
        ...village,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          villageLat,
          villageLng
        ),
      };
    })
    .sort((a, b) => a.distance - b.distance);
};
