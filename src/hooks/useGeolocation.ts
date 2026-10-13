import { useState, useCallback } from 'react';

interface GeolocationResult {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  requestLocation: () => void;
  reset: () => void;
}

/**
 * Hook to request the user's current position using the browser Geolocation API.
 * It performs a one‑time `getCurrentPosition` request (no watching) and returns
 * loading / error states along with the coordinates.
 *
 * Errors are normalized to human‑readable messages covering the four standard
 * Geolocation error codes.
 */
export function useGeolocation(): GeolocationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setLatitude(null);
    setLongitude(null);
  }, []);

  const requestLocation = useCallback(() => {
    // If a request is already in progress, ignore subsequent clicks
    if (loading) return;
    reset();
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      (geoError) => {
        let message = '';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = 'Permission to access location was denied.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case geoError.TIMEOUT:
            message = 'The request to get your location timed out.';
            break;
          default:
            message = 'An unknown error occurred while retrieving location.';
        }
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [reset, loading]);

  return {
    loading,
    error,
    latitude,
    longitude,
    requestLocation,
    reset,
  };
}
