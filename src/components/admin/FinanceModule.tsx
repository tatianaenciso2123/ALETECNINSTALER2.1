import React, { useState } from 'react';
import { Invoice, CashTransaction, WorkOrder, CashTransactionType, CashCategory } from '../../types';
import { formatCOP, formatDate, formatDateTime } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Building,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Printer,
  PieChart as PieChartIcon,
  Receipt,
  Download,
  Landmark,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Tag,
  UserCheck,
  Building2,
} from 'lucide-react';

interface FinanceModuleProps {
  invoices: Invoice[];
  cashTransactions: CashTransaction[];
  orders: WorkOrder[];
  onAddCashTransaction: (transaction: CashTransaction) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: 'PAGADO' | 'PENDIENTE', method?: any) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  invoices,
  cashTransactions,
  orders,
  onAddCashTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cash_book' | 'profitability'>('overview');
  const [showNewCashModal, setShowNewCashModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<CashTransaction | null>(null);

  // Filter state for cash book
  const [cashTypeFilter, setCashTypeFilter] = useState<'ALL' | 'INGRESO' | 'EGRESO'>('ALL');
  const [cashSearch, setCashSearch] = useState('');

  // New Cash Transaction form state
  const [txType, setTxType] = useState<CashTransactionType>('INGRESO');
  const [newCashAmount, setNewCashAmount] = useState('');
  const [newCashClient, setNewCashClient] = useState('');
  const [newCashCategory, setNewCashCategory] = useState<CashCategory>('RECAUDO_SERVICIO');
  const [newCashConcept, setNewCashConcept] = useState('');
  const [newCashTech, setNewCashTech] = useState('Ing. Carlos Andrés Restrepo');
  const [newCashOrderNo, setNewCashOrderNo] = useState('');

  // Initial petty cash fund constant
  const INITIAL_CASH_FUND = 1500000;

  // Incomes and Expenses sum
  const totalCashIncomes = cashTransactions
    .filter((c) => (c.type || 'INGRESO') === 'INGRESO')
    .reduce((acc, curr) => acc + curr.amountCOP, 0);

  const totalCashExpenses = cashTransactions
    .filter((c) => c.type === 'EGRESO')
    .reduce((acc, curr) => acc + curr.amountCOP, 0);

  const currentPettyCashBalance = INITIAL_CASH_FUND + totalCashIncomes - totalCashExpenses;

  // Calculations for general invoices
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalCOP, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === 'PAGADO')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);
  const totalPending = invoices
    .filter((inv) => inv.paymentStatus === 'PENDIENTE')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const estimatedOperatingCosts = orders.length * 380000;
  const estimatedGrossProfit = totalCollected - estimatedOperatingCosts;
  const grossMarginPercent = totalCollected > 0 ? ((estimatedGrossProfit / totalCollected) * 100).toFixed(1) : '0';

  const handleCreateCashReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashAmount || !newCashClient) return;

    const prefix = txType === 'INGRESO' ? 'RC' : 'CE'; // RC: Recibo de Caja, CE: Comprobante de Egreso
    const receipt: CashTransaction = {
      id: `cash-${Date.now()}`,
      receiptNumber: `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: txType,
      category: newCashCategory,
      orderNumber: newCashOrderNo || (txType === 'INGRESO' ? 'OT-2026-COBRO' : 'GASTO-OPERATIVO'),
      clientName: newCashClient,
      amountCOP: parseFloat(newCashAmount),
      receivedByTechnician: newCashTech,
      concept: newCashConcept || (txType === 'INGRESO' ? 'Recaudo en efectivo servicio hidráulico' : 'Gasto menor operativo'),
      status: txType === 'INGRESO' ? 'PENDIENTE_ARQUEO' : 'ARQUEADO_EN_CAJA',
    };

    onAddCashTransaction(receipt);
    setShowNewCashModal(false);
    setNewCashAmount('');
    setNewCashClient('');
    setNewCashConcept('');
    setNewCashOrderNo('');
  };

  // Filtered cash transactions
  const filteredCashTransactions = cashTransactions.filter((tx) => {
    const type = tx.type || 'INGRESO';
    if (cashTypeFilter !== 'ALL' && type !== cashTypeFilter) return false;

    if (cashSearch.trim()) {
      const q = cashSearch.toLowerCase();
      const matchNum = tx.receiptNumber.toLowerCase().includes(q);
      const matchClient = tx.clientName.toLowerCase().includes(q);
      const matchConcept = tx.concept.toLowerCase().includes(q);
      const matchTech = tx.receivedByTechnician.toLowerCase().includes(q);
      if (!matchNum && !matchClient && !matchConcept && !matchTech) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <DollarSign className="w-4 h-4" />
            Módulo Financiero & Control de Caja Menor
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Gestión Financiera, Caja Menor & Rentabilidad
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control de liquidez, arqueo de ingresos (+) y egresos (-) en efectivo con actualización en tiempo real del saldo de caja menor.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('cash_book')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'cash_book'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Libro de Caja Menor ({cashTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'profitability'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Rentabilidad & P&G
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Cash Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Caja Menor</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCOP(currentPettyCashBalance)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-emerald-600 font-bold">+{formatCOP(totalCashIncomes)}</span>
            <span className="text-rose-600 font-bold">-{formatCOP(totalCashExpenses)}</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recaudo Total Cobrado</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCOP(totalCollected)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-sky-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Facturación electrónica liquidada</span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cuentas por Cobrar</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatCOP(totalPending)}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            {invoices.filter((i) => i.paymentStatus === 'PENDIENTE').length} facturas por cobrar
          </div>
        </div>

        {/* Gross Margin */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Margen Bruto Est.</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {grossMarginPercent}%
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            Utilidad est: {formatCOP(estimatedGrossProfit)}
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>Últimas Facturas & Estados de Recaudo</span>
              <span className="text-xs font-normal text-slate-400">Total: {invoices.length}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Factura</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Medio</th>
                    <th className="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">{inv.invoiceNumber}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.clientName}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{formatCOP(inv.totalCOP)}</td>
                      <td className="p-3 text-slate-500">{inv.paymentMethod || 'PSE'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.paymentStatus === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Petty Cash Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>Arqueo de Caja Menor</span>
              <Wallet className="w-5 h-5 text-emerald-600" />
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Fondo Inicial Asignado:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCOP(INITIAL_CASH_FUND)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>(+) Total Ingresos en Efectivo:</span>
                <span className="font-mono font-bold">+{formatCOP(totalCashIncomes)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>(-) Total Egresos / Gastos Menores:</span>
                <span className="font-mono font-bold">-{formatCOP(totalCashExpenses)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                <span>Saldo Neto Disponible:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCOP(currentPettyCashBalance)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTxType('INGRESO');
                  setNewCashCategory('RECAUDO_SERVICIO');
                  setShowNewCashModal(true);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+ Ingreso</span>
              </button>

              <button
                onClick={() => {
                  setTxType('EGRESO');
                  setNewCashCategory('GASTO_FERRETERIA');
                  setShowNewCashModal(true);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>- Egreso</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASH BOOK (LIBRO DE CAJA MENOR CON INGRESOS Y EGRESOS) */}
      {activeTab === 'cash_book' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Libro Auxiliar de Caja Menor (Ingresos & Egresos)
              </h2>
              <p className="text-xs text-slate-500">
                Auditoría y conciliación de todos los recaudos (+) y egresos/gastos (-) efectuados en efectivo por el personal operativo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTxType('INGRESO');
                  setNewCashCategory('RECAUDO_SERVICIO');
                  setShowNewCashModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Ingreso (+)</span>
              </button>

              <button
                onClick={() => {
                  setTxType('EGRESO');
                  setNewCashCategory('GASTO_FERRETERIA');
                  setShowNewCashModal(true);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Egreso (-)</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por recibo, cliente, técnico o concepto..."
                value={cashSearch}
                onChange={(e) => setCashSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCashTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  cashTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Todos ({cashTransactions.length})
              </button>
              <button
                onClick={() => setCashTypeFilter('INGRESO')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                  cashTypeFilter === 'INGRESO'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Ingresos (+)
              </button>
              <button
                onClick={() => setCashTypeFilter('EGRESO')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                  cashTypeFilter === 'EGRESO'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                Egresos (-)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Comprobante No.</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Beneficiario / Cliente</th>
                  <th className="p-3">Concepto & Categoría</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3 text-right">Monto COP</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCashTransactions.map((tx) => {
                  const isIncome = (tx.type || 'INGRESO') === 'INGRESO';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {tx.receiptNumber}
                      </td>
                      <td className="p-3 text-slate-500">{tx.date}</td>
                      <td className="p-3">
                        {isIncome ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            Ingreso (+)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            Egreso (-)
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {tx.clientName}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{tx.concept}</div>
                        {tx.orderNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {tx.orderNumber}</div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{tx.receivedByTechnician}</td>
                      <td className={`p-3 text-right font-black font-mono text-sm ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCOP(tx.amountCOP)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Ver</span>
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

      {/* TAB 3: PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Estado de Resultados Operativo & Análisis de Rentabilidad
            </h2>
            <p className="text-xs text-slate-500">Estimación consolidada de ingresos, costos directos de mano de obra y margen neto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Ingresos Operacionales (Ventas)</span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{formatCOP(totalBilled)}</div>
              <p className="text-[11px] text-slate-500">Facturación de contratos fijos y servicios de emergencia.</p>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
              <span className="font-bold text-rose-800 dark:text-rose-300">Costos Directos de Cuadrillas & Repuestos</span>
              <div className="text-xl font-black text-rose-700 dark:text-rose-400">-{formatCOP(estimatedOperatingCosts)}</div>
              <p className="text-[11px] text-slate-500">Combustible, insumos, amortización de herramientas y horas operario.</p>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-900/60 space-y-2">
              <span className="font-bold text-sky-800 dark:text-sky-300">Margen de Contribución Neto</span>
              <div className="text-xl font-black text-sky-700 dark:text-sky-400">{formatCOP(estimatedGrossProfit)}</div>
              <p className="text-[11px] text-slate-500">Rentabilidad neta del {grossMarginPercent}% sobre recaudo total.</p>
            </div>
          </div>
        </div>
      )}

      {/* NEW CASH RECEIPT / EXPENSE MODAL */}
      {showNewCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                {txType === 'INGRESO' ? (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    <span>Registrar Ingreso de Caja Menor (+)</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-5 h-5 text-rose-600" />
                    <span>Registrar Egreso / Gasto de Caja Menor (-)</span>
                  </>
                )}
              </h3>
              <button onClick={() => setShowNewCashModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                ✕
              </button>
            </div>

            {/* Toggle Income / Expense */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTxType('INGRESO');
                  setNewCashCategory('RECAUDO_SERVICIO');
                }}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  txType === 'INGRESO'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Ingreso (+) Suma a Caja</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTxType('EGRESO');
                  setNewCashCategory('GASTO_FERRETERIA');
                }}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  txType === 'EGRESO'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Egreso (-) Resta de Caja</span>
              </button>
            </div>

            <form onSubmit={handleCreateCashReceipt} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {txType === 'INGRESO' ? 'Copropiedad, Cliente o Pagador: *' : 'Beneficiario / Comercio / Proveedor: *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCashClient}
                    onChange={(e) => setNewCashClient(e.target.value)}
                    placeholder={txType === 'INGRESO' ? 'Ej: Conjunto Residencial Santa Ana' : 'Ej: Ferretería Central / Parqueadero'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monto en Efectivo ($ COP): *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCashAmount}
                    onChange={(e) => setNewCashAmount(e.target.value)}
                    placeholder="Ej: 250000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría de {txType === 'INGRESO' ? 'Ingreso' : 'Egreso'}: *
                  </label>
                  <select
                    value={newCashCategory}
                    onChange={(e) => setNewCashCategory(e.target.value as CashCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {txType === 'INGRESO' ? (
                      <>
                        <option value="RECAUDO_SERVICIO">💰 Recaudo de Servicio Hidráulico</option>
                        <option value="ANTICIPO_CLIENTE">💵 Anticipo de Cliente</option>
                        <option value="REINTEGRO_FONDO">🔄 Reintegro de Fondo a Caja</option>
                        <option value="OTRO">📋 Otro Ingreso</option>
                      </>
                    ) : (
                      <>
                        <option value="GASTO_FERRETERIA">🔩 Compra de Repuestos / Ferretería</option>
                        <option value="GASTO_TRANSPORTE">⛽ Combustible / Transporte / Parqueadero</option>
                        <option value="GASTO_ALIMENTACION">🍲 Alimentación Cuadrilla en Turno</option>
                        <option value="GASTO_PAPELERIA">📄 Papelería / Fotocopias / Planos</option>
                        <option value="SERVICIO_PUBLICO">💧 Pago Menor Servicios Públicos</option>
                        <option value="OTRO">📋 Otro Egreso Operativo</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {txType === 'INGRESO' ? 'Técnico que Recibe Dinero:' : 'Técnico que Realiza el Gasto:'}
                  </label>
                  <select
                    value={newCashTech}
                    onChange={(e) => setNewCashTech(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="Ing. Carlos Andrés Restrepo">Ing. Carlos Andrés Restrepo</option>
                    <option value="Tec. Mauricio Galvis Pardo">Tec. Mauricio Galvis Pardo</option>
                    <option value="Tec. Jhon Fredy Benítez">Tec. Jhon Fredy Benítez</option>
                    <option value="Ing. David Fernando Lozano">Ing. David Fernando Lozano</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Orden de Trabajo / Referencia:
                  </label>
                  <input
                    type="text"
                    value={newCashOrderNo}
                    onChange={(e) => setNewCashOrderNo(e.target.value)}
                    placeholder="Ej: OT-2026-0819"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Concepto Detallado del Movimiento: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCashConcept}
                    onChange={(e) => setNewCashConcept(e.target.value)}
                    placeholder={txType === 'INGRESO' ? 'Ej: Recaudo por mantenimiento preventivo y sellos mecánicos' : 'Ej: Compra de 2 uniones universales PVC 2 pulg y pegante rápido'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Live Preview Impact */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                txType === 'INGRESO'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <span className="font-bold">
                  {txType === 'INGRESO' ? 'Impacto: Sumará a Caja Menor' : 'Impacto: Restará de Caja Menor'}
                </span>
                <span className="font-black font-mono text-sm">
                  {txType === 'INGRESO' ? '+' : '-'}{formatCOP(parseFloat(newCashAmount) || 0)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCashModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 ${
                    txType === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{txType === 'INGRESO' ? 'Guardar Ingreso' : 'Guardar Egreso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT / EXPENSE VOUCHER MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {(viewingReceipt.type || 'INGRESO') === 'INGRESO' ? 'Recibo de Caja Menor (Ingreso)' : 'Comprobante de Egreso (Gasto Menor)'}
              </h3>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                ✕
              </button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${
              (viewingReceipt.type || 'INGRESO') === 'INGRESO'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300">{viewingReceipt.receiptNumber}</span>
                <span className="text-[11px] text-slate-500">{viewingReceipt.date}</span>
              </div>

              <div className={`text-2xl font-black font-mono ${
                (viewingReceipt.type || 'INGRESO') === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {(viewingReceipt.type || 'INGRESO') === 'INGRESO' ? '+' : '-'}{formatCOP(viewingReceipt.amountCOP)}
              </div>

              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div><strong>{(viewingReceipt.type || 'INGRESO') === 'INGRESO' ? 'Pagador / Cliente:' : 'Beneficiario / Proveedor:'}</strong> {viewingReceipt.clientName}</div>
                <div><strong>Concepto:</strong> {viewingReceipt.concept}</div>
                <div><strong>Responsable:</strong> {viewingReceipt.receivedByTechnician}</div>
                {viewingReceipt.orderNumber && (
                  <div><strong>Referencia / OT:</strong> {viewingReceipt.orderNumber}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
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
