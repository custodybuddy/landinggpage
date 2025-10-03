
import React from 'react';

interface FooterProps {
    onOpenPrivacyPolicy: () => void;
    onOpenTermsOfUse: () => void;
    "aria-hidden"?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onOpenPrivacyPolicy, onOpenTermsOfUse, "aria-hidden": ariaHidden }) => {
    
    const handleLinkClick = (e: React.MouseEvent, handler: () => void) => {
        e.preventDefault();
        handler();
    };

    return (
        <footer id="contact" className="bg-slate-900 py-8 text-center text-gray-400 border-t border-slate-800" aria-hidden={ariaHidden}>
            <div className="container mx-auto px-4">
                <nav className="space-x-4 mb-4">
                    <a href="#features" className="hover:text-amber-400 transition-colors duration-200 ease-out">Features</a>
                    <a href="#social-proof" className="hover:text-amber-400 transition-colors duration-200 ease-out">Testimonials</a>
                    <a href="#donation" className="hover:text-amber-400 transition-colors duration-200 ease-out">Donate</a>
                    <a href="https://blog.custodybuddy.com" className="hover:text-amber-400 transition-colors duration-200 ease-out" target="_blank" rel="noopener noreferrer">Blog</a>
                    <a href="#" onClick={(e) => handleLinkClick(e, onOpenPrivacyPolicy)} className="hover:text-amber-400 transition-colors duration-200 ease-out">Privacy Policy</a>
                    <a href="#" onClick={(e) => handleLinkClick(e, onOpenTermsOfUse)} className="hover:text-amber-400 transition-colors duration-200 ease-out">Terms of Use</a>
                    <a href="#contact" className="hover:text-amber-400 transition-colors duration-200 ease-out">Contact</a>
                </nav>

                <p className="text-sm">&copy; {new Date().getFullYear()} CustodyBuddy.com. All Rights Reserved.</p>
                <p className="text-xs mt-4 max-w-4xl mx-auto">
                    **Disclaimer: CustodyBuddy is for informational purposes only and is not a substitute for a qualified legal professional. The use of this tool does not create a lawyer-client relationship.**
                </p>
            </div>
        </footer>
    );
};

export default Footer;