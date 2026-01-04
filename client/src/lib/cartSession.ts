// Cart session utilities - ensures consistent sessionId across all cart operations

export function getCartSessionId(): string {
    // Browser check for SSR safety
    if (typeof window === 'undefined') {
        return 'default-session';
    }

    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
}

export function clearCartSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSessionId');
    }
}
