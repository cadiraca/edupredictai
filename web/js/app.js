/**
 * Main Application Logic
 * Handles navigation, language switching, and simulator functionality
 */

import * as api from './api-client.js';
import * as dashboard from './dashboard.js';
import { switchLanguage, initLanguage } from './translations.js';
import { getDepartmentName } from './department-names.js';

// =============================================================================
// APPLICATION STATE
// =============================================================================

const AppState = {
    currentView: 'landing',
    views: ['landing', 'dashboard', 'simulator'],
    dashboardLoaded: false
};

// Simulator State (existing)
const state = {
    budget: 10000,
    selectedDepartment: null,
    selectedMunicipality: null,
    baseline: null,
    currentPrediction: null,
    investments: {
        infrastructure: 0,
        quality: 0,
        coverage: 0,
        staffing: 0
    }
};

// Investment configurations (existing)
const INVESTMENT_CONFIG = {
    infrastructure: {
        cost: 3000,
        parameter: 'primaria_to_media_ratio',
        improvement: 0.05
    },
    quality: {
        cost: 1500,
        parameter: 'repitencia_lag_1',
        improvement: -0.5
    },
    coverage: {
        cost: 1000,
        parameter: 'over_age_gap',
        improvement: -1.0
    },
    staffing: {
        cost: 4000,
        parameter: 'classroom_density',
        improvement: -2.0
    }
};

// DOM Elements (existing simulator elements)
const elements = {
    departmentSelect: document.getElementById('department'),
    municipalitySelect: document.getElementById('municipality'),
    loadButton: document.getElementById('loadButton'),
    resetButton: document.getElementById('resetButton'),
    budgetDisplay: document.getElementById('budget'),
    resultsContainer: document.getElementById('resultsContainer'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    currentRate: document.getElementById('currentRate'),
    baselineRate: document.getElementById('baselineRate'),
    studentsAtRisk: document.getElementById('studentsAtRisk'),
    studentsContinuing: document.getElementById('studentsContinuing'),
    municipalityName: document.getElementById('municipalityName'),
    population: document.getElementById('population')
};

// =============================================================================
// NAVIGATION SYSTEM
// =============================================================================

/**
 * Switch between views
 */
function switchView(viewName) {
    if (!AppState.views.includes(viewName)) return;
    
    // Hide all views
    AppState.views.forEach(v => {
        const viewElement = document.querySelector(`.view-${v}`);
        if (viewElement) {
            viewElement.style.display = 'none';
        }
    });
    
    // Show selected view
    const targetView = document.querySelector(`.view-${viewName}`);
    if (targetView) {
        targetView.style.display = 'block';
    }
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        const isActive = item.dataset.view === viewName;
        if (isActive) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update URL hash
    window.location.hash = viewName;
    
    // Lazy load dashboard if needed
    if (viewName === 'dashboard' && !AppState.dashboardLoaded) {
        dashboard.init().then(() => {
            AppState.dashboardLoaded = true;
        });
    }
    
    // Close mobile menu
    closeMobileMenu();
    
    AppState.currentView = viewName;
}

/**
 * Setup navigation event listeners
 */
function setupNavigation() {
    // Desktop and mobile nav items
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
    
    // CTA button on landing page
    const ctaButton = document.querySelector('[data-navigate]');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.navigate;
            if (view) {
                switchView(view);
            }
        });
    }
    
    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash && AppState.views.includes(hash)) {
            switchView(hash);
        }
    });
    
    // Mobile hamburger menu
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Language toggle
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguage);
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
}

/**
 * Toggle language
 */
function toggleLanguage() {
    const currentLang = document.getElementById('currentLang').textContent.toLowerCase();
    const newLang = currentLang === 'en' ? 'es' : 'en';
    switchLanguage(newLang);
}

// =============================================================================
// SIMULATOR LOGIC (EXISTING FUNCTIONALITY)
// =============================================================================

/**
 * Initialize the simulator
 */
async function initSimulator() {
    try {
        // Check API health
        await api.checkHealth();
        
        // Load departments
        await loadDepartments();
        
        // Setup event listeners
        setupSimulatorListeners();
    } catch (error) {
        showError('Error al conectar con la API: ' + error.message);
        console.error('Simulator initialization error:', error);
    }
}

/**
 * Load departments into dropdown
 */
