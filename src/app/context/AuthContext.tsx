// app/context/AuthContext.tsx
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
	const [windowHeight, setWindowHeight] = useState<number>(0);
	const [userID, setUserID] = useState<number | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [isDataValid, setIsDataValid] = useState<boolean>(false);

	useEffect(() => {
		// Ensure this code only runs on the client side
		if (typeof window !== 'undefined' && WebApp) {
			WebApp.isVerticalSwipesEnabled = false;
			setWindowHeight(WebApp.viewportStableHeight || window.innerHeight);
			WebApp.ready();

			// Validate Telegram data
			(async () => {
				try {
					const botId = 7638029485;
					await validate3rd(WebApp.initData, botId); // Validate initData
					setIsDataValid(true);
					const user = WebApp.initDataUnsafe.user; // Extract user data if valid
					setUserID(user?.id || null);
					setUsername(user?.username || null);
				} catch (error) {
					if (error instanceof Error) {
						console.error('Validation failed:', error.message);
					} else {
						console.error('Validation failed:', error);
					}
					setIsDataValid(false);
				}
			})();
		}
	}, []);

	const contextValue = {
		userID,
		username,
		windowHeight,
		isDataValid,
	};

	return (
		<AuthContext.Provider value={contextValue}>
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