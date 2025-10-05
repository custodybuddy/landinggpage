import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Define the shape of a route object for type safety
interface RouteConfig {
    path: string;
    component: React.FC;
}

interface RouterContextType {
    currentPath: string;
}

// Create a context to hold the current path
const RouterContext = createContext<RouterContextType>({ currentPath: '#/' });

/**
 * Custom hook to get the current route path from the RouterContext.
 * @returns An object containing the currentPath string.
 */
export const useRoute = () => useContext(RouterContext);

interface HashRouterProps {
    children: ReactNode;
}

/**
 * A router component that uses the URL hash to manage application state.
 * It provides the current path to its children via context.
 */
export const HashRouter: React.FC<HashRouterProps> = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash || '#/');
            window.scrollTo(0, 0); // Scroll to top on page change
        };
        
        // Ensure the initial route is correctly set
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <RouterContext.Provider value={{ currentPath }}>
            {children}
        </RouterContext.Provider>
    );
};

interface RoutesProps {
    routes: RouteConfig[];
}

/**
 * A component that renders the appropriate page component based on the current route.
 * It finds a matching route from the provided array.
 */
export const Routes: React.FC<RoutesProps> = ({ routes }) => {
    const { currentPath } = useRoute();
    
    // Find the matching route, defaulting to the home page ('#/') if no match is found
    const currentRoute = routes.find(r => r.path === currentPath) || routes.find(r => r.path === '#/');
    
    // If for some reason even the default route isn't found, render nothing
    if (!currentRoute) {
        console.error("No matching route found for path:", currentPath);
        return null;
    }
    
    const PageComponent = currentRoute.component;
    return <PageComponent />;
};