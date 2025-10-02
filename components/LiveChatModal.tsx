
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, LiveSession } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import XIcon from './icons/XIcon';
import MicIcon from './icons/MicIcon';
import MicOffIcon from './icons/MicOffIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
type Transcription = {
    speaker: 'user' | 'ai';
    text: string;
    isFinal: boolean;
};

const systemInstruction = `You are the "CustodyBuddy AI Legal Assistant," a voice-based AI for CustodyBuddy.com. Your role is to support self-represented parents in Canada navigating high-conflict co-parenting situations.

**Your Persona:**
*   You are empathetic, calm, and professional.
*   You are an expert in communication strategies (like BIFF), documentation, and general family law concepts in Canada.
*   You are NOT a lawyer and you MUST NOT provide legal advice.

**Core Directives:**
1.  **Disclaimer First:** At the beginning of every single conversation, you MUST state: "Hi, I'm the CustodyBuddy AI Assistant. Before we begin, please remember that I am an AI and not a lawyer, so I cannot provide legal advice. Our conversation is for informational purposes only. How can I help you today?"
2.  **No Legal Advice:** If asked for legal advice (e.g., "Should I file this motion?", "What will a judge do?"), you must decline firmly but politely. Redirect the user to consult a qualified legal professional. Example response: "That sounds like a question that requires legal advice, and as an AI, I can't provide that. A family lawyer would be the best person to guide you on that specific action."
3.  **Focus on "How," not "What":** Instead of telling users *what* to do, explain *how* they can approach a problem.
    *   Good example: "You're asking how to respond to a difficult email. A useful strategy is the BIFF method: Keep your reply Brief, Informative, Friendly, and Firm. Would you like me to elaborate on that?"
    *   Bad example: "You should reply and tell them..."
4.  **Promote Documentation:** Constantly reinforce the importance of creating a written record. Suggest logging events, saving emails, and communicating in writing.
5.  **De-escalate:** Model calm, objective, and child-focused communication.
6.  **Maintain Boundaries:** Keep conversations focused on co-parenting and legal documentation. If the user becomes overly emotional or vents excessively, gently guide them back to actionable topics.

Start every conversation with your mandatory disclaimer.`;

const LiveChatModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set()).current;

    const cleanup = useCallback(() => {
        setIsRecording(false);
        setConnectionState('closed');
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        sourceNodeRef.current?.disconnect();
        
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);

        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        sourceNodeRef.current = null;
        
        sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
        sessionPromiseRef.current = null;

        for (const source of audioSources.values()) {
            source.stop();
        }
        audioSources.clear();
        nextStartTimeRef.current = 0;

    }, [audioSources]);


    const handleClose = () => {
        cleanup();
        onClose();
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            cleanup();
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Your browser does not support the required audio features.");
            return;
        }

        setIsRecording(true);
        setError(null);
        setConnectionState('connecting');
        setTranscriptionHistory([]);

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        sourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const { inputTranscription, outputTranscription, turnComplete, modelTurn, interrupted } = message.serverContent ?? {};
                        
                        setTranscriptionHistory(prev => {
                            const next = [...prev];
                            if(inputTranscription) {
                                const last = next[next.length - 1];
                                if(last?.speaker === 'user') {
                                    last.text += inputTranscription.text;
                                    last.isFinal = false;
                                } else {
                                    next.push({ speaker: 'user', text: inputTranscription.text, isFinal: false });
                                }
                            }
                            if(outputTranscription) {
                                const last = next[next.length - 1];
                                if(last?.speaker === 'ai') {
                                    last.text += outputTranscription.text;
                                    last.isFinal = false;
                                } else {
                                    next.push({ speaker: 'ai', text: outputTranscription.text, isFinal: false });
                                }
                            }
                            if(turnComplete) {
                                const last = next[next.length - 1];
                                if(last) last.isFinal = true;
                            }
                            return next;
                        });

                        const base64Audio = modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            const audioCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                            const source = audioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioCtx.destination);
                            source.addEventListener('ended', () => audioSources.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSources.add(source);
                        }

                        if (interrupted) {
                             for (const source of audioSources.values()) {
                                source.stop();
                             }
                             audioSources.clear();
                             nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Connection error: ${e.message}. Please try again.`);
                        setConnectionState('error');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        setConnectionState('closed');
                        cleanup();
                    },
                },
            });
        } catch (err: any) {
            let message = "An unexpected error occurred.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = "Microphone access was denied. Please allow microphone permissions in your browser settings to use this feature.";
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
            setConnectionState('error');
            cleanup();
        }
    };
    
    useEffect(() => {
        if (isOpen) setIsRendered(true);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            cleanup();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setIsRendered(false);
    };

    if (!isRendered) return null;

    const getStatusText = () => {
        if (error) return "Error";
        switch (connectionState) {
            case 'idle': return "Ready to connect";
            case 'connecting': return "Connecting...";
            case 'connected': return isRecording ? "Listening..." : "Connected";
            case 'error': return "Error";
            case 'closed': return "Session ended";
            default: return "Idle";
        }
    };

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-400 ease-out ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className={`bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] max-h-[700px] flex flex-col relative transition-all duration-400 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 motion-safe:scale-95'}`}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                         <span className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500' : connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                         <h2 className="text-lg font-bold text-amber-400">AI Legal Assistant</h2>
                         <span className="text-sm text-gray-400 font-mono hidden sm:block">({getStatusText()})</span>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label="Close chat">
                        <XIcon />
                    </button>
                </header>
                <main className="p-4 sm:p-6 flex-grow overflow-y-auto bg-slate-900/50">
                    <div className="space-y-4">
                        {transcriptionHistory.length === 0 && !isRecording && (
                            <div className="text-center text-gray-400 p-8 flex flex-col items-center gap-4">
                                <MicIcon className="w-16 h-16 text-slate-600" />
                                <p className="font-semibold">Click the microphone to start a secure voice chat with your AI assistant.</p>
                                <p className="text-sm">Your conversation is private and not stored.</p>
                            </div>
                        )}
                        {transcriptionHistory.map((item, index) => (
                            <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl ${item.speaker === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-200'} ${!item.isFinal ? 'opacity-70' : ''}`}>
                                    <p>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex flex-col items-center justify-center gap-4">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3 w-full" role="alert">
                            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="flex-grow">{error}</p>
                            <button onClick={() => setError(null)} aria-label="Dismiss error"><XIcon className="w-5 h-5" /></button>
                        </div>
                    )}
                    <button
                        onClick={handleToggleRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800
                            ${isRecording ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' : 'bg-amber-400 hover:bg-amber-300 focus:ring-amber-300'}`}
                        aria-label={isRecording ? 'Stop Conversation' : 'Start Conversation'}
                    >
                        {isRecording ? <MicOffIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-black" />}
                    </button>
                    <p className="text-xs text-gray-500">
                        Disclaimer: This is an AI assistant and not a lawyer. This tool is for informational purposes only.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LiveChatModal;
