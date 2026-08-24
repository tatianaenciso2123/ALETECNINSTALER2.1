import React, { useState } from 'react';
import { WorkOrder, Technician } from '../../types';
import { CheckCircle2, X, UserCheck, Calendar, Clock, Send, ShieldCheck, Building, Wrench } from 'lucide-react';

interface AcceptRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: WorkOrder | null;
  technicians: Technician[];
  onConfirmAccept: (
    orderId: string,
    assignedTechId: string,
    scheduledDate: string,
    scheduledTime: string,
    adminNotes?: string
  ) => void;
}

export const AcceptRequestModal: React.FC<AcceptRequestModalProps> = ({
  isOpen,
  onClose,
  order,
  technicians,
  onConfirmAccept,
}) => {
  const [assignedTechId, setAssignedTechId] = useState<string>(technicians[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>(order?.scheduledDate || new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState<string>(order?.scheduledTime || '09:00 AM');
  const [adminNotes, setAdminNotes] = useState<string>('Solicitud aprobada por Gerencia de Operaciones. Cuadrilla asignada.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with order changes
  React.useEffect(() => {
    if (order) {
      setScheduledDate(order.scheduledDate || new Date().toISOString().split('T')[0]);
      setScheduledTime(order.scheduledTime || '09:00 AM');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTechId) return;

    setIsSubmitting(true);
    onConfirmAccept(order.id, assignedTechId, scheduledDate, scheduledTime, adminNotes);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 max-w-xl w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Aprobar y Programar Solicitud de Servicio
              </h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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
          {/* Order Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-500" />
                {order.clientName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                {order.priority}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <strong>Equipo Solicitado:</strong> {order.equipmentType}
            </div>
            <div className="text-slate-500 text-[11px]">
              <strong>Falla / Requerimiento:</strong> {order.reportedIssue}
            </div>
          </div>

          {/* Assign Technician */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Técnico o Cuadrilla Asignada:</span>
            </label>
            <select
              required
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.specialty} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Fecha Programada:</span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Horario Previsto:</span>
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="08:00 AM">08:00 AM (Primera franja)</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="02:00 PM">02:00 PM (Tarde)</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="Inmediata 24/7">Inmediata 24/7 (Emergencia)</option>
              </select>
            </div>
          </div>

          {/* Notes for Client & Tech */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Observaciones / Instrucciones para la Cuadrilla y el Cliente:
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Instrucciones especiales para la visita..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Notification notice */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <strong>Notificación en Tiempo Real:</strong> Se enviará un aviso inmediato al cliente con la confirmación de la visita y los datos del técnico asignado.
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Aprobar y Notificar al Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
