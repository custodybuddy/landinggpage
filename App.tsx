
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Resources from './components/Resources';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Modal from './components/Modal';
import TemplateLibrary from './components/TemplateLibrary';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import LiveChatWidget from './components/LiveChatWidget';
import LiveChatModal from './components/LiveChatModal';

const App: React.FC = () => {
    const [isTemplateLibraryModalOpen, setIsTemplateLibraryModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);

    const isAnyModalOpen = useMemo(() => 
        isTemplateLibraryModalOpen || isPrivacyModalOpen || isTermsModalOpen || isLiveChatModalOpen,
        [isTemplateLibraryModalOpen, isPrivacyModalOpen, isTermsModalOpen, isLiveChatModalOpen]
    );

    return (
        <div className="bg-slate-900 text-white">
            <Header onOpenTemplateLibrary={() => setIsTemplateLibraryModalOpen(true)} />
            <main aria-hidden={isAnyModalOpen}>
                <Hero />
                <Features />
                <Testimonials />
                <Resources />
                <Donation />
                <CTA />
            </main>
            <Footer 
                onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
                onOpenTermsOfUse={() => setIsTermsModalOpen(true)}
                aria-hidden={isAnyModalOpen}
            />

            <LiveChatWidget onOpen={() => setIsLiveChatModalOpen(true)} />

            <LiveChatModal
                isOpen={isLiveChatModalOpen}
                onClose={() => setIsLiveChatModalOpen(false)}
            />

            <Modal
                isOpen={isTemplateLibraryModalOpen}
                onClose={() => setIsTemplateLibraryModalOpen(false)}
                title="Email Template Library"
            >
                <TemplateLibrary isOpen={isTemplateLibraryModalOpen} />
            </Modal>

            <Modal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                title="Privacy Policy"
            >
                <PrivacyPolicy />
            </Modal>

            <Modal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                title="Terms of Use"
            >
                <TermsOfUse />
            </Modal>
        </div>
    );
};

export default App;