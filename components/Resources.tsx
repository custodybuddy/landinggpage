
import React from 'react';
import { books, legalAidServices } from '../constants';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

const Resources: React.FC = () => {
    return (
        <section id="recommended-resources" className="py-20 bg-slate-950">
            <div className="container mx-auto px-6 text-center relative z-10">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                    <span className="text-amber-400">Recommended</span>
                    <span className="text-white/90"> Reads</span>
                </h3>
                <p className="text-lg md:text-xl bg-gradient-to-r from-gray-300 to-gray-400 text-transparent bg-clip-text max-w-4xl mx-auto mb-16 leading-relaxed">
                    Discover expertly curated books to guide you through your journey. As Amazon Associates, 
                    we earn from qualifying purchases, which helps support CustodyBuddy.com at no extra cost to you.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {books.map((book, index) => (
                        <div key={index} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-center h-full border border-amber-400/50">
                            <div className="overflow-hidden rounded-xl mb-6 shadow-lg">
                                <img src={book.imageUrl} alt={book.alt} className="w-full h-auto aspect-[2/3] object-cover"/>
                            </div>
                            <span className="text-xl font-semibold bg-gradient-to-r from-amber-200 to-amber-400 text-transparent bg-clip-text text-center leading-tight flex-grow text-balance">
                                {book.title}
                            </span>
                            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                                <a className="inline-flex items-center gap-2 bg-amber-400 text-black font-bold py-2.5 px-6 rounded-full shadow-lg transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                   href={book.amazonLink}
                                   target="_blank" rel="sponsored noopener noreferrer"
                                   aria-label={book.ariaLabel}>
                                    <ExternalLinkIcon />
                                    View on Amazon
                                    <span className="sr-only">(opens in new tab)</span>
                                </a>
                                <span className="text-xs text-gray-400">(paid link)</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 pt-16 border-t border-slate-800">
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                        <span className="text-white/90">Find Legal Aid in </span>
                        <span className="text-amber-400">Your Province</span>
                    </h3>
                    <p className="text-lg md:text-xl bg-gradient-to-r from-gray-300 to-gray-400 text-transparent bg-clip-text max-w-4xl mx-auto mb-16 leading-relaxed">
                        Legal aid services provide crucial assistance to low-income individuals. Explore the resources in your province to see if you qualify for support.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                        {legalAidServices.map((service, index) => (
                            <a 
                                key={index} 
                                href={service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-between h-full border border-amber-400/50 transition-all duration-300 ease-out hover:bg-slate-700/80 motion-safe:hover:-translate-y-1 hover:border-amber-400 group"
                                aria-label={`Visit legal aid services for ${service.province}`}
                            >
                                <span className="text-xl font-semibold text-white group-hover:text-amber-300 transition-colors">
                                    {service.province}
                                </span>
                                <div className="text-amber-400 group-hover:text-white transition-colors">
                                    <ExternalLinkIcon />
                                    <span className="sr-only">(opens in new tab)</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Resources;