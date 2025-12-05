/**
 * Translations Module
 * Handles bilingual content (English/Spanish) switching
 */

export const translations = {
    en: {
        // Navigation
        navConcept: 'The Concept',
        navAnalytics: 'Analytics',
        navSimulator: 'Simulator',
        
        // Landing Page - Hero
        heroBadge: 'Beyond the GenAI Hype',
        heroTitle1: 'Solving Social Problems with',
        heroTitle2: 'Predictive Intelligence',
        heroSubtitle: 'While the world asks ChatGPT to write poems, we are using Random Forests to identify at-risk students before they drop out.',
        heroCTA: 'Explore the Data',
        
        // Landing Page - Philosophy
        philosophyTitle: 'The Right Tool for the Job',
        philosophyP1: 'There is a misconception that GenAI (like GPT) can predict the future. It cannot. GenAI is a reasoning engine - it explains, codes, and creates. But for numerical prediction? We need Classical Machine Learning.',
        philosophyP2: 'For finding patterns in numbers (like dropout rates across 14 years of municipal data), Random Forests and Gradient Boosting are the real MVPs.',
        genaiTitle: 'GenAI (The Architect)',
        genaiDesc: 'Great for reasoning, coding, explaining concepts, and creative tasks.',
        mlTitle: 'Predictive ML (The Engine)',
        mlDesc: 'Great for finding patterns in numbers, forecasting outcomes, and quantifying risk.',
        
        // Landing Page - Problem
        problemTitle: 'Why School Dropout?',
        problemSubtitle: 'In Colombia, dropout is not random - it follows structural patterns we can measure and predict.',
        funnelTitle: 'The Funnel Effect',
        funnelDesc: 'Thousands enter Primary, but the system "chokes" at High School. Insufficient capacity = dropout.',
        repetitionTitle: 'Grade Repetition',
        repetitionDesc: 'Students who repeat grades are more likely to drop out. Repetition is a leading indicator of risk.',
        ageGapTitle: 'Over-Age Gap',
        ageGapDesc: 'When students are older than their grade level, stigma and peer pressure increase dropout likelihood.',
        
        // Dashboard
        dashboardTitle: 'National Analytics Dashboard',
        dashboardSubtitle: 'Historical Analysis 2011-2024',
        dataSource: 'Data Source: Open Data Colombia',
        
        // KPIs
        kpiDropout: 'Current Dropout Rate',
        kpiStudents: 'Total Students',
        kpiStudentsDesc: 'Age 5-16 nationwide',
        kpiFunnel: 'Funnel Efficiency',
        kpiFunnelDesc: 'Primary → High School',
        kpiRisk: 'High-Risk Departments',
        kpiRiskDesc: 'Dropout > 6%',
        
        // Charts
        chartTrend: 'Historical Dropout Trend (2011-2024)',
        chartHeatmap: 'Regional Risk Heatmap',
        chartFunnel: 'The "Funnel Effect" Analysis',
        chartFunnelDesc: 'Student population vs. system capacity over time',
        
        // States
        loading: 'Loading...',
        loadingAnalytics: 'Loading analytics data...',
        error: 'Error',
        
        // Chart Labels
        dropoutRate: 'Dropout Rate %',
        year: 'Year',
        students: 'Students',
        funnelRatio: 'Funnel Efficiency',
        vsLastYear: 'vs last year',
        
        // Simulator
        simTitle: 'Secretary of Education Simulator',
        simSubtitle: 'School Dropout Prediction - Colombia',
        simReset: 'Reset',
        
        // Territory
        territory: 'Territory',
        department: 'Department',
        municipality: 'Municipality',
        loadingDepartments: 'Loading departments...',
        selectDepartment: 'First select a department',
        selectMunicipality: 'Select a municipality...',
        loadData: 'Load Data',
        
        // Context Card
        studentPopulation: 'Student Population',
        totalAges: 'Total (ages 5-16)',
        selectMunicipalityView: 'Select a municipality to view data',
        
        // Stat Tiles
        budget: 'Budget',
        available: 'Available',
        dropoutRateTile: 'Dropout Rate',
        studentsAtRisk: 'Students at Risk',
        highPriority: 'High Priority',
        safeStudents: 'Safe Students',
        projection: 'Projection',
        
        // Investments
        strategicInvestments: 'Strategic Investments',
        investmentsSubtitle: 'Select strategies to reduce school dropout.',
        criticalBudget: 'Critical Budget',
        
        // Investment Cards
        expandCapacity: 'Expand High School Capacity',
        expandCapacityDesc: 'Improves the "educational funnel" (primary → high school)',
        academicSupport: 'Academic Support',
        academicSupportDesc: 'Reduces repetition rate with personalized tutoring',
        bridgePrograms: 'Bridge Programs',
        bridgeProgramsDesc: 'Reduces the over-age gap',
        hireTeachers: 'Hire Teachers',
        hireTeachersDesc: 'Reduces classroom density (more teachers per student)',
        
        // Investment Footer
        cost: 'Cost:',
        level: 'Level:',
        invest: 'Invest',
        maxLevel: 'Max Level',
        insufficientBudget: 'Insufficient Budget',
        
        // Loading
        loadingData: 'Loading data...'
    },
    
    es: {
        // Navigation
        navConcept: 'El Concepto',
        navAnalytics: 'Analítica',
        navSimulator: 'Simulador',
        
        // Landing Page - Hero
        heroBadge: 'Más Allá del Hype de GenAI',
        heroTitle1: 'Resolviendo Problemas Sociales con',
        heroTitle2: 'Inteligencia Predictiva',
        heroSubtitle: 'Mientras el mundo le pide a ChatGPT que escriba poemas, nosotros usamos Random Forests para identificar estudiantes en riesgo antes de que abandonen.',
        heroCTA: 'Explorar los Datos',
        
        // Landing Page - Philosophy
        philosophyTitle: 'La Herramienta Correcta para el Trabajo',
        philosophyP1: 'Existe la idea errónea de que GenAI (como GPT) puede predecir el futuro. No puede. GenAI es un motor de razonamiento: explica, codifica y crea. ¿Pero para predicción numérica? Necesitamos Machine Learning Clásico.',
        philosophyP2: 'Para encontrar patrones en números (como tasas de deserción en 14 años de datos municipales), Random Forests y Gradient Boosting son los verdaderos MVPs.',
        genaiTitle: 'GenAI (El Arquitecto)',
        genaiDesc: 'Excelente para razonar, codificar, explicar conceptos y tareas creativas.',
        mlTitle: 'ML Predictivo (El Motor)',
        mlDesc: 'Excelente para encontrar patrones en números, pronosticar resultados y cuantificar riesgos.',
        
        // Landing Page - Problem
        problemTitle: '¿Por Qué la Deserción Escolar?',
        problemSubtitle: 'En Colombia, la deserción no es aleatoria: sigue patrones estructurales que podemos medir y predecir.',
        funnelTitle: 'El Efecto Embudo',
        funnelDesc: 'Miles entran a Primaria, pero el sistema se "ahoga" en Secundaria. Capacidad insuficiente = deserción.',
        repetitionTitle: 'Repitencia Escolar',
        repetitionDesc: 'Los estudiantes que repiten grados tienen más probabilidades de desertar. La repitencia es un indicador líder de riesgo.',
        ageGapTitle: 'Brecha de Edad',
        ageGapDesc: 'Cuando los estudiantes son mayores que su nivel de grado, el estigma y la presión de los compañeros aumentan la probabilidad de deserción.',
        
        // Dashboard
        dashboardTitle: 'Panel de Analítica Nacional',
        dashboardSubtitle: 'Análisis Histórico 2011-2024',
        dataSource: 'Fuente: Datos Abiertos Colombia',
        
        // KPIs
        kpiDropout: 'Tasa de Deserción Actual',
        kpiStudents: 'Total de Estudiantes',
        kpiStudentsDesc: 'Edades 5-16 a nivel nacional',
        kpiFunnel: 'Eficiencia del Embudo',
        kpiFunnelDesc: 'Primaria → Secundaria',
        kpiRisk: 'Departamentos de Alto Riesgo',
        kpiRiskDesc: 'Deserción > 6%',
        
        // Charts
        chartTrend: 'Tendencia Histórica de Deserción (2011-2024)',
        chartHeatmap: 'Mapa de Riesgo Regional',
        chartFunnel: 'Análisis del "Efecto Embudo"',
        chartFunnelDesc: 'Población estudiantil vs. capacidad del sistema en el tiempo',
        
        // States
        loading: 'Cargando...',
        loadingAnalytics: 'Cargando datos de analítica...',
        error: 'Error',
        
        // Chart Labels
        dropoutRate: 'Tasa de Deserción %',
        year: 'Año',
        students: 'Estudiantes',
        funnelRatio: 'Eficiencia del Embudo',
        vsLastYear: 'vs año anterior',
        
        // Simulator
        simTitle: 'Simulador del Secretario de Educación',
        simSubtitle: 'Predicción de Deserción Escolar - Colombia',
        simReset: 'Reiniciar',
        
        // Territory
        territory: 'Territorio',
        department: 'Departamento',
        municipality: 'Municipio',
        loadingDepartments: 'Cargando departamentos...',
        selectDepartment: 'Primero seleccione un departamento',
        selectMunicipality: 'Seleccione un municipio...',
        loadData: 'Cargar Datos',
        
        // Context Card
        studentPopulation: 'Población Estudiantil',
        totalAges: 'Total (5-16 años)',
        selectMunicipalityView: 'Seleccione un municipio para ver datos',
        
        // Stat Tiles
        budget: 'Presupuesto',
        available: 'Disponible',
        dropoutRateTile: 'Tasa de Deserción',
        studentsAtRisk: 'Estudiantes en Riesgo',
        highPriority: 'Alta Prioridad',
        safeStudents: 'Estudiantes Seguros',
        projection: 'Proyección',
        
        // Investments
        strategicInvestments: 'Inversiones Estratégicas',
        investmentsSubtitle: 'Selecciona estrategias para reducir la deserción escolar.',
        criticalBudget: 'Presupuesto Crítico',
        
        // Investment Cards
        expandCapacity: 'Expandir Capacidad de Secundaria',
        expandCapacityDesc: 'Mejora el "embudo educativo" (primaria → secundaria)',
        academicSupport: 'Apoyo Académico',
        academicSupportDesc: 'Reduce la tasa de repitencia con tutorías personalizadas',
        bridgePrograms: 'Programas Puente',
        bridgeProgramsDesc: 'Reduce la brecha de edad (over-age gap)',
        hireTeachers: 'Contratar Docentes',
        hireTeachersDesc: 'Reduce la densidad de aulas (más maestros por alumno)',
        
        // Investment Footer
        cost: 'Costo:',
        level: 'Nivel:',
        invest: 'Invertir',
        maxLevel: 'Nivel Máximo',
        insufficientBudget: 'Presupuesto Insuficiente',
        
        // Loading
        loadingData: 'Cargando datos...'
    }
};

/**
 * Current language state
 */
let currentLanguage = localStorage.getItem('language') || 'en';

/**
 * Get current language
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Switch language
 */
export function switchLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not supported`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-en and data-es attributes
    document.querySelectorAll('[data-en]').forEach(element => {
        const text = lang === 'en' ? element.dataset.en : element.dataset.es;
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update language toggle button
    const langButton = document.getElementById('currentLang');
    if (langButton) {
        langButton.textContent = lang.toUpperCase();
    }
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Dispatch event for charts to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Get translated text
 */
export function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Initialize language on page load
 */
export function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    switchLanguage(savedLang);
}
