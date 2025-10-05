import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const FONT_SCALE_KEY = 'custodybuddy-font-scale';
export const MIN_SCALE = 0.8;
export const MAX_SCALE = 1.4;
const STEP = 0.1;
const DEFAULT_SCALE = 1.0;

export const useTextSizer = () => {
    const [scale, setScale] = useLocalStorage<number>(FONT_SCALE_KEY, DEFAULT_SCALE);

    useEffect(() => {
        // Ensure the scale is clamped within bounds, in case of manual localStorage changes
        const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
        document.documentElement.style.fontSize = `${clampedScale * 100}%`;
    }, [scale]);

    const increase = useCallback(() => {
        setScale(currentScale => {
            const newScale = parseFloat((currentScale + STEP).toFixed(2));
            return Math.min(MAX_SCALE, newScale);
        });
    }, [setScale]);

    const decrease = useCallback(() => {
        setScale(currentScale => {
            const newScale = parseFloat((currentScale - STEP).toFixed(2));
            return Math.max(MIN_SCALE, newScale);
        });
    }, [setScale]);

    const reset = useCallback(() => {
        setScale(DEFAULT_SCALE);
    }, [setScale]);

    return { scale, increase, decrease, reset };
};