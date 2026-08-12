import { useState, useEffect } from 'react';
import { subscribeChurchSettings, updateChurchSettings } from '../services/firestoreService';
import { CHURCH_INFO } from '../data/churchData';

const STORAGE_KEY = 'imw_church_logo_url';

export function useChurchSettings() {
  const [logoUrl, setLogoUrlState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored !== '') {
        if (stored === 'assets/imw-logo.svg' || stored === 'public/imw-logo.svg' || stored === './imw-logo.svg') {
          return '/imw-logo.svg';
        }
        return stored;
      }
    }
    return CHURCH_INFO.logoUrl || '/imw-logo.svg';
  });

  useEffect(() => {
    const unsub = subscribeChurchSettings((settings) => {
      if (settings.logoUrl !== undefined) {
        setLogoUrlState(settings.logoUrl);
        if (typeof window !== 'undefined') {
          if (settings.logoUrl) {
            localStorage.setItem(STORAGE_KEY, settings.logoUrl);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const saveLogoUrl = async (newUrl: string) => {
    setLogoUrlState(newUrl);
    if (typeof window !== 'undefined') {
      if (newUrl) {
        localStorage.setItem(STORAGE_KEY, newUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    try {
      await updateChurchSettings({ logoUrl: newUrl });
    } catch (err) {
      console.warn('Could not save logo to Supabase (saved locally):', err);
    }
  };

  return {
    logoUrl,
    saveLogoUrl,
  };
}
