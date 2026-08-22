// Helper for GPS Geolocation & Google Maps Embeds

export interface GPSCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export function getCurrentGPSLocation(): Promise<GPSCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let address = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        try {
          // Attempt reverse geocoding via free OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) address = data.display_name;
          }
        } catch {}

        resolve({ latitude, longitude, accuracy, address });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Calculate distance in meters between two GPS coordinates (Haversine formula)
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Generates Google Maps Embed URL
export function getGoogleMapsEmbedUrl(queryOrCoords: string): string {
  const encoded = encodeURIComponent(queryOrCoords || 'San Francisco, CA');
  return `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
