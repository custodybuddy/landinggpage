// Fix: Import React to provide the namespace for types like React.Dispatch.
import React, { useState, useEffect } from 'react';

// A helper function to safely get a value from localStorage
function getStoredValue<T>(key: string, initialValue: T | (() => T)): T {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
    }

    if (initialValue instanceof Function) {
        return initialValue();
    }
    return initialValue;
}

/**
 * A custom hook that syncs state with localStorage.
 * It's a reactive alternative to useState that persists data.
 * @param key - The key to use in localStorage.
 * @param initialValue - The initial value to use if nothing is in localStorage.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        return getStoredValue(key, initialValue);
    });

    useEffect(() => {
        try {
            // Allow value to be null/undefined to remove the item
            if (storedValue === undefined || storedValue === null) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            }
        } catch (error) {
            console.error(`Error writing to localStorage for key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
