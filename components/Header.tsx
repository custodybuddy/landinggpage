
import React, { useState, useEffect } from 'react';
import MenuIcon from './icons/MenuIcon';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navClass = isScrolled
        ? 'fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-sm shadow-md py-4 transition-all duration-300'
        : 'fixed top-0 left-0 w-full z-50 bg-transparent py-4 transition-all duration-300';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { href: '#features', text: 'Features' },
        { href: '#social-proof', text: 'Testimonials' },
        { href: '#donation', text: 'Donate' },
        { href: 'https://blog.custodybuddy.com', text: 'Blog', external: true },
        { href: '#contact', text: 'Contact' },
    ];

    return (
        <>
            <nav id="main-nav" className={navClass}>
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <a href="/" className="text-xl md:text-2xl font-black transition-transform transform hover:scale-105">
                        <span className="text-amber-400">CUSTODY</span>
                        <span>BUDDY</span>
                        <span className="text-amber-400">.COM</span>
                    </a>
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                             <a 
                                key={link.text} 
                                href={link.href} 
                                className="hover:text-amber-400 transition" 
                                target={link.external ? '_blank' : '_self'} 
                                rel={link.external ? 'noopener noreferrer' : ''}
                            >
                                {link.text}
                            </a>
                        ))}
                        <a href="#features" className="inline-block bg-amber-400 text-black font-semibold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
                            Start Now
                        </a>
                    </div>
                    <button id="mobile-menu-toggle" aria-label="Toggle mobile menu" className="md:hidden text-white hover:text-amber-400 transition" onClick={toggleMenu}>
                        <MenuIcon />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`fixed top-0 left-0 w-full h-full bg-slate-900 z-40 md:hidden transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col space-y-6 text-xl text-center pt-24">
                    <a href="/" className="font-bold text-amber-400" onClick={toggleMenu}>Home</a>
                    {navLinks.map((link) => (
                         <a 
                            key={link.text} 
                            href={link.href} 
                            className="hover:text-amber-400 transition" 
                            target={link.external ? '_blank' : '_self'} 
                            rel={link.external ? 'noopener noreferrer' : ''}
                            onClick={toggleMenu}
                        >
                            {link.text}
                        </a>
                    ))}
                    <a href="#features" className="inline-block bg-amber-400 text-black font-semibold py-3 px-8 rounded-full shadow-lg mt-4" onClick={toggleMenu}>
                        Start Now
                    </a>
                </div>
            </div>
        </>
    );
};

export default Header;
