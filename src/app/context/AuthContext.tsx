'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { validate3rd } from '@telegram-apps/init-data-node/web';

type AuthContextType = {
    userID: number | null;
    username: string | null;
    windowHeight: number;
    isDataValid: boolean;
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

    useEffect(() => {
        setIsClient(true); // Ensure client-side rendering
    }, []);

    useEffect(() => {
        if (isClient && WebApp) {
            WebApp.isVerticalSwipesEnabled = false;
            setWindowHeight(WebApp.viewportStableHeight || window.innerHeight);
            WebApp.ready();

            (async () => {
                try {
                    const botId = 7638029485;
                    if (!WebApp.initData) {
                        throw new Error('initData is not available');
                    }
                    await validate3rd(WebApp.initData, botId); // Validate initData
                    setIsDataValid(true);
                    const user = WebApp.initDataUnsafe.user; // Extract user data if valid
                    setUserID(user?.id || null);
                    setUsername(user?.username || null);
                } catch (error) {
                    console.error('Validation failed:', error instanceof Error ? error.message : error);
                    setIsDataValid(false);
                }
            })();
        }
    }, [isClient]);

    const contextValue = {
        userID,
        username,
        windowHeight,
        isDataValid,
    };

    if (!isClient) {
        return null; // Prevent SSR/CSR mismatch
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