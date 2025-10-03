
import React, { useState, useEffect } from 'react';
import MenuIcon from './icons/MenuIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface HeaderProps {
    onOpenTemplateLibrary: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenTemplateLibrary }) => {
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
        ? 'fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-sm shadow-md transition-all duration-300'
        : 'fixed top-0 left-0 w-full z-50 bg-transparent transition-all duration-300';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavLinkClick = (e: React.MouseEvent, onClick?: () => void) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    const navLinks = [
        { href: '#features', text: 'Features' },
        { href: '#', text: 'Template Library', onClick: onOpenTemplateLibrary },
        { href: '#social-proof', text: 'Testimonials' },
        { href: '#donation', text: 'Donate' },
        { href: 'https://blog.custodybuddy.com', text: 'Blog', external: true },
        { href: '#contact', text: 'Contact' },
    ];

    return (
        <>
            <nav id="main-nav" className={navClass}>
                <div className="container mx-auto px-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex flex-col items-center py-3">
                        {/* Logo */}
                        <a href="/" className="text-xl md:text-2xl font-black transition-transform transform hover:scale-105 mb-3">
                            <span className="text-amber-400">CUSTODY</span>
                            <span>BUDDY</span>
                            <span className="text-amber-400">.COM</span>
                        </a>
                        {/* Nav Bar */}
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <a 
                                    key={link.text} 
                                    href={link.href} 
                                    className="hover:text-amber-400 transition-colors duration-200 ease-out flex items-center gap-1.5 text-sm font-semibold" 
                                    target={link.external ? '_blank' : '_self'} 
                                    rel={link.external ? 'noopener noreferrer' : ''}
                                    onClick={(e) => handleNavLinkClick(e, link.onClick)}
                                >
                                    {link.text === 'Template Library' && <BookOpenIcon className="w-4 h-4" />}
                                    {link.text}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex items-center justify-center relative py-4">
                        <a href="/" className="text-xl font-black transition-transform transform hover:scale-105">
                            <span className="text-amber-400">CUSTODY</span>
                            <span>BUDDY</span>
                            <span className="text-amber-400">.COM</span>
                        </a>
                        <button id="mobile-menu-toggle" aria-label="Toggle mobile menu" aria-expanded={isMenuOpen} className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-amber-400 transition-colors duration-200 ease-out" onClick={toggleMenu}>
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`fixed top-0 left-0 w-full h-full bg-slate-900 z-40 md:hidden transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col items-center space-y-6 text-xl text-center pt-24">
                    <a href="/" className="font-bold text-amber-400" onClick={toggleMenu}>Home</a>
                    {navLinks.map((link) => (
                         <a 
                            key={link.text} 
                            href={link.href} 
                            className="hover:text-amber-400 transition-colors duration-200 ease-out flex items-center justify-center gap-2" 
                            target={link.external ? '_blank' : '_self'} 
                            rel={link.external ? 'noopener noreferrer' : ''}
                            onClick={(e) => {
                                handleNavLinkClick(e, link.onClick);
                                toggleMenu();
                            }}
                        >
                            {link.text === 'Template Library' && <BookOpenIcon className="w-5 h-5" />}
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
