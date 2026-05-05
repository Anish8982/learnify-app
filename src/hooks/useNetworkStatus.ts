import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// Lightweight network check without a native module dependency
async function checkConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return res.ok;
    } catch {
        return false;
    }
}

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            const online = await checkConnectivity();
            if (!cancelled) setIsOnline(online);
        };

        check();

        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') check();
        });

        return () => {
            cancelled = true;
            sub.remove();
        };
    }, []);

    return { isOnline };
}
