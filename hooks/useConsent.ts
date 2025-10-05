import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useConsent = () => {
    const [consentGiven, setConsentGiven] = useLocalStorage<boolean>('custodybuddy-consent-given', false);

    const acceptConsent = useCallback(() => {
        setConsentGiven(true);
    }, [setConsentGiven]);

    return { consentGiven, acceptConsent };
};