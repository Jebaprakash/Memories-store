// Re-export from the new Cloudinary-optimized helper
// This file is kept for backward compatibility
export { getImageUrl, getCloudinaryUrl, getCloudinarySrcSet } from './cloudinary';

export const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl.replace(/\/api\/?$/, '');
    return 'http://localhost:5000';
};
