import React, { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LiveChatWidget from './components/LiveChatWidget';
import { routes } from './routes';

const LiveChatModal = lazy(() => import('./components/LiveChatModal'));

const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');
    const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);

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
    
    const handleOpenLiveChat = useCallback(() => setIsLiveChatModalOpen(true), []);
    const handleCloseLiveChat = useCallback(() => setIsLiveChatModalOpen(false), []);

    const isAnyModalOpen = isLiveChatModalOpen;

    const currentRoute = routes.find(r => r.path === route) || routes.find(r => r.path === '#/');
    const PageComponent = currentRoute!.component;

    return (
        <div className="bg-slate-900 text-white">
            <Header currentPath={route} />
            <main aria-hidden={isAnyModalOpen}>
                <PageComponent />
            </main>
            <Footer currentPath={route} aria-hidden={isAnyModalOpen} />

            <LiveChatWidget onOpen={handleOpenLiveChat} />

            <Suspense fallback={null}>
                {isLiveChatModalOpen && (
                    <LiveChatModal
                        isOpen={isLiveChatModalOpen}
                        onClose={handleCloseLiveChat}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default App;