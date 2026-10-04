import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  normalizeDistrict,
  getLocationRelevance,
  formatDistrictLabel,
  LocationRelevance,
} from './locationUtils';

export type LocationFilterOption = 'ALL' | 'IN_DISTRICT' | 'NEARBY_DISTRICT';

interface LocationContextType {
  userDistrict: string | null;
  locationFilter: LocationFilterOption;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  selectDistrict: (districtName: string | null) => void;
  setLocationFilter: (filter: LocationFilterOption) => void;
  clearLocation: () => void;
  getFarmRelevance: (farmDistrict: string | null | undefined) => LocationRelevance;
  userDistrictLabel: string;
}

const STORAGE_KEY_DISTRICT = 'adu_santhai_user_district';
const STORAGE_KEY_FILTER = 'adu_santhai_location_filter';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDistrict, setUserDistrictState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISTRICT);
      return saved ? normalizeDistrict(saved) : 'Vellore'; // Default to Vellore District for seamless initial discovery
    } catch {
      return 'Vellore';
    }
  });

  const [locationFilter, setLocationFilterState] = useState<LocationFilterOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILTER);
      if (saved === 'IN_DISTRICT' || saved === 'NEARBY_DISTRICT') return saved;
    } catch {
      // Ignore
    }
    return 'ALL';
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  const selectDistrict = useCallback((districtName: string | null) => {
    const norm = normalizeDistrict(districtName);
    setUserDistrictState(norm);
    if (norm) {
      localStorage.setItem(STORAGE_KEY_DISTRICT, norm);
    } else {
      localStorage.removeItem(STORAGE_KEY_DISTRICT);
    }
    setIsSelectorOpen(false);
  }, []);

  const setLocationFilter = useCallback((filter: LocationFilterOption) => {
    setLocationFilterState(filter);
    localStorage.setItem(STORAGE_KEY_FILTER, filter);
  }, []);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeSelector = useCallback(() => setIsSelectorOpen(false), []);

  const clearLocation = useCallback(() => {
    setUserDistrictState(null);
    setLocationFilterState('ALL');
    localStorage.removeItem(STORAGE_KEY_DISTRICT);
    localStorage.removeItem(STORAGE_KEY_FILTER);
  }, []);

  const getFarmRelevance = useCallback(
    (farmDistrict: string | null | undefined): LocationRelevance => {
      return getLocationRelevance(userDistrict, farmDistrict);
    },
    [userDistrict]
  );

  const userDistrictLabel = userDistrict ? formatDistrictLabel(userDistrict) : 'Select District';

  return (
    <LocationContext.Provider
      value={{
        userDistrict,
        locationFilter,
        isSelectorOpen,
        openSelector,
        closeSelector,
        selectDistrict,
        setLocationFilter,
        clearLocation,
        getFarmRelevance,
        userDistrictLabel,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
