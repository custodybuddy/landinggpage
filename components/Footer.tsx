import React from 'react';
import { routes, externalLinks } from '../routes';

interface FooterProps {
    currentPath: string;
    "aria-hidden"?: boolean;
}

const Footer: React.FC<FooterProps> = ({ currentPath, "aria-hidden": ariaHidden }) => {
    const footerLinks = routes.filter(r => r.inFooter);
    const externalFooterLinks = externalLinks.filter(l => l.inFooter);

    return (
        <footer className="bg-slate-900 py-8 text-center text-gray-400 border-t border-slate-800" aria-hidden={ariaHidden}>
            <div className="container mx-auto px-4">
                <nav className="space-x-4 mb-4">
                    {footerLinks.map(link => (
                        <a 
                            key={link.path}
                            href={link.path} 
                            className={`${link.path === currentPath ? 'text-amber-400' : 'hover:text-amber-400'} transition-colors duration-200 ease-out`}
                            aria-current={link.path === currentPath ? 'page' : undefined}
                        >
                            {link.label}
                        </a>
                    ))}
                    {externalFooterLinks.map(link => (
                         <a 
                            key={link.href}
                            href={link.href} 
                            className="hover:text-amber-400 transition-colors duration-200 ease-out" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {link.text}
                        </a>
                    ))}
                </nav>

                <p className="text-sm">&copy; {new Date().getFullYear()} CustodyBuddy.com. All Rights Reserved.</p>
                <p className="text-xs mt-4 max-w-4xl mx-auto">
                    **Disclaimer: CustodyBuddy is for informational purposes only and is not a substitute for a qualified legal professional. The use of this tool does not create a lawyer-client relationship.**
                </p>
            </div>
        </footer>
    );
};

export default React.memo(Footer);