import { useState, useEffect } from 'react';

export interface GeoLocationState {
  latitude: number;
  longitude: number;
  error: string | null;
  loading: boolean;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocationState>({
    latitude: 19.076, // Default Mumbai coordinates
    longitude: 72.8777,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      { timeout: 8000 }
    );
  }, []);

  return location;
}
