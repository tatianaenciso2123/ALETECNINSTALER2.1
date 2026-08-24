import React, { useState, useMemo } from 'react';
import { WorkOrder, TechnicalReport, Invoice, Technician, ClientAccount } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench,
  Gauge,
  Zap,
  Activity,
  Layers,
  Printer,
  Download,
  Eye,
  Building,
  User,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  ChevronDown,
  FileCheck,
  TrendingUp,
  Boxes,
  Phone,
  MapPin,
  QrCode,
  Share2,
  Check,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

interface MonthlyTechnicalReportsHistoryProps {
  orders: WorkOrder[];
  invoices?: Invoice[];
  technicians?: Technician[];
  clients?: ClientAccount[];
  onSelectOrderForReport?: (order: WorkOrder) => void;
  onViewInvoice?: (invoiceId: string) => void;
  onApproveReport?: (orderId: string, adminNotes?: string) => void;
  onRejectReport?: (orderId: string, adminNotes: string) => void;
  currentRole?: string;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MonthlyTechnicalReportsHistory: React.FC<MonthlyTechnicalReportsHistoryProps> = ({
  orders,
  invoices = [],
  technicians = [],
  clients = [],
  onSelectOrderForReport,
  onViewInvoice,
  onApproveReport,
  onRejectReport,
  currentRole = 'admin',
}) => {
  // Date selection state - defaults to current month (August 2026 in our app context)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 0-indexed: 7 = Agosto

  // Filters & view modes
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APROBADO_ENVIADO' | 'PENDIENTE_VALIDACION' | 'RECHAZADO_CORRECCION'>('ALL');
  const [techFilter, setTechFilter] = useState<string>('ALL');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<string>('ALL');
  const [stateAfterFilter, setStateAfterFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'daily'>('cards');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Modal for full certified ficha view
  const [selectedReportOrder, setSelectedReportOrder] = useState<WorkOrder | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [printSuccessNotice, setPrintSuccessNotice] = useState(false);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    // Default to current app context month (Agosto 2026)
    setSelectedYear(2026);
    setSelectedMonth(7);
  };

  // Helper to extract date parts
  const parseOrderDate = (order: WorkOrder) => {
    const dateStr = order.technicalReport?.date || order.scheduledDate || order.createdAt;
    if (!dateStr) return null;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length >= 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10),
      };
    }
    const d = new Date(dateStr);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
    };
  };

  // Extract all orders that have a technical report or completed service
  const allOrdersWithReports = useMemo(() => {
    return orders.filter((o) => o.technicalReport || o.status === 'FINALIZADA' || o.status === 'FACTURADA');
  }, [orders]);

  // Filter orders by the selected month and year
  const monthlyOrders = useMemo(() => {
    return allOrdersWithReports.filter((order) => {
      const dateInfo = parseOrderDate(order);
      if (!dateInfo) return false;
      return dateInfo.year === selectedYear && dateInfo.month === selectedMonth;
    });
  }, [allOrdersWithReports, selectedYear, selectedMonth]);

  // Filter by user inputs (search, status, tech, equipment)
  const filteredMonthlyOrders = useMemo(() => {
    return monthlyOrders.filter((order) => {
      const rep = order.technicalReport;
      const status = rep?.approvalStatus || 'PENDIENTE_VALIDACION';

      // Status filter
      if (statusFilter !== 'ALL' && status !== statusFilter) {
        return false;
      }

      // Tech filter
      if (techFilter !== 'ALL') {
        const techName = rep?.technicianName || order.assignedTechnicianName || '';
        if (!techName.toLowerCase().includes(techFilter.toLowerCase())) {
          return false;
        }
      }

      // Equipment type filter
      if (equipmentTypeFilter !== 'ALL') {
        const equip = (rep?.equipmentType || order.equipmentType || '').toLowerCase();
        if (!equip.includes(equipmentTypeFilter.toLowerCase())) {
          return false;
        }
      }

      // State after filter
      if (stateAfterFilter !== 'ALL') {
        const stateAfter = rep?.generalStateAfter;
        if (stateAfter !== stateAfterFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchClient = order.clientName.toLowerCase().includes(q);
        const matchAddress = (order.clientAddress || '').toLowerCase().includes(q);
        const matchTech = (rep?.technicianName || order.assignedTechnicianName || '').toLowerCase().includes(q);
        const matchEquip = (rep?.equipmentType || order.equipmentType || '').toLowerCase();
        const matchSerial = (rep?.serialNumber || '').toLowerCase().includes(q);
        const matchBrand = (rep?.brand || order.brand || '').toLowerCase().includes(q);
        const matchDiagnosis = (rep?.diagnosticDetails || '').toLowerCase().includes(q);
        const matchMaterials = (rep?.materialsUsed || []).some((m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));

        if (
          !matchNum &&
          !matchClient &&
          !matchAddress &&
          !matchTech &&
          !matchEquip.includes(q) &&
          !matchSerial &&
          !matchBrand &&
          !matchDiagnosis &&
          !matchMaterials
        ) {
          return false;
        }
      }

      return true;
    });
  }, [monthlyOrders, statusFilter, techFilter, equipmentTypeFilter, stateAfterFilter, searchQuery]);

  // Monthly KPIs & Statistics
  const stats = useMemo(() => {
    const totalReports = monthlyOrders.length;
    const approvedReports = monthlyOrders.filter((o) => o.technicalReport?.approvalStatus === 'APROBADO_ENVIADO').length;
    const pendingValidation = monthlyOrders.filter(
      (o) => (o.technicalReport?.approvalStatus || 'PENDIENTE_VALIDACION') === 'PENDIENTE_VALIDACION'
    ).length;
    const inCorrection = monthlyOrders.filter((o) => o.technicalReport?.approvalStatus === 'RECHAZADO_CORRECCION').length;

    // Total materials cost in month
    let totalMaterialsCOP = 0;
    let totalMaterialsCount = 0;
    const materialsMap: Record<string, { name: string; code: string; count: number; totalCOP: number }> = {};

    monthlyOrders.forEach((o) => {
      (o.technicalReport?.materialsUsed || []).forEach((m) => {
        totalMaterialsCOP += m.totalCOP || 0;
        totalMaterialsCount += m.quantity || 1;
        if (!materialsMap[m.code]) {
          materialsMap[m.code] = { name: m.name, code: m.code, count: 0, totalCOP: 0 };
        }
        materialsMap[m.code].count += m.quantity || 1;
        materialsMap[m.code].totalCOP += m.totalCOP || 0;
      });
    });

    const topMaterials = Object.values(materialsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Total service value
    const totalServiceCostCOP = monthlyOrders.reduce((acc, o) => acc + (o.totalCostCOP || 0), 0);

    // Equipment categories breakdown
    const equipmentBreakdown: Record<string, number> = {};
    monthlyOrders.forEach((o) => {
      const type = o.equipmentType || o.technicalReport?.equipmentType || 'Otros Sistemas';
      let category = 'Presión Constante / Hidroneumático';
      if (type.toLowerCase().includes('eyector') || type.toLowerCase().includes('aguas negras') || type.toLowerCase().includes('sumergible')) {
        category = 'Bombas Eyectoras / Sumergibles';
      } else if (type.toLowerCase().includes('tanque') || type.toLowerCase().includes('lavado') || type.toLowerCase().includes('desinfección')) {
        category = 'Lavado de Tanques (Dec. 1575)';
      } else if (type.toLowerCase().includes('incendio') || type.toLowerCase().includes('rci')) {
        category = 'Redes Contra Incendios RCI';
      } else if (type.toLowerCase().includes('tablero') || type.toLowerCase().includes('variador') || type.toLowerCase().includes('vfd')) {
        category = 'Tableros Eléctricos & VFD';
      }
      equipmentBreakdown[category] = (equipmentBreakdown[category] || 0) + 1;
    });

    // Technician breakdown
    const techBreakdown: Record<string, number> = {};
    monthlyOrders.forEach((o) => {
      const tech = o.technicalReport?.technicianName || o.assignedTechnicianName || 'Técnico de Guardia';
      techBreakdown[tech] = (techBreakdown[tech] || 0) + 1;
    });

    // Optimum outcome rate
    const optimumCount = monthlyOrders.filter((o) => o.technicalReport?.generalStateAfter === 'ÓPTIMO').length;
    const optimumRate = totalReports > 0 ? Math.round((optimumCount / totalReports) * 100) : 100;

    // Daily distribution map for heatmap/timeline
    const dailyMap: Record<number, number> = {};
    monthlyOrders.forEach((o) => {
      const dateInfo = parseOrderDate(o);
      if (dateInfo) {
        dailyMap[dateInfo.day] = (dailyMap[dateInfo.day] || 0) + 1;
      }
    });

    return {
      totalReports,
      approvedReports,
      pendingValidation,
      inCorrection,
      totalMaterialsCOP,
      totalMaterialsCount,
      totalServiceCostCOP,
      topMaterials,
      equipmentBreakdown,
      techBreakdown,
      optimumRate,
      dailyMap,
    };
  }, [monthlyOrders]);

  // Unique list of technicians in current month
  const availableTechs = useMemo(() => {
    const set = new Set<string>();
    allOrdersWithReports.forEach((o) => {
      const t = o.technicalReport?.technicianName || o.assignedTechnicianName;
      if (t) set.add(t);
    });
    return Array.from(set);
  }, [allOrdersWithReports]);

  // Helper to get invoice associated with order
  const getAssociatedInvoice = (orderId: string) => {
    return invoices.find((inv) => inv.orderId === orderId || inv.orderNumber === orderId);
  };

  // Group orders by day for 'daily' view mode
  const ordersGroupedByDay = useMemo(() => {
    const groups: { day: number; dateStr: string; orders: WorkOrder[] }[] = [];
    const map = new Map<number, WorkOrder[]>();

    filteredMonthlyOrders.forEach((order) => {
      const dateInfo = parseOrderDate(order);
      const day = dateInfo ? dateInfo.day : 1;
      if (!map.has(day)) {
        map.set(day, []);
      }
      map.get(day)!.push(order);
    });

    // Sort days descending (most recent first)
    const sortedDays = Array.from(map.keys()).sort((a, b) => b - a);
    sortedDays.forEach((day) => {
      const dayOrders = map.get(day)!;
      const firstOrder = dayOrders[0];
      const dateStr = firstOrder?.technicalReport?.date || firstOrder?.scheduledDate || `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      groups.push({
        day,
        dateStr,
        orders: dayOrders,
      });
    });

    return groups;
  }, [filteredMonthlyOrders, selectedYear, selectedMonth]);

  // Print single certificate
  const handlePrintCertificate = () => {
    window.print();
    setPrintSuccessNotice(true);
    setTimeout(() => setPrintSuccessNotice(false), 3000);
  };

  // Print monthly consolidated ledger
  const handlePrintMonthlyLedger = () => {
    window.print();
  };

  const handleCopyReportLink = (order: WorkOrder) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?order=${order.orderNumber}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="monthly-tech-reports-section">
      {/* =========================================================================
          HEADER & MONTH NAVIGATOR BAR
         ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
            <FileCheck className="w-4 h-4 text-sky-500" />
            <span>Módulo de Control de Calidad & Trazabilidad Hidráulica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Historial de Fichas Técnicas del Mes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Registro cronológico oficial de hojas de reporte técnico, mediciones eléctricas de bombeo, consumos de repuestos y firmas de conformidad de clientes en Colombia.
          </p>
        </div>

        {/* Month Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month / Year Control Group */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-850 transition-all cursor-pointer active:scale-95"
              title="Mes Anterior"
              id="btn-prev-month-reports"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-black text-slate-900 dark:text-white">
              <Calendar className="w-4 h-4 text-sky-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer text-xs sm:text-sm py-1"
                id="select-report-month"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent font-bold text-sky-600 dark:text-sky-400 focus:outline-none cursor-pointer text-xs sm:text-sm py-1"
                id="select-report-year"
              >
                {[2026, 2025, 2024, 2023].map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-850 transition-all cursor-pointer active:scale-95"
              title="Mes Siguiente"
              id="btn-next-month-reports"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToCurrentMonth}
            className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
            title="Ir al mes en curso"
          >
            Mes Actual
          </button>

          <button
            onClick={handlePrintMonthlyLedger}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
            title="Imprimir Libro Consolidado de Fichas del Mes"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Imprimir Dossier Mensual</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE MONTHLY KPIS GRID
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Reports */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Fichas
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalReports}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            En {MONTH_NAMES[selectedMonth]} {selectedYear}
          </div>
        </div>

        {/* Approved Reports */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Aprobadas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.approvedReports}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats.totalReports > 0 ? Math.round((stats.approvedReports / stats.totalReports) * 100) : 0}% con visto bueno
          </div>
        </div>

        {/* Pending Validation */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              En Auditoría
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingValidation}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Por validar por Admin
          </div>
        </div>

        {/* Repuestos Usados */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Repuestos
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalMaterialsCount} <span className="text-xs font-semibold text-slate-400">uds</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate" title={formatCOP(stats.totalMaterialsCOP)}>
            {formatCOP(stats.totalMaterialsCOP)}
          </div>
        </div>

        {/* Valor Total Facturado */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Servicios
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate" title={formatCOP(stats.totalServiceCostCOP)}>
            {formatCOP(stats.totalServiceCostCOP)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Mano de obra + repuestos
          </div>
        </div>

        {/* Confiabilidad Hidráulica */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado Óptimo
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats.optimumRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Equipos operativos al 100%
          </div>
        </div>
      </div>

      {/* =========================================================================
          MONTHLY ANALYTICS & TIMELINE DRAWER
         ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Análisis Gráfico & Distribución de Intervenciones — {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h3>
          </div>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            {showAnalytics ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAnalytics ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Daily Timeline Heatmap / Distribution */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                <span>Cronograma por Días del Mes</span>
                <span className="text-[10px] text-slate-400">{stats.totalReports} fichas registradas</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i} className="font-bold text-slate-400 pb-1">{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const count = stats.dailyMap[day] || 0;
                  return (
                    <div
                      key={day}
                      className={`h-7 rounded-lg flex items-center justify-center font-bold transition-all ${
                        count > 0
                          ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/30'
                          : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-850'
                      }`}
                      title={`Día ${day}: ${count} fichas técnicas`}
                    >
                      <span>{day}</span>
                      {count > 0 && <span className="text-[8px] ml-0.5 opacity-90">({count})</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                <span>Distribución por Tipo de Equipo</span>
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-2.5">
                {Object.keys(stats.equipmentBreakdown).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No hay registros en este mes.</p>
                ) : (
                  Object.entries(stats.equipmentBreakdown).map(([category, count]) => {
                    const countNum = Number(count);
                    const pct = stats.totalReports > 0 ? Math.round((countNum / stats.totalReports) * 100) : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="truncate pr-2">{category}</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">{countNum} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Repuestos Utilizados */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                <span>Top Insumos Instalados en el Mes</span>
                <Boxes className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              {stats.topMaterials.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No se utilizaron repuestos en este periodo.</p>
              ) : (
                <div className="space-y-2">
                  {stats.topMaterials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{mat.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{mat.code}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          {mat.count} uds
                        </span>
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatCOP(mat.totalCOP)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          FILTERS, SEARCH & VIEW MODE BAR
         ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por # de OT, cliente, técnico, equipo, serial, diagnóstico o repuesto..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              id="input-search-monthly-reports"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Tarjetas Detalladas"
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Tabla Resumida"
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista Agrupada por Día"
            >
              Por Días
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos los Estados ({monthlyOrders.length})</option>
            <option value="APROBADO_ENVIADO">Aprobados & Certificados ({stats.approvedReports})</option>
            <option value="PENDIENTE_VALIDACION">En Auditoría ({stats.pendingValidation})</option>
            <option value="RECHAZADO_CORRECCION">En Corrección ({stats.inCorrection})</option>
          </select>

          {/* Technician Filter */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos los Técnicos</option>
            {availableTechs.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>

          {/* Equipment Category Filter */}
          <select
            value={equipmentTypeFilter}
            onChange={(e) => setEquipmentTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos los Equipos</option>
            <option value="Presión">Sistemas de Presión Constante</option>
            <option value="Bomba">Electrobombas Centrífugas</option>
            <option value="Eyector">Bombas Eyectoras / Sumergibles</option>
            <option value="Tanque">Lavado de Tanques (Dec. 1575)</option>
            <option value="Incendio">Redes Contra Incendios RCI</option>
            <option value="Variador">Variadores VFD & Tableros</option>
          </select>

          {/* State After Service */}
          <select
            value={stateAfterFilter}
            onChange={(e) => setStateAfterFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Todos los Resultados Finales</option>
            <option value="ÓPTIMO">Dejado en Estado ÓPTIMO</option>
            <option value="BUENO">Dejado en Estado BUENO</option>
            <option value="OBSERVACIÓN">Con OBSERVACIÓN Pendiente</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL' || techFilter !== 'ALL' || equipmentTypeFilter !== 'ALL' || stateAfterFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTechFilter('ALL');
                setEquipmentTypeFilter('ALL');
                setStateAfterFilter('ALL');
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer Filtros
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          REPORTS DISPLAY: CARDS / TABLE / DAILY VIEW
         ========================================================================= */}
      {filteredMonthlyOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No se encontraron fichas técnicas para {MONTH_NAMES[selectedMonth]} {selectedYear}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No hay reportes que coincidan con los filtros aplicados. Intenta restablecer los filtros de búsqueda.'
              : 'Durante este mes no se registraron órdenes de trabajo finalizadas con hoja de reporte. Puedes navegar a otros meses o crear un nuevo reporte.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleGoToCurrentMonth}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Ver Mes Actual (Agosto 2026)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ======================= 1. CARDS VIEW ======================= */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredMonthlyOrders.map((order) => {
                const rep = order.technicalReport;
                const inv = getAssociatedInvoice(order.id);
                const status = rep?.approvalStatus || 'PENDIENTE_VALIDACION';

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/60 dark:hover:border-sky-500/60 transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                            {order.orderNumber}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {formatDate(rep?.date || order.scheduledDate || '')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                          {order.clientName}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{order.clientAddress || order.neighborhood || 'Bogotá D.C.'}</span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div>
                        {status === 'APROBADO_ENVIADO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Aprobado DIAN
                          </span>
                        ) : status === 'RECHAZADO_CORRECCION' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3" />
                            En Corrección
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            Por Auditar
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Equipment & Technical Parameters Grid */}
                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-sky-500" />
                            {rep?.equipmentType || order.equipmentType}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {rep?.hpPower || order.hpPower} HP • {rep?.voltagePhase || 'Trifásico 220V'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                          <span>Marca: <strong>{rep?.brand || order.brand}</strong></span>
                          <span>Modelo: <strong>{rep?.model || order.model}</strong></span>
                          {rep?.serialNumber && <span>S/N: <strong className="font-mono">{rep.serialNumber}</strong></span>}
                        </div>
                      </div>

                      {/* Technical Measurements Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Gauge className="w-3 h-3 text-sky-500" />
                            Presión
                          </div>
                          <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5 text-xs">
                            {rep?.suctionPressurePsi ?? 4} / {rep?.dischargePressurePsi ?? 68} <span className="text-[9px] font-normal">PSI</span>
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Corriente (R-S-T)
                          </div>
                          <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5 text-xs font-mono">
                            {rep?.ampPhaseR ?? 29.8}A • {rep?.ampPhaseS ?? 30.1}A
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Aislamiento
                          </div>
                          <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5 text-xs">
                            {rep?.insulationResistanceMohm ?? 85} <span className="text-[9px] font-normal">MΩ</span>
                          </div>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                            <Activity className="w-3 h-3 text-purple-500" />
                            Resultado
                          </div>
                          <div className={`font-black text-xs mt-0.5 ${
                            rep?.generalStateAfter === 'ÓPTIMO' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {rep?.generalStateAfter || 'ÓPTIMO'}
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic & Work Performed summary */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1">
                        <div className="line-clamp-2">
                          <strong className="text-slate-900 dark:text-white">Diagnóstico: </strong>
                          {rep?.diagnosticDetails || order.reportedIssue}
                        </div>
                        <div className="line-clamp-2 text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-300">Trabajo Realizado: </strong>
                          {rep?.workPerformed || 'Mantenimiento integral, cambio de componentes de fricción y pruebas operativas.'}
                        </div>
                      </div>

                      {/* Spare Parts Installed Pill list */}
                      {rep?.materialsUsed && rep.materialsUsed.length > 0 && (
                        <div className="text-xs">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                            Repuestos e Insumos Instalados ({rep.materialsUsed.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rep.materialsUsed.map((mat, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700"
                              >
                                <span>{mat.name}</span>
                                <strong className="text-sky-600 dark:text-sky-400">x{mat.quantity}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions & Technician / Signer Info */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {(rep?.technicianName || order.assignedTechnicianName || 'T').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                            {rep?.technicianName || order.assignedTechnicianName || 'Técnico Responsable'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Firma Cliente: {rep?.clientNameSigner || order.clientContact}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReportOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 text-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Ficha Oficial</span>
                        </button>

                        {inv && onViewInvoice && (
                          <button
                            onClick={() => onViewInvoice(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors text-xs"
                            title={`Ver Factura ${inv.invoiceNumber}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Factura</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================= 2. TABLE VIEW ======================= */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Orden / Fecha</th>
                      <th className="py-3.5 px-4">Copropiedad / Cliente</th>
                      <th className="py-3.5 px-4">Técnico Responsable</th>
                      <th className="py-3.5 px-4">Equipo Intervenido</th>
                      <th className="py-3.5 px-4">Mediciones (Presión / Corriente)</th>
                      <th className="py-3.5 px-4">Repuestos</th>
                      <th className="py-3.5 px-4">Estado Auditoría</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredMonthlyOrders.map((order) => {
                      const rep = order.technicalReport;
                      const status = rep?.approvalStatus || 'PENDIENTE_VALIDACION';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-medium">
                            <div className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
                              {order.orderNumber}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatDate(rep?.date || order.scheduledDate || '')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{order.clientName}</div>
                            <div className="text-[11px] text-slate-400">{order.clientAddress}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {rep?.technicianName || order.assignedTechnicianName || 'Técnico'}
                            </div>
                            <div className="text-[10px] text-slate-400">{rep?.technicianDocument || 'Certificado'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {rep?.equipmentType || order.equipmentType}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rep?.brand || order.brand} • {rep?.hpPower || order.hpPower} HP
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              P: {rep?.suctionPressurePsi ?? 4}/{rep?.dischargePressurePsi ?? 68} PSI
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              I: {rep?.ampPhaseR ?? 29.8}A / {rep?.ampPhaseS ?? 30.1}A
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {rep?.materialsUsed?.length || 0} uds
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {formatCOP((rep?.materialsUsed || []).reduce((acc, m) => acc + m.totalCOP, 0))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {status === 'APROBADO_ENVIADO' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                Aprobado
                              </span>
                            ) : status === 'RECHAZADO_CORRECCION' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                En Corrección
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                                En Auditoría
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedReportOrder(order)}
                              className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded-lg font-bold text-xs transition-colors"
                            >
                              Ver Ficha
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= 3. DAILY GROUP VIEW ======================= */}
          {viewMode === 'daily' && (
            <div className="space-y-6">
              {ordersGroupedByDay.map((group) => (
                <div key={group.day} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      {group.day}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatDate(group.dateStr)}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {group.orders.length} {group.orders.length === 1 ? 'ficha completada' : 'fichas completadas'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.orders.map((order) => {
                      const rep = order.technicalReport;
                      return (
                        <div
                          key={order.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{order.orderNumber}</span>
                              <span className="font-bold text-slate-900 dark:text-white truncate">{order.clientName}</span>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 truncate">
                              {rep?.equipmentType || order.equipmentType} • Tec. {rep?.technicianName || order.assignedTechnicianName}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedReportOrder(order)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs shrink-0 transition-transform active:scale-95"
                          >
                            Ver Ficha
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          MODAL: CERTIFIED OFFICIAL TECHNICAL SHEET (PRINT & EXPORT VIEW)
         ========================================================================= */}
      {selectedReportOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" theme="white" textVariant="icon" />
                <div>
                  <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                    Certificado Oficial de Mantenimiento Hidráulico • ISO 9001
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Ficha Técnica: {selectedReportOrder.orderNumber}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintCertificate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm"
                  title="Imprimir Ficha Técnica Oficial"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir PDF</span>
                </button>

                <button
                  onClick={() => handleCopyReportLink(selectedReportOrder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                  title="Copiar enlace"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
                </button>

                <button
                  onClick={() => setSelectedReportOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body - Official Certificate Layout */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:p-0 print:bg-white print:text-black">
              {/* Toast when printed */}
              {printSuccessNotice && (
                <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Enviado a la cola de impresión de Windows / Android con éxito.
                  </span>
                </div>
              )}

              {/* Certificate Corporate Banner */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-sky-600 dark:text-sky-400 tracking-wider">
                    ALE. TECNINSTALER S.A.S. • NIT 901.482.391-8
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ingeniería Hidráulica, Mantenimiento de Bombas, Redes RCI y Lavado de Tanques (Dec. 1575)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Línea Técnica 24/7: +57 300 447 8151 • Bogotá D.C., Colombia
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Orden de Trabajo</div>
                  <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {selectedReportOrder.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Fecha: <strong>{formatDate(selectedReportOrder.technicalReport?.date || selectedReportOrder.scheduledDate || '')}</strong>
                  </div>
                </div>
              </div>

              {/* Client and Technical Visit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-500" />
                    Datos del Cliente / Copropiedad
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div><strong>Razón Social:</strong> {selectedReportOrder.clientName}</div>
                    <div><strong>NIT / Identificación:</strong> {selectedReportOrder.clientNit || '900.548.120-1'}</div>
                    <div><strong>Dirección:</strong> {selectedReportOrder.clientAddress}</div>
                    <div><strong>Contacto / Administrador:</strong> {selectedReportOrder.clientContact}</div>
                    <div><strong>Teléfono:</strong> {selectedReportOrder.clientPhone}</div>
                  </div>
                </div>

                {/* Technician Info */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    Técnico Especialista Responsable
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div><strong>Nombre:</strong> {selectedReportOrder.technicalReport?.technicianName || selectedReportOrder.assignedTechnicianName}</div>
                    <div><strong>Documento / Matrícula:</strong> {selectedReportOrder.technicalReport?.technicianDocument || 'TE-048591 (CONTE)'}</div>
                    <div><strong>Especialidad:</strong> Electrobombas, Variadores VFD & Redes Hidráulicas</div>
                    <div><strong>Hora de Intervención:</strong> {selectedReportOrder.scheduledTime || '09:00 AM'}</div>
                    <div><strong>Supervisión:</strong> Calidad & Garantía ALE. TECNINSTALER</div>
                  </div>
                </div>
              </div>

              {/* Equipment Technical Specifications & Electrical Measurements Table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-sky-500" />
                    Parámetros Hidráulicos & Mediciones Eléctricas
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                    {selectedReportOrder.technicalReport?.voltagePhase || 'Trifásico 220V'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Equipo / Potencia</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedReportOrder.technicalReport?.equipmentType || selectedReportOrder.equipmentType}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {selectedReportOrder.technicalReport?.hpPower || selectedReportOrder.hpPower} HP ({selectedReportOrder.technicalReport?.brand || selectedReportOrder.brand})
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Presión de Operación</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                      Succión: {selectedReportOrder.technicalReport?.suctionPressurePsi ?? 4} PSI
                    </div>
                    <div className="text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                      Descarga: {selectedReportOrder.technicalReport?.dischargePressurePsi ?? 68} PSI
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Corrientes (A) R - S - T</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                      R: {selectedReportOrder.technicalReport?.ampPhaseR ?? 29.8}A • S: {selectedReportOrder.technicalReport?.ampPhaseS ?? 30.1}A
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      T: {selectedReportOrder.technicalReport?.ampPhaseT ?? 31.4}A (Nominal: {selectedReportOrder.technicalReport?.nominalAmperage ?? 26.5}A)
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Aislamiento & Vibración</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedReportOrder.technicalReport?.insulationResistanceMohm ?? 85} MΩ Megger
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vibración: {selectedReportOrder.technicalReport?.vibrationMmS ?? 6.8} mm/s RMS
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis, Work Performed & Recommendations */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    1. Diagnóstico Técnico de Fallas y Hallazgos
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedReportOrder.technicalReport?.diagnosticDetails || selectedReportOrder.reportedIssue}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    2. Detalle de Trabajos Ejecutados
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedReportOrder.technicalReport?.workPerformed || 'Desmontaje de componentes, reemplazo de rodamientos y sellos mecánicos, balanceo dinámico, cebado de succión y pruebas de presión estática.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    3. Recomendaciones Técnicas Preventivas
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedReportOrder.technicalReport?.recommendations || 'Monitorear rampa de variador VFD y realizar chequeo de vibración en 15 días.'}
                  </p>
                </div>
              </div>

              {/* Materials and Spare Parts Table */}
              {selectedReportOrder.technicalReport?.materialsUsed && selectedReportOrder.technicalReport.materialsUsed.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-500" />
                    Repuestos e Insumos Instalados
                  </h4>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5">Código SKU</th>
                        <th className="p-2.5">Descripción del Repuesto</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Precio Unitario</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedReportOrder.technicalReport.materialsUsed.map((m, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{m.code}</td>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{m.name}</td>
                          <td className="p-2.5 text-center font-bold">{m.quantity} {m.unit || 'UND'}</td>
                          <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{formatCOP(m.unitPriceCOP)}</td>
                          <td className="p-2.5 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCOP(m.totalCOP)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures & Certification Seal */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Technician Signature */}
                <div className="space-y-2 text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-2xl text-sky-700 dark:text-sky-300 font-bold">
                      {selectedReportOrder.technicalReport?.technicianName || selectedReportOrder.assignedTechnicianName}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedReportOrder.technicalReport?.technicianName || selectedReportOrder.assignedTechnicianName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Técnico Especialista • {selectedReportOrder.technicalReport?.technicianDocument || 'CC 1.030.548.219'}
                    </div>
                  </div>
                </div>

                {/* Client Signature */}
                <div className="space-y-2 text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-2xl text-slate-800 dark:text-slate-200 font-bold">
                      {selectedReportOrder.technicalReport?.clientNameSigner || selectedReportOrder.clientContact}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedReportOrder.technicalReport?.clientNameSigner || selectedReportOrder.clientContact}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Firma de Recibido a Conformidad • {selectedReportOrder.technicalReport?.clientDocumentSigner || 'CC Titular'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Certificado Digital Válido para Secretaría de Salud y Auditorías de Copropiedad.
              </span>
              <button
                onClick={() => setSelectedReportOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