async function loadDepartments() {
    try {
        const data = await api.getDepartments();
        
        if (elements.departmentSelect) {
            elements.departmentSelect.innerHTML = '<option value="">Seleccione un departamento...</option>';
            
            data.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.code;
                option.textContent = `${dept.name} (${dept.count} municipios)`;
                option.dataset.municipalities = JSON.stringify(dept.municipalities);
                elements.departmentSelect.appendChild(option);
            });
        }
    } catch (error) {
        showError('Error al cargar departamentos: ' + error.message);
    }
}

/**
 * Setup simulator event listeners
 */
function setupSimulatorListeners() {
    if (elements.departmentSelect) {
        elements.departmentSelect.addEventListener('change', handleDepartmentChange);
    }
    
    if (elements.municipalitySelect) {
        elements.municipalitySelect.addEventListener('change', handleMunicipalityChange);
    }
    
    if (elements.loadButton) {
        elements.loadButton.addEventListener('click', handleLoadData);
    }
    
    if (elements.resetButton) {
        elements.resetButton.addEventListener('click', handleReset);
    }
    
    // Use new button class
    document.querySelectorAll('.btn-invest').forEach(button => {
        button.addEventListener('click', handleInvestment);
    });
}

/**
 * Handle department selection
 */
function handleDepartmentChange(event) {
    const selectedOption = event.target.selectedOptions[0];
    
    if (!selectedOption.value) {
        elements.municipalitySelect.disabled = true;
        elements.municipalitySelect.innerHTML = '<option value="">Primero seleccione un departamento</option>';
        elements.loadButton.disabled = true;
        return;
    }
    
    state.selectedDepartment = selectedOption.value;
    
    const municipalities = JSON.parse(selectedOption.dataset.municipalities);
    
    elements.municipalitySelect.innerHTML = '<option value="">Seleccione un municipio...</option>';
    municipalities.forEach(muni => {
        const option = document.createElement('option');
        option.value = muni;
        option.textContent = muni;
        elements.municipalitySelect.appendChild(option);
    });
    
    elements.municipalitySelect.disabled = false;
    elements.loadButton.disabled = true;
}

/**
 * Handle municipality selection
 */
function handleMunicipalityChange(event) {
    state.selectedMunicipality = event.target.value;
    elements.loadButton.disabled = !state.selectedMunicipality;
}

/**
 * Load baseline data for selected municipality
 */
async function handleLoadData() {
    if (!state.selectedMunicipality) return;
    
    try {
        showLoading(true);
        hideError();
        
        const prediction = await api.predictDropout(state.selectedMunicipality);
        
        state.baseline = prediction;
        state.currentPrediction = prediction;
        
        resetInvestments();
        displayResults();
        
        if (elements.resultsContainer) {
            elements.resultsContainer.style.display = 'block';
        }
        showLoading(false);
    } catch (error) {
        showError('Error al cargar datos: ' + error.message);
        showLoading(false);
    }
}

/**
 * Handle investment button click
 */
async function handleInvestment(event) {
    const button = event.target;
    const investmentType = button.dataset.investment;
    const cost = parseInt(button.dataset.cost);
    
    if (state.budget < cost) {
        showError('Presupuesto insuficiente');
        setTimeout(hideError, 3000);
        return;
    }
    
    state.budget -= cost;
    state.investments[investmentType]++;
    
    updateBudgetDisplay();
    updateInvestmentLevels();
    
    await updatePrediction();
}

/**
 * Update prediction with current investments
 */
async function updatePrediction() {
    try {
        showLoading(true);
        
        const adjustments = {};
        
        for (const [type, level] of Object.entries(state.investments)) {
            if (level > 0) {
                const config = INVESTMENT_CONFIG[type];
                const baseValue = state.baseline.input_parameters[config.parameter];
                adjustments[config.parameter] = baseValue + (config.improvement * level);
            }
        }
        
        const prediction = await api.predictDropout(
            state.selectedMunicipality,
            2025,
            Object.keys(adjustments).length > 0 ? adjustments : null
        );
        
        state.currentPrediction = prediction;
        displayResults();
        showLoading(false);
    } catch (error) {
        showError('Error al actualizar predicción: ' + error.message);
        showLoading(false);
    }
}

/**
 * Display results in the UI
 */
