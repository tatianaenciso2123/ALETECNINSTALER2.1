import React, { useState } from 'react';
import { SupplierBill, BankAccount, BillCategory, BillStatus, PaymentMethod, COLOMBIAN_BANKS } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { BrandLogo } from '../BrandLogo';
import {
  Building2,
  Receipt,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Printer,
  Search,
  Filter,
  Download,
  Landmark,
  Smartphone,
  Wallet,
  AlertTriangle,
  Zap,
  Droplets,
  Flame,
  Globe,
  Trash2,
  Check,
  X,
  Package,
  Wrench,
  Info,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface SupplierBillsModuleProps {
  supplierBills: SupplierBill[];
  bankAccounts: BankAccount[];
  onAddSupplierBill: (bill: SupplierBill) => void;
  onPaySupplierBill: (billId: string, paymentMethod: PaymentMethod, bankAccountId: string, paymentRef: string) => void;
  onDeleteSupplierBill?: (billId: string) => void;
  onAddBankAccount?: (account: BankAccount) => void;
  onUpdateBankAccountBalance?: (accountId: string, newBalance: number) => void;
}

export const SupplierBillsModule: React.FC<SupplierBillsModuleProps> = ({
  supplierBills,
  bankAccounts,
  onAddSupplierBill,
  onPaySupplierBill,
  onDeleteSupplierBill,
  onAddBankAccount,
  onUpdateBankAccountBalance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'bank_accounts' | 'analytics'>('bills');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [payingBill, setPayingBill] = useState<SupplierBill | null>(null);
  const [viewingBill, setViewingBill] = useState<SupplierBill | null>(null);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);

  // Form State for New Bill
  const [newBillNumber, setNewBillNumber] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierNit, setNewSupplierNit] = useState('');
  const [newCategory, setNewCategory] = useState<BillCategory>('SERVICIO_PUBLICO_AGUA');
  const [newMeterCode, setNewMeterCode] = useState('');
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDueDate, setNewDueDate] = useState('');
  const [newSubtotal, setNewSubtotal] = useState('');
  const [newTax, setNewTax] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Form State for Paying Bill
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANCOLOMBIA');
  const [selectedBankName, setSelectedBankName] = useState('Bancolombia');
  const [payBankAccountId, setPayBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [payReference, setPayReference] = useState('');

  // Form State for New Bank Account
  const [newBankName, setNewBankName] = useState('Bancolombia');
  const [newAccountType, setNewAccountType] = useState<'CORRIENTE' | 'AHORROS' | 'BILLETERA_DIGITAL' | 'CAJA_EFECTIVO'>('CORRIENTE');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newHolderName, setNewHolderName] = useState('ALE. TECNINSTALER S.A.S.');
  const [newHolderDoc, setNewHolderDoc] = useState('NIT 901.482.391-8');
  const [newInitialBalance, setNewInitialBalance] = useState('');
  const [newAccDescription, setNewAccDescription] = useState('');

  // Quick Utility Templates
  const applyUtilityTemplate = (templateType: string) => {
    switch (templateType) {
      case 'EAAB':
        setNewSupplierName('Empresa de Acueducto y Alcantarillado de Bogotá (EAAB)');
        setNewSupplierNit('NIT 899.999.094-1');
        setNewCategory('SERVICIO_PUBLICO_AGUA');
        setNewMeterCode('NIC 4829102 - Cuenta Contrato Sede Principal');
        setNewNotes('Factura de servicio de acueducto y alcantarillado sede operativa y laboratorio');
        break;
      case 'ENEL':
        setNewSupplierName('Enel Colombia S.A. ESP (Codensa)');
        setNewSupplierNit('NIT 860.007.822-9');
        setNewCategory('SERVICIO_PUBLICO_ENERGIA');
        setNewMeterCode('Cliente 3928104 - Tarifa Comercial Trifásica');
        setNewNotes('Consumo eléctrico banco de pruebas de motores hidráulicos y taller');
        break;
      case 'VANTI':
        setNewSupplierName('Vanti S.A. ESP (Gas Natural)');
        setNewSupplierNit('NIT 800.003.528-7');
        setNewCategory('SERVICIO_PUBLICO_GAS');
        setNewMeterCode('Ref. Pago 1092841');
        setNewNotes('Suministro de gas natural');
        break;
      case 'ETB':
        setNewSupplierName('ETB S.A. ESP (Telecomunicaciones)');
        setNewSupplierNit('NIT 899.999.115-8');
        setNewCategory('SERVICIO_PUBLICO_INTERNET');
        setNewMeterCode('Línea PBX 601 3004478 + Fibra Óptica 500M');
        setNewNotes('Internet dedicado y telefonía fija corporativa');
        break;
      case 'PAVCO':
        setNewSupplierName('Pavco Wavin Colombia S.A.S.');
        setNewSupplierNit('NIT 860.005.187-3');
        setNewCategory('PROVEEDOR_TUBERIAS');
        setNewMeterCode('');
        setNewNotes('Lote de tubería PVC RDE 21, accesorios CPVC y soldadura líquida');
        break;
      case 'BARNES':
        setNewSupplierName('Barnes de Colombia S.A.');
        setNewSupplierNit('NIT 860.032.190-4');
        setNewCategory('PROVEEDOR_EQUIPOS_BOMBAS');
        setNewMeterCode('');
        setNewNotes('Electrobombas centrífugas, impulsores y sellos mecánicos tipo 21');
        break;
      case 'CORONA':
        setNewSupplierName('Corona Industrial S.A.S. / Grival');
        setNewSupplierNit('NIT 890.900.279-0');
        setNewCategory('PROVEEDOR_REPUESTOS');
        setNewMeterCode('');
        setNewNotes('Griferías institucionales, fluxómetros y repuestos sanitarios');
        break;
    }
  };

  // Filtered Bills
  const filteredBills = supplierBills.filter((bill) => {
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'SERVICIOS_PUBLICOS') {
        if (!bill.category.startsWith('SERVICIO_PUBLICO')) return false;
      } else if (categoryFilter === 'PROVEEDORES') {
        if (!bill.category.startsWith('PROVEEDOR')) return false;
      } else if (bill.category !== categoryFilter) {
        return false;
      }
    }

    if (statusFilter !== 'ALL' && bill.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = bill.billNumber.toLowerCase().includes(q);
      const matchSupp = bill.supplierName.toLowerCase().includes(q);
      const matchNit = bill.supplierNitOrDocument.toLowerCase().includes(q);
      const matchMeter = bill.meterNumberOrServiceCode?.toLowerCase().includes(q) || false;
      if (!matchNum && !matchSupp && !matchNit && !matchMeter) return false;
    }

    return true;
  });

  // Financial Metrics
  const totalPendingBills = supplierBills
    .filter((b) => b.status === 'PENDIENTE')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const totalPaidBills = supplierBills
    .filter((b) => b.status === 'PAGADO')
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const totalUtilities = supplierBills
    .filter((b) => b.category.startsWith('SERVICIO_PUBLICO'))
    .reduce((acc, curr) => acc + curr.totalCOP, 0);

  const totalBankBalances = bankAccounts.reduce((acc, curr) => acc + curr.currentBalanceCOP, 0);

  const getCategoryBadge = (cat: BillCategory) => {
    switch (cat) {
      case 'SERVICIO_PUBLICO_AGUA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
            <Droplets className="w-3 h-3 text-sky-600" />
            Acueducto & Alcantarillado
          </span>
        );
      case 'SERVICIO_PUBLICO_ENERGIA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            <Zap className="w-3 h-3 text-amber-600" />
            Energía Eléctrica
          </span>
        );
      case 'SERVICIO_PUBLICO_GAS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300">
            <Flame className="w-3 h-3 text-orange-600" />
            Gas Natural
          </span>
        );
      case 'SERVICIO_PUBLICO_INTERNET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300">
            <Globe className="w-3 h-3 text-indigo-600" />
            Internet & PBX
          </span>
        );
      case 'PROVEEDOR_EQUIPOS_BOMBAS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
            <Wrench className="w-3 h-3 text-purple-600" />
            Bombas & Motores
          </span>
        );
      case 'PROVEEDOR_TUBERIAS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            <Layers className="w-3 h-3 text-emerald-600" />
            Tuberías & Válvulas
          </span>
        );
      case 'PROVEEDOR_REPUESTOS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300">
            <Package className="w-3 h-3 text-cyan-600" />
            Repuestos Hidráulicos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
            <Building2 className="w-3 h-3 text-slate-500" />
            Proveedor / Gasto
          </span>
        );
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillNumber || !newSupplierName || !newSubtotal) return;

    const subtotal = parseFloat(newSubtotal) || 0;
    const tax = parseFloat(newTax) || 0;
    const total = subtotal + tax;

    const bill: SupplierBill = {
      id: `bill-${Date.now()}`,
      billNumber: newBillNumber.trim(),
      supplierName: newSupplierName.trim(),
      supplierNitOrDocument: newSupplierNit.trim() || 'NIT No especificado',
      category: newCategory,
      meterNumberOrServiceCode: newMeterCode.trim() || undefined,
      issueDate: newIssueDate || new Date().toISOString().slice(0, 10),
      dueDate: newDueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      subtotalCOP: subtotal,
      taxCOP: tax,
      totalCOP: total,
      status: 'PENDIENTE',
      notes: newNotes.trim() || undefined,
    };

    onAddSupplierBill(bill);
    setShowNewBillModal(false);
    // Reset form
    setNewBillNumber('');
    setNewSupplierName('');
    setNewSupplierNit('');
    setNewMeterCode('');
    setNewSubtotal('');
    setNewTax('');
    setNewNotes('');
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill) return;

    onPaySupplierBill(payingBill.id, payMethod, payBankAccountId, payReference || `TRANSF-${Date.now().toString().slice(-6)}`);
    setPayingBill(null);
    setPayReference('');
  };

  const handleCreateBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber || !onAddBankAccount) return;

    const account: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      accountType: newAccountType,
      accountNumber: newAccountNumber.trim(),
      holderName: newHolderName.trim(),
      holderDocument: newHolderDoc.trim(),
      currentBalanceCOP: parseFloat(newInitialBalance) || 0,
      isDefault: false,
      description: newAccDescription.trim() || undefined,
    };

    onAddBankAccount(account);
    setShowNewAccountModal(false);
    setNewAccountNumber('');
    setNewInitialBalance('');
    setNewAccDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Building2 className="w-4 h-4" />
            Gestión de Egresos & Cuentas Bancarias
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Facturación de Proveedores, Servicios Públicos & Bancos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro de facturas por pagar (Acueducto, Energía, Gas, Telecomunicaciones, Tuberías y Bombas) y conciliación de cuentas bancarias asociadas.
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('bills')}
              className={`px-3 py-2 rounded-lg transition-all ${
                activeSubTab === 'bills'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Facturas & Servicios ({supplierBills.length})
            </button>
            <button
              onClick={() => setActiveSubTab('bank_accounts')}
              className={`px-3 py-2 rounded-lg transition-all ${
                activeSubTab === 'bank_accounts'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cuentas Bancarias ({bankAccounts.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewBillModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 text-xs transition-transform active:scale-95"
            id="btn-new-supplier-bill"
          >
            <Plus className="w-4 h-4" />
            <span>Radicar Factura / Servicio</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cuentas por Pagar</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-200 font-mono">
            {formatCOP(totalPendingBills)}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {supplierBills.filter((b) => b.status === 'PENDIENTE').length} facturas pendientes de pago
          </div>
        </div>

        {/* Total Utilities */}
        <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sky-700 dark:text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">Servicios Públicos Mes</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-sky-950 dark:text-sky-200 font-mono">
            {formatCOP(totalUtilities)}
          </div>
          <div className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">
            Acueducto, Energía, Gas & Internet
          </div>
        </div>

        {/* Total Paid Egresos */}
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Egresos Pagados</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 font-mono">
            {formatCOP(totalPaidBills)}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {supplierBills.filter((b) => b.status === 'PAGADO').length} facturas canceladas con soporte
          </div>
        </div>

        {/* Total Bank Liquidity */}
        <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Cuentas & Bancos</span>
            <Landmark className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-950 dark:text-indigo-200 font-mono">
            {formatCOP(totalBankBalances)}
          </div>
          <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
            En {bankAccounts.length} cuentas y cajas asociadas
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SUPPLIER BILLS & UTILITIES LIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por proveedor, NIC, factura o NIT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="ALL">Todas las Categorías</option>
                <option value="SERVICIOS_PUBLICOS">💧⚡ Todos los Servicios Públicos</option>
                <option value="SERVICIO_PUBLICO_AGUA">💧 Acueducto (EAAB)</option>
                <option value="SERVICIO_PUBLICO_ENERGIA">⚡ Energía (Enel)</option>
                <option value="SERVICIO_PUBLICO_GAS">🔥 Gas Natural (Vanti)</option>
                <option value="SERVICIO_PUBLICO_INTERNET">🌐 Internet & PBX (ETB/Claro)</option>
                <option value="PROVEEDORES">🔩⚙️ Todos los Proveedores</option>
                <option value="PROVEEDOR_EQUIPOS_BOMBAS">⚙️ Bombas & Motores</option>
                <option value="PROVEEDOR_TUBERIAS">🚰 Tuberías & Conexiones</option>
                <option value="PROVEEDOR_REPUESTOS">🚿 Repuestos & Griferías</option>
                <option value="CONTRATISTA_EXTERNO">👥 Contratistas Externos</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PENDIENTE">⏳ Pendientes de Pago</option>
                <option value="PAGADO">✅ Pagadas & Conciliadas</option>
                <option value="VENCIDO">⚠️ Vencidas</option>
              </select>
            </div>
          </div>

          {/* Table / Cards List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Factura / Ref</th>
                    <th className="py-3.5 px-4">Proveedor / Entidad</th>
                    <th className="py-3.5 px-4">Categoría & Código</th>
                    <th className="py-3.5 px-4">Emisión / Vence</th>
                    <th className="py-3.5 px-4 text-right">Monto Total</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-center">Acción / Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No se encontraron facturas o servicios públicos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <div>{bill.billNumber}</div>
                          {bill.paymentReference && (
                            <span className="text-[10px] text-emerald-600 font-medium font-mono">
                              Ref: {bill.paymentReference}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{bill.supplierName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{bill.supplierNitOrDocument}</div>
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          <div>{getCategoryBadge(bill.category)}</div>
                          {bill.meterNumberOrServiceCode && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              {bill.meterNumberOrServiceCode}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div>Emisión: {bill.issueDate}</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Vence: {bill.dueDate}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-black text-slate-900 dark:text-white text-sm">
                            {formatCOP(bill.totalCOP)}
                          </div>
                          {bill.taxCOP > 0 && (
                            <div className="text-[10px] text-slate-400">
                              (IVA: {formatCOP(bill.taxCOP)})
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {bill.status === 'PAGADO' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              PAGADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PENDIENTE
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {bill.status === 'PENDIENTE' ? (
                              <button
                                onClick={() => {
                                  setPayingBill(bill);
                                  setPayBankAccountId(bankAccounts[0]?.id || '');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1 text-[11px] transition-transform active:scale-95"
                                title="Pagar factura y debitar de cuenta bancaria"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pagar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setViewingBill(bill)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-1 text-[11px]"
                                title="Ver comprobante de egreso y soporte"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Soporte</span>
                              </button>
                            )}

                            {onDeleteSupplierBill && (
                              <button
                                onClick={() => onDeleteSupplierBill(bill.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ASSOCIATED BANK ACCOUNTS & BALANCES */}
      {/* ========================================================================= */}
      {activeSubTab === 'bank_accounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-600" />
                Cuentas Bancarias & Cajas Asociadas de la Empresa
              </h3>
              <p className="text-xs text-slate-500">
                Cuentas registradas para la recepción de recaudos PSE, Nequi, Daviplata, Efectivo y dispersión de pagos a proveedores.
              </p>
            </div>

            {onAddBankAccount && (
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 text-xs transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Cuenta Bancaria</span>
              </button>
            )}
          </div>

          {/* Bank Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {account.accountType === 'CAJA_EFECTIVO' ? (
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      ) : account.accountType === 'BILLETERA_DIGITAL' ? (
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Landmark className="w-5 h-5 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        {account.bankName}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {account.accountType === 'CORRIENTE'
                          ? 'Cuenta Corriente'
                          : account.accountType === 'AHORROS'
                          ? 'Cuenta de Ahorros'
                          : account.accountType === 'BILLETERA_DIGITAL'
                          ? 'Billetera Digital'
                          : 'Caja Menor'}
                      </span>
                    </div>
                  </div>

                  {account.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      Principal
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Número de Cuenta / Línea:
                  </div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {account.accountNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Titular: {account.holderName} ({account.holderDocument})
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Saldo Disponible:</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCOP(account.currentBalanceCOP)}
                    </div>
                  </div>

                  {account.description && (
                    <div className="text-[10px] text-slate-400 max-w-[140px] text-right italic line-clamp-2">
                      {account.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RADICAR NUEVA FACTURA DE PROVEEDOR O SERVICIO PÚBLICO */}
      {/* ========================================================================= */}
      {showNewBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>Radicar Factura de Proveedor o Servicio Público</span>
              </div>
              <button
                onClick={() => setShowNewBillModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Plantillas Rápidas de Servicios Públicos y Proveedores Habituales:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('EAAB')}
                  className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold border border-sky-300 hover:bg-sky-200 flex items-center gap-1"
                >
                  <Droplets className="w-3 h-3 text-sky-600" />
                  EAAB Acueducto
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('ENEL')}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 hover:bg-amber-200 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-600" />
                  Enel Energía
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('VANTI')}
                  className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold border border-orange-300 hover:bg-orange-200 flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 text-orange-600" />
                  Vanti Gas
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('ETB')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-300 hover:bg-indigo-200 flex items-center gap-1"
                >
                  <Globe className="w-3 h-3 text-indigo-600" />
                  ETB / PBX
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('PAVCO')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 hover:bg-emerald-200 flex items-center gap-1"
                >
                  <Layers className="w-3 h-3 text-emerald-600" />
                  Pavco Tuberías
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('BARNES')}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold border border-purple-300 hover:bg-purple-200 flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3 text-purple-600" />
                  Barnes Bombas
                </button>
                <button
                  type="button"
                  onClick={() => applyUtilityTemplate('CORONA')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-300 hover:bg-cyan-200 flex items-center gap-1"
                >
                  <Package className="w-3 h-3 text-cyan-600" />
                  Corona Griferías
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Factura / NIC / Ref. de Pago: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. EAAB-2026-0819 o FAC-8921"
                    value={newBillNumber}
                    onChange={(e) => setNewBillNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría de Egreso / Servicio: *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as BillCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="SERVICIO_PUBLICO_AGUA">💧 Servicio Público: Acueducto y Alcantarillado</option>
                    <option value="SERVICIO_PUBLICO_ENERGIA">⚡ Servicio Público: Energía Eléctrica</option>
                    <option value="SERVICIO_PUBLICO_GAS">🔥 Servicio Público: Gas Natural</option>
                    <option value="SERVICIO_PUBLICO_INTERNET">🌐 Servicio Público: Internet & PBX</option>
                    <option value="SERVICIO_PUBLICO_ASEO">🧹 Servicio Público: Aseo & Recolección</option>
                    <option value="PROVEEDOR_EQUIPOS_BOMBAS">⚙️ Proveedor: Bombas, Motores & Tableros</option>
                    <option value="PROVEEDOR_TUBERIAS">🚰 Proveedor: Tuberías, Válvulas & PVC</option>
                    <option value="PROVEEDOR_REPUESTOS">🚿 Proveedor: Repuestos Hidráulicos & Sellos</option>
                    <option value="PROVEEDOR_HERRAMIENTAS">🛠️ Proveedor: Herramientas de Sondeo</option>
                    <option value="CONTRATISTA_EXTERNO">👥 Contratistas & Técnicos Externos</option>
                    <option value="ARRIENDO_SEDE">🏢 Arriendo o Administración de Sede</option>
                    <option value="OTRO_GASTO">📋 Otro Gasto Operativo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proveedor / Entidad Pública: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Empresa de Acueducto EAAB"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIT / Cédula del Proveedor:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. NIT 899.999.094-1"
                    value={newSupplierNit}
                    onChange={(e) => setNewSupplierNit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Servicio / Número de Cuenta / NIC / Matrícula:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. NIC 4829102 - Cuenta Contrato Sede Principal"
                    value={newMeterCode}
                    onChange={(e) => setNewMeterCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Emisión:
                  </label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha Límite de Pago / Vencimiento: *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subtotal Antes de IVA ($ COP): *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Ej. 385000"
                    value={newSubtotal}
                    onChange={(e) => setNewSubtotal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IVA / Impuestos ($ COP):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej. 0 o 73150"
                    value={newTax}
                    onChange={(e) => setNewTax(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black font-mono text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notas u Observaciones del Concepto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Suministro mensual para taller o compra de repuestos para OT"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Total a Pagar Factura:</span>
                <span className="font-mono font-black text-base text-indigo-950 dark:text-white">
                  {formatCOP((parseFloat(newSubtotal) || 0) + (parseFloat(newTax) || 0))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewBillModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Radicar Factura</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRAR PAGO Y DEBITAR DE CUENTA BANCARIA */}
      {/* ========================================================================= */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Registrar Pago & Debitar de Cuenta Bancaria</span>
              </div>
              <button onClick={() => setPayingBill(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Factura a Pagar:</div>
              <div className="font-black text-base text-slate-900 dark:text-white flex items-center justify-between">
                <span>{payingBill.billNumber}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCOP(payingBill.totalCOP)}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">
                {payingBill.supplierName}
              </div>
              {payingBill.meterNumberOrServiceCode && (
                <div className="text-[11px] text-slate-500 font-mono">
                  {payingBill.meterNumberOrServiceCode}
                </div>
              )}
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Modalidad de Pago Empleada: *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('BANCOLOMBIA')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'BANCOLOMBIA'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    Bancolombia
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('PSE')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'PSE'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    PSE Débito
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('NEQUI')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'NEQUI'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Nequi
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('DAVIPLATA')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'DAVIPLATA'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Daviplata
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('EFECTIVO')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'EFECTIVO'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Caja Menor
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod('OTROS_BANCOS')}
                    className={`p-2.5 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                      payMethod === 'OTROS_BANCOS'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Otros Bancos
                  </button>
                </div>
              </div>

              {/* Bank selector if Other Banks is chosen */}
              {payMethod === 'OTROS_BANCOS' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seleccione Entidad Bancaria Colombiana:
                  </label>
                  <select
                    value={selectedBankName}
                    onChange={(e) => setSelectedBankName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    {COLOMBIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Associate Bank Account to Debit */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cuenta Bancaria o Caja Menor para Debitar Fondos: *
                </label>
                <select
                  required
                  value={payBankAccountId}
                  onChange={(e) => setPayBankAccountId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountNumber} ({formatCOP(acc.currentBalanceCOP)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Transacción / Comprobante / Voucher:
                </label>
                <input
                  type="text"
                  placeholder="Ej. TRX-849102 o RECIBO-VOUCHER-01"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Debitar {formatCOP(payingBill.totalCOP)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AGREGAR NUEVA CUENTA BANCARIA */}
      {/* ========================================================================= */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <span>Vincular Nueva Cuenta Bancaria / Billetera</span>
              </div>
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBankAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Entidad Bancaria: *
                  </label>
                  <select
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {COLOMBIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Caja Menor Principal">Caja Menor Principal (Efectivo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Cuenta: *
                  </label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="CORRIENTE">Cuenta Corriente</option>
                    <option value="AHORROS">Cuenta de Ahorros</option>
                    <option value="BILLETERA_DIGITAL">Billetera Digital (Nequi/Daviplata)</option>
                    <option value="CAJA_EFECTIVO">Caja Menor Efectivo</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Cuenta / Teléfono Billetera: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 031-482910-44 o 300 447 8151"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titular de la Cuenta:
                  </label>
                  <input
                    type="text"
                    value={newHolderName}
                    onChange={(e) => setNewHolderName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Documento / NIT Titular:
                  </label>
                  <input
                    type="text"
                    value={newHolderDoc}
                    onChange={(e) => setNewHolderDoc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Saldo Inicial Disponible ($ COP):
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 5000000"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Finalidad o Uso de la Cuenta:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Recaudos PSE o Pago Nómina"
                    value={newAccDescription}
                    onChange={(e) => setNewAccDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cuenta Bancaria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VER SOPORTE Y COMPROBANTE DE PAGO */}
      {/* ========================================================================= */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Comprobante de Egreso & Pago Conciliado</span>
              </div>
              <button onClick={() => setViewingBill(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {viewingBill.billNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                  PAGADO
                </span>
              </div>

              <div className="text-xl font-black text-emerald-950 dark:text-emerald-200 font-mono">
                {formatCOP(viewingBill.totalCOP)}
              </div>

              <div className="text-slate-700 dark:text-slate-300 font-semibold">
                Beneficiario: <strong>{viewingBill.supplierName}</strong>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
                <div>Medio de Pago: <strong>{viewingBill.paymentMethod || 'Transferencia Bancaria'}</strong></div>
                {viewingBill.bankAccountName && (
                  <div>Debitado de: <strong>{viewingBill.bankAccountName}</strong></div>
                )}
                {viewingBill.paymentReference && (
                  <div>Comprobante / Ref: <strong>{viewingBill.paymentReference}</strong></div>
                )}
                {viewingBill.paidDate && (
                  <div>Fecha de Liquidación: <strong>{viewingBill.paidDate}</strong></div>
                )}
                {viewingBill.notes && (
                  <div className="italic mt-1">Notas: {viewingBill.notes}</div>
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
                <span>Imprimir Soporte</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingBill(null)}
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
