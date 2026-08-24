import React, { useState } from 'react';
import { WorkOrder, Technician } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
  FileText,
  Building,
  UserCheck
} from 'lucide-react';

interface VisitsCalendarProps {
  orders: WorkOrder[];
  technicians: Technician[];
  onSelectOrder?: (order: WorkOrder) => void;
  onOpenNewVisit?: () => void;
  onAssignTechnician?: (orderId: string, techId: string) => void;
  onOpenReportSheet?: (order: WorkOrder) => void;
  currentRole?: string;
  currentTechId?: string;
}

export const VisitsCalendar: React.FC<VisitsCalendarProps> = ({
  orders,
  technicians,
  onSelectOrder,
  onOpenNewVisit,
  onAssignTechnician,
  onOpenReportSheet,
  currentRole = 'admin',
  currentTechId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<WorkOrder | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesTech =
      selectedTechFilter === 'ALL' ||
      (selectedTechFilter === 'UNASSIGNED' ? !o.assignedTechnicianId : o.assignedTechnicianId === selectedTechFilter);
    const matchesPriority = selectedPriorityFilter === 'ALL' || o.priority === selectedPriorityFilter;
    return matchesTech && matchesPriority;
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    calendarDays.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: false });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding to fill 35 or 42 cells
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    calendarDays.push({ dateStr, dayNum: d, isCurrentMonth: false, isToday: false });
  }

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'EMERGENCIA':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'ALTA':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MEDIA':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header & Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-[11px] font-bold"
              >
                Hoy
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Agenda de visitas técnicas, mantenimientos programados y cuadrillas motorizadas
            </p>
          </div>
        </div>

        {/* View mode & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                viewMode === 'month' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                viewMode === 'agenda' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Lista / Agenda
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onOpenNewVisit && (
            <button
              onClick={onOpenNewVisit}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-sky-600/30 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Visita</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-sky-500" />
            <span>Filtrar por:</span>
          </div>

          {/* Technician filter */}
          <select
            value={selectedTechFilter}
            onChange={(e) => setSelectedTechFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">Todos los Técnicos ({technicians.length})</option>
            <option value="UNASSIGNED">⚠️ Sin Técnico Asignado</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.specialty})
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">Todas las Prioridades</option>
            <option value="EMERGENCIA">🚨 Emergencia / Paro de Planta</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="PROGRAMADO">Programado / Preventivo</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Mostrando <strong>{filteredOrders.length}</strong> visitas programadas
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-950/70 text-xs font-black text-slate-600 dark:text-slate-400 py-3">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className={idx === 0 || idx === 6 ? 'text-rose-500' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {calendarDays.map((cell, idx) => {
              const dayOrders = filteredOrders.filter((o) => o.scheduledDate === cell.dateStr);

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth
                      ? cell.isToday
                        ? 'bg-sky-50/40 dark:bg-sky-950/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-sky-600 text-white shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayOrders.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {dayOrders.length}
                      </span>
                    )}
                  </div>

                  {/* Visit Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderDetails(order)}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-xs truncate ${getPriorityBadgeStyle(
                          order.priority
                        )}`}
                        title={`${order.scheduledTime} - ${order.clientName} (${order.equipmentType})`}
                      >
                        <div className="flex items-center justify-between gap-1 truncate">
                          <span className="truncate">{order.clientName}</span>
                          <span className="font-mono text-[9px] opacity-80 shrink-0">{order.scheduledTime}</span>
                        </div>
                        <div className="text-[9px] font-normal truncate opacity-80">
                          {order.assignedTechnicianName ? `👷 ${order.assignedTechnicianName.split(' ')[0]}` : '⚠️ Sin asignar'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA / LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            Agenda Cronológica de Visitas Programadas
          </h3>

          {filteredOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No hay visitas que coincidan con los filtros.</p>
          ) : (
            <div className="space-y-3">
              {filteredOrders
                .sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1))
                .map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-sky-500 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[11px]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border ${getPriorityBadgeStyle(
                            order.priority
                          )}`}
                        >
                          {order.priority}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {order.clientName}
                        </span>
                      </div>

                      <div className="text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
                          {order.scheduledDate} ({order.scheduledTime})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {order.clientAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          Técnico: <strong className="text-slate-800 dark:text-slate-200">{order.assignedTechnicianName || 'Sin asignar'}</strong>
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-1">
                        <strong>Novedad:</strong> {order.reportedIssue}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-sky-500"
                      >
                        Ver Ficha
                      </button>

                      {onOpenReportSheet && (
                        <button
                          onClick={() => onOpenReportSheet(order)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Diligenciar Hoja Reporte</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL & REASSIGNMENT MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                  {selectedOrderDetails.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                    selectedOrderDetails.priority
                  )}`}
                >
                  {selectedOrderDetails.priority}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Cliente / Copropiedad:</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedOrderDetails.clientName}
                </div>
                <div className="text-slate-500 text-[11px]">{selectedOrderDetails.clientAddress}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Fecha Programada:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedOrderDetails.scheduledDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hora Sugerida:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedOrderDetails.scheduledTime}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Equipo a Intervenir:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedOrderDetails.equipmentType}</strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Descripción del Requerimiento:</span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedOrderDetails.reportedIssue}
                </p>
              </div>

              {/* Quick Reassign Technician */}
              {onAssignTechnician && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    Asignar / Reasignar Empleado:
                  </label>
                  <select
                    value={selectedOrderDetails.assignedTechnicianId || ''}
                    onChange={(e) => {
                      const newTechId = e.target.value;
                      onAssignTechnician(selectedOrderDetails.id, newTechId);
                      const tech = technicians.find((t) => t.id === newTechId);
                      setSelectedOrderDetails((prev) =>
                        prev
                          ? { ...prev, assignedTechnicianId: newTechId, assignedTechnicianName: tech?.fullName }
                          : null
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs"
                  >
                    <option value="">-- Seleccionar Técnico Disponible --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} - {t.specialty} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                Cerrar
              </button>

              {onOpenReportSheet && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenReportSheet(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Diligenciar Hoja de Reporte</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
