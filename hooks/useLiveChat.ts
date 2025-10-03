import { useState, useEffect, useRef, useCallback } from 'react';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
// Fix: Import the shared Gemini AI instance.
import { ai } from '../services/aiService';
// Fix: Import types and utilities for the Gemini Live API.
import { LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

// --- Type Definitions ---

type Transcription = {
    speaker: 'user' | 'ai';
    text: string;
};

// --- The Custom Hook ---

export const useLiveChat = (isOpen: boolean, systemInstruction: string) => {
    // Fix: State is now for managing a session, not just recording.
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // UI feedback for when AI is generating response
    const [error, setError] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const createBlob = (data: Float32Array): GenAI_Blob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    const stopSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.warn("Error closing session, it might have already been closed.", e);
            } finally {
                sessionPromiseRef.current = null;
            }
        }

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setIsRecording(false);
        setIsProcessing(false);
    }, []);
    
    const toggleRecording = useCallback(async () => {
        if (isRecording) {
            await stopSession();
            return;
        }

        setError(null);
        setIsRecording(true);
        setIsProcessing(true); // Indicate that we are connecting

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser does not support the required audio features.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // These must be created here, as they can be closed and need re-initialization.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsProcessing(false); // Connected, ready for input
                        const inputAudioContext = inputAudioContextRef.current!;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        setIsProcessing(true); // AI is responding
                        
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscriptionRef.current.trim();
                            const fullOutput = currentOutputTranscriptionRef.current.trim();
                            
                            if (fullInput || fullOutput) {
                                setTranscriptionHistory(prev => {
                                    const newHistory: Transcription[] = [...prev];
                                    if (fullInput) newHistory.push({ speaker: 'user', text: fullInput });
                                    if (fullOutput) newHistory.push({ speaker: 'ai', text: fullOutput });
                                    return newHistory;
                                });
                            }
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputAudioContext = outputAudioContextRef.current!;
                            const nextStartTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            nextStartTimeRef.current = nextStartTime;

                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                                if (audioSourcesRef.current.size === 0) {
                                    setIsProcessing(false);
                                }
                            });

                            source.start(nextStartTime);
                            nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        } else if (message.serverContent?.turnComplete) {
                           setIsProcessing(false);
                        }
                        
                        if (message.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(source => source.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError(getFriendlyErrorMessage(e, 'live chat session'));
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        stopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
            });
            await sessionPromiseRef.current;

        } catch (err: any) {
            console.error("Microphone or session start Error:", err);
            let friendlyMessage = "Failed to start recording. Please ensure your microphone is connected and working.";
            if (err instanceof DOMException) {
                switch(err.name) {
                    case 'NotAllowedError':
                    case 'PermissionDeniedError':
                        friendlyMessage = "Microphone access was denied. Please allow microphone permissions in your browser settings to use this feature.";
                        break;
                    case 'NotFoundError':
                        friendlyMessage = "No microphone was found. Please connect a microphone and try again.";
                        break;
                    case 'NotReadableError':
                        friendlyMessage = "There was a hardware error with your microphone. Please check your system settings.";
                        break;
                }
            } else if (err instanceof Error) {
                friendlyMessage = err.message;
            }
            setError(friendlyMessage);
            setIsRecording(false);
            setIsProcessing(false);
        }
    }, [isRecording, stopSession, systemInstruction]);

    const cleanup = useCallback(() => {
        stopSession();
        setTranscriptionHistory([]);
    }, [stopSession]);

    useEffect(() => {
        if (!isOpen) {
            cleanup();
        }
    }, [isOpen, cleanup]);
    
    return {
        isRecording,
        isProcessing,
        error,
        transcriptionHistory,
        toggleRecording,
        setError
    };
};
