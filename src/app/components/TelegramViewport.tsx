// app/components/TelegramViewport.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type WebAppType from '@twa-dev/sdk';

// Inner component that uses WebApp
function ViewportHandlerInner({ 
    children 
}: { 
    children: React.ReactNode 
}) {
    const [styles, setStyles] = useState<React.CSSProperties>({});

    useEffect(() => {
        const initViewport = async () => {
            try {
                const WebApp = (await import('@twa-dev/sdk')).default;
                
                const updateStyles = () => {
                    setStyles({
                        '--tg-viewport-height': `${WebApp.viewportHeight}px`,
                        '--tg-viewport-stable-height': `${WebApp.viewportStableHeight}px`,
                    } as React.CSSProperties);
                };

                updateStyles();
                WebApp.onEvent('viewportChanged', updateStyles);

                return () => {
                    WebApp.offEvent('viewportChanged', updateStyles);
                };
            } catch (error) {
                console.error('Failed to initialize Telegram viewport:', error);
            }
        };

        initViewport();
    }, []);

    return <div style={styles}>{children}</div>;
}

// Dynamically import the inner component with SSR disabled
const ViewportHandler = dynamic(() => Promise.resolve(ViewportHandlerInner), {
    ssr: false
});

// Main export
export function TelegramViewport({ 
    children 
}: { 
    children: React.ReactNode 
}) {
    return <ViewportHandler>{children}</ViewportHandler>;
}