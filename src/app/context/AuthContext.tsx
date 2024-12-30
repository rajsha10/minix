// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type WebAppType from '@twa-dev/sdk';

type AuthContextType = {
    userID: number | null;
    username: string | null;
    windowHeight: number;
    isDataValid: boolean;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthContextType = {
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
    const [state, setState] = useState<AuthContextType>(initialState);

    useEffect(() => {
        let mounted = true;

        const initTelegram = async () => {
            try {
                // Dynamically import WebApp and validation function
                const [{ default: WebApp }, { validate3rd }] = await Promise.all([
                    import('@twa-dev/sdk'),
                    import('@telegram-apps/init-data-node/web')
                ]);

                if (!mounted) return;

                // Initialize WebApp
                if (WebApp) {
                    WebApp.isVerticalSwipesEnabled = false;
                    const height = WebApp.viewportStableHeight || (typeof window !== 'undefined' ? window.innerHeight : 0);
                    
                    WebApp.ready();

                    try {
                        const botId = 7638029485;
                        if (WebApp.initData) {
                            await validate3rd(WebApp.initData, botId);
                            const user = WebApp.initDataUnsafe.user;

                            if (mounted) {
                                setState({
                                    userID: user?.id || null,
                                    username: user?.username || null,
                                    windowHeight: height,
                                    isDataValid: true,
                                    isLoading: false
                                });
                            }
                        } else {
                            throw new Error('No initData available');
                        }
                    } catch (error) {
                        console.error('Telegram validation failed:', error);
                        if (mounted) {
                            setState(prev => ({
                                ...prev,
                                isDataValid: false,
                                isLoading: false
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to initialize Telegram:', error);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        isDataValid: false
                    }));
                }
            }
        };

        // Only run on client side
        if (typeof window !== 'undefined') {
            initTelegram();
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }

        return () => {
            mounted = false;
        };
    }, []);

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