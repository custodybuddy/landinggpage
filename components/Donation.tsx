
import React from 'react';

const Donation: React.FC = () => {
    return (
        <section id="donation" className="bg-slate-900 py-20 text-center animate-fade-in-up">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Your Support <span className="text-amber-400">Keeps Us</span> Free.</h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 font-medium text-gray-300">
                    CustodyBuddy is built to help every parent, regardless of their financial situation. Your donation helps us provide this vital toolkit at no cost to those who need it most, ensuring no parent is left to fight alone.
                </p>
                <a href="#" className="inline-block bg-amber-400 text-black font-bold py-4 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105">
                    Support Our Mission
                </a>
            </div>
        </section>
    );
};

export default Donation;
