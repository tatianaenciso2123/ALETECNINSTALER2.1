import React, { useState } from 'react';
import { SparePart, ClientAccount } from '../../types';
import { formatCOP } from '../../utils/formatters';
import {
  ShoppingCart,
  Search,
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Building,
  ShieldCheck,
  Tag,
  Boxes,
  Truck,
  Filter,
  X,
} from 'lucide-react';

interface ClientSparePartsStoreProps {
  client: ClientAccount;
  spareParts: SparePart[];
  onOrderSpareParts: (cartItems: { part: SparePart; quantity: number }[], notes?: string) => void;
  onOpenServiceRequestWithParts?: (cartItems: { part: SparePart; quantity: number }[]) => void;
}

export const ClientSparePartsStore: React.FC<ClientSparePartsStoreProps> = ({
  client,
  spareParts,
  onOrderSpareParts,
  onOpenServiceRequestWithParts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<{ part: SparePart; quantity: number }[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const categories = ['Todos', ...Array.from(new Set(spareParts.map((p) => p.category)))];

  const filteredParts = spareParts.filter((part) => {
    const matchesCategory = selectedCategory === 'Todos' || part.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      part.name.toLowerCase().includes(q) ||
      part.code.toLowerCase().includes(q) ||
      part.brand.toLowerCase().includes(q) ||
      part.category.toLowerCase().includes(q) ||
      part.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const addToCart = (part: SparePart) => {
    if (part.stock <= 0) return; // Prevent adding out-of-stock items

    setCart((prev) => {
      const existing = prev.find((item) => item.part.id === part.id);
      if (existing) {
        if (existing.quantity >= part.stock) {
          return prev; // cannot exceed available stock
        }
        return prev.map((item) =>
          item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { part, quantity: 1 }];
    });
  };

  const updateQuantity = (partId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.part.id === partId) {
            const targetPart = spareParts.find((p) => p.id === partId);
            const maxStock = targetPart ? targetPart.stock : 99;
            const newQty = item.quantity + delta;
            if (newQty > maxStock) return item;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { part: SparePart; quantity: number }[]
    );
  };

  const removeFromCart = (partId: string) => {
    setCart((prev) => prev.filter((item) => item.part.id !== partId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalCOP = cart.reduce((acc, item) => acc + item.part.unitPriceCOP * item.quantity, 0);
  const ivaCOP = Math.round(subtotalCOP * 0.19);
  const totalCOP = subtotalCOP + ivaCOP;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    onOrderSpareParts(cart, orderNotes);
    setOrderSubmitted(true);
    setCart([]);
    setShowCartModal(false);
    setTimeout(() => {
      setOrderSubmitted(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Confirmation */}
      {orderSubmitted && (
        <div className="p-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>
              ¡Pedido de repuestos registrado con éxito! El centro de despacho preparará el envío para {client.companyName}.
            </span>
          </div>
          <button onClick={() => setOrderSubmitted(false)} className="text-white/80 hover:text-white underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold">
              <Boxes className="w-3.5 h-3.5" />
              Galería Oficial de Repuestos & Suministros Originales
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Venta de Repuestos para Equipos de Bombeo
            </h1>
            <p className="text-xs text-slate-300">
              Suministro directo garantizado de sellos mecánicos, rodamientos, presostatos, variadores de frecuencia y válvulas certificadas para <strong>{client.companyName}</strong>.
            </p>
          </div>

          {/* Quick Cart Floating Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCartModal(true)}
              className="relative px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-500/30 transition-transform active:scale-95 flex items-center gap-2.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Ver Carrito de Compras</span>
              {totalUnits > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white text-sky-900 font-extrabold text-[11px] ml-1">
                  {totalUnits}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por repuesto, código SKU, marca (Barnes, SKF, Danfoss)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spare Parts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredParts.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              No se encontraron repuestos con los filtros seleccionados
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba buscando por otra palabra clave o selecciona la categoría "Todos".
            </p>
          </div>
        ) : (
          filteredParts.map((part) => {
            const isOutOfStock = part.stock <= 0;
            const cartItem = cart.find((item) => item.part.id === part.id);

            return (
              <div
                key={part.id}
                className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-50 dark:bg-slate-900/60 border-rose-200 dark:border-rose-900/50 opacity-90'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                }`}
              >
                {/* Image & Stock Badge Header */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={part.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80'}
                    alt={part.name}
                    className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                      isOutOfStock ? 'grayscale opacity-60' : ''
                    }`}
                  />

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-600/40">
                        <AlertTriangle className="w-3 h-3" />
                        AGOTADO
                      </span>
                    ) : part.stock <= part.minStock ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        Últimas {part.stock} unid.
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        Disponible ({part.stock} {part.unit}s)
                      </span>
                    )}
                  </div>

                  {/* Category Tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-400" />
                      {part.category}
                    </span>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>SKU: <strong>{part.code}</strong></span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">{part.brand}</span>
                    </div>

                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug" title={part.name}>
                      {part.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {part.description}
                    </p>
                  </div>

                  {/* Pricing and Add to Cart */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio Unitario</span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatCOP(part.unitPriceCOP)}
                      </span>
                    </div>

                    {/* Button / Stepper */}
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold cursor-not-allowed border border-rose-200 dark:border-rose-900/40 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Agotado</span>
                      </button>
                    ) : cartItem ? (
                      <div className="flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 p-1 rounded-xl border border-sky-200 dark:border-sky-800">
                        <button
                          onClick={() => updateQuantity(part.id, -1)}
                          className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-sky-600 shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-black text-xs text-sky-700 dark:text-sky-300">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(part.id, 1)}
                          disabled={cartItem.quantity >= part.stock}
                          className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-sky-600 shadow-sm disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(part)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Modal / Drawer */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Carrito de Repuestos & Suministros
                  </h2>
                  <p className="text-xs text-slate-500">
                    {client.companyName} • {client.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">Tu carrito de repuestos está vacío.</p>
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
                  >
                    Explorar Galería de Repuestos
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(({ part, quantity }) => (
                    <div
                      key={part.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <img
                        src={part.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80'}
                        alt={part.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {part.name}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          SKU: {part.code} • {part.brand}
                        </div>
                        <div className="font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                          {formatCOP(part.unitPriceCOP)} c/u
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => updateQuantity(part.id, -1)}
                          className="text-slate-500 hover:text-rose-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black px-1.5">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(part.id, 1)}
                          disabled={quantity >= part.stock}
                          className="text-slate-500 hover:text-sky-600 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal Item */}
                      <div className="text-right min-w-[80px]">
                        <span className="font-black text-slate-900 dark:text-white font-mono">
                          {formatCOP(part.unitPriceCOP * quantity)}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(part.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                        title="Eliminar repuesto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Notes */}
              {cart.length > 0 && (
                <div className="pt-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Instrucciones de Despacho o Equipo Destino (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ej. Entregar en portería torre central con atención a técnico de turno..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Footer Calculation & Submit */}
            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal Repuestos:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCOP(subtotalCOP)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCOP(ivaCOP)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Pedido:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400">{formatCOP(totalCOP)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                  >
                    Vaciar Carrito
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full sm:flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Confirmar Pedido & Despacho a Copropiedad</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
