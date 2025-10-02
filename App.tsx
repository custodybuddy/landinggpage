
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Resources from './components/Resources';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Footer from './components/Footer';

const App: React.FC = () => {
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
        </div>
    );
};

export default App;
