import React, { useState, useMemo, lazy, Suspense, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Resources from './components/Resources';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Modal from './components/Modal';
import LiveChatWidget from './components/LiveChatWidget';
import SpinnerIcon from './components/icons/SpinnerIcon';

// Lazy-load modal components
const LiveChatModal = lazy(() => import('./components/LiveChatModal'));
const TemplateLibrary = lazy(() => import('./components/TemplateLibrary'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));

const SuspenseFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full min-h-[400px]">
      <div className="text-center text-gray-400">
        <SpinnerIcon className="w-8 h-8 mx-auto mb-2 text-amber-400" />
        <p>Loading...</p>
      </div>
    </div>
);


const App: React.FC = () => {
    const [isTemplateLibraryModalOpen, setIsTemplateLibraryModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);

    const isAnyModalOpen = useMemo(() => 
        isTemplateLibraryModalOpen || isPrivacyModalOpen || isTermsModalOpen || isLiveChatModalOpen,
        [isTemplateLibraryModalOpen, isPrivacyModalOpen, isTermsModalOpen, isLiveChatModalOpen]
    );

    const handleOpenTemplateLibrary = useCallback(() => setIsTemplateLibraryModalOpen(true), []);
    const handleOpenPrivacyPolicy = useCallback(() => setIsPrivacyModalOpen(true), []);
    const handleOpenTermsOfUse = useCallback(() => setIsTermsModalOpen(true), []);
    const handleOpenLiveChat = useCallback(() => setIsLiveChatModalOpen(true), []);
    const handleCloseTemplateLibrary = useCallback(() => setIsTemplateLibraryModalOpen(false), []);
    const handleClosePrivacyPolicy = useCallback(() => setIsPrivacyModalOpen(false), []);
    const handleCloseTermsOfUse = useCallback(() => setIsTermsModalOpen(false), []);
    const handleCloseLiveChat = useCallback(() => setIsLiveChatModalOpen(false), []);

    return (
        <div className="bg-slate-900 text-white">
            <Header onOpenTemplateLibrary={handleOpenTemplateLibrary} />
            <main aria-hidden={isAnyModalOpen}>
                <Hero />
                <Features />
                <Testimonials />
                <Resources />
                <Donation />
                <CTA />
                <Contact />
            </main>
            <Footer 
                onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                onOpenTermsOfUse={handleOpenTermsOfUse}
                aria-hidden={isAnyModalOpen}
            />

            <LiveChatWidget onOpen={handleOpenLiveChat} />

            <Suspense fallback={null}>
                {isLiveChatModalOpen && (
                    <LiveChatModal
                        isOpen={isLiveChatModalOpen}
                        onClose={handleCloseLiveChat}
                    />
                )}
            </Suspense>

            <Modal
                isOpen={isTemplateLibraryModalOpen}
                onClose={handleCloseTemplateLibrary}
                title="Email Template Library"
            >
                <Suspense fallback={<SuspenseFallback />}>
                    <TemplateLibrary isOpen={isTemplateLibraryModalOpen} />
                </Suspense>
            </Modal>

            <Modal
                isOpen={isPrivacyModalOpen}
                onClose={handleClosePrivacyPolicy}
                title="Privacy Policy"
            >
                <Suspense fallback={<SuspenseFallback />}>
                    <PrivacyPolicy />
                </Suspense>
            </Modal>

            <Modal
                isOpen={isTermsModalOpen}
                onClose={handleCloseTermsOfUse}
                title="Terms of Use"
            >
                <Suspense fallback={<SuspenseFallback />}>
                    <TermsOfUse />
                </Suspense>
            </Modal>
        </div>
    );
};

export default App;