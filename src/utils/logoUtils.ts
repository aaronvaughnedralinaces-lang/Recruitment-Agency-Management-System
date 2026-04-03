// src/utils/logoUtils.ts
export const getLogoUrl = (logoPath: string | null | undefined): string => {
    if (!logoPath) return '';
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://') || logoPath.startsWith('data:')) {
        return logoPath;
    }
    // Remove any leading slash and return as-is (already includes 'uploads/')
    const cleanPath = logoPath.replace(/^\/+/, '');
    return `/${cleanPath}`;   // e.g., /uploads/company_logo/logo.png
};