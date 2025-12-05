import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Building2, 
  Users, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCcw,
  School,
  GraduationCap,
  BookOpen,
  Briefcase,
  MapPin,
  ChevronDown,
  Globe
} from 'lucide-react';

// --- Types & Mock Data ---

const MOCK_DEPARTMENTS = [
  "Bolívar (46 municipios)",
  "Antioquia (125 municipios)",
  "Cundinamarca (116 municipios)"
];

const MOCK_MUNICIPIOS = {
  "Bolívar (46 municipios)": ["Cartagena", "Magangué", "Turbaco"],
  "Antioquia (125 municipios)": ["Medellín", "Bello", "Envigado"],
  "Cundinamarca (116 municipios)": ["Bogotá", "Soacha", "Zipaquirá"]
};

const STRATEGIES = [
  {
    id: 1,
    title: "Expandir Capacidad de Secundaria",
    description: "Mejora el 'embudo educativo' (primaria → secundaria)",
    cost: 3000,
    impact: 0.15, // reduction in dropout rate per level
    icon: Building2,
    color: "blue"
  },
  {
    id: 2,
    title: "Apoyo Académico",
    description: "Reduce la tasa de repitencia con tutorías personalizadas",
    cost: 1500,
    impact: 0.08,
    icon: BookOpen,
    color: "indigo"
  },
  {
    id: 3,
    title: "Programas Puente",
    description: "Reduce la brecha de edad (over-age gap)",
    cost: 1000,
    impact: 0.05,
    icon: GraduationCap,
    color: "sky"
  },
  {
    id: 4,
    title: "Contratar Docentes",
    description: "Reduce la densidad de aulas (más maestros por alumno)",
    cost: 4000,
    impact: 0.2,
    icon: Users,
    color: "violet"
  }
];

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend, compact = false }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass}`}></div>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      {Icon && <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
    </div>
    {trend && (
      <div className={`mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-500'} flex items-center gap-1`}>
        {trend.positive ? <TrendingDown size={14} /> : <AlertTriangle size={14} />}
        {trend.text}
      </div>
    )}
  </div>
);

