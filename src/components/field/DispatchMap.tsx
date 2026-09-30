import React, { useState, useMemo } from 'react';
import { Technician, WorkOrder, TechnicianGeolocationRecord } from '../../types';
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
  Radio,
  Activity,
  LocateFixed,
  Battery,
  Gauge,
  Zap,
  Search,
  Filter,
  ArrowRight,
  Crosshair,
  FileText,
  Check,
  ChevronRight,
  Info,
  ExternalLink,
  RefreshCw,
  Building,
} from 'lucide-react';

interface DispatchMapProps {
  technicians: Technician[];
  orders: WorkOrder[];
  onAssignTechnician?: (orderId: string, technicianId: string) => void;
  onSelectOrder?: (order: WorkOrder) => void;
  onOpenReport?: (order: WorkOrder) => void;
}

// Bounding box for Bogotá metropolitan area
const BOGOTA_BOUNDS = {
  minLat: 4.590,
  maxLat: 4.760,
  minLng: -74.170,
  maxLng: -74.020,
};

const SVG_WIDTH = 700;
const SVG_HEIGHT = 460;
const PADDING = 45;

/**
 * Converts real-world GPS coordinates into 2D SVG canvas coordinate space
 */
function gpsToCanvas(lat: number, lng: number): { x: number; y: number } {
  const clampedLat = Math.max(BOGOTA_BOUNDS.minLat, Math.min(BOGOTA_BOUNDS.maxLat, lat));
  const clampedLng = Math.max(BOGOTA_BOUNDS.minLng, Math.min(BOGOTA_BOUNDS.maxLng, lng));

  const lngRange = BOGOTA_BOUNDS.maxLng - BOGOTA_BOUNDS.minLng;
  const latRange = BOGOTA_BOUNDS.maxLat - BOGOTA_BOUNDS.minLat;

  const x = PADDING + ((clampedLng - BOGOTA_BOUNDS.minLng) / lngRange) * (SVG_WIDTH - 2 * PADDING);
  const y = PADDING + ((BOGOTA_BOUNDS.maxLat - clampedLat) / latRange) * (SVG_HEIGHT - 2 * PADDING);

  return { x: Math.round(x), y: Math.round(y) };
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  technicians,
  orders,
  onAssignTechnician,
  onSelectOrder,
  onOpenReport,
}) => {
  // Live simulated technicians state to allow interactive GPS telemetry refresh
  const [liveTechs, setLiveTechs] = useState<Technician[]>(technicians);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(technicians[0]?.id || null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EN_SERVICIO' | 'EN_RUTA' | 'DISPONIBLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
  const [showOrderLinks, setShowOrderLinks] = useState(true);
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);
  const [activeTooltipTechId, setActiveTooltipTechId] = useState<string | null>(technicians[0]?.id || null);

  // Sync prop changes if external technicians update
  React.useEffect(() => {
    setLiveTechs(technicians);
  }, [technicians]);

  // Selected technician object
  const selectedTech = useMemo(
    () => liveTechs.find((t) => t.id === selectedTechId) || liveTechs[0],
    [liveTechs, selectedTechId]
  );

  // Selected order object
  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  // Filtered active technicians
  const filteredTechs = useMemo(() => {
    return liveTechs.filter((tech) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'EN_SERVICIO'
          ? tech.status === 'EN_SERVICIO'
          : statusFilter === 'EN_RUTA'
          ? tech.status === 'EN_RUTA'
          : tech.status === 'DISPONIBLE';

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesName = tech.fullName.toLowerCase().includes(q);
      const matchesSpecialty = tech.specialty.toLowerCase().includes(q);
      const matchesLocation = tech.currentLocationName.toLowerCase().includes(q);

      // Check if matches assigned order number
      const assignedOrder = orders.find((o) => o.assignedTechnicianId === tech.id);
      const matchesOrder = assignedOrder?.orderNumber.toLowerCase().includes(q);

      return matchesStatus && (matchesName || matchesSpecialty || matchesLocation || matchesOrder);
    });
  }, [liveTechs, statusFilter, searchQuery, orders]);

  // Helper to find the active assigned order for a technician
  const getAssignedOrderForTech = (tech: Technician): WorkOrder | undefined => {
    return (
      orders.find(
        (o) =>
          o.assignedTechnicianId === tech.id &&
          (o.status === 'EN_EJECUCION' || o.status === 'EN_RUTA' || o.status === 'PROGRAMADO' || o.status === 'PENDIENTE')
      ) ||
      orders.find((o) => o.assignedTechnicianId === tech.id) ||
      (tech.lastKnownLocation?.orderId ? orders.find((o) => o.id === tech.lastKnownLocation?.orderId) : undefined)
    );
  };

  // Helper to get technician's last known geolocation record
  const getLastKnownRecord = (tech: Technician): TechnicianGeolocationRecord => {
    if (tech.lastKnownLocation) return tech.lastKnownLocation;
    if (tech.locationHistory && tech.locationHistory.length > 0) {
      return tech.locationHistory[tech.locationHistory.length - 1];
    }
    return {
      lat: tech.coordinates.lat,
      lng: tech.coordinates.lng,
      accuracyMeters: 10,
      timestamp: 'Reciente',
      verifiedOnSite: tech.status === 'EN_SERVICIO',
      addressApprox: tech.currentLocationName,
      speedKmh: tech.status === 'EN_RUTA' ? 32 : 0,
      batteryLevel: 90,
      notes: 'Ubicación satelital transmitida por dispositivo móvil',
    };
  };

  // Simulate real-time GPS ping: advances mobile coordinates and appends a new record to history
  const handleSimulateGpsPing = () => {
    setIsSimulatingPing(true);

    setTimeout(() => {
      setLiveTechs((prev) =>
        prev.map((t) => {
          // Add small GPS drift or progress along route
          const deltaLat = (Math.random() - 0.48) * 0.0012;
          const deltaLng = (Math.random() - 0.48) * 0.0012;
          const newLat = Number((t.coordinates.lat + deltaLat).toFixed(6));
          const newLng = Number((t.coordinates.lng + deltaLng).toFixed(6));

          const assignedOrder = getAssignedOrderForTech(t);
          const now = new Date();
          const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          const newRecord: TechnicianGeolocationRecord = {
            lat: newLat,
            lng: newLng,
            accuracyMeters: Math.floor(Math.random() * 8) + 5,
            timestamp: `${timeStr} (En Vivo)`,
            distanceToSiteMeters: Math.max(15, Math.floor(Math.random() * 500)),
            verifiedOnSite: t.status === 'EN_SERVICIO',
            addressApprox: t.currentLocationName,
            orderId: assignedOrder?.id,
            orderNumber: assignedOrder?.orderNumber,
            speedKmh: t.status === 'EN_RUTA' ? Math.floor(Math.random() * 25) + 20 : 0,
            batteryLevel: Math.max(15, (t.lastKnownLocation?.batteryLevel ?? 90) - 1),
            notes: 'Telemetría GPS en tiempo real confirmada por cuadrilla',
          };

          const updatedHistory = [...(t.locationHistory || []), newRecord];

          return {
            ...t,
            coordinates: { lat: newLat, lng: newLng },
            lastKnownLocation: newRecord,
            locationHistory: updatedHistory,
          };
        })
      );
      setIsSimulatingPing(false);
    }, 600);
  };

  // Reference key zones across Bogotá
  const mapZones = [
    { name: 'Usaquén / Niza', lat: 4.715, lng: -74.032, color: 'text-sky-400' },
    { name: 'Chapinero / Chicó', lat: 4.675, lng: -74.055, color: 'text-emerald-400' },
    { name: 'Calle 80 / Base Central', lat: 4.685, lng: -74.090, color: 'text-amber-400' },
    { name: 'Fontibón / Zona Franca', lat: 4.665, lng: -74.138, color: 'text-indigo-400' },
    { name: 'Teusaquillo / Galerías', lat: 4.643, lng: -74.073, color: 'text-purple-400' },
    { name: 'Suba / Rincón', lat: 4.745, lng: -74.088, color: 'text-teal-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Centro de Despacho & Mapa Logístico GPS en Tiempo Real
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rastreo satelital de cuadrantes en Bogotá y Sabana con historial de telemetría de técnicos, trazado de rutas y asignación inteligente.
              </p>
            </div>
          </div>
        </div>

        {/* Live Satellite Status & Real-time simulation trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateGpsPing}
            disabled={isSimulatingPing}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Recibe un nuevo paquete de telemetría de todos los móviles GPS activos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingPing ? 'animate-spin text-sky-500' : ''}`} />
            <span>{isSimulatingPing ? 'Recibiendo Telemetría...' : 'Actualizar Ping GPS'}</span>
          </button>

          <span className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-3.5 py-2 rounded-2xl font-bold text-xs border border-emerald-300 dark:border-emerald-800 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>{liveTechs.length} Móviles en Enlace Satelital</span>
          </span>
        </div>
      </div>

      {/* Filter and Layer Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-sky-500" /> Estado:
          </span>
          {(
            [
              { id: 'ALL', label: 'Todos los Móviles' },
              { id: 'EN_SERVICIO', label: 'En Servicio' },
              { id: 'EN_RUTA', label: 'En Ruta GPS' },
              { id: 'DISPONIBLE', label: 'Disponibles' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === filter.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle breadcrumb trail */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={showBreadcrumbs}
              onChange={(e) => setShowBreadcrumbs(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-semibold">Historial de Rutas GPS</span>
          </label>

          {/* Toggle order route connections */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={showOrderLinks}
              onChange={(e) => setShowOrderLinks(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-semibold">Líneas a OTs Activas</span>
          </label>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar técnico u orden OT..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Vector Map & Real-Time Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vector Map Canvas Container (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[540px]">
          {/* Map Top Bar Info */}
          <div className="flex items-center justify-between z-10 text-xs gap-2">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 text-slate-300 shadow-md">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white">Capa: Cuadrantes Hidráulicos Bogotá Metrópolis</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400">Telemetría: Enlace Activo (100%)</span>
            </div>
          </div>

          {/* Interactive Precision SVG Vector Map */}
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-full select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Map Grid */}
              <defs>
                <pattern id="dispatch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="3 3" />
                </pattern>
                <radialGradient id="sky-pulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="amber-pulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#dispatch-grid)" />

              {/* Major Bogotá Arteries Lines (Autonorte, Cra 7, Calle 26, Calle 80, Cra 30/NQS, Av Boyacá) */}
              {/* Autopista Norte / Cra 7 Corridor */}
              <path
                d="M 580 20 L 540 140 L 510 240 L 480 440"
                stroke="#334155"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text x="555" y="35" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                Autopista Norte / Cra 7
              </text>

              {/* Calle 80 / Autopista Medellín */}
              <path
                d="M 40 220 L 390 220 L 620 180"
                stroke="#334155"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <text x="70" y="214" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                Calle 80
              </text>

              {/* Calle 26 / Av El Dorado */}
              <path
                d="M 120 310 L 380 300 L 580 290"
                stroke="#334155"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <text x="140" y="304" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                Av. Calle 26 (El Dorado)
              </text>

              {/* Av Boyacá */}
              <path
                d="M 360 40 L 320 200 L 260 420"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 4"
              />
              <text x="330" y="60" fill="#475569" fontSize="8" fontFamily="sans-serif">
                Av. Boyacá
              </text>

              {/* Zone label markers */}
              {mapZones.map((zone) => {
                const pt = gpsToCanvas(zone.lat, zone.lng);
                return (
                  <g key={zone.name} className="pointer-events-none select-none">
                    <circle cx={pt.x} cy={pt.y} r="2.5" fill="#475569" />
                    <text
                      x={pt.x}
                      y={pt.y + 16}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {zone.name}
                    </text>
                  </g>
                );
              })}

              {/* Historical GPS Path (Breadcrumbs) from locationHistory */}
              {showBreadcrumbs &&
                filteredTechs.map((tech) => {
                  const history = tech.locationHistory || [];
                  if (history.length < 2) return null;

                  const isSelected = selectedTechId === tech.id;
                  const isHovered = hoveredTechId === tech.id;
                  const strokeColor =
                    tech.status === 'EN_SERVICIO'
                      ? '#0ea5e9'
                      : tech.status === 'EN_RUTA'
                      ? '#f59e0b'
                      : '#10b981';

                  // Build SVG path string from history points
                  const points = history.map((rec) => gpsToCanvas(rec.lat, rec.lng));
                  const pathData = points.reduce((acc, pt, i) => {
                    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  return (
                    <g key={`trail-${tech.id}`}>
                      {/* Trail Path Line */}
                      <path
                        d={pathData}
                        stroke={strokeColor}
                        strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                        strokeDasharray={tech.status === 'EN_RUTA' ? '4 3' : '2 2'}
                        strokeOpacity={isSelected || isHovered ? 0.9 : 0.45}
                        className={tech.status === 'EN_RUTA' ? 'animate-pulse' : ''}
                      />

                      {/* Intermediate breadcrumb coordinate dots */}
                      {points.map((pt, idx) => (
                        <g key={`pt-${tech.id}-${idx}`}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={idx === points.length - 1 ? 3 : 2}
                            fill={strokeColor}
                            fillOpacity={0.7}
                          />
                        </g>
                      ))}
                    </g>
                  );
                })}

              {/* Dynamic Connection Lines connecting active technician to their assigned Work Order */}
              {showOrderLinks &&
                filteredTechs.map((tech) => {
                  const assignedOrder = getAssignedOrderForTech(tech);
                  if (!assignedOrder || !assignedOrder.coordinates) return null;

                  const lastRec = getLastKnownRecord(tech);
                  const techPos = gpsToCanvas(lastRec.lat, lastRec.lng);
                  const orderPos = gpsToCanvas(
                    assignedOrder.coordinates.lat,
                    assignedOrder.coordinates.lng
                  );

                  const isSelected = selectedTechId === tech.id || selectedOrderId === assignedOrder.id;

                  return (
                    <g key={`order-link-${tech.id}`}>
                      <line
                        x1={techPos.x}
                        y1={techPos.y}
                        x2={orderPos.x}
                        y2={orderPos.y}
                        stroke={assignedOrder.priority === 'EMERGENCIA' ? '#f43f5e' : '#38bdf8'}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray="5 4"
                        strokeOpacity={isSelected ? 0.85 : 0.35}
                        className="animate-pulse"
                      />
                    </g>
                  );
                })}

              {/* Work Order Target Pins plotted on map */}
              {orders.map((order) => {
                if (!order.coordinates) return null;
                const pos = gpsToCanvas(order.coordinates.lat, order.coordinates.lng);
                const isSelected = selectedOrderId === order.id;
                const isEmergency = order.priority === 'EMERGENCIA';

                return (
                  <g
                    key={`order-pin-${order.id}`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      if (order.assignedTechnicianId) {
                        setSelectedTechId(order.assignedTechnicianId);
                        setActiveTooltipTechId(order.assignedTechnicianId);
                      }
                      if (onSelectOrder) onSelectOrder(order);
                    }}
                  >
                    {isEmergency && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="14"
                        fill="#e11d48"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 9 : 7}
                      fill={isEmergency ? '#e11d48' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      OT
                    </text>
                  </g>
                );
              })}

              {/* Active Technicians Real-Time Markers with Geolocation Records */}
              {filteredTechs.map((tech, index) => {
                const lastRec = getLastKnownRecord(tech);
                const pos = gpsToCanvas(lastRec.lat, lastRec.lng);
                const isSelected = selectedTechId === tech.id;
                const isHovered = hoveredTechId === tech.id;
                const assignedOrder = getAssignedOrderForTech(tech);

                const markerColor =
                  tech.status === 'EN_SERVICIO'
                    ? '#0284c7' // Blue/Sky
                    : tech.status === 'EN_RUTA'
                    ? '#eab308' // Amber
                    : '#10b981'; // Emerald

                const techBadge = `T${index + 1}`;

                return (
                  <g
                    key={`tech-marker-${tech.id}`}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => {
                      setSelectedTechId(tech.id);
                      setActiveTooltipTechId(activeTooltipTechId === tech.id ? null : tech.id);
                      if (assignedOrder) {
                        setSelectedOrderId(assignedOrder.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredTechId(tech.id)}
                    onMouseLeave={() => setHoveredTechId(null)}
                  >
                    {/* Pulsing Radar Ring for active en route or in service technicians */}
                    {(tech.status === 'EN_SERVICIO' || tech.status === 'EN_RUTA') && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? '22' : '16'}
                        fill={markerColor}
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}

                    {/* Selection ring */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="16"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Main Technician Location Pin Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? '12' : '10'}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="shadow-lg filter drop-shadow"
                    />

                    {/* Technician identifier text */}
                    <text
                      x={pos.x}
                      y={pos.y + 3.5}
                      fill="#ffffff"
                      fontSize={isSelected ? '9' : '8'}
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      {techBadge}
                    </text>

                    {/* Mini Assigned Order Pill pinned above technician */}
                    {assignedOrder && (
                      <g transform={`translate(${pos.x}, ${pos.y - 18})`}>
                        <rect
                          x="-28"
                          y="-9"
                          width="56"
                          height="14"
                          rx="7"
                          fill={assignedOrder.priority === 'EMERGENCIA' ? '#9f1239' : '#0f172a'}
                          stroke={assignedOrder.priority === 'EMERGENCIA' ? '#f43f5e' : '#38bdf8'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="1"
                          fill="#ffffff"
                          fontSize="7.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {assignedOrder.orderNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Floating Tooltip on the map for selected/active technician */}
          {activeTooltipTechId && (() => {
            const tech = liveTechs.find((t) => t.id === activeTooltipTechId);
            if (!tech) return null;
            const lastRec = getLastKnownRecord(tech);
            const assignedOrder = getAssignedOrderForTech(tech);

            return (
              <div className="absolute top-16 right-4 sm:right-6 z-20 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 p-4 rounded-2xl shadow-2xl text-slate-200 text-xs space-y-3 animate-fade-in">
                {/* Tooltip Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={tech.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                      alt={tech.fullName}
                      className="w-9 h-9 rounded-xl object-cover border border-sky-400"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                        {tech.fullName}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                          {tech.conteLicense}
                        </span>
                      </h4>
                      <p className="text-[11px] text-sky-400 font-medium">{tech.specialty}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTooltipTechId(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Status & Last Known Location Telemetry Record */}
                <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Estado Operativo:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        tech.status === 'EN_SERVICIO'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : tech.status === 'EN_RUTA'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {tech.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Coordenadas GPS:</span>
                    <span className="font-mono text-white font-bold">
                      [{lastRec.lat.toFixed(4)}, {lastRec.lng.toFixed(4)}]
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hora Telemetría:</span>
                    <span className="text-slate-200 font-mono">{lastRec.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Precisión GPS:</span>
                    <span className="text-emerald-400 font-semibold">±{lastRec.accuracyMeters || 8} metros</span>
                  </div>

                  {lastRec.addressApprox && (
                    <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="truncate">{lastRec.addressApprox}</span>
                    </div>
                  )}
                </div>

                {/* CLICKABLE ASSIGNED ORDER NUMBER CARD */}
                {assignedOrder ? (
                  <div
                    onClick={() => {
                      setSelectedOrderId(assignedOrder.id);
                      if (onSelectOrder) onSelectOrder(assignedOrder);
                    }}
                    className="p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 hover:border-sky-400 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-sky-400" /> Orden Asignada
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          assignedOrder.priority === 'EMERGENCIA'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                      >
                        {assignedOrder.priority}
                      </span>
                    </div>

                    {/* Highlighting Clickable Order Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-white group-hover:text-sky-300 flex items-center gap-1.5">
                        {assignedOrder.orderNumber}
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {assignedOrder.scheduledTime || 'En turno'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium truncate">
                      {assignedOrder.clientName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {assignedOrder.equipmentType}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-sky-900/60 text-[10px]">
                      <span className="text-sky-400 font-semibold group-hover:underline">
                        Ver detalles de orden ➔
                      </span>
                      <span className="text-slate-400">
                        {lastRec.verifiedOnSite ? '✓ En sitio' : `A ${lastRec.distanceToSiteMeters ?? 50}m`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-[11px]">
                    Sin orden activa asignada actualmente. Técnico disponible en base.
                  </div>
                )}

                {/* Action button: Direct call / radio */}
                <div className="flex gap-2 pt-1">
                  <a
                    href={`tel:${tech.phone}`}
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar / Radio Móvil</span>
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Map Footer Legend */}
          <div className="z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 shadow-inner mt-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block shadow-sm shadow-sky-500/50" /> En Servicio
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50" /> En Ruta GPS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" /> Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" /> Urgencia OT
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Frecuencia GPS: En vivo cada 10s</span>
            </div>
          </div>
        </div>

        {/* Right Telemetry & Dispatch Control Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Technician Card & Geolocation History */}
          {selectedTech && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <LocateFixed className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Móvil Seleccionado
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    selectedTech.status === 'DISPONIBLE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300'
                      : selectedTech.status === 'EN_SERVICIO'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border border-sky-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300'
                  }`}
                >
                  {selectedTech.status.replace('_', ' ')}
                </span>
              </div>

              {/* Technician Profile summary */}
              <div className="flex items-start gap-3">
                <img
                  src={selectedTech.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt={selectedTech.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-500 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {selectedTech.fullName}
                  </h3>
                  <div className="text-xs text-sky-600 dark:text-sky-400 font-semibold truncate">
                    {selectedTech.specialty}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{selectedTech.currentLocationName}</span>
                  </div>
                </div>
              </div>

              {/* Active Assigned Order Card */}
              {(() => {
                const assignedOrder = getAssignedOrderForTech(selectedTech);
                if (!assignedOrder) return null;

                return (
                  <div
                    onClick={() => {
                      setSelectedOrderId(assignedOrder.id);
                      if (onSelectOrder) onSelectOrder(assignedOrder);
                    }}
                    className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 hover:border-sky-400 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-sky-500" /> Orden Asignada
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          assignedOrder.priority === 'EMERGENCIA'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                        }`}
                      >
                        {assignedOrder.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center gap-1">
                        {assignedOrder.orderNumber}
                        <ExternalLink className="w-3 h-3 text-sky-500" />
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{assignedOrder.scheduledTime}</span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                      {assignedOrder.clientName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {assignedOrder.equipmentType}
                    </p>
                  </div>
                );
              })()}

              {/* Technician Geolocation History Feed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-sky-500" /> Historial de Pings GPS
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {selectedTech.locationHistory?.length || 1} registros
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {(selectedTech.locationHistory || [getLastKnownRecord(selectedTech)]).map((rec, i) => (
                    <div
                      key={`hist-${selectedTech.id}-${i}`}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {rec.timestamp}
                        </span>
                        {rec.verifiedOnSite ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> En Sitio
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ±{rec.accuracyMeters || 10}m
                          </span>
                        )}
                      </div>

                      <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate">
                        {rec.addressApprox || 'Punto de control de cuadrilla'}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                        <span>Lat: {rec.lat.toFixed(4)}, Lng: {rec.lng.toFixed(4)}</span>
                        {rec.speedKmh !== undefined && rec.speedKmh > 0 && (
                          <span className="text-amber-500 font-semibold">{rec.speedKmh} km/h</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Contact Button */}
              <a
                href={`tel:${selectedTech.phone}`}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-sky-600/20 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Contactar por Radio / Celular ({selectedTech.phone})</span>
              </a>
            </div>
          )}

          {/* Quick Dispatch Assignment Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-sky-600" />
              Asignación Inteligente por Cercanía
            </h3>

            <div className="space-y-2 text-xs">
              {orders.slice(0, 3).map((order) => {
                const assignedTech = liveTechs.find((t) => t.id === order.assignedTechnicianId);

                return (
                  <div
                    key={`quick-dispatch-${order.id}`}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      if (order.assignedTechnicianId) {
                        setSelectedTechId(order.assignedTechnicianId);
                        setActiveTooltipTechId(order.assignedTechnicianId);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedOrderId === order.id
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{order.orderNumber} • {order.clientName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          order.priority === 'EMERGENCIA'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </div>

                    <div className="text-sky-600 dark:text-sky-400 text-[11px] font-semibold mt-0.5 truncate">
                      {order.equipmentType}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[10px] mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      <span>Móvil: <strong>{assignedTech ? assignedTech.fullName : 'Sin asignar'}</strong></span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {order.etaMinutes ? `${order.etaMinutes} min ETA` : 'En cobertura'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
