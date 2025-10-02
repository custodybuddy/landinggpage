
import React from 'react';

const CTA: React.FC = () => {
    return (
        <section className="bg-amber-400 text-slate-900 py-20 text-center animate-fade-in">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                    <span>Stop Feeling Powerless.</span> <span>Start Fighting Back.</span>
                </h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 font-medium">
                    Turn your frustration into a winning strategy. It's time to protect your children and your future.
                </p>
                <a href="#features" className="inline-block bg-slate-900 text-amber-400 font-bold py-4 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105 hover:bg-slate-800">
                    Take Control Today
                </a>
            </div>
        </section>
    );
};

export default CTA;
