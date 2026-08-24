import React from 'react';
import { AppNotification, WorkOrder } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  AlertTriangle,
  ArrowRight,
  X,
  Trash2,
  Check,
  UserCheck,
  Wrench,
  Package,
  Building,
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  FileEdit,
  Tag,
} from 'lucide-react';

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  orders?: WorkOrder[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string, meta?: any) => void;
  onMarkAsRead?: (id: string) => void;
  onDeleteNotification?: (id: string) => void;
  onOpenReportSheet?: (order: WorkOrder) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  orders = [],
  isOpen,
  onClose,
  onNavigateToTab,
  onMarkAsRead,
  onDeleteNotification,
  onOpenReportSheet,
}) => {
  if (!isOpen || !notification) return null;

  // Find linked order if applicable
  const matchedOrder = orders.find(
    (o) => o.id === notification.orderId || o.orderNumber === notification.orderNumber
  );

  const getIconAndStyle = () => {
    switch (notification.type) {
      case 'EMERGENCIA':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
          badge: 'EMERGENCIA 24/7',
          badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
      case 'INVOICE_GENERATED':
        return {
          icon: Receipt,
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
          badge: 'FACTURACIÓN DIAN',
          badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'REPORT_SUBMITTED':
        return {
          icon: FileText,
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          badge: 'REPORTE DE CAMPO',
          badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'PAYMENT_RECEIVED':
        return {
          icon: CheckCircle2,
          bg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
          badge: 'PAGO RECIBIDO',
          badgeBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
        };
      case 'TECH_ASSIGNED':
        return {
          icon: UserCheck,
          bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
          badge: 'SERVICIO ASIGNADO AL TÉCNICO',
          badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
        };
      case 'SERVICE_REQUESTED':
        return {
          icon: Wrench,
          bg: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
          badge: 'SOLICITUD DE SERVICIO CLIENTE',
          badgeBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        };
      case 'PART_PURCHASED':
        return {
          icon: Package,
          bg: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
          badge: 'COMPRA DE REPUESTOS',
          badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
        };
      default:
        return {
          icon: Bell,
          bg: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
          badge: 'NOTIFICACIÓN DEL SISTEMA',
          badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        };
    }
  };

  const { icon: IconComponent, bg, badge, badgeBg } = getIconAndStyle();

  const handleOpenReport = () => {
    if (onMarkAsRead) onMarkAsRead(notification.id);
    if (matchedOrder && onOpenReportSheet) {
      onOpenReportSheet(matchedOrder);
    } else if (notification.actionTab && onNavigateToTab) {
      onNavigateToTab(notification.actionTab, {
        orderId: notification.orderId,
        orderNumber: notification.orderNumber,
        targetRole: notification.targetRole,
      });
    }
    onClose();
  };

  const handleAction = () => {
    if (onMarkAsRead) onMarkAsRead(notification.id);
    if (notification.actionTab && onNavigateToTab) {
      onNavigateToTab(notification.actionTab, {
        orderId: notification.orderId,
        invoiceId: notification.invoiceId,
        orderNumber: notification.orderNumber,
        targetRole: notification.targetRole,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-7 landscape:p-4 max-w-2xl w-full shadow-2xl space-y-3 sm:space-y-4 relative my-auto max-h-[92vh] landscape:max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border ${bg}`}>
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className={`inline-block text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${badgeBg}`}>
                {badge}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">
                {notification.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-3 sm:space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Emitida: {notification.timestamp}</span>
            <span>•</span>
            <span>Estado: {notification.read ? 'Leída' : 'No leída (Nueva)'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            {notification.message}
          </div>

          {/* Formato que el cliente llenó si existe orden asociada */}
          {matchedOrder ? (
            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Formato de Solicitud de Visita Diligenciado por el Cliente
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  OT: {matchedOrder.orderNumber}
                </span>
              </div>

              {/* Client & Address Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-500" />
                    Datos de la Copropiedad / Cliente
                  </div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {matchedOrder.clientName}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{matchedOrder.clientAddress} • Barrio {matchedOrder.neighborhood}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Contacto: <strong>{matchedOrder.clientContact}</strong> ({matchedOrder.clientPhone})</span>
                  </div>
                </div>

                {/* Equipment & Schedule Info */}
                <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-500" />
                    Equipo Hidráulico & Programación
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {matchedOrder.equipmentType} ({matchedOrder.brand} {matchedOrder.model})
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                      Tipo: {matchedOrder.type}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        matchedOrder.priority === 'EMERGENCIA'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      Prioridad: {matchedOrder.priority}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Visita: <strong>{matchedOrder.scheduledDate}</strong> a las <strong>{matchedOrder.scheduledTime} hrs</strong></span>
                  </div>
                </div>
              </div>

              {/* Reported Problem filled by client */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Descripción de la Falla / Motivo de Visita (Llenado por el Cliente):
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed whitespace-pre-wrap">
                  {matchedOrder.reportedIssue || 'Mantenimiento preventivo periódico y calibración general de presión del sistema hidráulico.'}
                </div>
                {matchedOrder.notes && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <strong>Notas Adicionales de Acceso / Administración:</strong> {matchedOrder.notes}
                  </div>
                )}
              </div>
            </div>
          ) : (
            (notification.orderNumber || notification.invoiceNumber || notification.targetClientId) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {notification.orderNumber && (
                  <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-medium">
                    Orden de Trabajo: <strong className="font-mono">{notification.orderNumber}</strong>
                  </div>
                )}
                {notification.invoiceNumber && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                    Factura DIAN: <strong className="font-mono">{notification.invoiceNumber}</strong>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Footer Actions with specific options */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!notification.read && onMarkAsRead && (
              <button
                type="button"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Marcar como Leída
              </button>
            )}

            {onDeleteNotification && (
              <button
                type="button"
                onClick={() => {
                  onDeleteNotification(notification.id);
                  onClose();
                }}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Eliminar notificación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Cerrar button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cerrar
            </button>

            {/* If there's an associated order, give direct option to "Abrir Hoja de Reporte" */}
            {matchedOrder ? (
              <button
                type="button"
                onClick={handleOpenReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
              >
                <FileEdit className="w-4 h-4" />
                <span>Abrir Hoja de Reporte</span>
              </button>
            ) : notification.actionTab ? (
              <button
                type="button"
                onClick={handleAction}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 active:scale-95 transition-transform"
              >
                <span>Ir al Módulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

