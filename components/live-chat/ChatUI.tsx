import React, { useEffect, useRef } from 'react';
import XIcon from '../icons/XIcon';
import UsersIcon from '../icons/UsersIcon';
import AlertTriangleIcon from '../icons/AlertTriangleIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import MicIcon from '../icons/MicIcon';
import MicOffIcon from '../icons/MicOffIcon';
import { useLiveChat } from '../../hooks/useLiveChat';
import { Persona } from '../../prompts';
import PersonaMenu from './PersonaMenu';

interface ChatUIProps {
    liveChat: ReturnType<typeof useLiveChat>;
    onClose: () => void;
    selectedPersona: Persona;
    isPersonaMenuOpen: boolean;
    onTogglePersonaMenu: () => void;
    onSelectPersona: (persona: Persona) => void;
    personaMenuRef: React.RefObject<HTMLDivElement>;
}

const ChatUI: React.FC<ChatUIProps> = ({
    liveChat,
    onClose,
    selectedPersona,
    isPersonaMenuOpen,
    onTogglePersonaMenu,
    onSelectPersona,
    personaMenuRef
}) => {
    const { isRecording, isProcessing, error, transcriptionHistory, toggleRecording, setError } = liveChat;
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [transcriptionHistory]);

    const getStatusText = () => {
        if (error) return "Error";
        if (isProcessing) return "Processing...";
        if (isRecording) return "Listening...";
        return "Ready";
    };

    const getStatusIndicatorClass = () => {
        if (error) return 'bg-red-500';
        if (isProcessing) return 'bg-yellow-500 animate-pulse';
        if (isRecording) return 'bg-green-500';
        return 'bg-gray-500';
    };

    return (
        <>
            <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                     <span className={`w-3 h-3 rounded-full ${getStatusIndicatorClass()}`}></span>
                     <h2 className="text-lg font-bold text-amber-400">AI Legal Assistant</h2>
                     <span className="text-sm text-gray-400 font-mono hidden sm:block">({getStatusText()})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={personaMenuRef}>
                        <button
                            onClick={onTogglePersonaMenu}
                            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
                            aria-label="Select AI Persona"
                        >
                            <UsersIcon />
                        </button>
                        <PersonaMenu
                            isOpen={isPersonaMenuOpen}
                            selectedPersona={selectedPersona}
                            onSelectPersona={onSelectPersona}
                        />
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close chat">
                        <XIcon />
                    </button>
                </div>
            </header>
            <main ref={chatContainerRef} className="p-4 sm:p-6 flex-grow overflow-y-auto bg-slate-900/50 scroll-smooth">
                <div className="space-y-4">
                    {transcriptionHistory.length === 0 && !isRecording && !isProcessing && (
                        <div className="text-center text-gray-400 p-8 flex flex-col items-center gap-4">
                            <MicIcon className="w-16 h-16 text-slate-600" />
                            <p className="font-semibold">Click the microphone to start a secure voice chat with your AI assistant.</p>
                            <p className="text-sm">Your conversation is private and not stored.</p>
                        </div>
                    )}
                    {transcriptionHistory.map((item, index) => (
                        <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl ${item.speaker === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-gray-200'}`}>
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
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-75 disabled:cursor-wait
                        ${isRecording ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' : 'bg-amber-400 hover:bg-amber-300 focus:ring-amber-300'}`}
                    aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                >
                    {isProcessing 
                        ? <SpinnerIcon className="w-8 h-8 text-white" />
                        : isRecording 
                            ? <MicOffIcon className="w-8 h-8 text-white" /> 
                            : <MicIcon className="w-8 h-8 text-black" />
                    }
                </button>
                <p className="text-xs text-gray-500">
                    Disclaimer: This is an AI assistant and not a lawyer. This tool is for informational purposes only.
                </p>
            </footer>
        </>
    );
};

export default ChatUI;