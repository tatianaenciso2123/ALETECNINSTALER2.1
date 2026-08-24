import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  XCircle,
  Star,
  Download,
  AlertTriangle,
  Building,
  Wrench,
  Zap,
  Droplet,
  Layers,
  Sparkles,
  Package,
  FileText,
  ShieldCheck,
  ChevronRight,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List
} from 'lucide-react';
import { Supplier, SupplierCategory } from '../../types';

interface SuppliersDirectoryProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (id: string, updated: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

const CATEGORY_LABELS: Record<SupplierCategory, { label: string; icon: React.ReactNode; color: string; badgeBg: string }> = {
  EQUIPOS_BOMBAS: {
    label: 'Bombas & Equipos de Presión',
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  TUBERIAS_VALVULAS: {
    label: 'Tuberías & Válvulas',
    icon: <Droplet className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  REPUESTOS_HIDRAULICOS: {
    label: 'Sellos & Repuestos Hidráulicos',
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  AUTOMATIZACION_VFD: {
    label: 'Automatización & Variadores VFD',
    icon: <Layers className="w-3.5 h-3.5" />,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  GRIFERIAS_SANITARIOS: {
    label: 'Griferías & Sanitarios',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  },
  SERVICIOS_PUBLICOS: {
    label: 'Servicios Públicos (Agua/Luz/Gas/Tel)',
    icon: <Building className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  HERRAMIENTAS_MAQUINARIA: {
    label: 'Herramientas & Equipos de Sondeo',
    icon: <Wrench className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
  },
  CONTRATISTAS_SERVICIOS: {
    label: 'Contratistas & Servicios Técnicos',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  QUIMICOS_CONSUMIBLES: {
    label: 'Químicos & Consumibles',
    icon: <FileText className="w-3.5 h-3.5" />,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
  OTRO_SERVICIO: {
    label: 'Otros Servicios & Proveedores',
    icon: <Building2 className="w-3.5 h-3.5" />,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
  },
};

export const SuppliersDirectory: React.FC<SuppliersDirectoryProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [viewDetailSupplier, setViewDetailSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    commercialName: '',
    nitOrDocument: '',
    category: 'REPUESTOS_HIDRAULICOS',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Bogotá D.C.',
    suppliedProductsOrServices: '',
    paymentTerms: 'Crédito a 30 días',
    bankAccountInfo: '',
    website: '',
    rating: 5,
    status: 'ACTIVO',
    notes: '',
  });

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.commercialName && s.commercialName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.nitOrDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.suppliedProductsOrServices.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory === 'ALL') {
        matchesCategory = true;
      } else if (selectedCategory === 'SOLO_PROVEEDORES') {
        matchesCategory = s.category !== 'SERVICIOS_PUBLICOS';
      } else if (selectedCategory === 'SOLO_RECIBOS') {
        matchesCategory = s.category === 'SERVICIOS_PUBLICOS';
      } else {
        matchesCategory = s.category === selectedCategory;
      }

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchTerm, selectedCategory, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.status === 'ACTIVO').length;
    const soloProveedores = suppliers.filter((s) => s.category !== 'SERVICIOS_PUBLICOS').length;
    const soloRecibos = suppliers.filter((s) => s.category === 'SERVICIOS_PUBLICOS').length;
    const hydraulicAndParts = suppliers.filter((s) =>
      ['EQUIPOS_BOMBAS', 'TUBERIAS_VALVULAS', 'REPUESTOS_HIDRAULICOS', 'AUTOMATIZACION_VFD'].includes(s.category)
    ).length;
    return { total, active, soloProveedores, soloRecibos, hydraulicAndParts };
  }, [suppliers]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      commercialName: '',
      nitOrDocument: '',
      category: 'REPUESTOS_HIDRAULICOS',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: 'Bogotá D.C.',
      suppliedProductsOrServices: '',
      paymentTerms: 'Crédito a 30 días',
      bankAccountInfo: '',
      website: '',
      rating: 5,
      status: 'ACTIVO',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      commercialName: supplier.commercialName || '',
      nitOrDocument: supplier.nitOrDocument,
      category: supplier.category,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      whatsapp: supplier.whatsapp || '',
      email: supplier.email,
      address: supplier.address,
      city: supplier.city,
      suppliedProductsOrServices: supplier.suppliedProductsOrServices,
      paymentTerms: supplier.paymentTerms,
      bankAccountInfo: supplier.bankAccountInfo || '',
      website: supplier.website || '',
      rating: supplier.rating || 5,
      status: supplier.status,
      notes: supplier.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, formData);
    } else {
      onAddSupplier(formData);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      onDeleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Nombre Empresa',
      'Nombre Comercial',
      'NIT / Documento',
      'Categoría',
      'Persona Contacto',
      'Teléfono',
      'WhatsApp',
      'Email',
      'Dirección',
      'Ciudad',
      'Productos / Servicios',
      'Condiciones de Pago',
      'Datos Bancarios',
      'Estado',
    ];

    const rows = filteredSuppliers.map((s) => [
      `"${s.name}"`,
      `"${s.commercialName || ''}"`,
      `"${s.nitOrDocument}"`,
      `"${CATEGORY_LABELS[s.category]?.label || s.category}"`,
      `"${s.contactPerson}"`,
      `"${s.phone}"`,
      `"${s.whatsapp || ''}"`,
      `"${s.email}"`,
      `"${s.address}"`,
      `"${s.city}"`,
      `"${s.suppliedProductsOrServices.replace(/"/g, '""')}"`,
      `"${s.paymentTerms}"`,
      `"${s.bankAccountInfo || ''}"`,
      `"${s.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Directorio_Proveedores_Servicios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 border border-indigo-500/20">
              <Building2 className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Directorio de Proveedores & Servicios
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {suppliers.length} Registrados
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Listado consolidado de casas matrices, distribuidores de repuestos hidráulicos, suministros y entidades de servicios públicos
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar base de datos en formato Excel/CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar Directorio</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Proveedor</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Total Registros
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('SOLO_PROVEEDORES')}
            className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
              selectedCategory === 'SOLO_PROVEEDORES'
                ? 'bg-sky-100/70 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 ring-2 ring-sky-500/20'
                : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-900/40 hover:bg-sky-100/40'
            }`}
          >
            <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-sky-500" />
              Solo Proveedores
            </div>
            <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">{stats.soloProveedores}</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('SOLO_RECIBOS')}
            className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
              selectedCategory === 'SOLO_RECIBOS'
                ? 'bg-amber-100/70 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 ring-2 ring-amber-500/20'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100/40'
            }`}
          >
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-500" />
              Solo Recibos (ESP)
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.soloRecibos}</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setStatusFilter(statusFilter === 'ACTIVO' ? 'ALL' : 'ACTIVO');
            }}
            className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
              statusFilter === 'ACTIVO' && selectedCategory === 'ALL'
                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100/40'
            }`}
          >
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Entidades Activas
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.active}</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, NIT, contacto, repuestos suministrados o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown with Solo Proveedores and Solo Recibos */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Mostrar Todos ({suppliers.length})</option>
              <option value="SOLO_PROVEEDORES">📦 Solo Proveedores ({stats.soloProveedores})</option>
              <option value="SOLO_RECIBOS">💧 Solo Recibos / Servicios Públicos ({stats.soloRecibos})</option>
              <optgroup label="── Por Categoría Específica ──">
                {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => {
                  const count = suppliers.filter((s) => s.category === catKey).length;
                  return (
                    <option key={catKey} value={catKey}>
                      {catMeta.label} ({count})
                    </option>
                  );
                })}
              </optgroup>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="ACTIVO">Solo Activos ({stats.active})</option>
              <option value="INACTIVO">Solo Inactivos ({stats.total - stats.active})</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Vista Tabla Detallada"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category & Segment Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Todos ({suppliers.length})
          </button>

          <button
            onClick={() => setSelectedCategory('SOLO_PROVEEDORES')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedCategory === 'SOLO_PROVEEDORES'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 hover:bg-sky-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Solo Proveedores</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-100 font-black">
              {stats.soloProveedores}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('SOLO_RECIBOS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedCategory === 'SOLO_RECIBOS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Solo Recibos (ESP)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-black">
              {stats.soloRecibos}
            </span>
          </button>

          <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

          {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => {
            const count = suppliers.filter((s) => s.category === catKey).length;
            if (count === 0) return null;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{catMeta.icon}</span>
                <span>{catMeta.label.split('(')[0].trim()}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No se encontraron proveedores ni servicios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {searchTerm || selectedCategory !== 'ALL' || statusFilter !== 'ALL'
                ? 'Prueba modificando los filtros de búsqueda o categoría.'
                : 'Aún no hay proveedores registrados. Comienza agregando uno nuevo.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primer Proveedor</span>
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const catMeta = CATEGORY_LABELS[supplier.category] || CATEGORY_LABELS.OTRO_SERVICIO;
            const whatsappClean = supplier.whatsapp?.replace(/[^0-9]/g, '');

            return (
              <div
                key={supplier.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-800 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catMeta.badgeBg}`}>
                        {catMeta.icon}
                        <span>{catMeta.label.split('(')[0].trim()}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          supplier.status === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </div>
                  </div>

                  {/* Company Name & NIT */}
                  <div className="mb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {supplier.name}
                    </h3>
                    {supplier.commercialName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {supplier.commercialName}
                      </p>
                    )}
                    <p className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      NIT: {supplier.nitOrDocument}
                    </p>
                  </div>

                  {/* Supplied Products / Services */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5 text-[11px]">
                      📦 Suministros & Servicios:
                    </span>
                    {supplier.suppliedProductsOrServices}
                  </div>

                  {/* Contact Info Grid */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {supplier.contactPerson}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.address}, {supplier.city}</span>
                    </div>

                    {supplier.paymentTerms && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {supplier.paymentTerms}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Direct Contact Shortcuts */}
                  <div className="flex items-center gap-1.5">
                    {whatsappClean && (
                      <a
                        href={`https://wa.me/${whatsappClean}?text=Hola%20${encodeURIComponent(supplier.contactPerson)},%20nos%20comunicamos%20de%20ALE.%20TECNINSTALER`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                        title="Escribir al WhatsApp comercial"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    <a
                      href={`tel:${supplier.phone.replace(/[^0-9+]/g, '')}`}
                      className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 flex items-center justify-center transition-colors"
                      title="Llamar al proveedor"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <a
                      href={`mailto:${supplier.email}`}
                      className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 flex items-center justify-center transition-colors"
                      title="Enviar correo"
                    >
                      <Mail className="w-4 h-4" />
                    </a>

                    {supplier.website && (
                      <a
                        href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        title="Visitar sitio web o catálogo"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(supplier)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Editar información del proveedor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => setSupplierToDelete(supplier)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Eliminar proveedor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Empresa / Razón Social</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Contacto / Asesor</th>
                  <th className="p-3.5">Teléfono & WhatsApp</th>
                  <th className="p-3.5">Productos & Suministros</th>
                  <th className="p-3.5">Condiciones Pago</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredSuppliers.map((supplier) => {
                  const catMeta = CATEGORY_LABELS[supplier.category] || CATEGORY_LABELS.OTRO_SERVICIO;
                  const whatsappClean = supplier.whatsapp?.replace(/[^0-9]/g, '');

                  return (
                    <tr key={supplier.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {supplier.name}
                        </div>
                        {supplier.commercialName && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {supplier.commercialName}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-slate-400">
                          NIT: {supplier.nitOrDocument}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badgeBg}`}>
                          {catMeta.icon}
                          <span>{catMeta.label.split('(')[0].trim()}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {supplier.contactPerson}
                        </div>
                        <div className="text-[11px] text-slate-400">{supplier.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {supplier.phone}
                        </div>
                        {supplier.whatsapp && (
                          <a
                            href={`https://wa.me/${whatsappClean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2">
                          {supplier.suppliedProductsOrServices}
                        </p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {supplier.paymentTerms}
                        </span>
                        {supplier.bankAccountInfo && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {supplier.bankAccountInfo}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            supplier.status === 'ACTIVO'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(supplier)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSupplierToDelete(supplier)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL AGREGAR / EDITAR PROVEEDOR ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {editingSupplier ? 'Editar Proveedor / Servicio' : 'Registrar Nuevo Proveedor o Servicio'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ingresa los datos comerciales, de contacto y suministros de la entidad
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              {/* Row 1: Nombre & Nombre Comercial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Razón Social / Nombre Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Barnes de Colombia S.A."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Comercial / Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Bombas Barnes / Wilo Group"
                    value={formData.commercialName}
                    onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: NIT & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIT o Documento Tributario *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 860.032.190-4"
                    value={formData.nitOrDocument}
                    onChange={(e) => setFormData({ ...formData, nitOrDocument: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría de Suministro *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SupplierCategory })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => (
                      <option key={catKey} value={catKey}>
                        {catMeta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Contact Person & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Persona de Contacto / Asesor Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Fernando Morales - Asesor Técnico"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico de Pedidos / Facturación *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. ventas@barnes.com.co"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono Principal / PBX *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +57 (601) 748 9000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Comercial Directo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. +57 310 445 8899"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dirección de Despacho / Sede
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Zona Industrial Cazucá Autopista Sur"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad / Sede Principal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Bogotá D.C."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Supplied Products / Services */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Productos & Servicios Suministrados *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej. Electrobombas centrífugas multietapas, bombas sumergibles de pozo, sellos mecánicos y repuestos originales."
                  value={formData.suppliedProductsOrServices}
                  onChange={(e) => setFormData({ ...formData, suppliedProductsOrServices: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Row 7: Payment Terms & Bank Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Condiciones / Plazo de Pago
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Crédito a 30 días">Crédito a 30 días</option>
                    <option value="Crédito a 45 días">Crédito a 45 días</option>
                    <option value="Crédito a 60 días">Crédito a 60 días</option>
                    <option value="Contado / Contraentrega">Contado / Contraentrega</option>
                    <option value="Anticipado 100%">Anticipado 100%</option>
                    <option value="Facturación Mensual">Facturación Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Datos Bancarios para Pago / Transferencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Bancolombia Cta Cte 031-482910-44"
                    value={formData.bankAccountInfo}
                    onChange={(e) => setFormData({ ...formData, bankAccountInfo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 8: Website & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sitio Web / Catálogo Online
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. https://barnes.com.co"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado del Proveedor
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVO">Activo / Habilitado para Compras</option>
                    <option value="INACTIVO">Inactivo / En Revisión</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas Internas / Descuentos Acordados
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Descuento comercial del 15% por pronto pago. Solicitar cotización formal antes de cada compra."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-colors"
                >
                  {editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMAR ELIMINACIÓN ================= */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Eliminar Proveedor / Servicio?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ¿Estás seguro de que deseas eliminar del directorio a{' '}
                <strong className="text-slate-800 dark:text-slate-200">{supplierToDelete.name}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSupplierToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