const InvestmentCard = ({ strategy, level, onInvest, budget }) => {
  const Icon = strategy.icon;
  const isMaxed = level >= 3;
  const canAfford = budget >= strategy.cost;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col h-full hover:border-blue-100 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className={`p-2.5 rounded-lg bg-${strategy.color}-50`}>
            <Icon className={`w-6 h-6 text-${strategy.color}-600`} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{strategy.title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{strategy.description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end text-sm">
          <span className="text-slate-500">Costo: <span className="font-semibold text-slate-700">${strategy.cost.toLocaleString()}k</span></span>
          <span className="text-slate-500">Nivel: <span className="font-semibold text-blue-600">{level}/3</span></span>
        </div>
        
        {/* Progress Bar for Level */}
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`flex-1 rounded-full ${step <= level ? `bg-blue-500` : 'bg-slate-100'}`}
            />
          ))}
        </div>

        <button
          onClick={() => onInvest(strategy.id)}
          disabled={isMaxed || !canAfford}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            ${isMaxed 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : !canAfford
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.98]'
            }`}
        >
          {isMaxed ? 'Nivel Máximo' : !canAfford ? 'Presupuesto Insuficiente' : 'Invertir'}
        </button>
      </div>
    </div>
  );
};

export default function SimulatorPage() {
  const [selectedDept, setSelectedDept] = useState(MOCK_DEPARTMENTS[0]);
  const [selectedMuni, setSelectedMuni] = useState(MOCK_MUNICIPIOS[MOCK_DEPARTMENTS[0]][0]);
  
  // Simulation State
  const [budget, setBudget] = useState(10000);
  const [baselineRate] = useState(4.20);
  const [investments, setInvestments] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  // Calculated State
  const currentRate = Math.max(0, baselineRate - Object.entries(investments).reduce((acc, [id, level]) => {
    const strategy = STRATEGIES.find(s => s.id === Number(id));
    return acc + (strategy.impact * level);
  }, 0)).toFixed(2);

  const studentsAtRisk = Math.round(8366 * (currentRate / baselineRate));
  const studentsSafe = 190706 + (8366 - studentsAtRisk);

  const handleDeptChange = (e) => {
    const dept = e.target.value;
    setSelectedDept(dept);
    setSelectedMuni(MOCK_MUNICIPIOS[dept][0]);
  };

  const handleInvest = (id) => {
    const strategy = STRATEGIES.find(s => s.id === id);
    if (budget >= strategy.cost && investments[id] < 3) {
      setBudget(prev => prev - strategy.cost);
      setInvestments(prev => ({ ...prev, [id]: prev[id] + 1 }));
    }
  };

  const handleReset = () => {
    setBudget(10000);
    setInvestments({ 1: 0, 2: 0, 3: 0, 4: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* --- Navigation Bar --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">EduPredict AI</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">The Concept</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Analytics</a>
              <a href="#" className="text-blue-600 bg-blue-50 rounded-full px-4 py-2 text-sm font-semibold">Simulator</a>
            </div>

            <button className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Globe size={16} />
              <span>EN</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Secretary of Education Simulator</h1>
            <p className="text-slate-500 mt-1">Predicción de Deserción Escolar - Colombia</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm text-sm font-medium"
            >
              <RefreshCcw size={16} />
              Reiniciar
            </button>
          </div>
        </div>

        {/* --- Dashboard Grid Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Controls (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Control Panel Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                <MapPin size={18} className="text-blue-600" />
                <h2>Territorio</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Departamento</label>
                  <div className="relative">
                    <select 
                      value={selectedDept}
                      onChange={handleDeptChange}
                      className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg bg-slate-50 text-slate-700 appearance-none"
                    >
                      {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Municipio</label>
                  <div className="relative">
                    <select 
                      value={selectedMuni}
                      onChange={(e) => setSelectedMuni(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg bg-slate-50 text-slate-700 appearance-none"
                    >
                      {MOCK_MUNICIPIOS[selectedDept].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    Cargar Datos
                  </button>
                </div>
              </div>
            </div>

            {/* Context Stats (Population) */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
               <h3 className="text-blue-900 font-semibold text-sm mb-3">Población Estudiantil</h3>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-blue-700/70 text-sm">Total (5-16 años)</span>
                 <span className="font-bold text-blue-900">199,072</span>
               </div>
               <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-2">
                 <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
               </div>
               <div className="mt-4 text-xs text-blue-700/60 leading-relaxed">
                 Datos actualizados al periodo 2024-1. Fuente: Ministerio de Educación.
               </div>
            </div>

          </div>

          {/* Right Column: Stats & Simulator (Span 9) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Key Metrics Row - The "Tiles" */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Presupuesto" 
                value={`$${budget.toLocaleString()}k`} 
                icon={Wallet}
                colorClass="bg-emerald-500"
                subtext="Disponible"
              />
              <StatCard 
                title="Tasa de Deserción" 
                value={`${currentRate}%`} 
                icon={TrendingDown}
                colorClass="bg-blue-500"
                trend={{ 
                  positive: Number(currentRate) < Number(baselineRate), 
                  text: `${(baselineRate - currentRate).toFixed(2)}% vs Base` 
                }}
              />
              <StatCard 
                title="Estudiantes en Riesgo" 
                value={studentsAtRisk.toLocaleString()} 
                icon={AlertTriangle}
                colorClass="bg-amber-500"
                subtext="Alta Prioridad"
              />
              <StatCard 
                title="Estudiantes Seguros" 
                value={studentsSafe.toLocaleString()} 
                icon={CheckCircle2}
                colorClass="bg-indigo-500"
                subtext="Proyección"
              />
            </div>

            {/* Investments Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Inversiones Estratégicas</h2>
                  <p className="text-slate-500 text-sm">Selecciona estrategias para reducir la deserción escolar.</p>
                </div>
                {budget < 1000 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                    <AlertTriangle size={12} />
                    Presupuesto Crítico
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STRATEGIES.map((strategy) => (
                  <InvestmentCard 
                    key={strategy.id} 
                    strategy={strategy} 
                    level={investments[strategy.id]}
                    onInvest={handleInvest}
                    budget={budget}
                  />
                ))}
              </div>
            </div>

            {/* Impact Visualization (Mini Chart) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Proyección de Impacto (5 Años)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { year: '2024', base: 4.2, current: 4.2 },
                      { year: '2025', base: 4.3, current: Number(currentRate) + 0.1 },
                      { year: '2026', base: 4.2, current: Math.max(0, Number(currentRate) - 0.2) },
                      { year: '2027', base: 4.4, current: Math.max(0, Number(currentRate) - 0.4) },
                      { year: '2028', base: 4.1, current: Math.max(0, Number(currentRate) - 0.5) },
                    ]}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      domain={[0, 5]}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{fontSize: '12px', fontWeight: 600}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="base" 
                      name="Tendencia Base" 
                      stroke="#cbd5e1" 
                      strokeDasharray="5 5" 
                      fill="transparent" 
                      strokeWidth={2} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="current" 
                      name="Proyección Actual" 
                      stroke="#3b82f6" 
                      fill="url(#colorCurrent)" 
                      strokeWidth={3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}