/**
 * Analytics utility for tracking e-commerce events
 * Uses Google Analytics 4 (gtag.js)
 */

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        trackEvent?: (eventName: string, params: Record<string, unknown>) => void;
    }
}

type EcommerceItem = {
    item_id: string;
    item_name: string;
    price: number;
    quantity?: number;
    item_category?: string;
    item_brand?: string;
};

class Analytics {
    private isEnabled: boolean;

    constructor() {
        this.isEnabled = typeof window !== 'undefined' && !!window.gtag;
    }

    private track(eventName: string, params: Record<string, unknown> = {}) {
        if (!this.isEnabled) {
            console.debug('[Analytics]', eventName, params);
            return;
        }

        try {
            window.gtag?.('event', eventName, params);
        } catch (e) {
            console.error('Analytics error:', e);
        }
    }

    // Page Views
    pageView(pagePath: string, pageTitle: string) {
        this.track('page_view', {
            page_path: pagePath,
            page_title: pageTitle,
        });
    }

    // Search
    search(searchTerm: string) {
        this.track('search', { search_term: searchTerm });
    }

    // Product Views
    viewItem(item: EcommerceItem) {
        this.track('view_item', {
            currency: 'USD',
            value: item.price,
            items: [item],
        });
    }

    // Add to Cart
    addToCart(item: EcommerceItem) {
        this.track('add_to_cart', {
            currency: 'USD',
            value: item.price * (item.quantity || 1),
            items: [item],
        });
    }

    // Remove from Cart
    removeFromCart(item: EcommerceItem) {
        this.track('remove_from_cart', {
            currency: 'USD',
            value: item.price * (item.quantity || 1),
            items: [item],
        });
    }

    // View Cart
    viewCart(items: EcommerceItem[], total: number) {
        this.track('view_cart', {
            currency: 'USD',
            value: total,
            items,
        });
    }

    // Begin Checkout
    beginCheckout(items: EcommerceItem[], total: number) {
        this.track('begin_checkout', {
            currency: 'USD',
            value: total,
            items,
        });
    }

    // Purchase Complete
    purchase(transactionId: string, items: EcommerceItem[], total: number) {
        this.track('purchase', {
            transaction_id: transactionId,
            currency: 'USD',
            value: total,
            items,
        });
    }

    // Add to Wishlist
    addToWishlist(item: EcommerceItem) {
        this.track('add_to_wishlist', {
            currency: 'USD',
            value: item.price,
            items: [item],
        });
    }

    // Sign Up
    signUp(method: string) {
        this.track('sign_up', { method });
    }

    // Login
    login(method: string) {
        this.track('login', { method });
    }

    // Apply Promo Code
    applyPromoCode(code: string, success: boolean) {
        this.track('apply_promo_code', {
            promo_code: code,
            success,
        });
    }

    // Custom Events
    custom(eventName: string, params: Record<string, unknown>) {
        this.track(eventName, params);
    }
}

export const analytics = new Analytics();
export default analytics;
