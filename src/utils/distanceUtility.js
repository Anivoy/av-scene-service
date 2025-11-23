/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance and return detailed result
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {Object} Distance result with km and miles
 */
export function calculateDistanceDetailed(lat1, lon1, lat2, lon2) {
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  const distanceMiles = distanceKm * 0.621371;

  return {
    kilometers: Math.round(distanceKm * 100) / 100,
    miles: Math.round(distanceMiles * 100) / 100,
    meters: Math.round(distanceKm * 1000),
  };
}

/**
 * Check if a guess is within acceptable range
 * @param {number} distance - Distance in kilometers
 * @param {number} threshold - Acceptable threshold in kilometers
 * @returns {boolean} Whether the guess is acceptable
 */
export function isWithinRange(distance, threshold = 5) {
  return distance <= threshold;
}
