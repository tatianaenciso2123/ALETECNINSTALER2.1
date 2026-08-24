import React, { useState } from 'react';
import { Invoice, PaymentMethod, PaymentStatus } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  ShieldCheck,
  QrCode,
  Sparkles,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Landmark,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Layers,
  ArrowRight,
  Receipt,
  Download,
  Trash2,
  XCircle,
} from 'lucide-react';

interface InvoicingModuleProps {
  invoices: Invoice[];
  onUpdateInvoiceStatus: (invoiceId: string, status: PaymentStatus, method?: PaymentMethod) => void;
  onApproveInvoice?: (invoiceId: string) => void;
  onSendInvoiceToClient?: (invoiceId: string) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
}

export const InvoicingModule: React.FC<InvoicingModuleProps> = ({
  invoices,
  onUpdateInvoiceStatus,
  onApproveInvoice,
  onSendInvoiceToClient,
  onDeleteInvoice,
}) => {
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedCustomDate, setSelectedCustomDate] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'PAGADO' | 'EN_VERIFICACION'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);
  const [manualPayModalInvoice, setManualPayModalInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [manualMethod, setManualMethod] = useState<PaymentMethod>('PSE');
  const [manualRef, setManualRef] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayStr = '2026-08-14';
  const yesterdayStr = '2026-08-13';

  // Filter invoices according to selected daily report filters
  const filteredInvoices = invoices.filter((inv) => {
    // Date filter
    if (selectedCustomDate) {
      if (inv.issueDate !== selectedCustomDate) return false;
    } else if (dateFilter === 'TODAY') {
      if (inv.issueDate !== todayStr) return false;
    } else if (dateFilter === 'YESTERDAY') {
      if (inv.issueDate !== yesterdayStr) return false;
    } else if (dateFilter === 'MONTH') {
      if (!inv.issueDate.startsWith('2026-08')) return false;
    }

    // Payment Status filter
    if (paymentStatusFilter !== 'ALL' && inv.paymentStatus !== paymentStatusFilter) return false;

    // Payment Method filter
    if (paymentMethodFilter !== 'ALL' && inv.paymentMethod !== paymentMethodFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchClient = inv.clientName.toLowerCase().includes(q);
      const matchNit = inv.clientNit.toLowerCase().includes(q);
      const matchOt = inv.orderNumber?.toLowerCase().includes(q) || false;
      if (!matchNum && !matchClient && !matchNit && !matchOt) return false;
    }

    return true;
  });

  // Daily Summary metrics based on filtered invoices
  const dailyTotalBilled = filteredInvoices.reduce((acc, curr) => acc + curr.totalCOP, 0);
  const dailyTotalCollected = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'PAGADO')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);
  const dailyTotalPending = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'PENDIENTE')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);
  const dailyTotalIva = filteredInvoices.reduce((acc, curr) => acc + curr.iva19COP, 0);

  const collectedByPse = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'PAGADO' && inv.paymentMethod === 'PSE')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const collectedByCash = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'PAGADO' && inv.paymentMethod === 'EFECTIVO_VERIFICADO')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const collectedByNequi = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'PAGADO' && (inv.paymentMethod === 'NEQUI' || inv.paymentMethod === 'DAVIPLATA'))
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const getMethodBadge = (method?: PaymentMethod) => {
    switch (method) {
      case 'PSE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Landmark className="w-3.5 h-3.5 text-sky-600" />
            PSE Débito
          </span>
        );
      case 'BANCOLOMBIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
            Bancolombia Directo
          </span>
        );
      case 'NEQUI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            Nequi QR / Celular
          </span>
        );
      case 'DAVIPLATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
            <Smartphone className="w-3.5 h-3.5 text-red-600" />
            Daviplata
          </span>
        );
      case 'EFECTIVO':
      case 'EFECTIVO_VERIFICADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            Efectivo / Caja Menor
          </span>
        );
      case 'OTROS_BANCOS':
      case 'TRANSFERENCIA_BANCARIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            Otros Bancos / ACH
          </span>
        );
      case 'TARJETA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            Tarjeta Crédito
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <CreditCard className="w-3.5 h-3.5" />
            PSE / Bancolombia
          </span>
        );
    }
  };

  const handleConfirmManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayModalInvoice) return;

    onUpdateInvoiceStatus(manualPayModalInvoice.id, 'PAGADO', manualMethod);
    setToastMessage(`Pago verificado y registrado para la Factura ${manualPayModalInvoice.invoiceNumber}`);
    setTimeout(() => setToastMessage(null), 4000);
    setManualPayModalInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
          <FileText className="w-4 h-4" />
          Facturación Electrónica DIAN & Informes Diarios
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Informes Diarios de Facturación & Proceso de Pagos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visualiza las facturas generadas por fecha, la forma de pago al lado y el ciclo completo de validación, envío y recaudo.
        </p>
      </div>

      {/* Daily Metrics Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Facturación del Período</span>
            <Receipt className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCOP(dailyTotalBilled)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {filteredInvoices.length} facturas electrónicas emitidas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Recaudado / Pagado</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCOP(dailyTotalCollected)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            PSE: {formatCOP(collectedByPse)} • Caja: {formatCOP(collectedByCash)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pendiente por Cobrar</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatCOP(dailyTotalPending)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {filteredInvoices.filter((i) => i.paymentStatus === 'PENDIENTE').length} facturas en espera de pago
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>IVA 19% Generado DIAN</span>
            <ShieldCheck className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCOP(dailyTotalIva)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Retención en la fuente estimada incluida
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Factura FE-XXXX, OT, Copropiedad o NIT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Specific Date Picker */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Fecha Específica:</label>
          <input
            type="date"
            value={selectedCustomDate}
            onChange={(e) => setSelectedCustomDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
          />
          {selectedCustomDate && (
            <button
              onClick={() => setSelectedCustomDate('')}
              className="text-xs text-sky-600 hover:underline font-bold"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Payment Status Dropdown */}
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium w-full md:w-auto"
        >
          <option value="ALL">Todos los Estados de Pago</option>
          <option value="PENDIENTE">Solo Pendientes de Pago</option>
          <option value="PAGADO">Solo Pagadas</option>
          <option value="EN_VERIFICACION">En Verificación</option>
        </select>
      </div>

      {/* DAILY INVOICES TABLE WITH PAYMENT METHOD AND PAYMENT PROCESS WORKFLOW */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Detalle Diario de Facturación & Estado de Pagos
            </h2>
            <p className="text-xs text-slate-500">
              Mostrando {filteredInvoices.length} facturas ordenadas por fecha con seguimiento de recaudos.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Informe Diario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Fecha & No. Factura</th>
                <th className="p-3.5">Copropiedad / Cliente</th>
                <th className="p-3.5">Valor Total COP</th>
                <th className="p-3.5">Forma de Pago al Lado</th>
                <th className="p-3.5">Proceso del Pago & Validación</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.paymentStatus === 'PAGADO';
                const isApproved = inv.approvalStatus === 'APROBADO_ENVIADO';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Date & Invoice Number */}
                    <td className="p-3.5">
                      <div className="font-mono font-black text-sky-600 dark:text-sky-400 text-xs">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {inv.issueDate} {inv.orderNumber && `• ${inv.orderNumber}`}
                      </div>
                    </td>

                    {/* Client Name & NIT */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {inv.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        NIT: {inv.clientNit}
                      </div>
                    </td>

                    {/* Total Amount & Breakdown */}
                    <td className="p-3.5">
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {formatCOP(inv.totalCOP)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Subtotal: {formatCOP(inv.subtotalCOP)} + IVA {formatCOP(inv.iva19COP)}
                      </div>
                    </td>

                    {/* FORMA DE PAGO AL LADO (Explicit requested column) */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        {getMethodBadge(inv.paymentMethod)}
                        {inv.paymentReference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {inv.paymentReference}
                          </div>
                        )}
                        {inv.paidDate && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Pagado el: {inv.paidDate}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* PROCESO DEL PAGO & WORKFLOW */}
                    <td className="p-3.5">
                      <div className="space-y-1.5">
                        {/* Process Step 1: Admin Validation */}
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            {isApproved ? 'Validada por Admin' : 'Pendiente Visto Bueno Admin'}
                          </span>
                        </div>

                        {/* Process Step 2: Payment Status Badge */}
                        <div>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Pago Verificado & Conciliado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              Pendiente de Pago (Vence {inv.dueDate})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Inspect full invoice */}
                        <button
                          onClick={() => setSelectedInvoiceForModal(inv)}
                          title="Ver Factura Electrónica Completa DIAN"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-sky-500" />
                        </button>

                        {/* Register payment manually if not paid */}
                        {!isPaid && (
                          <button
                            onClick={() => {
                              setManualPayModalInvoice(inv);
                              setManualRef(`REC-${Date.now().toString().slice(-6)}`);
                            }}
                            title="Registrar / Conciliar Pago"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete invoice button (for test / mistakes) */}
                        <button
                          onClick={() => setInvoiceToDelete(inv)}
                          title="Eliminar Factura (por error o prueba)"
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron facturas para la fecha o filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ELECTRONIC INVOICE MODAL (DIAN FORMAT) */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Invoice Top Brand Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <BrandLogo size="md" />

              <div className="text-right space-y-1">
                <div className="font-mono text-xl font-black text-sky-600 dark:text-sky-400">
                  {selectedInvoiceForModal.invoiceNumber}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Factura Electrónica de Venta
                </div>
                <div className="text-[11px] text-slate-400">
                  Fecha Emisión: {selectedInvoiceForModal.issueDate} • Vence: {selectedInvoiceForModal.dueDate}
                </div>
              </div>
            </div>

            {/* Buyer and Seller Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Emisor:</span>
                <p className="font-bold mt-1 text-slate-800 dark:text-slate-200">ALE. TECNINSTALER S.A.S.</p>
                <p className="text-slate-500">NIT: 901.485.920-3</p>
                <p className="text-slate-500">Calle 80 # 69-15, Bogotá D.C.</p>
                <p className="text-slate-500">Línea 24/7: 300 447 8151</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Adquirente / Cliente:</span>
                <p className="font-bold mt-1 text-slate-800 dark:text-slate-200">{selectedInvoiceForModal.clientName}</p>
                <p className="text-slate-500">NIT: {selectedInvoiceForModal.clientNit}</p>
                <p className="text-slate-500">{selectedInvoiceForModal.clientAddress}</p>
                <p className="text-slate-500">{selectedInvoiceForModal.clientEmail}</p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Detalle de Conceptos & Servicios Facturados:</span>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Descripción</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Vlr. Unitario</th>
                      <th className="p-3 text-right">Total COP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedInvoiceForModal.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatCOP(item.unitPriceCOP)}</td>
                        <td className="p-3 text-right font-bold">{formatCOP(item.totalCOP)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals & Taxes */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Payment Method & DIAN CUFE */}
              <div className="space-y-2 flex-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white">Forma de Pago:</span>
                  <div className="mt-1">{getMethodBadge(selectedInvoiceForModal.paymentMethod)}</div>
                  {selectedInvoiceForModal.paymentStatus === 'PAGADO' ? (
                    <div className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Estado: Pagada ({selectedInvoiceForModal.paidDate})
                    </div>
                  ) : (
                    <div className="text-amber-600 font-bold text-[11px] flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      Estado: Pendiente por Cobrar
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 break-all font-mono">
                  <strong>CUFE DIAN:</strong> {selectedInvoiceForModal.dianCufe || 'CUFE-PROV-9014587203-20260814'}
                </div>
              </div>

              {/* Math Totals */}
              <div className="w-full sm:w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCOP(selectedInvoiceForModal.subtotalCOP)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IVA (19%):</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCOP(selectedInvoiceForModal.iva19COP)}</span>
                </div>
                {selectedInvoiceForModal.retencionFuenteCOP > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>ReteFuente (4%):</span>
                    <span className="font-medium text-rose-600">-{formatCOP(selectedInvoiceForModal.retencionFuenteCOP)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCOP(selectedInvoiceForModal.totalCOP)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Factura
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const inv = selectedInvoiceForModal;
                    setSelectedInvoiceForModal(null);
                    setInvoiceToDelete(inv);
                  }}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-800"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar / Anular de Prueba
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceForModal(null)}
                className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE INVOICE MODAL (FOR MISTAKES OR TEST INVOICES) */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/40 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Eliminar Factura del Sistema
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Corrección de errores o registros de prueba
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  ¿Está seguro de eliminar esta factura? Si fue creada como <strong>prueba</strong> o por <strong>equivocación</strong>, se borrará definitivamente y se recalcularán los totales diarios de facturación.
                </div>
              </div>

              {/* Invoice snapshot */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Factura:</span>
                  <strong className="font-mono text-sky-600 dark:text-sky-400">{invoiceToDelete.invoiceNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Copropiedad / Cliente:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{invoiceToDelete.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha de Emisión:</span>
                  <span className="text-slate-700 dark:text-slate-300">{invoiceToDelete.issueDate}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Valor Facturado:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCOP(invoiceToDelete.totalCOP)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteInvoice) {
                    onDeleteInvoice(invoiceToDelete.id);
                  }
                  setToastMessage(`Factura ${invoiceToDelete.invoiceNumber} eliminada correctamente.`);
                  setTimeout(() => setToastMessage(null), 4000);
                  setInvoiceToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/40 flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                Sí, Eliminar Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL PAYMENT CONCILIATION MODAL */}
      {manualPayModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/40 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600">
                <DollarSign className="w-6 h-6" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Registrar / Conciliar Pago
                </h3>
              </div>
              <button onClick={() => setManualPayModalInvoice(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmManualPayment} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <div className="text-slate-500">Factura No: <strong>{manualPayModalInvoice.invoiceNumber}</strong></div>
                <div className="text-slate-500">Cliente: <strong>{manualPayModalInvoice.clientName}</strong></div>
                <div className="text-base font-black text-emerald-600">Total: {formatCOP(manualPayModalInvoice.totalCOP)}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medio de Recaudo Efectuado:
                </label>
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="PSE">PSE (Débito en línea cualquier banco)</option>
                  <option value="BANCOLOMBIA">Bancolombia (Transferencia / QR Directo)</option>
                  <option value="NEQUI">Nequi (Recaudo QR / Teléfono)</option>
                  <option value="DAVIPLATA">Daviplata (Recaudo QR / Teléfono)</option>
                  <option value="EFECTIVO">Efectivo en Caja Menor (Recibo de Caja)</option>
                  <option value="OTROS_BANCOS">Otros Bancos (Davivienda, BBVA, Bogotá, etc.)</option>
                  <option value="TARJETA">Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No. de Comprobante / CUS / Recibo de Caja:
                </label>
                <input
                  type="text"
                  required
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="Ej: CUS-894102 / RC-2026-0422"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualPayModalInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
