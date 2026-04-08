import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface BusinessProfile {
  business_name: string;
  owner_name: string;
  phone_number: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  business_logo?: string;
  signature?: string;
}

interface BusinessState {
  profile: BusinessProfile | null;
  isLoaded: boolean;
}

type BusinessAction = 
  | { type: 'SET_PROFILE'; payload: BusinessProfile }
  | { type: 'LOADED' };

const businessReducer = (state: BusinessState, action: BusinessAction): BusinessState => {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'LOADED':
      return { ...state, isLoaded: true };
    default:
      return state;
  }
};

const BusinessContext = createContext<{
  state: BusinessState;
  saveProfile: (profile: BusinessProfile) => void;
} | null>(null);

const getInitialState = (): BusinessState => {
  const stored = localStorage.getItem('invoiceflow_business');
  let profile = null;
  if (stored) {
    try {
      profile = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse business profile', e);
    }
  }
  return {
    profile,
    isLoaded: true,
  };
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(businessReducer, getInitialState());

  const saveProfile = (profile: BusinessProfile) => {
    localStorage.setItem('invoiceflow_business', JSON.stringify(profile));
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };

  return (
    <BusinessContext.Provider value={{ state, saveProfile }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessStore = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusinessStore must be used within BusinessProvider');
  return context;
};
