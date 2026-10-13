import React, { useEffect, useState } from 'react';
import { CAMPUS_LOCALITIES } from '@/config/localities';
import { isPublicPickupLocation } from '@/lib/locationValidation';

interface LocationSelectorProps {
  campusId: string;
  selectedLocation: string;
  onSelect: (loc: string) => void;
}

export default function LocationSelector({ campusId, selectedLocation, onSelect }: LocationSelectorProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset selections when campus changes
  const prevCampusId = React.useRef<string>(campusId);
  useEffect(() => {
    if (prevCampusId.current !== campusId) {
      // If current selectedLocation is not in the new campus list, clear it
      const campusLocs = CAMPUS_LOCALITIES[campusId]?.localities?.map(l => l.name) ?? [];
      if (selectedLocation && !campusLocs.includes(selectedLocation)) {
        onSelect('');
      }
      setManualLocation('');
      setError(null);
      prevCampusId.current = campusId;
    }
  }, [campusId, selectedLocation, onSelect]);

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

  const campusOptions = CAMPUS_LOCALITIES[campusId]?.localities ?? [];

  return (
    <div className="space-y-4">
      {/* Option A: Current location (placeholder) */}
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800 py-2.5 text-center text-sm text-gray-500 cursor-not-allowed"
        title="Coming soon – Phase 2"
      >
        📍 Use my current location (coming soon)
      </button>

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