function displayResults() {
    const { baseline, currentPrediction } = state;
    
    const totalPopulation = Math.round(currentPrediction.input_parameters.POBLACIÓN_5_16);
    const studentsAtRisk = currentPrediction.predicted_students_impacted;
    const studentsContinuing = totalPopulation - studentsAtRisk;
    
    // Show stat tiles and investments section
    const statTiles = document.getElementById('statTiles');
    const investmentsSection = document.getElementById('investmentsSection');
    if (statTiles) statTiles.style.display = 'grid';
    if (investmentsSection) investmentsSection.style.display = 'block';
    
    // Update stat tiles
    if (elements.currentRate) {
        elements.currentRate.textContent = `${currentPrediction.predicted_dropout_rate.toFixed(2)}%`;
    }
    if (elements.studentsAtRisk) {
        elements.studentsAtRisk.textContent = studentsAtRisk.toLocaleString();
    }
    if (elements.studentsContinuing) {
        elements.studentsContinuing.textContent = studentsContinuing.toLocaleString();
    }
    
    // Update sidebar context
    if (elements.municipalityName) {
        elements.municipalityName.textContent = currentPrediction.municipality_name;
    }
    if (elements.population) {
        elements.population.textContent = totalPopulation.toLocaleString();
    }
    
    // Update trend indicator
    const trendIndicator = document.getElementById('trendIndicator');
    const improvement = baseline.predicted_dropout_rate - currentPrediction.predicted_dropout_rate;
    if (trendIndicator) {
        if (improvement > 0) {
            trendIndicator.textContent = `↓ ${improvement.toFixed(2)}% vs Base`;
            trendIndicator.className = 'tile-trend positive';
        } else if (improvement < 0) {
            trendIndicator.textContent = `↑ ${Math.abs(improvement).toFixed(2)}% vs Base`;
            trendIndicator.className = 'tile-trend negative';
        } else {
            trendIndicator.textContent = 'Sin cambios';
            trendIndicator.className = 'tile-trend';
        }
    }
    
    // Update budget warning
    updateBudgetWarning();
}

/**
 * Reset simulation
 */
function handleReset() {
    state.budget = 10000;
    resetInvestments();
    
    if (state.selectedMunicipality) {
        handleLoadData();
    }
}

/**
 * Reset all investments
 */
function resetInvestments() {
    state.investments = {
        infrastructure: 0,
        quality: 0,
        coverage: 0,
        staffing: 0
    };
    updateInvestmentLevels();
    updateBudgetDisplay();
}

/**
 * Update budget display
 */
function updateBudgetDisplay() {
    if (elements.budgetDisplay) {
        elements.budgetDisplay.textContent = `$${state.budget.toLocaleString()}k`;
        
        if (state.budget < 1000) {
            elements.budgetDisplay.style.color = '#ef4444';
        } else {
            elements.budgetDisplay.style.color = '#10b981';
        }
    }
}

/**
 * Update investment level displays and progress bars
 */
function updateInvestmentLevels() {
    for (const [type, level] of Object.entries(state.investments)) {
        const levelElement = document.getElementById(`level-${type}`);
        if (levelElement) {
            levelElement.textContent = level;
        }
        
        // Update progress bars
        const card = document.querySelector(`[data-investment="${type}"]`)?.closest('.investment-card');
        if (card) {
            const progressSteps = card.querySelectorAll('.progress-step');
            progressSteps.forEach((step, index) => {
                if (index < level) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            // Update button state
            const button = card.querySelector('.btn-invest');
            const cost = parseInt(button.dataset.cost);
            
            if (level >= 3) {
                button.disabled = true;
                button.textContent = 'Nivel Máximo';
                button.classList.add('maxed');
            } else if (state.budget < cost) {
                button.disabled = true;
                button.textContent = 'Presupuesto Insuficiente';
                button.classList.add('insufficient');
            } else {
                button.disabled = false;
                button.textContent = 'Invertir';
                button.classList.remove('maxed', 'insufficient');
            }
        }
    }
}

/**
 * Update budget warning display
 */
function updateBudgetWarning() {
    const budgetWarning = document.getElementById('budgetWarning');
    if (budgetWarning) {
        if (state.budget < 1000) {
            budgetWarning.style.display = 'flex';
        } else {
            budgetWarning.style.display = 'none';
        }
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError() {
    if (elements.errorMessage) {
        elements.errorMessage.style.display = 'none';
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the entire application
 */
async function init() {
    // Initialize language
    initLanguage();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize simulator
    await initSimulator();
    
    // Handle initial route
    const hash = window.location.hash.slice(1);
    if (hash && AppState.views.includes(hash)) {
        switchView(hash);
    } else {
        switchView('landing');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
