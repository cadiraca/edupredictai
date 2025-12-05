/**
 * Chart.js Helper Utilities
 * Provides gradient creation, configuration templates, and responsive helpers
 */

import { t } from './translations.js';

/**
 * Create a linear gradient for charts
 */
export function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    
    // Color mappings
    const gradients = {
        '#3b82f6': ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.05)'], // Blue
        '#10b981': ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.05)'], // Emerald
        '#ef4444': ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.05)'],   // Red
        '#a855f7': ['rgba(168, 85, 247, 0.4)', 'rgba(168, 85, 247, 0.05)']  // Purple
    };
    
    const [start, end] = gradients[color] || ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.05)'];
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    
    return gradient;
}

/**
 * Get default chart options (responsive + accessible)
 */
export function getDefaultChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        size: 12
                    },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        }
    };
}

/**
 * Get trend chart configuration
 */
export function getTrendChartConfig(years, dropoutRates) {
    return {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: t('dropoutRate'),
                data: dropoutRates,
                fill: true,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    return createGradient(ctx, '#3b82f6');
                },
                borderColor: '#3b82f6',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                ...getDefaultChartOptions().plugins,
                legend: {
                    display: false
                },
                tooltip: {
                    ...getDefaultChartOptions().plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${t('dropoutRate')}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: '#e2e8f0',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    },
                    beginAtZero: false
                }
            }
        }
    };
}

/**
 * Get funnel chart configuration (mixed bar + line)
 */
export function getFunnelChartConfig(years, studentCounts, funnelRatios) {
    return {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    type: 'bar',
                    label: t('students'),
                    data: studentCounts,
                    backgroundColor: 'rgba(148, 163, 184, 0.6)',
                    borderColor: '#94a3b8',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y-left'
                },
                {
                    type: 'line',
                    label: t('funnelRatio'),
                    data: funnelRatios,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    yAxisID: 'y-right',
                    fill: false
                }
            ]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                ...getDefaultChartOptions().plugins,
                tooltip: {
                    ...getDefaultChartOptions().plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            
                            if (context.datasetIndex === 0) {
                                // Students - format with thousands separator
                                return `${label}: ${value.toLocaleString()}`;
                            } else {
                                // Funnel ratio - format as percentage
                                return `${label}: ${(value * 100).toFixed(1)}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                'y-left': {
                    type: 'linear',
                    position: 'left',
                    grid: {
                        color: '#e2e8f0',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            // Format large numbers (e.g., 9.5M)
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                            return value;
                        }
                    },
                    title: {
                        display: true,
                        text: t('students'),
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                'y-right': {
                    type: 'linear',
                    position: 'right',
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: t('funnelRatio'),
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 1
                }
            }
        }
    };
}

/**
 * Destroy chart if it exists
 */
export function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

/**
 * Update chart with new data (for language changes)
 */
export function updateChartLabels(chart, config) {
    if (!chart) return;
    
    // Update dataset labels
    chart.data.datasets.forEach((dataset, index) => {
        if (config.data.datasets[index]) {
            dataset.label = config.data.datasets[index].label;
        }
    });
    
    // Update scale titles
    if (config.options.scales) {
        Object.keys(config.options.scales).forEach(scaleKey => {
            if (chart.options.scales[scaleKey] && config.options.scales[scaleKey].title) {
                chart.options.scales[scaleKey].title.text = config.options.scales[scaleKey].title.text;
            }
        });
    }
    
    chart.update();
}

/**
 * Format number with locale
 */
export function formatNumber(num, decimals = 0) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format percentage
 */
export function formatPercent(num, decimals = 1) {
    return num.toFixed(decimals) + '%';
}

/**
 * Get risk level color
 */
export function getRiskColor(dropoutRate) {
    if (dropoutRate < 3) return '#10b981'; // Low - emerald
    if (dropoutRate < 6) return '#f59e0b'; // Medium - amber
    return '#ef4444'; // High - red
}

/**
 * Get risk level label
 */
export function getRiskLabel(dropoutRate, lang = 'en') {
    const labels = {
        en: { low: 'Low', medium: 'Medium', high: 'High' },
        es: { low: 'Bajo', medium: 'Medio', high: 'Alto' }
    };
    
    if (dropoutRate < 3) return labels[lang].low;
    if (dropoutRate < 6) return labels[lang].medium;
    return labels[lang].high;
}
