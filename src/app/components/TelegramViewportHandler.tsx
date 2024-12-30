// app/components/TelegramViewportHandler.tsx
'use client';

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function TelegramViewportHandler({
    children
}: {
    children: React.ReactNode;
}) {
    const [viewportStyles, setViewportStyles] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof WebApp !== 'undefined') {
            // Initial setup
            const updateViewportStyles = () => {
                setViewportStyles({
                    '--tg-viewport-height': `${WebApp.viewportHeight}px`,
                    '--tg-viewport-stable-height': `${WebApp.viewportStableHeight}px`,
                } as React.CSSProperties);
            };

            // Set initial values
            updateViewportStyles();

            // Update on viewport changes if needed
            const handleViewportChange = () => {
                updateViewportStyles();
            };

            WebApp.onEvent('viewportChanged', handleViewportChange);

            return () => {
                WebApp.offEvent('viewportChanged', handleViewportChange);
            };
        }
    }, []);

    return (
        <div style={viewportStyles} className="min-h-screen">
            {children}
        </div>
    );
}