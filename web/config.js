/**
 * Environment Configuration
 * Automatically detects environment and provides the correct API URL
 */

const ENV_CONFIG = {
    // API URLs for different environments
    api: {
        // Local development
        development: 'http://localhost:8000',
        
        // Production - SAP BTP Cloud Foundry
        // IMPORTANT: Replace this URL after deploying to SAP BTP
        // Format: https://your-app-name.cfapps.[region].hana.ondemand.com
        // Example regions: eu10, us10, ap21, etc.
        production: 'https://edupredict-api.cfapps.us10-001.hana.ondemand.com'
    },
    
    // GitHub Pages URLs (for reference)
    pages: {
        url: 'https://cadiraca.github.io/edupredictai'
    }
};

/**
 * Detect current environment
 */
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    
    // Production (GitHub Pages or any other domain)
    return 'production';
}

/**
 * Get API base URL for current environment
 */
export function getApiUrl() {
    const env = detectEnvironment();
    const apiUrl = ENV_CONFIG.api[env];
    
    console.log(`🌍 Environment: ${env}`);
    console.log(`🔗 API URL: ${apiUrl}`);
    
    return apiUrl;
}

/**
 * Get environment name
 */
export function getEnvironment() {
    return detectEnvironment();
}

/**
 * Check if running in production
 */
export function isProduction() {
    return detectEnvironment() === 'production';
}

// Export config for direct access if needed
export const config = ENV_CONFIG;
