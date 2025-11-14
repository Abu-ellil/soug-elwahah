// حساب المسافة بين نقطتين باستخدام صيغة هافرساين
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// تنسيق المسافة للعرض
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} م`;
  }
  return `${distance.toFixed(1)} كم`;
};

// ترتيب المحلات حسب القرب
export const sortStoresByDistance = (stores, userLocation) => {
  return stores
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
