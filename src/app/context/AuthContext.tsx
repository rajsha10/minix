'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { validate3rd } from '@telegram-apps/init-data-node/web';

type AuthContextType = {
    userID: number | null;
    username: string | null;
    windowHeight: number;
    isDataValid: boolean;
    error: string | null;
    isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isClient, setIsClient] = useState(false);
    const [windowHeight, setWindowHeight] = useState<number>(0);
    const [userID, setUserID] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isDataValid, setIsDataValid] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        // Check if WebApp is available
        if (typeof WebApp === 'undefined') {
            setError('Telegram WebApp is not available. Are you running this outside of Telegram?');
            setIsInitialized(true);
            return;
        }

        let initializationTimeout: NodeJS.Timeout;

        const initializeWebApp = async () => {
            try {
                // Disable vertical swipes
                WebApp.isVerticalSwipesEnabled = false;
                
                // Set viewport height
                setWindowHeight(WebApp.viewportStableHeight || window.innerHeight);

                // Wait for WebApp to be ready
                WebApp.ready();

                // Set initialization timeout
                initializationTimeout = setTimeout(() => {
                    if (!WebApp.initData) {
                        setError('Initialization timeout: initData not received from Telegram');
                        setIsInitialized(true);
                    }
                }, 5000); // 5 second timeout

                // Validate initialization data
                const botId = 7638029485;
                
                if (!WebApp.initData) {
                    throw new Error('Telegram WebApp initialization data is not available');
                }

                // Clear timeout as we got the initData
                clearTimeout(initializationTimeout);

                // Validate the initialization data
                await validate3rd(WebApp.initData, botId);
                
                // Extract user data if available
                const user = WebApp.initDataUnsafe.user;
                if (!user) {
                    throw new Error('User data is not available in initialization data');
                }

                // Set user data
                setUserID(user.id);
                setUsername(user.username || null);
                setIsDataValid(true);
                setError(null);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setError(errorMessage);
                setIsDataValid(false);
                console.error('Telegram WebApp initialization failed:', errorMessage);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeWebApp();

        // Cleanup
        return () => {
            if (initializationTimeout) {
                clearTimeout(initializationTimeout);
            }
        };
    }, [isClient]);

    const contextValue = {
        userID,
        username,
        windowHeight,
        isDataValid,
        error,
        isInitialized
    };

    if (!isClient) {
        return null;
    }

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};