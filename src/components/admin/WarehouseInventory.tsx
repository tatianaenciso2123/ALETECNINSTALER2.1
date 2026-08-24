import React, { useState } from 'react';
import { SparePart } from '../../types';
import { formatCOP } from '../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Check,
  X,
  UploadCloud,
  Minus,
  MapPin,
  Tag,
  Boxes,
  Eye,
  RefreshCw
} from 'lucide-react';

interface WarehouseInventoryProps {
  spareParts: SparePart[];
  onAddSparePart: (newPart: Omit<SparePart, 'id'>) => void;
  onUpdateSparePart: (id: string, updated: Partial<SparePart>) => void;
  onDeleteSparePart: (id: string) => void;
  onQuickStockAdjust: (id: string, newStock: number, reason: string) => void;
}

export const WarehouseInventory: React.FC<WarehouseInventoryProps> = ({
  spareParts,
  onAddSparePart,
  onUpdateSparePart,
  onDeleteSparePart,
  onQuickStockAdjust,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'CRITICAL' | 'AVAILABLE'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal State for New / Edit Part (6.1)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  // Form State (6.1)
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Sellos / O-rings');
  const [formBrand, setFormBrand] = useState('John Crane');
  const [formDescription, setFormDescription] = useState('');
  const [formStock, setFormStock] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(3);
  const [formUnit, setFormUnit] = useState('Unidad');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(150000);
  const [formLocation, setFormLocation] = useState('Pasillo A - Estante 1 - Gaveta 1');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Quick adjustment modal
  const [adjustModalPart, setAdjustModalPart] = useState<SparePart | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Conteo Físico / Reabastecimiento');

  // Categories list
  const defaultCategoryOptions = [
    'Baños & Sanitarios',
    'Duchas & Regaderas',
    'Cocinas & Lavaplatos',
    'Griferías & Mezcladores',
    'Jacuzzis, Spas & Piscinas',
    'Sondeo & Desobstrucción',
    'Bombas & Presión Constante',
    'Válvulas & Conexiones',
    'Control & Instrumentación',
    'Sellos / O-rings',
    'Motores & Rodamientos',
    'Tanques & Acumuladores',
    'Mangueras & Raccords',
    'Aceites & Fluidos',
    'Otros',
  ];

  // Merge default categories with any dynamic categories present in the spare parts list
  const categoryOptions = Array.from(
    new Set([...defaultCategoryOptions, ...spareParts.map((p) => p.category).filter(Boolean)])
  );

  const unitOptions = ['Unidad', 'Metro', 'Galón', 'Juego / Kit', 'Litro', 'Rollo'];

  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'Baños & Sanitarios':
      case 'Baños':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-400/30';
      case 'Duchas & Regaderas':
      case 'Duchas':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-400/30';
      case 'Cocinas & Lavaplatos':
      case 'Cocinas':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/30';
      case 'Griferías & Mezcladores':
      case 'Griferías':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-400/30';
      case 'Jacuzzis, Spas & Piscinas':
      case 'Jacuzzis':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-400/30';
      case 'Sondeo & Desobstrucción':
      case 'Sondeo':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400/30';
      case 'Bombas & Presión Constante':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400/30';
      case 'Válvulas & Conexiones':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-400/30';
      case 'Sellos / O-rings':
        return 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-400/30';
      case 'Control & Instrumentación':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-400/30';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/30';
    }
  };

  // KPIs (6.2, 6.3, 6.4)
  const totalReferences = spareParts.length;
  const criticalStockParts = spareParts.filter((p) => p.stock <= p.minStock);
  const totalValuationCOP = spareParts.reduce((sum, p) => sum + p.stock * p.unitPriceCOP, 0);

  // Filtered list
  const filteredParts = spareParts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockStatusFilter === 'CRITICAL') matchesStock = p.stock <= p.minStock;
    if (stockStatusFilter === 'AVAILABLE') matchesStock = p.stock > p.minStock;

    return matchesSearch && matchesCat && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingPartId(null);
    setFormName('');
    setFormSku(`SKU-HYD-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory('Sellos / O-rings');
    setFormBrand('Pedrollo');
    setFormDescription('');
    setFormStock(10);
    setFormMinStock(3);
    setFormUnit('Unidad');
    setFormUnitPrice(120000);
    setFormLocation('Pasillo A - Estante 1 - Gaveta 1');
    setFormImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setEditingPartId(part.id);
    setFormName(part.name);
    setFormSku(part.code);
    setFormCategory(part.category);
    setFormBrand(part.brand);
    setFormDescription(part.description);
    setFormStock(part.stock);
    setFormMinStock(part.minStock);
    setFormUnit(part.unit);
    setFormUnitPrice(part.unitPriceCOP);
    setFormLocation(part.warehouseLocation);
    setFormImageUrl(part.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    if (editingPartId) {
      onUpdateSparePart(editingPartId, {
        name: formName,
        code: formSku,
        category: formCategory,
        brand: formBrand,
        description: formDescription,
        stock: Number(formStock),
        minStock: Number(formMinStock),
        unit: formUnit,
        unitPriceCOP: Number(formUnitPrice),
        warehouseLocation: formLocation,
        imageUrl: formImageUrl,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    } else {
      onAddSparePart({
        name: formName,
        code: formSku,
        category: formCategory,
        brand: formBrand,
        description: formDescription,
        stock: Number(formStock),
        minStock: Number(formMinStock),
        unit: formUnit,
        unitPriceCOP: Number(formUnitPrice),
        warehouseLocation: formLocation,
        imageUrl: formImageUrl,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }

    setIsModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmQuickAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalPart) return;
    const newStock = Math.max(0, adjustModalPart.stock + adjustQty);
    onQuickStockAdjust(adjustModalPart.id, newStock, adjustReason);
    setAdjustModalPart(null);
    setAdjustQty(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Bodega de Repuestos & Gestión de Inventario
            </h2>
            <p className="text-xs text-slate-500">
              Control de existencias físicas, valorización en tiempo real y descuentos automáticos por actas de servicio
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/30 flex items-center gap-2 active:scale-95 transition-transform self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ingresar Nuevo Repuesto</span>
        </button>
      </div>

      {/* KPI Cards (6.2, 6.3, 6.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Referencias */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Referencias</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalReferences} <span className="text-xs font-medium text-slate-400">SKUs</span>
          </div>
          <p className="text-[11px] text-slate-400">Referencias activas en catálogo y bodega</p>
        </div>

        {/* KPI 2: Stock Crítico / Bajo */}
        <div
          onClick={() => setStockStatusFilter(stockStatusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-5 rounded-3xl border shadow-sm space-y-2 cursor-pointer transition-all ${
            stockStatusFilter === 'CRITICAL'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Stock Crítico / Bajo
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              Alerta Reposición
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {criticalStockParts.length} <span className="text-xs font-medium text-slate-400">ítems</span>
          </div>
          <p className="text-[11px] text-slate-400">Clic para filtrar repuestos por debajo del stock mínimo</p>
        </div>

        {/* KPI 3: Valorización de Bodega */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Valorización de Bodega
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCOP(totalValuationCOP)}
          </div>
          <p className="text-[11px] text-slate-400">Capital monetario total disponible en inventario</p>
        </div>
      </div>

      {/* Search and Filters Toolbar (6.5) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search bar with magnifying glass */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código SKU, nombre, marca, descripción o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="Todos">Todas las Categorías</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Stock Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setStockStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  stockStatusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Todos ({spareParts.length})
              </button>
              <button
                onClick={() => setStockStatusFilter('CRITICAL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  stockStatusFilter === 'CRITICAL'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                Crítico ({criticalStockParts.length})
              </button>
              <button
                onClick={() => setStockStatusFilter('AVAILABLE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  stockStatusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Disponible ({spareParts.length - criticalStockParts.length})
              </button>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Galería
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Chips Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Filtrar por Área:</span>
          {['Todos', 'Baños & Sanitarios', 'Cocinas & Lavaplatos', 'Duchas & Regaderas', 'Griferías & Mezcladores', 'Jacuzzis, Spas & Piscinas', 'Sondeo & Desobstrucción', 'Bombas & Presión Constante', 'Sellos / O-rings', 'Válvulas & Conexiones'].map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'Todos' ? spareParts.length : spareParts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 ring-2 ring-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE VIEW (6.5) */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Foto / SKU</th>
                  <th className="py-3.5 px-4">Nombre & Descripción</th>
                  <th className="py-3.5 px-4">Marca / Categoría</th>
                  <th className="py-3.5 px-4">Ubicación Bodega</th>
                  <th className="py-3.5 px-4">Precio Unitario</th>
                  <th className="py-3.5 px-4 text-center">Existencias / Stock</th>
                  <th className="py-3.5 px-4 text-center">Ajuste Rápido</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No se encontraron repuestos con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredParts.map((part) => {
                    const isCritical = part.stock <= part.minStock;
                    return (
                      <tr
                        key={part.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Foto & SKU */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={part.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80'}
                              alt={part.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300">
                                {part.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Nombre & Descripción */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {part.name}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {part.description}
                          </p>
                        </td>

                        {/* Marca / Categoría */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {part.brand}
                          </div>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg border mt-1 ${getCategoryBadgeStyle(part.category)}`}>
                            {part.category}
                          </span>
                        </td>

                        {/* Ubicación Bodega */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{part.warehouseLocation}</span>
                          </div>
                        </td>

                        {/* Precio Unitario */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {formatCOP(part.unitPriceCOP)}
                          <span className="text-[10px] text-slate-400 block font-sans font-normal">/{part.unit}</span>
                        </td>

                        {/* Existencias / Stock */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-black font-mono text-sm px-2.5 py-0.5 rounded-xl ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {part.stock} {part.unit}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              Mín: {part.minStock}
                            </span>
                          </div>
                        </td>

                        {/* Ajuste Rápido (+ / -) */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                const newStock = Math.max(0, part.stock - 1);
                                onQuickStockAdjust(part.id, newStock, 'Ajuste rápido - Salida');
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                              title="Restar 1 unidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdjustModalPart(part);
                                setAdjustQty(0);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:underline"
                            >
                              Ajustar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newStock = part.stock + 1;
                                onQuickStockAdjust(part.id, newStock, 'Ajuste rápido - Entrada');
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                              title="Sumar 1 unidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(part)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                              title="Editar repuesto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Desea eliminar el repuesto ${part.name}?`)) {
                                  onDeleteSparePart(part.id);
                                }
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Eliminar repuesto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID / GALLERY VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParts.map((part) => {
            const isCritical = part.stock <= part.minStock;
            return (
              <div
                key={part.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-purple-400 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img
                      src={part.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80'}
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-900/90 text-white backdrop-blur-xs">
                        {part.code}
                      </span>
                    </div>
                    {isCritical && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-600 text-white shadow-sm animate-pulse">
                          Stock Crítico
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {part.brand}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(part.category)}`}>
                        {part.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate mt-0.5" title={part.name}>
                      {part.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {part.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Ubicación:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{part.warehouseLocation}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Existencias:</span>
                      <strong className={isCritical ? 'text-rose-600' : 'text-emerald-600'}>
                        {part.stock} {part.unit} (Mín: {part.minStock})
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {formatCOP(part.unitPriceCOP)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(part)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setAdjustModalPart(part);
                        setAdjustQty(0);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shadow-sm"
                    >
                      Ajustar Stock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 6.1. MODAL INGRESAR / EDITAR REPUESTO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingPartId ? 'Editar Repuesto en Bodega' : 'Ingresar Nuevo Repuesto a Bodega'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registro de especificaciones, fotografía, stock y ubicación
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePart} className="space-y-4">
              {/* Photo preview & upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <img
                  src={formImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80'}
                  alt="Vista previa"
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 bg-white"
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Fotografía del Repuesto
                  </div>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="URL de la imagen o selecciona archivo local..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="inventory-part-photo"
                    />
                    <label
                      htmlFor="inventory-part-photo"
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      Subir Imagen
                    </label>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Repuesto:
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Ej: Sello Mecánico 1 1/4 Carburo Silicio"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código SKU:
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="Ej: SM-CARB-125"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Marca:
                  </label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="John Crane, Pedrollo, SKF, ABB..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción Técnica:
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Especificaciones, compatibilidad con marcas de bombas y fluidos..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Mínimo (Alerta de reposición):
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unidad de Medida:
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Unitario ($ COP):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ubicación en Bodega:
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Ej: Pasillo A - Estante 2 - Gaveta 4"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar en Bodega</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL AJUSTE RÁPIDO DE STOCK ================= */}
      {adjustModalPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                Ajuste Manual de Existencias
              </h3>
              <button
                onClick={() => setAdjustModalPart(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{adjustModalPart.name}</div>
              <div className="text-slate-500 text-[11px]">
                Código: <strong className="font-mono">{adjustModalPart.code}</strong> • Existencia actual:{' '}
                <strong className="font-mono text-purple-600">{adjustModalPart.stock} {adjustModalPart.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmQuickAdjust} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cantidad a Sumar (+) o Restar (-):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQty((prev) => prev - 1)}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold hover:scale-105"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono font-black text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQty((prev) => prev + 1)}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 text-center">
                  Nueva existencia resultará en:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {Math.max(0, adjustModalPart.stock + adjustQty)} {adjustModalPart.unit}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo del Ajuste:
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  <option value="Conteo Físico / Reabastecimiento">Conteo Físico / Reabastecimiento</option>
                  <option value="Entrada por Compra a Proveedor">Entrada por Compra a Proveedor</option>
                  <option value="Salida por Venta Directa en Mostrador">Salida por Venta Directa en Mostrador</option>
                  <option value="Merma o Repuesto en Garantía">Merma o Repuesto en Garantía</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalPart(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md"
                >
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
