/**
 * API Client for Colombia Dropout Prediction API
 * Handles all communication with the backend API
 * Keep this file focused ONLY on API calls - no UI logic
 */

import { getApiUrl } from '../config.js';

// API Configuration - automatically detects environment
const API_CONFIG = {
    BASE_URL: getApiUrl()
};

/**
 * Health check - verify API is running
 */
export async function checkHealth() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/`);
    if (!response.ok) {
        throw new Error('API health check failed');
    }
    return response.json();
}

/**
 * Get all departments with their municipalities
 * Returns: { departments: [...], total_departments: number }
 */
export async function getDepartments() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/departments`);
    if (!response.ok) {
        throw new Error('Failed to fetch departments');
    }
    return response.json();
}

/**
 * Get all municipalities (flat list)
 * Returns: { municipalities: [...], count: number }
 */
export async function getMunicipalities() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/municipalities`);
    if (!response.ok) {
        throw new Error('Failed to fetch municipalities');
    }
    return response.json();
}

/**
 * Get features for a specific municipality
 * @param {string} municipalityName - Name of the municipality
 * Returns: { municipality_name, features: [...] }
 */
export async function getMunicipalityFeatures(municipalityName) {
    const encodedName = encodeURIComponent(municipalityName);
    const response = await fetch(`${API_CONFIG.BASE_URL}/municipality/${encodedName}/features`);
    if (!response.ok) {
        throw new Error(`Failed to fetch features for ${municipalityName}`);
    }
    return response.json();
}

/**
 * Predict dropout rate for a municipality
 * @param {string} municipalityName - Name of the municipality
 * @param {number} targetYear - Year for prediction (default: 2025)
 * @param {object|null} scenarioAdjustments - Optional parameter adjustments
 * 
 * Example scenarioAdjustments:
 * {
 *   "repitencia_lag_1": 2.5,
 *   "classroom_density": 25.0,
 *   "primaria_to_media_ratio": 0.85
 * }
 * 
 * Returns: {
 *   municipality_name,
 *   predicted_dropout_rate,
 *   predicted_students_impacted,
 *   target_year,
 *   input_parameters,
 *   department_code
 * }
 */
export async function predictDropout(municipalityName, targetYear = 2025, scenarioAdjustments = null) {
    const requestBody = {
        municipality_name: municipalityName,
        target_year: targetYear
    };
    
    if (scenarioAdjustments) {
        requestBody.scenario_adjustments = scenarioAdjustments;
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Prediction failed');
    }
    
    return response.json();
}

/**
 * Get model features and their descriptions
 * Returns: { features: [...], descriptions: {...} }
 */
export async function getModelFeatures() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/model/features`);
    if (!response.ok) {
        throw new Error('Failed to fetch model features');
    }
    return response.json();
}

/**
 * Helper function to update API base URL (useful for production deployment)
 * @param {string} newBaseUrl - New API base URL
 */
export function setApiBaseUrl(newBaseUrl) {
    API_CONFIG.BASE_URL = newBaseUrl;
    console.log(`API base URL updated to: ${newBaseUrl}`);
}

/**
 * Get current API base URL
 */
export function getApiBaseUrl() {
    return API_CONFIG.BASE_URL;
}

// ==================== ANALYTICS ENDPOINTS ====================

/**
 * Get national-level analytics and statistics
 * Returns: {
 *   current_year,
 *   dropout_rate,
 *   total_students,
 *   year_over_year_change,
 *   funnel_efficiency,
 *   trend,
 *   previous_year_dropout
 * }
 */
export async function getNationalAnalytics() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/national`);
    if (!response.ok) {
        throw new Error('Failed to fetch national analytics');
    }
    return response.json();
}

/**
 * Get department-level comparison analytics
 * Returns: {
 *   departments: [{
 *     code,
 *     name,
 *     dropout_rate,
 *     student_count,
 *     risk_level,
 *     municipality_count
 *   }],
 *   count
 * }
 */
export async function getDepartmentAnalytics() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/departments`);
    if (!response.ok) {
        throw new Error('Failed to fetch department analytics');
    }
    return response.json();
}

/**
 * Get historical trends over time
 * @param {string|null} departmentCode - Optional department code to filter
 * Returns: {
 *   data: [{
 *     year,
 *     dropout_rate,
 *     students,
 *     funnel_ratio
 *   }],
 *   count,
 *   department_code
 * }
 */
export async function getHistoricalTrends(departmentCode = null) {
    let url = `${API_CONFIG.BASE_URL}/analytics/history`;
    if (departmentCode) {
        url += `?department_code=${encodeURIComponent(departmentCode)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch historical trends');
    }
    return response.json();
}
