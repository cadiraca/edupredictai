/**
 * Dashboard Module
 * Handles analytics dashboard data loading, KPI rendering, and chart creation
 */

import * as api from './api-client.js';
import * as charts from './charts.js';
import { t, getCurrentLanguage } from './translations.js';

// Dashboard state
const Dashboard = {
    data: null,
    charts: {},
    loaded: false,
    selectedDepartment: null
};

/**
 * Initialize dashboard
 */
export async function init() {
    if (Dashboard.loaded) {
        return; // Already loaded
    }
    
    try {
        showLoading(true);
        await loadData();
        renderKPIs();
        renderCharts();
        renderDepartmentList();
        Dashboard.loaded = true;
        showLoading(false);
    } catch (error) {
        showError('Error loading analytics data: ' + error.message);
        console.error('Dashboard initialization error:', error);
    }
}

/**
 * Load all analytics data from API
 */
async function loadData() {
    try {
        const [national, departments, history] = await Promise.all([
            api.getNationalAnalytics(),
            api.getDepartmentAnalytics(),
            api.getHistoricalTrends()
        ]);
        
        Dashboard.data = {
            national,
            departments,
            history
        };
    } catch (error) {
        throw new Error('Failed to load analytics data from API');
    }
}

/**
 * Render KPI cards
 */
function renderKPIs() {
    const { national, departments } = Dashboard.data;
    
    // KPI 1: Dropout Rate
    const dropoutElement = document.getElementById('kpi-dropout');
    const dropoutChangeElement = document.getElementById('kpi-dropout-change');
    if (dropoutElement) {
        dropoutElement.textContent = `${national.dropout_rate}%`;
        
        // Calculate year-over-year change
        const change = national.year_over_year_change || 0;
        const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';
        const changeClass = change > 0 ? 'negative' : change < 0 ? 'positive' : 'neutral';
        
        if (dropoutChangeElement) {
            dropoutChangeElement.textContent = `${changeIcon} ${Math.abs(change).toFixed(1)}% ${t('vsLastYear')}`;
            dropoutChangeElement.className = `kpi-change ${changeClass}`;
        }
    }
    
    // KPI 2: Total Students
    const studentsElement = document.getElementById('kpi-students');
    if (studentsElement) {
        studentsElement.textContent = charts.formatNumber(national.total_students);
    }
    
    // KPI 3: Funnel Efficiency
    const funnelElement = document.getElementById('kpi-funnel');
    if (funnelElement) {
        const efficiency = (national.funnel_efficiency * 100).toFixed(1);
        funnelElement.textContent = `${efficiency}%`;
    }
    
    // KPI 4: High-Risk Departments
    const riskElement = document.getElementById('kpi-risk');
    if (riskElement && departments) {
        const highRiskCount = departments.departments.filter(
            d => d.dropout_rate > 6
        ).length;
        riskElement.textContent = highRiskCount;
    }
}

/**
 * Render all charts
 */
function renderCharts() {
    createTrendChart();
    createFunnelChart();
}

/**
 * Create historical trend chart
 */
function createTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { history } = Dashboard.data;
    
    // Extract data
    const years = history.data.map(d => d.year);
    const dropoutRates = history.data.map(d => d.dropout_rate);
    
    // Destroy existing chart
    if (Dashboard.charts.trend) {
        charts.destroyChart(Dashboard.charts.trend);
    }
    
    // Create new chart
    const config = charts.getTrendChartConfig(years, dropoutRates);
    Dashboard.charts.trend = new Chart(ctx, config);
}

/**
 * Create funnel analysis chart
 */
