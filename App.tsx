
import React, { useState } from 'react';
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

const App: React.FC = () => {
    const [isTemplateLibraryModalOpen, setIsTemplateLibraryModalOpen] = useState(false);

    return (
        <div className="bg-slate-900 text-white">
            <Header onOpenTemplateLibrary={() => setIsTemplateLibraryModalOpen(true)} />
            <main>
                <Hero />
                <Features />
                <Testimonials />
                <Resources />
                <Donation />
                <CTA />
            </main>
            <Footer />

            <Modal
                isOpen={isTemplateLibraryModalOpen}
                onClose={() => setIsTemplateLibraryModalOpen(false)}
                title="Email Template Library"
            >
                <TemplateLibrary isOpen={isTemplateLibraryModalOpen} />
            </Modal>
        </div>
    );
};

export default App;