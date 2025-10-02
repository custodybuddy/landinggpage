
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer id="contact" className="bg-slate-900 py-8 text-center text-gray-400 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <nav className="space-x-4 mb-4">
                    <a href="#features" className="hover:text-amber-400 transition">Features</a>
                    <a href="#social-proof" className="hover:text-amber-400 transition">Testimonials</a>
                    <a href="#donation" className="hover:text-amber-400 transition">Donate</a>
                    <a href="https://blog.custodybuddy.com" className="hover:text-amber-400 transition" target="_blank" rel="noopener noreferrer">Blog</a>
                    <a href="#" className="hover:text-amber-400 transition">Privacy Policy</a>
                    <a href="#" className="hover:text-amber-400 transition">Terms of Use</a>
                    <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
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
