import { useState, useCallback, useEffect } from 'react';

interface UseTextToSpeechProps {
    onEnd?: () => void;
}

export const useTextToSpeech = ({ onEnd }: UseTextToSpeechProps = {}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) {
            console.error("Text-to-speech not supported in this browser.");
            return;
        }

        // Cancel any previous speech to prevent overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);
        };
        
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) {
                onEnd();
            }
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error", event);
            setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
    }, [onEnd]);

    const cancel = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false); // Manually set state as onend might not fire on cancel
        }
    }, []);

    // Cleanup effect to cancel speech synthesis when the component unmounts
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { isSpeaking, speak, cancel };
};
