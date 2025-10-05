import React, { useState, useEffect, useRef } from 'react';
import { useLiveChat } from '../hooks/useLiveChat';
import { Persona, personaPrompts } from '../prompts';
import ChatUI from './live-chat/ChatUI';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LiveChatModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isRendered, setIsRendered] = useState(isOpen);
    const [selectedPersona, setSelectedPersona] = useLocalStorage<Persona>('custodybuddy-persona', 'Strategic Advisor');
    const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
    const personaMenuRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Accessibility: Trap focus within the modal
    useFocusTrap(modalRef, isOpen, onClose);

    const liveChat = useLiveChat(isOpen, personaPrompts[selectedPersona]);

    // Handle modal render/unmount animations
    useEffect(() => {
        if (isOpen) setIsRendered(true);
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setIsRendered(false);
    };

    // Close persona menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
                setIsPersonaMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClose = () => {
        if (liveChat.isRecording) {
            liveChat.toggleRecording();
        }
        setIsPersonaMenuOpen(false);
        onClose();
    };
    
    const handleSelectPersona = (persona: Persona) => {
        setSelectedPersona(persona);
        setIsPersonaMenuOpen(false);
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-400 ease-out ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-modal-title"
        >
            <div 
                ref={modalRef}
                className={`bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] max-h-[700px] flex flex-col relative transition-all duration-400 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 motion-safe:scale-95'}`}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                <ChatUI
                    liveChat={liveChat}
                    onClose={handleClose}
                    selectedPersona={selectedPersona}
                    isPersonaMenuOpen={isPersonaMenuOpen}
                    onTogglePersonaMenu={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                    onSelectPersona={handleSelectPersona}
                    personaMenuRef={personaMenuRef}
                />
            </div>
        </div>
    );
};

export default LiveChatModal;