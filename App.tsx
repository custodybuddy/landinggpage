import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { routes, externalLinks, NavLink } from './routes';

const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#/');
            window.scrollTo(0, 0); // Scroll to top on page change
        };

        // Set initial route
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const currentRoute = routes.find(r => r.path === route) || routes.find(r => r.path === '#/');
    const PageComponent = currentRoute!.component;

    // Logic to prepare links for Header and Footer
    const headerNavLinks: NavLink[] = [
        ...routes
            .filter(r => r.inHeader)
            .map(r => ({ href: r.path, text: r.label, isExternal: false })),
        ...externalLinks
            .filter(l => l.inHeader)
            .map(l => ({ href: l.href, text: l.text, isExternal: true }))
    ];

    const footerNavLinks: NavLink[] = [
        ...routes
            .filter(r => r.inFooter)
            .map(r => ({ href: r.path, text: r.label, isExternal: false })),
        ...externalLinks
            .filter(l => l.inFooter)
            .map(l => ({ href: l.href, text: l.text, isExternal: true }))
    ];

    return (
        <div className="bg-slate-900 text-white">
            <Header currentPath={route} navLinks={headerNavLinks} />
            <main>
                <PageComponent />
            </main>
            <Footer currentPath={route} navLinks={footerNavLinks} />
        </div>
    );
};

export default App;
