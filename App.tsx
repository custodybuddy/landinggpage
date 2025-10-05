import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { routes, externalLinks, NavLink } from './routes';
import { ModalProvider } from './contexts/ModalContext';
import GlobalModals from './components/GlobalModals';
import { useConsent } from './hooks/useConsent';
import ConsentModal from './components/ConsentModal';
import { HashRouter, Routes, useRoute } from './components/Router';

/**
 * The main layout of the application, including Header, Footer, and the main content area.
 * This component is wrapped by providers and the router, allowing it to access their context.
 */
const AppLayout: React.FC = () => {
    const { currentPath } = useRoute(); // Access the current path from the router context
    const { consentGiven, acceptConsent } = useConsent();

    // The logic to prepare navigation links remains the same
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
            <Header currentPath={currentPath} navLinks={headerNavLinks} />
            <main>
                <Routes routes={routes} />
            </main>
            <Footer currentPath={currentPath} navLinks={footerNavLinks} />
            <GlobalModals />
            {!consentGiven && <ConsentModal onAccept={acceptConsent} />}
        </div>
    );
};


/**
 * The root component of the application.
 * It sets up the context providers and the hash-based router.
 */
const App: React.FC = () => {
    return (
        <ModalProvider>
            <HashRouter>
                <AppLayout />
            </HashRouter>
        </ModalProvider>
    );
};

export default App;