'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { validate3rd } from '@telegram-apps/init-data-node/web';

type AuthContextType = {
    userID: number | null;
    username: string | null;
    windowHeight: number;
    isDataValid: boolean;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial state that matches SSR output
const initialState = {
    userID: null,
    username: null,
    windowHeight: 0,
    isDataValid: false,
    isLoading: true
};

export const AuthContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // Initialize with SSR-safe values
    const [state, setState] = useState<AuthContextType>(initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Skip initialization if already done
        if (isInitialized) return;

        let isMounted = true;

        const initializeTelegramWebApp = async () => {
            try {
                // Check if we're in Telegram WebApp environment
                if (typeof WebApp === 'undefined') {
                    console.error('Telegram WebApp is not available');
                    return;
                }

                // Initialize WebApp
                WebApp.isVerticalSwipesEnabled = false;
                
                // Use a promise to ensure WebApp.ready() completes
                await new Promise<void>((resolve) => {
                    WebApp.ready();
                    // Give a small delay for WebApp to fully initialize
                    setTimeout(resolve, 100);
                });

                if (!isMounted) return;

                // Update height after WebApp is ready
                const height = WebApp.viewportStableHeight || window.innerHeight;

                // Validate Telegram data
                try {
                    const botId = 7638029485;
                    await validate3rd(WebApp.initData, botId);
                    
                    const user = WebApp.initDataUnsafe.user;
                    
                    if (isMounted) {
                        setState({
                            userID: user?.id || null,
                            username: user?.username || null,
                            windowHeight: height,
                            isDataValid: true,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Telegram validation failed:', error);
                    if (isMounted) {
                        setState(prev => ({
                            ...prev,
                            isDataValid: false,
                            isLoading: false,
                            windowHeight: height
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to initialize Telegram WebApp:', error);
                if (isMounted) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false
                    }));
                }
            }
        };

        // Delay initialization slightly to avoid hydration issues
        const timer = setTimeout(() => {
            initializeTelegramWebApp();
            setIsInitialized(true);
        }, 0);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [isInitialized]);

    return (
        <AuthContext.Provider value={state}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};