function createFunnelChart() {
    const canvas = document.getElementById('funnelChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { history } = Dashboard.data;
    
    // Extract data
    const years = history.data.map(d => d.year);
    const studentCounts = history.data.map(d => d.students);
    const funnelRatios = history.data.map(d => d.funnel_ratio);
    
    // Destroy existing chart
    if (Dashboard.charts.funnel) {
        charts.destroyChart(Dashboard.charts.funnel);
    }
    
    // Create new chart
    const config = charts.getFunnelChartConfig(years, studentCounts, funnelRatios);
    Dashboard.charts.funnel = new Chart(ctx, config);
}

/**
 * Render department list (risk heatmap)
 */
function renderDepartmentList() {
    const container = document.getElementById('departmentList');
    if (!container) return;
    
    const { departments } = Dashboard.data;
    const lang = getCurrentLanguage();
    
    // Sort by dropout rate (highest first)
    const sortedDepts = [...departments.departments].sort(
        (a, b) => b.dropout_rate - a.dropout_rate
    );
    
    // Add "Show All" button at top
    let html = `
        <div class="dept-item dept-filter-all ${Dashboard.selectedDepartment === null ? 'selected' : ''}" data-dept-code="all">
            <div class="dept-info">
                <span class="dept-name" style="font-weight: 600;">
                    ${lang === 'en' ? '🇨🇴 All Departments (National)' : '🇨🇴 Todos los Departamentos (Nacional)'}
                </span>
            </div>
        </div>
    `;
    
    // Generate department items
    html += sortedDepts.map(dept => {
        const riskColor = charts.getRiskColor(dept.dropout_rate);
        const riskLabel = charts.getRiskLabel(dept.dropout_rate, lang);
        const riskClass = riskLabel.toLowerCase();
        const isSelected = Dashboard.selectedDepartment === dept.code;
        
        return `
            <div class="dept-item ${isSelected ? 'selected' : ''}" data-dept-code="${dept.code}">
                <div class="dept-info">
                    <span class="dept-name">${dept.name}</span>
                    <span class="dept-code">${dept.code}</span>
                </div>
                <div class="dept-stats">
                    <span class="dept-rate" style="color: ${riskColor}">
                        ${dept.dropout_rate.toFixed(1)}%
                    </span>
                    <span class="risk-badge ${riskClass}" style="background-color: ${riskColor}20; color: ${riskColor}">
                        ${riskLabel}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Add click handlers to all department items
    container.querySelectorAll('.dept-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const deptCode = item.dataset.deptCode;
            if (deptCode === 'all') {
                filterByDepartment(null);
            } else {
                filterByDepartment(deptCode);
            }
        });
    });
}

/**
 * Filter entire dashboard by department
 */
async function filterByDepartment(departmentCode) {
    try {
        Dashboard.selectedDepartment = departmentCode;
        
        // Show loading state on entire dashboard
        const dashboardContainer = document.querySelector('.view-dashboard');
        if (dashboardContainer) {
            dashboardContainer.style.opacity = '0.6';
            dashboardContainer.style.pointerEvents = 'none';
        }
        
        // Fetch filtered data
        const history = await api.getHistoricalTrends(departmentCode);
        
        // Update stored history data
        Dashboard.data.history = history;
        
        // Update dashboard header with filter state
        updateDashboardHeader(departmentCode);
        
        // Update KPIs with department-specific data
        updateKPIsForDepartment(departmentCode, history);
        
        // Update both charts
        createTrendChart();
        createFunnelChart();
        
        // Update chart titles
        updateChartTitles(departmentCode);
        
        // Re-render department list to update selected state
        renderDepartmentList();
        
        // Restore interaction
        if (dashboardContainer) {
            dashboardContainer.style.opacity = '1';
            dashboardContainer.style.pointerEvents = 'auto';
        }
    } catch (error) {
        console.error('Error filtering by department:', error);
        showError('Error loading department data');
        
        // Restore interaction even on error
        const dashboardContainer = document.querySelector('.view-dashboard');
        if (dashboardContainer) {
            dashboardContainer.style.opacity = '1';
            dashboardContainer.style.pointerEvents = 'auto';
        }
    }
}

/**
 * Update dashboard header to show filter state
 */
function updateDashboardHeader(departmentCode) {
    const headerTitle = document.querySelector('.dashboard-header h2');
    const lang = getCurrentLanguage();
    
    if (!headerTitle) return;
    
    if (departmentCode) {
        const dept = Dashboard.data.departments.departments.find(d => d.code === departmentCode);
        const deptName = dept ? dept.name : departmentCode;
        
        headerTitle.innerHTML = lang === 'en' 
            ? `${deptName} Department Analytics`
            : `Analítica del Departamento de ${deptName}`;
    } else {
        headerTitle.textContent = lang === 'en'
            ? 'National Analytics Dashboard'
            : 'Panel de Analítica Nacional';
    }
}

/**
 * Update KPIs with department-specific data
 */
function updateKPIsForDepartment(departmentCode, history) {
    if (!departmentCode) {
        // Reset to national data
        renderKPIs();
        return;
    }
    
    // Find department info
    const dept = Dashboard.data.departments.departments.find(d => d.code === departmentCode);
    
    // Calculate KPIs from historical data
    const latestYear = history.data[history.data.length - 1];
    const previousYear = history.data.length > 1 ? history.data[history.data.length - 2] : null;
    
    // KPI 1: Dropout Rate
    const dropoutElement = document.getElementById('kpi-dropout');
    const dropoutChangeElement = document.getElementById('kpi-dropout-change');
    if (dropoutElement && latestYear) {
        dropoutElement.textContent = `${latestYear.dropout_rate.toFixed(2)}%`;
        
        if (dropoutChangeElement && previousYear) {
            const change = latestYear.dropout_rate - previousYear.dropout_rate;
            const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';
            const changeClass = change > 0 ? 'negative' : change < 0 ? 'positive' : 'neutral';
            dropoutChangeElement.textContent = `${changeIcon} ${Math.abs(change).toFixed(1)}% ${t('vsLastYear')}`;
            dropoutChangeElement.className = `kpi-change ${changeClass}`;
        }
    }
    
    // KPI 2: Total Students
    const studentsElement = document.getElementById('kpi-students');
    if (studentsElement && latestYear) {
        studentsElement.textContent = charts.formatNumber(latestYear.students);
    }
    
    // KPI 3: Funnel Efficiency
    const funnelElement = document.getElementById('kpi-funnel');
    if (funnelElement && latestYear) {
        const efficiency = (latestYear.funnel_ratio * 100).toFixed(1);
        funnelElement.textContent = `${efficiency}%`;
    }
    
    // KPI 4: High-Risk Departments - Hide or show department info
    const riskElement = document.getElementById('kpi-risk');
    const riskCard = riskElement?.closest('.kpi-card');
    if (riskCard) {
        if (departmentCode) {
            // Show department code instead
            riskElement.textContent = dept ? dept.code : departmentCode;
            const riskLabel = riskCard.querySelector('.kpi-label');
            if (riskLabel) {
                const lang = getCurrentLanguage();
                riskLabel.textContent = lang === 'en' ? 'DEPARTMENT CODE' : 'CÓDIGO DEPARTAMENTO';
            }
        } else {
            // Reset to high-risk count
            const highRiskCount = Dashboard.data.departments.departments.filter(
                d => d.dropout_rate > 6
            ).length;
            riskElement.textContent = highRiskCount;
            const riskLabel = riskCard.querySelector('.kpi-label');
            if (riskLabel) {
                const lang = getCurrentLanguage();
                riskLabel.textContent = lang === 'en' ? 'HIGH-RISK DEPARTMENTS' : 'DEPARTAMENTOS DE ALTO RIESGO';
            }
        }
    }
}

/**
 * Update chart titles based on filter state
 */
function updateChartTitles(departmentCode) {
    const lang = getCurrentLanguage();
    
    // Update trend chart title
    const trendTitle = document.querySelector('.chart-card-large h3');
    if (trendTitle) {
        if (departmentCode) {
            const dept = Dashboard.data.departments.departments.find(d => d.code === departmentCode);
            const deptName = dept ? dept.name : departmentCode;
            trendTitle.textContent = lang === 'en' 
                ? `Historical Dropout Trend - ${deptName}` 
                : `Tendencia Histórica de Deserción - ${deptName}`;
        } else {
            trendTitle.textContent = lang === 'en'
                ? 'Historical Dropout Trend (2011-2024)'
                : 'Tendencia Histórica de Deserción (2011-2024)';
        }
    }
    
    // Update funnel chart title
    const funnelTitle = document.querySelector('.chart-card-full h3');
    if (funnelTitle) {
        if (departmentCode) {
            const dept = Dashboard.data.departments.departments.find(d => d.code === departmentCode);
            const deptName = dept ? dept.name : departmentCode;
            funnelTitle.textContent = lang === 'en'
                ? `The 'Funnel Effect' Analysis - ${deptName}`
                : `Análisis del 'Efecto Embudo' - ${deptName}`;
        } else {
            funnelTitle.textContent = lang === 'en'
                ? "The 'Funnel Effect' Analysis"
                : "Análisis del 'Efecto Embudo'";
        }
    }
}

/**
 * Update dashboard when language changes
 */
export function updateLanguage() {
    if (!Dashboard.loaded) return;
    
    // Re-render KPIs (for dynamic text)
    renderKPIs();
    
    // Re-render department list (for risk labels)
    renderDepartmentList();
    
    // Update chart labels
    if (Dashboard.charts.trend && Dashboard.data) {
        const { history } = Dashboard.data;
        const years = history.data.map(d => d.year);
        const dropoutRates = history.data.map(d => d.dropout_rate);
        const config = charts.getTrendChartConfig(years, dropoutRates);
        charts.updateChartLabels(Dashboard.charts.trend, config);
    }
    
    if (Dashboard.charts.funnel && Dashboard.data) {
        const { history } = Dashboard.data;
        const years = history.data.map(d => d.year);
        const studentCounts = history.data.map(d => d.students);
        const funnelRatios = history.data.map(d => d.funnel_ratio);
        const config = charts.getFunnelChartConfig(years, studentCounts, funnelRatios);
        charts.updateChartLabels(Dashboard.charts.funnel, config);
    }
}

/**
 * Show loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('dashboardLoading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('dashboardError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    showLoading(false);
}

/**
 * Hide error message
 */
function hideError() {
    const errorElement = document.getElementById('dashboardError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Listen for language changes
window.addEventListener('languageChanged', () => {
    updateLanguage();
});
