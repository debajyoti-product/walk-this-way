import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

const MAPS_API_KEY = 'AIzaSyA9kHSqZsbpvc1Pp-ll3n3uVukvtvdm6Ug';

// Haversine formula to project a coordinate
function projectCoordinate(lat, lon, distanceMeters, bearingDegrees) {
  const R = 6378137; // Earth’s radius in meters
  const bearing = bearingDegrees * (Math.PI / 180);
  const lat1 = lat * (Math.PI / 180);
  const lon1 = lon * (Math.PI / 180);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMeters / R) +
    Math.cos(lat1) * Math.sin(distanceMeters / R) * Math.cos(bearing)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(distanceMeters / R) * Math.cos(lat1),
    Math.cos(distanceMeters / R) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    latitude: lat2 * (180 / Math.PI),
    longitude: lon2 * (180 / Math.PI)
  };
}

// Haversine distance between two coordinates
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6378137; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Decode polyline string from Google Maps API
function decodePolyline(t, e) {
  // basic polyline decoder
  let n, o, u = 0, l = 0, r = 0, h = 0, i = 0, a = null, d = Math.pow(10, e || 5);
  const c = [];
  for (; u < t.length;) {
    a = null, h = 0, i = 0;
    do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
    n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0;
    do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
    o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, c.push({ latitude: l / d, longitude: r / d });
  }
  return c;
}

// Extract checkpoints from a route at 25%, 50%, 75% of the way
function extractCheckpoints(routeData) {
  if (!routeData) return [];

  // For routes (array of {latitude, longitude})
  if (Array.isArray(routeData) && routeData.length >= 4) {
    const len = routeData.length;
    return [
      { ...routeData[Math.floor(len * 0.25)], index: 0, reached: false },
      { ...routeData[Math.floor(len * 0.50)], index: 1, reached: false },
      { ...routeData[Math.floor(len * 0.75)], index: 2, reached: false },
    ];
  }

  return [];
}

export function useWalkingRoute(stepGoal, mapLoaded = true) {
  const [route, setRoute] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [routeError, setRouteError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const generateRoute = useCallback(async (startLoc) => {
    setIsGenerating(true);
    setRouteError(null);

    const targetDistance = (stepGoal * 0.762) + 250;
    const waypointDistance = targetDistance / 2;

    let attempts = 0;
    let foundRoute = null;

    while (attempts < 2 && !foundRoute) {
      const randomBearing = Math.random() * 360;
      const legDistance = waypointDistance / 3; // Each leg is shorter for a tighter loop
      // 3 waypoints at 90° intervals to form a rectangular loop: origin → wp1 → wp2 → wp3 → back to origin
      const wp1 = projectCoordinate(startLoc.latitude, startLoc.longitude, legDistance, randomBearing);
      const wp2 = projectCoordinate(startLoc.latitude, startLoc.longitude, legDistance, (randomBearing + 90) % 360);
      const wp3 = projectCoordinate(startLoc.latitude, startLoc.longitude, legDistance, (randomBearing + 180) % 360);
      
      if (Platform.OS === 'web') {
        const destOffset = projectCoordinate(startLoc.latitude, startLoc.longitude, 10, (randomBearing + 270) % 360);
        foundRoute = [
          { latitude: startLoc.latitude, longitude: startLoc.longitude },
          { latitude: wp1.latitude, longitude: wp1.longitude },
          { latitude: wp2.latitude, longitude: wp2.longitude },
          { latitude: wp3.latitude, longitude: wp3.longitude },
          { latitude: destOffset.latitude, longitude: destOffset.longitude },
        ];
      } else {
        const origin = `${startLoc.latitude},${startLoc.longitude}`;
        const destOffset = projectCoordinate(startLoc.latitude, startLoc.longitude, 10, (randomBearing + 270) % 360);
        const dest = `${destOffset.latitude},${destOffset.longitude}`;
        const waypoints = `${wp1.latitude},${wp1.longitude}|${wp2.latitude},${wp2.longitude}|${wp3.latitude},${wp3.longitude}`;
        
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&waypoints=${waypoints}&mode=walking&key=${MAPS_API_KEY}`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === 'OK' && data.routes.length > 0) {
            const polylineStr = data.routes[0].overview_polyline.points;
            foundRoute = decodePolyline(polylineStr);
          } else {
            console.warn("Directions API failed, using fallback route");
            foundRoute = [
              { latitude: startLoc.latitude, longitude: startLoc.longitude },
              { latitude: wp1.latitude, longitude: wp1.longitude },
              { latitude: wp2.latitude, longitude: wp2.longitude },
              { latitude: wp3.latitude, longitude: wp3.longitude },
            ];
          }
        } catch (err) {
          attempts++;
        }
      }
    }

    if (foundRoute) {
      setRoute(foundRoute);
      setCheckpoints(extractCheckpoints(foundRoute));
    } else {
      setRouteError("Uh oh! looks like we couldn't find a walking path nearby");
    }
    setIsGenerating(false);
  }, [stepGoal]);

  useEffect(() => {
    let subscriber = null;

    const startTracking = async () => {
      if (Platform.OS === 'web' && !mapLoaded) return;
      if (isTracking) return;

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setRouteError('Permission to access location was denied');
        return;
      }
      
      // Get initial position and generate route
      let currentPos;
      try {
        currentPos = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
      } catch (err) {
        if (Platform.OS === 'web') {
          // Fallback to a default location (e.g., San Francisco) if Geolocation fails on web
          currentPos = { coords: { latitude: 37.7749, longitude: -122.4194 } };
        } else {
          setRouteError('Could not determine location. Please check your GPS settings.');
          return;
        }
      }
      
      setCurrentLocation(currentPos.coords);
      generateRoute(currentPos.coords);

      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (loc) => {
          setCurrentLocation(loc.coords);
        }
      );
      setIsTracking(true);
    };

    startTracking();

    return () => {
      if (subscriber) {
        try { subscriber.remove(); } catch (e) { /* expo-location web cleanup bug */ }
      }
    };
  }, [generateRoute, mapLoaded, isTracking]);

  return { route, checkpoints, routeError, isGenerating, currentLocation, isTracking };
}
