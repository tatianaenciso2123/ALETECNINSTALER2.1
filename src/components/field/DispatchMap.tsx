import React, { useState } from 'react';
import { Technician, WorkOrder } from '../../types';
import {
  Compass,
  MapPin,
  Navigation,
  Wrench,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  Layers,
} from 'lucide-react';

interface DispatchMapProps {
  technicians: Technician[];
  orders: WorkOrder[];
  onAssignTechnician: (orderId: string, technicianId: string) => void;
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  technicians,
  orders,
  onAssignTechnician,
}) => {
  const [selectedTech, setSelectedTech] = useState<Technician | null>(technicians[0]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(orders[0]);

  // City map zones coordinates approximation on custom interactive SVG canvas
  const mapZones = [
    { name: 'Usaquén / Niza', x: 280, y: 70, color: 'text-sky-500' },
    { name: 'Chapinero / Chicó', x: 300, y: 150, color: 'text-emerald-500' },
    { name: 'Calle 80 / Base Operativa', x: 200, y: 180, color: 'text-amber-500' },
    { name: 'Fontibón / Zona Franca', x: 120, y: 220, color: 'text-indigo-500' },
    { name: 'Sabana Norte / Chía', x: 320, y: 20, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-sky-600" />
            Centro de Despacho & Mapa Logístico en Tiempo Real
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoreo GPS satelital de cuadrantes en Bogotá y Sabana, optimización de rutas y asignación inteligente.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            4 Móviles en Enlace Satelital
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map (8 cols) & Dispatch Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visualizer Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          {/* Map Controls Top Bar */}
          <div className="flex items-center justify-between z-10 text-xs">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Capa: Cuadrantes Hidráulicos Bogotá Metrópolis</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Tráfico: Normal (Fluido)</span>
            </div>
          </div>

          {/* Precision SVG Vector Map Background */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <svg
              viewBox="0 0 500 350"
              className="w-full h-full text-slate-800 select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Map grid lines */}
              <path
                d="M 50 0 L 50 350 M 150 0 L 150 350 M 250 0 L 250 350 M 350 0 L 350 350 M 450 0 L 450 350"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 50 L 500 50 M 0 150 L 500 150 M 0 250 L 500 250 M 0 350 L 500 350"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Major Bogotá Arteries: Autonorte, Cra 7, Calle 26, Calle 80 */}
              <path
                d="M 330 0 L 290 140 L 270 240 L 250 350"
                stroke="#334155"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Calle 80 */}
              <path
                d="M 0 180 L 290 140 L 450 120"
                stroke="#334155"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Calle 26 */}
              <path
                d="M 50 250 L 270 240 L 450 230"
                stroke="#334155"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Route connecting Tech 1 to Client 1 */}
              <path
                d="M 280 70 Q 290 100 300 150"
                stroke="#0284c7"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Zone labels */}
              {mapZones.map((zone) => (
                <text
                  key={zone.name}
                  x={zone.x}
                  y={zone.y + 24}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {zone.name}
                </text>
              ))}

              {/* Technician Markers plotted on map */}
              {/* Tech 1 (Usaquén) */}
              <g
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedTech(technicians[0])}
              >
                <circle cx="280" cy="70" r="14" fill="#0284c7" fillOpacity="0.3" className="animate-ping" />
                <circle cx="280" cy="70" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x="280" y="74" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  T1
                </text>
              </g>

              {/* Tech 2 (Chapinero) */}
              <g
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedTech(technicians[1])}
              >
                <circle cx="300" cy="150" r="10" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                <text x="300" y="154" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  T2
                </text>
              </g>

              {/* Tech 3 (Calle 80) */}
              <g
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedTech(technicians[2])}
              >
                <circle cx="200" cy="180" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="200" y="184" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  T3
                </text>
              </g>

              {/* Tech 4 (Fontibón) */}
              <g
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedTech(technicians[3])}
              >
                <circle cx="120" cy="220" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="120" y="224" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  T4
                </text>
              </g>

              {/* Emergency Work Order Target (Cerros de Sotavento) */}
              <g
                className="cursor-pointer animate-bounce"
                onClick={() => setSelectedOrder(orders[0])}
              >
                <circle cx="290" cy="60" r="12" fill="#e11d48" fillOpacity="0.4" />
                <circle cx="290" cy="60" r="8" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                <text x="290" y="63" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  OT
                </text>
              </g>
            </svg>
          </div>

          {/* Map legend footer */}
          <div className="z-10 bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" /> En Servicio
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> En Ruta GPS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Urgencia OT
              </span>
            </div>

            <div className="text-slate-400 font-mono">
              Frecuencia de telemetría: Cada 10s
            </div>
          </div>
        </div>

        {/* Dispatch & Assign Tool Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Technician Card */}
          {selectedTech && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase">Móvil Seleccionado</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedTech.status === 'DISPONIBLE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : selectedTech.status === 'EN_SERVICIO'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}
                >
                  {selectedTech.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedTech.fullName}</h3>
                <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{selectedTech.specialty}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {selectedTech.currentLocationName}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Matrícula:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedTech.conteLicense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OTs Realizadas:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTech.completedOrdersCount} OTs</span>
                </div>
              </div>

              <a
                href={`tel:${selectedTech.phone}`}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Contactar por Radio / Celular
              </a>
            </div>
          )}

          {/* Quick Dispatch Assignment Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-sky-600" />
              Asignación Inteligente por Cercanía
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {orders[0].orderNumber} • {orders[0].clientName}
                </div>
                <div className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-0.5">
                  Urgencia: {orders[0].equipmentType}
                </div>
                <div className="text-slate-500 text-[10px] mt-1">
                  Móvil más cercano: <strong>Ing. Carlos Andrés Restrepo (5 min ETA)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
