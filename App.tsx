
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Resources from './components/Resources';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Footer from './components/Footer';
import LiveChatWidget from './components/LiveChatWidget';
import LiveChatModal from './components/LiveChatModal';

const App: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="bg-slate-900 text-white">
            <Header />
            <main>
                <Hero />
                <Features />
                <Testimonials />
                <Resources />
                <Donation />
                <CTA />
            </main>
            <Footer />
            <LiveChatWidget onOpen={() => setIsChatOpen(true)} />
            <LiveChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default App;