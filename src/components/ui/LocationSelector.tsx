import React, { useEffect, useRef, useState } from 'react';
import { CAMPUS_LOCALITIES } from '@/config/localities';
import { isPublicPickupLocation } from '@/lib/locationValidation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { reverseGeocode } from '@/lib/reverseGeocode';

interface LocationSelectorProps {
  campusId: string;
  selectedLocation: string;
  onSelect: (loc: string) => void;
}

export default function LocationSelector({ campusId, selectedLocation, onSelect }: LocationSelectorProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggestedLocation, setSuggestedLocation] = useState<string | null>(null);
  const [campusMismatch, setCampusMismatch] = useState(false);

  const { loading, error: geoError, latitude, longitude, requestLocation, reset } = useGeolocation();

  // Reset selections when campus changes
  const prevCampusId = useRef<string>(campusId);
  useEffect(() => {
    if (prevCampusId.current !== campusId) {
      const campusLocs = CAMPUS_LOCALITIES[campusId]?.localities?.map(l => l.name) ?? [];
      if (selectedLocation && !campusLocs.includes(selectedLocation)) {
        onSelect('');
      }
      setManualLocation('');
      setError(null);
      setSuggestedLocation(null);
      setCampusMismatch(false);
      reset();
      prevCampusId.current = campusId;
    }
  }, [campusId, selectedLocation, onSelect, reset]);

  // When coordinates are available, attempt reverse‑geocoding
  useEffect(() => {
    if (latitude != null && longitude != null) {
      (async () => {
        const result = await reverseGeocode(latitude, longitude);
        if (result && isPublicPickupLocation(result)) {
          setSuggestedLocation(result);
          setCampusMismatch(false);
        } else if (result) {
          // Result exists but fails public‑pickup validation
          setError('Your detected address looks too private. Please choose a public landmark instead.');
        } else {
          setError('We couldn\'t determine a suitable public pickup landmark.');
        }
      })();
    }
  }, [latitude, longitude]);

  // Propagate geolocation API errors to UI
  useEffect(() => {
    if (geoError) {
      setError(geoError);
    }
  }, [geoError]);

  const handleCampusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSelect(val);
    setError(null);
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualLocation(val);
    if (val && !isPublicPickupLocation(val)) {
      setError('Please enter a public landmark; avoid room numbers, flat numbers, or phone numbers.');
    } else {
      setError(null);
      onSelect(val);
    }
  };

  const handleUseSuggestion = () => {
    if (suggestedLocation) {
      onSelect(suggestedLocation);
    }
  };

  const campusOptions = CAMPUS_LOCALITIES[campusId]?.localities ?? [];

  return (
    <div className="space-y-4">
      {/* Option A: Current location */}
      <button
        type="button"
        disabled={loading}
        className={`w-full rounded-xl border ${loading ? 'border-gray-300 bg-gray-100' : 'border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800'} py-2.5 text-center text-sm ${loading ? 'text-gray-500 cursor-wait' : 'text-gray-500 cursor-pointer'}`}
        onClick={requestLocation}
      >
        {loading ? '📍 Detecting your location...' : '📍 Use my current location'}
      </button>

      {/* Geolocation error UI */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={requestLocation}
              className="rounded-md bg-primary-600 px-3 py-1 text-white"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => setError(null)}
              className="rounded-md bg-gray-600 px-3 py-1 text-white"
            >
              Choose manually
            </button>
          </div>
        </div>
      )}

      {/* Suggestion UI */}
      {suggestedLocation && (
        <div className="space-y-2">
          <p className="text-sm">📍 Location detected: {suggestedLocation}</p>
          {campusMismatch && (
            <p className="text-xs text-yellow-600">
              Your detected location may not match the selected campus. Please verify.
            </p>
          )}
          <button
            type="button"
            onClick={handleUseSuggestion}
            className="w-full rounded-xl bg-primary-600 py-2.5 text-white"
          >
            Use this location
          </button>
          <button
            type="button"
            onClick={() => setSuggestedLocation(null)}
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 text-sm"
          >
            Choose another location
          </button>
          <p className="text-xs text-gray-400 mt-1">© OpenStreetMap contributors</p>
        </div>
      )}

      {/* Option B: Campus location dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Campus location
        </label>
        <select
          value={selectedLocation}
          onChange={handleCampusSelect}
          className="w-full rounded-xl border border-gray-300 bg-white dark:bg-zinc-900 py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select a campus spot</option>
          {campusOptions.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Option C: Manual entry */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Manual public landmark
        </label>
        <input
          type="text"
          placeholder="e.g. Near Main Gate, BH-4 entrance, Library lobby"
          value={manualLocation}
          onChange={handleManualChange}
          className="w-full rounded-xl border border-gray-300 bg-white dark:bg-zinc-900 py-2.5 px-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-gray-400">
          Use a public landmark or common area. Do not enter your room number or private address.
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
