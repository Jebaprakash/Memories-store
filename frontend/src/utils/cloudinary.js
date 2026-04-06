// ============================================================
// Cloudinary Image Optimization Helper
// ============================================================
// Usage:
//   import { getCloudinaryUrl, getImageUrl } from '../utils/cloudinary';
//   const url = getCloudinaryUrl(rawUrl, { width: 400, quality: 'auto' });
// ============================================================

const CLOUDINARY_BASE = 'https://res.cloudinary.com';

// The previous regex parseCloudinaryUrl was removed to prevent path truncations.
export function getCloudinaryUrl(url, options = {}) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com')) return url;

    // Split at /upload/ to safely insert transformations
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity,
    } = options;

    // Build transformation string
    const transformParts = [];
    if (format) transformParts.push(`f_${format}`);
    if (quality) transformParts.push(`q_${quality}`);
    if (crop) transformParts.push(`c_${crop}`);
    if (gravity) transformParts.push(`g_${gravity}`);
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);

    const transformation = transformParts.join(',');

    let restOfUrl = parts[1];
    
    const segments = restOfUrl.split('/');
    if (segments.length > 1 && /^[a-z]_[a-zA-Z0-9]+/.test(segments[0])) {
        segments.shift();
        restOfUrl = segments.join('/');
    }

    return `${parts[0]}/upload/${transformation}/${restOfUrl}`;
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
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return '';
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
