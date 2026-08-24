import React, { useState } from 'react';
import { WorkOrder, TechnicalReport, Invoice } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Send,
  Printer,
  ShieldCheck,
  Zap,
  Gauge,
  Wrench,
  Search,
  Filter,
  Camera,
  Layers,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface WorkOrdersAuditControlProps {
  orders: WorkOrder[];
  invoices: Invoice[];
  onApproveReport: (orderId: string, adminNotes?: string) => void;
  onRejectReport: (orderId: string, adminNotes: string) => void;
  onViewInvoice: (invoiceId: string) => void;
}

export const WorkOrdersAuditControl: React.FC<WorkOrdersAuditControlProps> = ({
  orders,
  invoices,
  onApproveReport,
  onRejectReport,
  onViewInvoice,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDIENTE_VALIDACION' | 'APROBADO_ENVIADO' | 'RECHAZADO_CORRECCION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [rejectionModalOrder, setRejectionModalOrder] = useState<WorkOrder | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Orders that have a technical report or are completed/in progress
  const ordersWithReports = orders.filter((o) => o.technicalReport || o.status === 'FINALIZADA' || o.status === 'EN_EJECUCION');

  const filteredOrders = ordersWithReports.filter((order) => {
    const reportStatus = order.technicalReport?.approvalStatus || (order.technicalReport ? 'PENDIENTE_VALIDACION' : 'BORRADOR');
    if (filterStatus !== 'ALL' && reportStatus !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchClient = order.clientName.toLowerCase().includes(q);
      const matchTech = order.assignedTechnicianName?.toLowerCase().includes(q) || false;
      const matchEquip = order.equipmentType.toLowerCase().includes(q);
      if (!matchNum && !matchClient && !matchTech && !matchEquip) return false;
    }
    return true;
  });

  const pendingCount = ordersWithReports.filter(
    (o) => (o.technicalReport?.approvalStatus || 'PENDIENTE_VALIDACION') === 'PENDIENTE_VALIDACION' && o.technicalReport
  ).length;

  const approvedCount = ordersWithReports.filter(
    (o) => o.technicalReport?.approvalStatus === 'APROBADO_ENVIADO'
  ).length;

  const rejectedCount = ordersWithReports.filter(
    (o) => o.technicalReport?.approvalStatus === 'RECHAZADO_CORRECCION'
  ).length;

  const handleApprove = (order: WorkOrder) => {
    onApproveReport(order.id, 'Control de calidad verificado satisfactoriamente según normativa.');
    setSuccessToast(`¡Reporte y Factura para ${order.orderNumber} aprobados y enviados al cliente con éxito!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setSelectedOrder(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalOrder || !adminNotesInput.trim()) return;

    onRejectReport(rejectionModalOrder.id, adminNotesInput);
    setSuccessToast(`Reporte ${rejectionModalOrder.orderNumber} devuelto al técnico para corrección.`);
    setTimeout(() => setSuccessToast(null), 4000);
    setRejectionModalOrder(null);
    setAdminNotesInput('');
    setSelectedOrder(null);
  };

  const getAssociatedInvoice = (orderId: string) => {
    return invoices.find((inv) => inv.orderId === orderId || inv.orderNumber === orderId);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white text-xs underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
            <ClipboardCheck className="w-4 h-4" />
            Módulo de Supervisión & Calidad Técnica
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Control de Trabajos, Fichas Técnicas & Aprobaciones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa los reportes registrados por los operarios, audita los parámetros de bombeo y autoriza el envío de copia y facturación electrónica a los clientes.
          </p>
        </div>

        {/* Status Indicators Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('PENDIENTE_VALIDACION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              filterStatus === 'PENDIENTE_VALIDACION'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendientes de Validación ({pendingCount})
          </button>

          <button
            onClick={() => setFilterStatus('APROBADO_ENVIADO')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              filterStatus === 'APROBADO_ENVIADO'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprobados & Enviados ({approvedCount})
          </button>

          <button
            onClick={() => setFilterStatus('RECHAZADO_CORRECCION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              filterStatus === 'RECHAZADO_CORRECCION'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            En Corrección ({rejectedCount})
          </button>

          {filterStatus !== 'ALL' && (
            <button
              onClick={() => setFilterStatus('ALL')}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Ver Todos ({ordersWithReports.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por OT, Copropiedad, Técnico, Equipo o Matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Work Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const report = order.technicalReport;
          const status = report?.approvalStatus || (report ? 'PENDIENTE_VALIDACION' : 'BORRADOR');
          const associatedInvoice = getAssociatedInvoice(order.id);

          return (
            <div
              key={order.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-5 space-y-4 transition-all hover:shadow-md flex flex-col justify-between ${
                status === 'PENDIENTE_VALIDACION'
                  ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30'
                  : status === 'APROBADO_ENVIADO'
                  ? 'border-emerald-300 dark:border-emerald-800/80'
                  : status === 'RECHAZADO_CORRECCION'
                  ? 'border-rose-300 dark:border-rose-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Status Badge & OT Number */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                    {order.orderNumber}
                  </span>

                  {status === 'PENDIENTE_VALIDACION' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                      <Clock className="w-3 h-3" />
                      Validación Pendiente
                    </span>
                  )}

                  {status === 'APROBADO_ENVIADO' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Aprobado & Enviado
                    </span>
                  )}

                  {status === 'RECHAZADO_CORRECCION' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <XCircle className="w-3 h-3" />
                      Devuelto a Revisión
                    </span>
                  )}
                </div>

                {/* Client and Location */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {order.clientName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.clientAddress} • {order.neighborhood}
                  </p>
                </div>

                {/* Equipment and Technician Info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5 truncate">
                      <Wrench className="w-3.5 h-3.5 text-sky-500" />
                      {order.equipmentType}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {order.hpPower} HP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">Técnico: <strong>{order.assignedTechnicianName}</strong></span>
                    <span>{formatDate(order.scheduledDate)}</span>
                  </div>
                </div>

                {/* Technical Readings Snapshot */}
                {report && (
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                    <div className="p-1.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg border border-sky-100 dark:border-sky-900/40">
                      <div className="text-[10px] text-slate-400">Presión</div>
                      <div className="font-bold text-sky-700 dark:text-sky-300">{report.dischargePressurePsi} PSI</div>
                    </div>
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <div className="text-[10px] text-slate-400">Amperaje R</div>
                      <div className="font-bold text-purple-700 dark:text-purple-300">{report.ampPhaseR} A</div>
                    </div>
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[10px] text-slate-400">Vibración</div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">{report.vibrationMmS} mm/s</div>
                    </div>
                  </div>
                )}

                {/* Rejection Notes Banner if any */}
                {report?.adminNotes && status === 'RECHAZADO_CORRECCION' && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Observación para el Técnico:
                    </div>
                    <p className="text-[11px] mt-0.5 line-clamp-2">{report.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Factura Relacionada:</span>
                  {associatedInvoice ? (
                    <button
                      onClick={() => onViewInvoice(associatedInvoice.id)}
                      className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {associatedInvoice.invoiceNumber} ({formatCOP(associatedInvoice.totalCOP)})
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 italic">Pendiente Factura</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    Inspeccionar Ficha
                  </button>

                  {status === 'PENDIENTE_VALIDACION' && (
                    <>
                      <button
                        onClick={() => handleApprove(order)}
                        title="Aprobar y Enviar Copia al Cliente"
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setRejectionModalOrder(order);
                          setAdminNotesInput('');
                        }}
                        title="Devolver al Técnico para Corrección"
                        className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No se encontraron reportes con ese criterio</h3>
            <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o la búsqueda.</p>
          </div>
        )}
      </div>

      {/* FULL INSPECTION MODAL */}
      {selectedOrder && selectedOrder.technicalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Ficha Técnica & Control de Trabajo {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cliente: <strong>{selectedOrder.clientName}</strong> • Realizado el {formatDate(selectedOrder.technicalReport.date)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Approval Status Banner inside Modal */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              selectedOrder.technicalReport.approvalStatus === 'APROBADO_ENVIADO'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : selectedOrder.technicalReport.approvalStatus === 'RECHAZADO_CORRECCION'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}>
              <div className="flex items-center gap-2.5 text-xs font-bold">
                {selectedOrder.technicalReport.approvalStatus === 'APROBADO_ENVIADO' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : selectedOrder.technicalReport.approvalStatus === 'RECHAZADO_CORRECCION' ? (
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 flex-shrink-0 animate-pulse" />
                )}
                <div>
                  <div className="text-sm">
                    {selectedOrder.technicalReport.approvalStatus === 'APROBADO_ENVIADO'
                      ? 'Estado: Reporte Aprobado y Copia Enviada al Cliente'
                      : selectedOrder.technicalReport.approvalStatus === 'RECHAZADO_CORRECCION'
                      ? 'Estado: Devuelto al Técnico para Corrección'
                      : 'Estado: Pendiente de Validación Administrativa'}
                  </div>
                  <div className="text-[11px] font-normal opacity-80">
                    Técnico Responsable: {selectedOrder.technicalReport.technicianName} ({selectedOrder.technicalReport.technicianDocument})
                  </div>
                </div>
              </div>

              {selectedOrder.technicalReport.approvalStatus === 'PENDIENTE_VALIDACION' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(selectedOrder)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar & Enviar
                  </button>

                  <button
                    onClick={() => {
                      setRejectionModalOrder(selectedOrder);
                      setAdminNotesInput('');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    Denegar / Revisar
                  </button>
                </div>
              )}
            </div>

            {/* Equipment and Electric Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-700">
                  <Wrench className="w-4 h-4 text-sky-500" />
                  Identificación del Equipo
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <p><strong>Tipo:</strong> {selectedOrder.technicalReport.equipmentType}</p>
                  <p><strong>Marca / Modelo:</strong> {selectedOrder.technicalReport.brand} {selectedOrder.technicalReport.model}</p>
                  <p><strong>Potencia:</strong> {selectedOrder.technicalReport.hpPower} HP • <strong>Fases:</strong> {selectedOrder.technicalReport.voltagePhase}</p>
                  <p><strong>Serial Placa:</strong> {selectedOrder.technicalReport.serialNumber}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-700">
                  <Gauge className="w-4 h-4 text-purple-500" />
                  Lecturas Hidráulicas & Eléctricas
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <p><strong>P. Succión:</strong> {selectedOrder.technicalReport.suctionPressurePsi} PSI</p>
                  <p><strong>P. Descarga:</strong> {selectedOrder.technicalReport.dischargePressurePsi} PSI</p>
                  <p><strong>Amp Fase R:</strong> {selectedOrder.technicalReport.ampPhaseR} A</p>
                  <p><strong>Amp Fase S:</strong> {selectedOrder.technicalReport.ampPhaseS} A</p>
                  <p><strong>Amp Fase T:</strong> {selectedOrder.technicalReport.ampPhaseT} A</p>
                  <p><strong>Vibración:</strong> {selectedOrder.technicalReport.vibrationMmS} mm/s</p>
                  <p className="col-span-2"><strong>Aislamiento Eléctrico:</strong> {selectedOrder.technicalReport.insulationResistanceMohm} MΩ</p>
                </div>
              </div>
            </div>

            {/* Diagnostic and Work performed */}
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Diagnóstico Técnico Inicial:</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedOrder.technicalReport.diagnosticDetails}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Trabajo Efectuado & Pruebas en Sitio:</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedOrder.technicalReport.workPerformed}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">Recomendaciones para el Cliente / Copropiedad:</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedOrder.technicalReport.recommendations}</p>
              </div>
            </div>

            {/* Materials and Spare parts */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                Materiales e Insumos Instalados ({selectedOrder.technicalReport.materialsUsed.length}):
              </span>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Descripción</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right">Vlr. Unitario</th>
                      <th className="p-2.5 text-right">Total COP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedOrder.technicalReport.materialsUsed.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-mono text-[11px]">{m.code}</td>
                        <td className="p-2.5 font-medium">{m.name}</td>
                        <td className="p-2.5 text-center">{m.quantity} {m.unit}</td>
                        <td className="p-2.5 text-right">{formatCOP(m.unitPriceCOP)}</td>
                        <td className="p-2.5 text-right font-bold">{formatCOP(m.totalCOP)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures & Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                <div className="text-slate-400 font-medium">Recibido a Conformidad por el Cliente:</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.technicalReport.clientNameSigner}</div>
                <div className="text-[11px] text-slate-500">
                  {selectedOrder.technicalReport.clientRoleSigner} • Doc: {selectedOrder.technicalReport.clientDocumentSigner}
                </div>
                <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Firma Digital Biométrica Registrada
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                <div className="text-slate-400 font-medium">Técnico Responsable Ejecutor:</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.technicalReport.technicianName}</div>
                <div className="text-[11px] text-slate-500">{selectedOrder.technicalReport.technicianDocument}</div>
                <div className="mt-2 text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Certificación CONTE / COPNIA Verificada
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Copia de Ficha
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION OBSERVATIONS MODAL */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-300 dark:border-rose-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Devolver Reporte para Corrección
                </h3>
                <p className="text-xs text-slate-500">Orden de Trabajo: {rejectionModalOrder.orderNumber}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones y Correcciones Requeridas por Administración:
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Ej: Favor anexar fotografía de la placa del motor con amperaje nominal y verificar lectura de vibración en el acople..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-md shadow-rose-600/30"
                >
                  Enviar Corrección al Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
