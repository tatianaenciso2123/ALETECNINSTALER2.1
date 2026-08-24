import React, { useState } from 'react';
import { WorkOrder } from '../../types';
import { XCircle, X, AlertTriangle, MessageSquare, Send, ShieldAlert, Building, Clock } from 'lucide-react';

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: WorkOrder | null;
  onConfirmReject: (orderId: string, rejectionReason: string) => void;
}

const PRESET_REASONS = [
  'Capacidad operativa copada para la fecha y horario solicitados. Favor reagendar en otra franja.',
  'El requerimiento requiere cotización previa formal de repuestos especiales antes de programar visita.',
  'El equipo reportado no se encuentra cubierto bajo la póliza o contrato de mantenimiento vigente.',
  'Incompatibilidad técnica con los datos suministrados. Se requiere visita de inspección preliminar.',
  'La copropiedad presenta mora pendiente en facturación electrónica previa.',
];

export const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setIsSubmitting(true);
    onConfirmReject(order.id, rejectionReason.trim());
    setIsSubmitting(false);
    setRejectionReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 max-w-xl w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-500/10 border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Rechazar Solicitud de Servicio
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {order.orderNumber} • {order.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Order Snapshot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-500" />
                {order.clientName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                {order.priority}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <strong>Equipo:</strong> {order.equipmentType}
            </div>
            <div className="text-slate-500 text-[11px]">
              <strong>Reporte del cliente:</strong> {order.reportedIssue}
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Plantillas de Motivos Frecuentes (Clic para aplicar):
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectionReason(preset)}
                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition-colors ${
                    rejectionReason === preset
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                  }`}
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Description Textarea */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Descripción Detallada del Rechazo (Obligatorio):</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {rejectionReason.length} caracteres
              </span>
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explique detalladamente al cliente por qué no es viable atender la solicitud en los términos indicados..."
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Warning notice */}
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2 text-rose-800 dark:text-rose-300 text-[11px]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong>Notificación Automática:</strong> Al confirmar, el cliente recibirá una alerta en tiempo real con este motivo y el estado de la solicitud cambiará a <strong>RECHAZADA</strong>.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!rejectionReason.trim() || isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Rechazo y Notificar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
