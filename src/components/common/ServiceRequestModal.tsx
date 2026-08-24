import React, { useState } from 'react';
import { WorkOrder, SparePart, PriorityLevel } from '../../types';
import { formatCOP } from '../../utils/formatters';
import {
  Wrench,
  Shield,
  Settings,
  Package,
  Search,
  Droplets,
  GraduationCap,
  AlertTriangle,
  UploadCloud,
  X,
  Check,
  Calendar,
  Clock,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (orderData: Partial<WorkOrder>, cartItems?: { part: SparePart; quantity: number }[]) => void;
  spareParts: SparePart[];
  initialClientData?: {
    companyName?: string;
    nit?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
  spareParts,
  initialClientData,
}) => {
  // Service selection (4.1)
  const [serviceType, setServiceType] = useState<string>('Correctivo');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('Media');

  // Equipment & Diagnosis (4.2)
  const [machineryType, setMachineryType] = useState<string>('Baños');
  const [specificAccessory, setSpecificAccessory] = useState<string>('Válvula de Descarga & Grifería Sanitaria');
  const [suggestedDate, setSuggestedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [suggestedTime, setSuggestedTime] = useState<string>('09:00 AM');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Client / Company Details (4.3)
  const [clientCompanyName, setClientCompanyName] = useState<string>(initialClientData?.companyName || '');
  const [clientDocType, setClientDocType] = useState<'NIT' | 'Cédula'>('NIT');
  const [clientDocNumber, setClientDocNumber] = useState<string>(initialClientData?.nit || '');
  const [clientEmail, setClientEmail] = useState<string>(initialClientData?.email || '');
  const [clientPhone, setClientPhone] = useState<string>(initialClientData?.phone || '');
  const [clientAddress, setClientAddress] = useState<string>(initialClientData?.address || '');

  // Spare Parts Shopping Cart
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);
  const [cart, setCart] = useState<{ part: SparePart; quantity: number }[]>([]);
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Submit toast
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const serviceOptions = [
    {
      id: 'Correctivo',
      name: 'Correctivo',
      subtitle: 'Reparación de fallas mecánicas, fugas y paros no programados',
      icon: Wrench,
      accent: 'border-rose-500/80 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'Preventivo',
      name: 'Preventivo',
      subtitle: 'Rutinas periódicas, cambio de sellos, rodamientos y lubricación',
      icon: Shield,
      accent: 'border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'Instalacion',
      name: 'Instalación',
      subtitle: 'Montaje de electrobombas, cilindros, tuberías y HPU',
      icon: Settings,
      accent: 'border-sky-500/80 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'Repuesto',
      name: 'Repuesto',
      subtitle: 'Suministro, compra y cambio de repuestos con galería comercial',
      icon: Package,
      accent: 'border-purple-500/80 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'Inspeccion',
      name: 'Inspección',
      subtitle: 'Diagnóstico con boroscopia, termografía y pruebas de presión',
      icon: Search,
      accent: 'border-cyan-500/80 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'Sondeo',
      name: 'Sondeo de Tubería',
      subtitle: 'Desobstrucción con hidrojugger y cámaras CCTV de inspección',
      icon: Droplets,
      accent: 'border-blue-500/80 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'Capacitacion',
      name: 'Capacitación',
      subtitle: 'Entrenamiento operativo a conserjes y personal de mantenimiento',
      icon: GraduationCap,
      accent: 'border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const urgencyOptions = [
    {
      id: 'Baja',
      title: 'Baja (Programable)',
      desc: 'Mantenimiento preventivo o inspección que puede agendarse en ruta.',
      color: 'border-slate-300 dark:border-slate-700 hover:border-sky-500',
      activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300',
    },
    {
      id: 'Media',
      title: 'Media (Falla Parcial)',
      desc: 'Rendimiento reducido o ruido sin detención total del suministro.',
      color: 'border-slate-300 dark:border-slate-700 hover:border-amber-500',
      activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
    },
    {
      id: 'Alta',
      title: 'Alta (Paro de Planta / Urgencia)',
      desc: 'Línea de bombeo detenida, inundación o falta total de agua.',
      color: 'border-slate-300 dark:border-slate-700 hover:border-rose-500',
      activeColor: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300',
    },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Cart operations
  const addToCart = (part: SparePart) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.part.id === part.id);
      if (existing) {
        return prev.map((item) =>
          item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { part, quantity: 1 }];
    });
  };

  const updateCartQuantity = (partId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.part.id === partId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { part: SparePart; quantity: number }[]
    );
  };

  const cartTotalCOP = cart.reduce((sum, item) => sum + item.part.unitPriceCOP * item.quantity, 0);

  const filteredSpareParts = spareParts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(partSearchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['Todos', ...Array.from(new Set(spareParts.map((p) => p.category)))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim() && cart.length === 0) {
      alert('Por favor ingrese una descripción del requerimiento o seleccione repuestos en el carrito.');
      return;
    }

    let mappedPriority: PriorityLevel = 'MEDIA';
    if (urgencyLevel === 'Baja') mappedPriority = 'PROGRAMADO';
    else if (urgencyLevel === 'Alta') mappedPriority = 'EMERGENCIA';
    else mappedPriority = 'ALTA';

    const orderPayload: Partial<WorkOrder> = {
      clientName: clientCompanyName || 'Cliente Solicitante',
      clientNit: `${clientDocType}: ${clientDocNumber || 'S/N'}`,
      clientPhone: clientPhone,
      clientEmail: clientEmail,
      clientAddress: clientAddress || 'Bogotá D.C.',
      equipmentType: `${machineryType} (${serviceType})`,
      brand: 'Barnes / Pedrollo / Rexroth',
      model: specificAccessory || 'Central Hidráulica',
      priority: mappedPriority,
      reportedIssue: `[${serviceType.toUpperCase()} - Urgencia ${urgencyLevel}] ${problemDescription}${
        cart.length > 0
          ? ` | Repuestos solicitados (${cart.length}): ` +
            cart.map((c) => `${c.quantity}x ${c.part.name}`).join(', ')
          : ''
      }`,
      scheduledDate: suggestedDate,
      scheduledTime: suggestedTime,
      status: 'PENDIENTE',
      totalCostCOP: cartTotalCOP,
    };

    onSubmitRequest(orderPayload, cart);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Formato de Solicitud de Servicio Técnico & Repuestos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ALE. TECNINSTALER S.A.S. • Despacho de Cuadrillas & Bodega de Repuestos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPartsCatalog(!showPartsCatalog)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showPartsCatalog
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Carrito Repuestos ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              {cartTotalCOP > 0 && <span className="font-mono text-[11px] font-black">{formatCOP(cartTotalCOP)}</span>}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 animate-fade-in shadow-md">
            <Check className="w-5 h-5" />
            <span>¡Solicitud de servicio enviada con éxito! Se ha asignado al centro de control técnico.</span>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* POPUP/DRAWER: Shopping Cart and Spare Parts Gallery */}
          {showPartsCatalog && (
            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border-2 border-purple-400/40 dark:border-purple-800 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                  <Package className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-sm">Catálogo de Repuestos & Suministros Originales</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selecciona los repuestos que requieres para tu instalación o visita técnica
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Buscar repuesto, SKU o marca..."
                    value={partSearchQuery}
                    onChange={(e) => setPartSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Spare Parts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredSpareParts.map((part) => {
                  const cartItem = cart.find((c) => c.part.id === part.id);
                  const isOutOfStock = part.stock <= 0;
                  return (
                    <div
                      key={part.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 shadow-sm ${
                        isOutOfStock
                          ? 'bg-slate-50 dark:bg-slate-850 border-rose-200 dark:border-rose-900/50 opacity-90'
                          : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-purple-900/50'
                      }`}
                    >
                      <div className="flex gap-2.5">
                        <img
                          src={part.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                          alt={part.name}
                          className={`w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-700 ${
                            isOutOfStock ? 'grayscale opacity-60' : ''
                          }`}
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {part.code}
                            </span>
                            {isOutOfStock && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white">
                                AGOTADO
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5" title={part.name}>
                            {part.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {part.brand} • Stock: <strong className={isOutOfStock ? 'text-rose-600 font-bold' : part.stock <= part.minStock ? 'text-amber-500' : 'text-emerald-500'}>
                              {isOutOfStock ? '0 (Agotado)' : `${part.stock} ${part.unit}`}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="font-black text-xs text-purple-600 dark:text-purple-400 font-mono">
                          {formatCOP(part.unitPriceCOP)}
                        </span>

                        {isOutOfStock ? (
                          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold">
                            Sin Existencias
                          </span>
                        ) : cartItem ? (
                          <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-lg text-xs">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(part.id, -1)}
                              className="text-purple-700 dark:text-purple-300 font-bold hover:scale-110"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-purple-900 dark:text-purple-100 px-1">{cartItem.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(part.id, 1)}
                              disabled={cartItem.quantity >= part.stock}
                              className="text-purple-700 dark:text-purple-300 font-bold hover:scale-110 disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(part)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary Bar */}
              {cart.length > 0 && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-600" />
                    <span>
                      Total Repuestos en Carrito: <strong>{cart.reduce((a, b) => a + b.quantity, 0)} unidades</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-900 dark:text-white font-bold">
                      Subtotal: <strong className="text-purple-600 text-sm font-mono">{formatCOP(cartTotalCOP)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-rose-500 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" /> Vaciar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 4.1. TIPO DE SERVICIO REQUERIDO ================= */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                Tipo de Servicio Requerido & Urgencia Operativa
              </h3>
            </div>

            {/* Service Selection Cards Grid (Image 1 reference) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {serviceOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = serviceType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setServiceType(opt.id);
                      if (opt.id === 'Repuesto' && !showPartsCatalog) {
                        setShowPartsCatalog(true);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? `${opt.accent} shadow-md scale-[1.01] ring-2 ring-sky-500/30`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white/80 dark:bg-slate-900/80 shadow-sm' : 'bg-slate-200/70 dark:bg-slate-700/60'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{opt.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Urgency Level Selection */}
            <div className="pt-2 space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                Nivel de Urgencia Operativa:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {urgencyOptions.map((u) => {
                  const isSelected = urgencyLevel === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setUrgencyLevel(u.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-xs ${
                        isSelected ? `${u.activeColor} shadow-md font-bold` : `${u.color} bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black">{u.title}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                      <p className="text-[11px] font-normal leading-tight opacity-90">{u.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= 4.2. EQUIPO Y DIAGNÓSTICO PRELIMINAR ================= */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                Equipo & Diagnóstico Preliminar
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Área / Tipo de Sistema Hidrosanitario:
                </label>
                <select
                  value={machineryType}
                  onChange={(e) => setMachineryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="Baños">Baños (Sanitarios, Griferías, Válvulas, Fluxómetros)</option>
                  <option value="Cocinas">Cocinas (Lavaplatos, Griferías, Sifones, Trampas de Grasa)</option>
                  <option value="Duchas">Duchas (Mezcladores, Regaderas, Teleduchas, Cartuchos)</option>
                  <option value="Jacuzzis">Jacuzzis & Spas (Hidromasajes, Bombas, Blowers, Calentadores)</option>
                  <option value="Sondeo">Sondeo & Desobstrucción (Tuberías, Cajas, Hidrojet, Sifones)</option>
                  <option value="Otros">Otros (Sistemas de Presión, Tanques, Redes Hidráulicas Generales)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo Específico / Accesorio / Componente:
                </label>
                <input
                  type="text"
                  value={specificAccessory}
                  onChange={(e) => setSpecificAccessory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Ej: Grifería monocontrol, válvula de descarga, desobstrucción sifón, bomba jacuzzi..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  Fecha Sugerida de Atención:
                </label>
                <input
                  type="date"
                  value={suggestedDate}
                  onChange={(e) => setSuggestedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Hora Sugerida:
                </label>
                <select
                  value={suggestedTime}
                  onChange={(e) => setSuggestedTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="07:00 AM">07:00 AM (Primera hora)</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="INMEDIATA">Inmediata (Urgencia / 24/7)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción del Problema o Requerimiento Técnico:
                </label>
                <textarea
                  rows={3}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Describa síntomas, ruidos anormales, pérdida de presión, fugas visibles o componentes que requieren reemplazo..."
                />
              </div>

              {/* Photo Upload Box */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Evidencia Fotográfica / Diagrama (Opcional):
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-sky-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                  <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Arrastra fotos o haz clic para adjuntar evidencias
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite a los ingenieros preparar los repuestos y herramientas exactas antes de salir.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="service-request-photo-upload"
                  />
                  <label
                    htmlFor="service-request-photo-upload"
                    className="inline-block mt-2.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Seleccionar Archivos
                  </label>
                </div>

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {photoPreviews.map((url, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={url} alt={`Evidencia ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= 4.3. DATOS DE LA EMPRESA O CLIENTE ================= */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                Datos de la Empresa / Cliente & Ubicación
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-500" />
                  Nombre o Razón Social:
                </label>
                <input
                  type="text"
                  required
                  value={clientCompanyName}
                  onChange={(e) => setClientCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Ej: Conjunto Residencial Cerros de Sotavento / Industrias SAS"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  Tipo y Número de Documento:
                </label>
                <div className="flex gap-2">
                  <select
                    value={clientDocType}
                    onChange={(e) => setClientDocType(e.target.value as any)}
                    className="w-28 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="NIT">NIT</option>
                    <option value="Cédula">Cédula</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={clientDocNumber}
                    onChange={(e) => setClientDocNumber(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ej: 900.284.102-4"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="administracion@conjunto.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                  Teléfono / WhatsApp Móvil:
                </label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="+57 312 458 9012"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  Dirección Exacta de la Planta / Instalación:
                </label>
                <input
                  type="text"
                  required
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Ej: Cra 7 # 127-45 Cuarto de Bombas Torre A, Bogotá D.C."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4.4. CANCELAR O ENVIAR SOLICITUD ================= */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {cart.length > 0 ? (
              <span>
                Incluye <strong>{cart.reduce((a, b) => a + b.quantity, 0)} repuestos</strong> por{' '}
                <strong className="text-purple-600 font-mono">{formatCOP(cartTotalCOP)}</strong>
              </span>
            ) : (
              <span>Se creará una Orden de Trabajo con prioridad <strong>{urgencyLevel}</strong>.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-lg shadow-sky-600/30 active:scale-95 transition-transform text-xs flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Enviar Solicitud de Servicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
