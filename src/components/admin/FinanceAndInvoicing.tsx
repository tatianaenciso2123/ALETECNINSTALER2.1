import React, { useState } from 'react';
import { Invoice, CashTransaction, WorkOrder } from '../../types';
import { formatCOP, formatDate, formatDateTime } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  FileText,
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  Wallet,
  ShieldCheck,
  QrCode,
  Sparkles,
  Plus,
  Lock,
} from 'lucide-react';

interface FinanceAndInvoicingProps {
  invoices: Invoice[];
  cashTransactions: CashTransaction[];
  orders: WorkOrder[];
  onAddCashTransaction: (transaction: CashTransaction) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: 'PAGADO' | 'PENDIENTE', method?: any) => void;
}

export const FinanceAndInvoicing: React.FC<FinanceAndInvoicingProps> = ({
  invoices,
  cashTransactions,
  orders,
  onAddCashTransaction,
  onUpdateInvoiceStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoicing' | 'cash_book' | 'bi_analytics'>('invoicing');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [showNewCashModal, setShowNewCashModal] = useState(false);

  // New Cash Transaction form state
  const [newCashAmount, setNewCashAmount] = useState('');
  const [newCashClient, setNewCashClient] = useState('');
  const [newCashConcept, setNewCashConcept] = useState('');
  const [newCashTech, setNewCashTech] = useState('Ing. Carlos Andrés Restrepo');

  // Calculations
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalCOP, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === 'PAGADO')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);
  const totalPending = invoices
    .filter((inv) => inv.paymentStatus === 'PENDIENTE')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);
  const totalIvaRecaudado = invoices
    .filter((inv) => inv.paymentStatus === 'PAGADO')
    .reduce((acc, curr) => acc + curr.iva19COP, 0);

  const totalCashInBox = cashTransactions
    .filter((c) => c.status === 'ARQUEADO_EN_CAJA')
    .reduce((acc, curr) => acc + curr.amountCOP, 0);

  const pendingCashReconciliation = cashTransactions
    .filter((c) => c.status === 'PENDIENTE_ARQUEO')
    .reduce((acc, curr) => acc + curr.amountCOP, 0);

  const handleCreateCashReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashAmount || !newCashClient) return;

    const receipt: CashTransaction = {
      id: `cash-${Date.now()}`,
      receiptNumber: `RC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      orderNumber: 'OT-2026-COBRO',
      clientName: newCashClient,
      amountCOP: parseFloat(newCashAmount),
      receivedByTechnician: newCashTech,
      concept: newCashConcept || 'Pago en efectivo de servicio hidráulico',
      status: 'PENDIENTE_ARQUEO',
    };

    onAddCashTransaction(receipt);
    setShowNewCashModal(false);
    setNewCashAmount('');
    setNewCashClient('');
    setNewCashConcept('');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Finanzas, Facturación Electrónica DIAN & BI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión contable integral, control de caja de pagos en efectivo y análisis financiero predictivo.
          </p>
        </div>

        {/* SubTab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('invoicing')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'invoicing'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Facturación DIAN ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('cash_book')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'cash_book'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Libro de Caja & Efectivo
          </button>
          <button
            onClick={() => setActiveSubTab('bi_analytics')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'bi_analytics'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Business Intelligence (BI)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Facturado (Periodo)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCOP(totalBilled)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Incluye IVA 19% y retenciones</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Recaudado Efectivo & Bancos</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCOP(totalCollected)}
          </div>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-500 mt-1">82.5% de efectividad de cobro</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Cartera Pendiente por Cobrar</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCOP(totalPending)}
          </div>
          <div className="text-xs text-amber-700/80 mt-1">Copropiedades con vencimiento a 15 días</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase">Caja Menor / Recaudos Efectivo</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {formatCOP(totalCashInBox)}
          </div>
          <div className="text-xs text-sky-700 dark:text-sky-400 mt-1">
            {formatCOP(pendingCashReconciliation)} pendientes de arqueo
          </div>
        </div>
      </div>

      {/* VIEW 1: Facturación Electrónica DIAN */}
      {activeSubTab === 'invoicing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Invoice List (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Facturas Electrónicas Emitidas</h3>
              <span className="text-xs text-slate-400">Validación previa DIAN</span>
            </div>

            <div className="space-y-2.5">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
                      {inv.clientName}
                    </div>
                    <div className="text-[11px] text-slate-500">NIT: {inv.clientNit}</div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-xs">
                      <span className="text-slate-400">Fecha: {formatDate(inv.issueDate)}</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCOP(inv.totalCOP)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoice Document Preview & DIAN Template (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {selectedInvoice ? (
              <div className="space-y-6">
                {/* Actions bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      Documento Oficial DIAN
                    </span>
                    {selectedInvoice.paymentStatus === 'PENDIENTE' && (
                      <button
                        onClick={() => onUpdateInvoiceStatus(selectedInvoice.id, 'PAGADO', 'EFECTIVO_VERIFICADO')}
                        className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                      >
                        Marcar como Pagado
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintInvoice}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir / PDF
                    </button>
                  </div>
                </div>

                {/* Printable Invoice Sheet Frame with Brand Logo and Watermark */}
                <div className="relative p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
                  {/* Watermark in background */}
                  <BrandLogo isWatermark className="absolute inset-0 m-auto" />

                  {/* Document Header */}
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <BrandLogo size="sm" showText={true} textVariant="full" theme="dark" />
                      <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                        <div><strong>NIT:</strong> 901.458.720-3 | Régimen Responsable de IVA</div>
                        <div><strong>Actividad Económica:</strong> 4322 Instalaciones hidráulicas y sanitarias</div>
                        <div><strong>Sede Principal:</strong> Calle 80 # 69-42, Bogotá D.C.</div>
                        <div><strong>PBX:</strong> (601) 745-9000 | info@tecninstaler.com</div>
                      </div>
                    </div>

                    <div className="text-right sm:self-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-xs font-bold text-sky-600 uppercase tracking-wide">
                        Factura Electrónica de Venta
                      </div>
                      <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                        {selectedInvoice.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Emisión: {selectedInvoice.issueDate} | Vence: {selectedInvoice.dueDate}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Adquirente / Cliente:</div>
                      <div className="font-bold text-slate-900 dark:text-white">{selectedInvoice.clientName}</div>
                      <div className="text-slate-600 dark:text-slate-300">NIT: {selectedInvoice.clientNit}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Dirección & Notificaciones:</div>
                      <div className="text-slate-700 dark:text-slate-300">{selectedInvoice.clientAddress}</div>
                      <div className="text-slate-500">{selectedInvoice.clientEmail}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="relative z-10 py-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 text-[11px] uppercase">
                          <th className="text-left py-1.5">Descripción del Servicio / Repuesto</th>
                          <th className="text-center py-1.5 w-12">Cant.</th>
                          <th className="text-right py-1.5 w-24">V. Unitario</th>
                          <th className="text-right py-1.5 w-28">Total COP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {selectedInvoice.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 text-slate-800 dark:text-slate-200 font-medium">
                              {item.description}
                            </td>
                            <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2 text-right text-slate-600">{formatCOP(item.unitPriceCOP)}</td>
                            <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                              {formatCOP(item.totalCOP)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="relative z-10 flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="w-64 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Subtotal Servicios:</span>
                        <span className="font-semibold">{formatCOP(selectedInvoice.subtotalCOP)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>IVA (19%):</span>
                        <span className="font-semibold">{formatCOP(selectedInvoice.iva19COP)}</span>
                      </div>
                      {selectedInvoice.retencionFuenteCOP > 0 && (
                        <div className="flex justify-between text-rose-600 dark:text-rose-400">
                          <span>Retención en la Fuente (4%):</span>
                          <span className="font-semibold">-{formatCOP(selectedInvoice.retencionFuenteCOP)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-700">
                        <span>Total a Pagar:</span>
                        <span className="text-sky-600 dark:text-sky-400">{formatCOP(selectedInvoice.totalCOP)}</span>
                      </div>
                    </div>
                  </div>

                  {/* DIAN CUFE & QR */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="space-y-1 max-w-sm">
                      <div className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Código Único de Factura Electrónica (CUFE):
                      </div>
                      <div className="font-mono break-all text-[9px] text-slate-400">
                        {selectedInvoice.dianCufe || 'CUFE-PROV-9014587203-2026-08-14-DIAN-AUTORIZADO'}
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200 dark:border-slate-700">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Seleccione una factura para visualizar el comprobante oficial.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Libro de Caja & Pagos en Efectivo */}
      {activeSubTab === 'cash_book' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-sky-600" />
                Control de Recaudos en Efectivo & Arqueos de Caja
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro de dineros recibidos en campo por técnicos con comprobante de ingreso firmado.
              </p>
            </div>

            <button
              onClick={() => setShowNewCashModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Recibo de Caja en Efectivo
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Recibo</th>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Cliente / Copropiedad</th>
                    <th className="py-3 px-4">Concepto del Pago</th>
                    <th className="py-3 px-4">Técnico Receptor</th>
                    <th className="py-3 px-4 text-right">Monto Recibido</th>
                    <th className="py-3 px-4 text-center">Estado de Arqueo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cashTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700 dark:text-sky-400">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {tx.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {tx.concept}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {tx.receivedByTechnician}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCOP(tx.amountCOP)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            tx.status === 'ARQUEADO_EN_CAJA'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {tx.status === 'ARQUEADO_EN_CAJA' ? 'Arqueado en Caja' : 'Pendiente Arqueo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Business Intelligence (BI) Analytics */}
      {activeSubTab === 'bi_analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Distribution by Hydraulic System */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-sky-600" />
              Rentabilidad por Línea de Servicio
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Sistemas Hidroneumáticos & VFD', percent: 45, value: 18500000, color: 'bg-sky-500' },
                { name: 'Redes Contra Incendio (RCI)', percent: 28, value: 11500000, color: 'bg-rose-500' },
                { name: 'Lavado y Desinfección Tanques', percent: 17, value: 7000000, color: 'bg-emerald-500' },
                { name: 'Suministro Repuestos & Sellos', percent: 10, value: 4100000, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-900 dark:text-white">{formatCOP(item.value)} ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Gateway Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Canales de Recaudo en Colombia
            </h3>

            <div className="space-y-3">
              {[
                { channel: 'PSE (Transferencia ACH)', share: '48%', trend: '+12%' },
                { channel: 'Nequi & Daviplata QR', share: '24%', trend: '+35%' },
                { channel: 'Efectivo en Sitio Verificado', share: '18%', trend: '-5%' },
                { channel: 'Tarjetas de Crédito/Débito', share: '10%', trend: '+8%' },
              ].map((c) => (
                <div key={c.channel} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.channel}</span>
                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white">{c.share}</span>
                    <span className="ml-2 text-[10px] text-emerald-600 font-bold">{c.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive MTBF Savings Matrix */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Ahorro por Mantenimiento Preventivo IA
            </h3>

            <p className="text-xs text-slate-500">
              El diagnóstico predictivo de vibración y cavitación previno 14 paradas de bombeo mayores este trimestre.
            </p>

            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
              <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                Ahorro Estimado para Clientes:
              </div>
              <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                $42.500.000 COP
              </div>
              <div className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                En rebobinados de emergencia y multas por desabastecimiento de agua potable.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Cash Receipt Form */}
      {showNewCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Generar Comprobante de Efectivo
              </h3>
              <button
                onClick={() => setShowNewCashModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCashReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cliente o Conjunto Residencial:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conjunto Residencial Cerros de Sotavento"
                  value={newCashClient}
                  onChange={(e) => setNewCashClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto Recibido en Efectivo (COP):
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 1250000"
                  value={newCashAmount}
                  onChange={(e) => setNewCashAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Concepto del Pago:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mantenimiento bomba y cambio de sellos"
                  value={newCashConcept}
                  onChange={(e) => setNewCashConcept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Técnico que Recibe en Sitio:
                </label>
                <select
                  value={newCashTech}
                  onChange={(e) => setNewCashTech(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Ing. Carlos Andrés Restrepo">Ing. Carlos Andrés Restrepo</option>
                  <option value="Tec. Mauricio Galvis Pardo">Tec. Mauricio Galvis Pardo</option>
                  <option value="Tec. Jhon Fredy Benítez">Tec. Jhon Fredy Benítez</option>
                  <option value="Ing. David Fernando Lozano">Ing. David Fernando Lozano</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewCashModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Guardar Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
