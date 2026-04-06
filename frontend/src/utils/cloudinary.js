// ============================================================
// Cloudinary Image Optimization Helper
// ============================================================
// Usage:
//   import { getCloudinaryUrl, getImageUrl } from '../utils/cloudinary';
//   const url = getCloudinaryUrl(rawUrl, { width: 400, quality: 'auto' });
// ============================================================

const CLOUDINARY_BASE = 'https://res.cloudinary.com';

/**
 * Extracts the public ID and cloud name from a Cloudinary URL.
 * Returns null if the URL is not a Cloudinary URL.
 */
function parseCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(
        /https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload(?:\/([^/]+(?:\/[^/]+)*))?\/?([^?]+)/
    );
    if (!match) return null;
    return {
        cloudName: match[1],
        resourceType: match[2],
        // match[3] may contain existing transformations
        existingTransforms: match[3] || '',
        publicId: match[4],
    };
}

/**
 * Builds an optimized Cloudinary URL with given transformation options.
 *
 * @param {string} url - Original image URL (Cloudinary or otherwise)
 * @param {object} options
 * @param {number|string} [options.width]      - Resize width (e.g. 400)
 * @param {number|string} [options.height]     - Resize height (e.g. 300)
 * @param {'auto'|number} [options.quality]    - Image quality (default: 'auto')
 * @param {'auto'|string} [options.format]     - Image format (default: 'auto' → WebP/AVIF)
 * @param {'fill'|'crop'|'scale'|'fit'|'thumb'} [options.crop] - Crop mode
 * @param {'auto'|'face'} [options.gravity]    - Crop gravity
 * @returns {string} Optimized URL
 */
export function getCloudinaryUrl(url, options = {}) {
    if (!url) return null;

    const parsed = parseCloudinaryUrl(url);
    if (!parsed) {
        // Not a Cloudinary URL – return as-is
        return url;
    }

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity,
    } = options;

    // Build transformation string
    const parts = [];
    if (format) parts.push(`f_${format}`);
    if (quality) parts.push(`q_${quality}`);
    if (crop) parts.push(`c_${crop}`);
    if (gravity) parts.push(`g_${gravity}`);
    if (width) parts.push(`w_${width}`);
    if (height) parts.push(`h_${height}`);

    const transformation = parts.join(',');

    return `${CLOUDINARY_BASE}/${parsed.cloudName}/${parsed.resourceType}/upload/${transformation}/${parsed.publicId}`;
}

/**
 * Returns a set of responsive srcSet values for Cloudinary images.
 * Use with <img srcSet={...} sizes={...} />
 *
 * @param {string} url - Original Cloudinary URL
 * @param {number[]} widths - Array of widths e.g. [200, 400, 800]
 * @returns {string} srcSet string
 */
export function getCloudinarySrcSet(url, widths = [200, 400, 800, 1200]) {
    if (!url || !parseCloudinaryUrl(url)) return '';
    return widths
        .map((w) => `${getCloudinaryUrl(url, { width: w })} ${w}w`)
        .join(', ');
}

// ============================================================
// General getImageUrl – works for both Cloudinary and local URLs
// ============================================================

const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl.replace(/\/api\/?$/, '');
    return 'http://localhost:5000';
};

/**
 * Resolves any image path to a full, optimized URL.
 * - Cloudinary images are automatically optimized (WebP, auto quality, responsive)
 * - Local server images are prefixed with the API base URL
 * - External URLs are returned as-is
 *
 * @param {string} imagePath
 * @param {object} [options] - Cloudinary transformation options
 * @returns {string}
 */
export const getImageUrl = (imagePath, options = {}) => {
    if (!imagePath) return 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image';

    // External Cloudinary URL → optimize
    if (imagePath.includes('res.cloudinary.com')) {
        return getCloudinaryUrl(imagePath, {
            format: 'auto',
            quality: 'auto',
            ...options,
        });
    }

    // Other absolute URLs (http/https) → return as-is
    if (imagePath.startsWith('http')) return imagePath;

    // Local / relative path → prefix with API base URL
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${getBaseUrl()}${normalizedPath}`;
};

/**
 * Returns the best image URL for a product card thumbnail.
 * Applies 400px width, auto format, auto quality optimizations.
 *
 * @param {string} imagePath
 * @returns {string}
 */
export const getProductCardImage = (imagePath) =>
    getImageUrl(imagePath, { width: 400, crop: 'fill', gravity: 'auto' });

/**
 * Returns the best image URL for a product detail hero.
 * Applies 800px width optimizations.
 *
 * @param {string} imagePath
 * @returns {string}
 */
export const getProductHeroImage = (imagePath) =>
    getImageUrl(imagePath, { width: 800, crop: 'fill', gravity: 'auto' });

/**
 * Returns the best image URL for a category card.
 * Applies 600px width optimizations.
 *
 * @param {string} imagePath
 * @returns {string}
 */
export const getCategoryImage = (imagePath) =>
    getImageUrl(imagePath, { width: 600, crop: 'fill', gravity: 'auto' });
