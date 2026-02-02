/**
 * Product Schema Transformer
 * 
 * Transforms PrimePickz product data to Meta Catalog format
 */

import type { Product } from '../../shared/schema';
import type { MetaCatalogProduct } from '../../shared/meta-catalog-schema';

// Site URL for generating product links
const SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://primepickz.com';

/**
 * Transform PrimePickz product to Meta Catalog format
 */
export function transformToMetaProduct(product: Product): MetaCatalogProduct {
    // Use product ID as retailer_id (unique identifier for Meta)
    const retailerId = product.id;

    // Ensure image URL is HTTPS
    let imageUrl = product.imageUrl;
    if (imageUrl && !imageUrl.startsWith('https://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
    }

    // Get additional images (up to 10)
    const additionalImages: string[] = [];
    if (product.images && Array.isArray(product.images)) {
        for (const img of product.images.slice(0, 10)) {
            if (typeof img === 'string' && img !== product.imageUrl) {
                additionalImages.push(
                    img.startsWith('https://') ? img : img.replace('http://', 'https://')
                );
            }
        }
    }

    // Calculate price in cents
    const priceInCents = Math.round(parseFloat(product.price?.toString() || '0') * 100);

    // Calculate sale price if there's a discount
    let salePriceInCents: number | undefined;
    if (product.originalPrice && parseFloat(product.originalPrice.toString()) > parseFloat(product.price?.toString() || '0')) {
        salePriceInCents = priceInCents;
    }

    // Determine availability
    const availability: MetaCatalogProduct['availability'] =
        product.inStock && (product.stockCount === null || product.stockCount === undefined || product.stockCount > 0)
            ? 'in stock'
            : 'out of stock';

    // Truncate description to 5000 chars (Meta limit)
    const description = (product.description || '').slice(0, 5000);

    // Truncate name to 150 chars (Meta limit)
    const name = (product.name || 'Product').slice(0, 150);

    const metaProduct: MetaCatalogProduct = {
        retailer_id: retailerId,
        name,
        description,
        price: priceInCents,
        currency: 'USD',
        availability,
        image_url: imageUrl,
        url: `${SITE_URL}/product/${product.id}`,
        condition: 'new',
    };

    // Add optional fields
    if (additionalImages.length > 0) {
        metaProduct.additional_image_urls = additionalImages;
    }

    if (product.category) {
        metaProduct.category = product.category;
        metaProduct.custom_label_0 = product.category;
    }

    if (product.badge) {
        metaProduct.custom_label_1 = product.badge;
    }

    if (salePriceInCents && product.originalPrice) {
        metaProduct.sale_price = salePriceInCents;
    }

    return metaProduct;
}

/**
 * Validate that a product has all required fields for Meta
 */
export function validateForMeta(product: Product): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.id) {
        errors.push('Missing product ID (retailer_id)');
    }

    if (!product.name || product.name.trim().length === 0) {
        errors.push('Missing product name');
    }

    if (!product.description || product.description.trim().length === 0) {
        errors.push('Missing product description');
    }

    if (!product.price || parseFloat(product.price.toString()) <= 0) {
        errors.push('Invalid or missing price');
    }

    if (!product.imageUrl) {
        errors.push('Missing image URL');
    } else if (!product.imageUrl.startsWith('http')) {
        errors.push('Image URL must be a valid HTTP/HTTPS URL');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Compare two Meta products to detect changes
 * Returns true if products are different and need syncing
 */
export function hasProductChanged(
    current: MetaCatalogProduct,
    previous: MetaCatalogProduct | null
): boolean {
    if (!previous) return true;

    // Compare key fields
    return (
        current.name !== previous.name ||
        current.description !== previous.description ||
        current.price !== previous.price ||
        current.availability !== previous.availability ||
        current.image_url !== previous.image_url ||
        current.url !== previous.url
    );
}

/**
 * Generate a change summary for logging
 */
export function getChangeSummary(
    current: MetaCatalogProduct,
    previous: MetaCatalogProduct | null
): string[] {
    if (!previous) return ['New product'];

    const changes: string[] = [];

    if (current.name !== previous.name) {
        changes.push(`Name: "${previous.name}" → "${current.name}"`);
    }
    if (current.price !== previous.price) {
        changes.push(`Price: $${(previous.price / 100).toFixed(2)} → $${(current.price / 100).toFixed(2)}`);
    }
    if (current.availability !== previous.availability) {
        changes.push(`Availability: ${previous.availability} → ${current.availability}`);
    }
    if (current.image_url !== previous.image_url) {
        changes.push('Image updated');
    }
    if (current.description !== previous.description) {
        changes.push('Description updated');
    }

    return changes.length > 0 ? changes : ['No changes detected'];
}
