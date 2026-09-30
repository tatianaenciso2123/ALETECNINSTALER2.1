import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { UserRole, ThemeColorId, THEME_OPTIONS, AppNotification } from '../types';
import { AuthUser } from './auth/LoginPage';
import { AndroidApkModal } from './common/AndroidApkModal';
import {
  Building2,
  Wrench,
  UserCheck,
  Cpu,
  BookOpen,
  Bell,
  Activity,
  ShieldCheck,
  PhoneCall,
  LogOut,
  User,
  Calculator,
  MapPin,
  FileText,
  DollarSign,
  Users,
  Palette,
  Check,
  Sun,
  Moon,
  Sparkles,
  ClipboardCheck,
  Receipt,
  TrendingUp,
  X,
  CheckCheck,
  Share2,
  Calendar,
  Boxes,
  ShoppingCart,
  UserCog,
  Smartphone,
  Download,
  Folder,
  FolderOpen,
  ChevronDown,
  Coins,
  Building,
  Package,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  activeTab: string;
  isDarkMode: boolean;
  currentTheme?: ThemeColorId;
  currentUser?: AuthUser | null;
  notifications?: AppNotification[];
  pendingValidationCount?: number;
  onRoleChange: (role: UserRole) => void;
  onTabChange: (tab: string) => void;
  onToggleDarkMode: () => void;
  onChangeTheme?: (themeId: ThemeColorId) => void;
  onTriggerEmergency: () => void;
  onLogout: () => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onSelectNotification?: (notif: AppNotification) => void;
  onOpenShareCleanModal?: () => void;
  onOpenAdminProfile?: () => void;
  onOpenCompanySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  isDarkMode,
  currentTheme = 'dark-sky',
  currentUser,
  notifications = [],
  pendingValidationCount = 0,
  onRoleChange,
  onTabChange,
  onToggleDarkMode,
  onChangeTheme,
  onTriggerEmergency,
  onLogout,
  onMarkNotificationAsRead,
  onSelectNotification,
  onOpenShareCleanModal,
  onOpenAdminProfile,
  onOpenCompanySettings,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isAccountingMenuOpen, setIsAccountingMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const accountingMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (accountingMenuRef.current && !accountingMenuRef.current.contains(event.target as Node)) {
        setIsAccountingMenuOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
        setIsResourcesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const activeThemeObj = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-lg mobile-landscape-compact-header">
      {/* Top Corporate Status Bar */}
      <div className="bg-slate-950 px-2 sm:px-4 py-1 sm:py-1.5 border-b border-slate-800/80 text-[10px] sm:text-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3 mobile-landscape-compact-header">
        <div className="flex items-center gap-2 sm:gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Servidor Hidráulico Operativo</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Certificación ISO 9001 & Decreto 1575
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsAndroidApkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 text-emerald-300 text-[10px] sm:text-[11px] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm shadow-emerald-950 cursor-pointer"
            title="Descargar APK Android y ver pipeline CI/CD"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Descargar APK Android ✅</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400">
            <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-300 hidden xs:inline">Línea 24/7:</span>
            <a href="tel:+573004478151" className="text-sky-400 font-bold hover:underline">
              300 447 8151
            </a>
          </div>

          <button
            onClick={onTriggerEmergency}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold transition-transform active:scale-95 shadow-sm shadow-rose-900/50"
          >
            <PhoneCall className="w-3 h-3 animate-bounce" />
            <span>Reportar Urgencia</span>
          </button>
        </div>
      </div>

      {/* Main Header & User Info Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        {/* Brand Logo & Mobile Role Pill Row */}
        <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
          <BrandLogo
            size="md"
            theme="white"
            textVariant="full"
            className="cursor-pointer"
          />

          {/* Mobile User Role Badge next to brand name on mobile */}
          <div className="sm:hidden flex items-center gap-1.5">
            <span className="text-[10px] bg-sky-900/70 text-sky-300 px-2.5 py-0.5 rounded-md border border-sky-600/50 font-bold uppercase tracking-wider shadow-sm">
              {currentRole === 'admin'
                ? 'Admin'
                : currentRole === 'technician'
                ? 'Empleado'
                : 'Cliente'}
            </span>
          </div>
        </div>

        {/* Action Functions: Displayed directly below Company Name on Android / On the Right on Tablet & Web */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-1.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-t-0">
          {/* Authenticated User Pill - Clickable to edit administrator data */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                if (currentRole === 'admin' && onOpenAdminProfile) {
                  onOpenAdminProfile();
                }
              }}
              className={`flex items-center gap-2 bg-slate-950 hover:bg-slate-800/90 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 hover:border-sky-500/60 text-xs transition-all ${
                currentRole === 'admin' ? 'cursor-pointer group active:scale-95' : 'cursor-default'
              } text-left shadow-sm shrink-0`}
              title={
                currentRole === 'admin'
                  ? 'Clic para cambiar y editar los datos del Administrador'
                  : `Usuario autenticado: ${currentUser.fullName}`
              }
              id="header-user-profile-btn"
            >
              <div className="relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-sky-400/50 shadow-sm"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-[11px] sm:text-[12px] shadow-sm">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                {currentRole === 'admin' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[8px] text-white border border-slate-900 group-hover:scale-110 transition-transform">
                    ✎
                  </span>
                )}
              </div>
              <div className="text-left max-w-[110px] sm:max-w-[150px]">
                <div className="font-bold text-white leading-tight truncate group-hover:text-sky-300 text-[11px] sm:text-xs">
                  {currentUser.fullName}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-slate-300 truncate hidden xs:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>{currentRole === 'admin' ? 'Administrador' : currentUser.email || currentUser.username}</span>
                </div>
              </div>
            </button>
          )}

          {/* Group of Interactive Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Real-time Notifications Bell */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[34px] sm:min-w-[36px] min-h-[34px] sm:min-h-[36px]"
                title="Notificaciones de reportes y facturación"
                id="navbar-notification-bell-btn"
              >
                <Bell className="w-4 h-4 text-sky-400" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse shadow-md shadow-rose-900/50">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Modal - Responsive for Android Portrait & Landscape */}
              {isNotifMenuOpen && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-28 sm:top-full mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[80vh] landscape:max-h-[calc(100vh-60px)] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl flex flex-col">
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Centro de Notificaciones
                      </span>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {unreadNotifications.length} nuevas
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3 space-y-2 max-h-[50vh] sm:max-h-[320px] landscape:max-h-[38vh] overflow-y-auto pr-1 flex-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay notificaciones en este momento.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (onMarkNotificationAsRead) onMarkNotificationAsRead(notif.id);
                            if (onSelectNotification) onSelectNotification(notif);
                            if (notif.actionUrl) onTabChange(notif.actionUrl);
                            setIsNotifMenuOpen(false);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.read
                              ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                              : 'bg-slate-800/80 border-sky-500/50 text-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-white text-xs">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Sincronización en vivo
                    </span>
                    <button
                      onClick={() => setIsNotifMenuOpen(false)}
                      className="text-slate-300 hover:text-white font-medium hover:underline px-2 py-1"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Color Theme Selector Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm hover:border-slate-700 active:scale-95 min-h-[34px] sm:min-h-[36px]"
                title="Seleccionar paleta y color del tema"
                id="theme-palette-dropdown-btn"
              >
                <span className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${activeThemeObj.dotBg} shadow-sm shrink-0`} />
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                <span className="hidden xs:inline font-medium text-slate-300 text-[11px] sm:text-xs">
                  {activeThemeObj.name.split(' ')[0]}
                </span>
                <span className="text-[10px] sm:text-[11px]">{isDarkMode ? '🌙' : '☀️'}</span>
              </button>

              {/* Dropdown Menu with Multiple Color Themes - Responsive Grid for Android */}
              {isThemeMenuOpen && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-28 sm:top-full mt-2 w-auto sm:w-[420px] max-w-[calc(100vw-1rem)] max-h-[82vh] landscape:max-h-[calc(100vh-60px)] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3.5 sm:p-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl flex flex-col">
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Paleta de Temas y Colores
                      </span>
                    </div>
                    <button
                      onClick={onToggleDarkMode}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-colors"
                      title="Alternar entre modo claro y oscuro"
                    >
                      {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
                      <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                  </div>

                  <div className="mt-2.5 sm:mt-3 space-y-3 sm:space-y-4 max-h-[58vh] sm:max-h-[380px] landscape:max-h-[42vh] overflow-y-auto pr-1 flex-1">
                    {/* Category: Oscuros */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Moon className="w-3 h-3 text-sky-400" />
                        Temas Oscuros de Alta Precisión (Android & Web)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        {THEME_OPTIONS.filter((t) => t.category === 'Oscuro').map((theme) => {
                          const isSelected = currentTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => {
                                if (onChangeTheme) onChangeTheme(theme.id);
                                setIsThemeMenuOpen(false);
                              }}
                              className={`flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl text-left border transition-all ${
                                isSelected
                                  ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-md shadow-sky-950/50'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full ${theme.dotBg} shrink-0 mt-0.5 shadow-sm`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                    {theme.name}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                                  {theme.badge}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category: Claros */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Sun className="w-3 h-3 text-amber-400" />
                        Temas Claros Diurnos (Android & Web)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        {THEME_OPTIONS.filter((t) => t.category === 'Claro').map((theme) => {
                          const isSelected = currentTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => {
                                if (onChangeTheme) onChangeTheme(theme.id);
                                setIsThemeMenuOpen(false);
                              }}
                              className={`flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl text-left border transition-all ${
                                isSelected
                                  ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-md shadow-sky-950/50'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full ${theme.dotBg} shrink-0 mt-0.5 shadow-sm`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                    {theme.name}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                                  {theme.badge}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      Sincronización Android automática
                    </span>
                    <button
                      onClick={() => setIsThemeMenuOpen(false)}
                      className="text-slate-300 hover:text-white font-medium hover:underline px-2 py-1"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile & Company Settings buttons */}
            {currentRole === 'admin' && (
              <div className="hidden lg:flex items-center gap-1.5">
                {onOpenAdminProfile && (
                  <button
                    onClick={onOpenAdminProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Editar Perfil del Administrador"
                  >
                    <UserCog className="w-3.5 h-3.5 text-sky-400" />
                    <span>Perfil Admin</span>
                  </button>
                )}
                {onOpenCompanySettings && (
                  <button
                    onClick={onOpenCompanySettings}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Editar Datos y Configuración de la Empresa"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Datos Empresa</span>
                  </button>
                )}
              </div>
            )}

            {/* Admin Share & Reset History / Clean Mode button */}
            {currentRole === 'admin' && onOpenShareCleanModal && (
              <button
                onClick={onOpenShareCleanModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Compartir enlace limpio sin cuentas demo y gestionar historial en 0"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Compartir Link Limpio</span>
              </button>
            )}

            {/* Android APK status button for quick access */}
            <button
              onClick={() => setIsAndroidApkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/80 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Descargar App Android APK (Release & Debug)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Descargar APK</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-700/60 text-xs font-bold transition-all min-h-[34px] sm:min-h-[36px]"
              title="Cerrar sesión y volver a la página de ingreso"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden xs:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Tabs Navigation */}
      <div className="bg-slate-900/95 border-t border-slate-800/70 px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto sm:overflow-visible no-scrollbar">
            {/* ================= ADMIN TABS ================= */}
            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Dashboard General
                </button>

                <button
                  onClick={() => onTabChange('visits_calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'visits_calendar'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Calendario de Visitas
                </button>

                <button
                  onClick={() => onTabChange('audit_control')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
                    activeTab === 'audit_control'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
                  Auditoría & Control de OTs
                  {pendingValidationCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      {pendingValidationCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onTabChange('tech_reports_history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'tech_reports_history'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-tab-tech-reports-history"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Historial Fichas del Mes
                </button>

                {/* Carpeta de Gestión, Directorio & Bodega (Dropdown Folder) */}
                <div className="relative" ref={resourcesMenuRef}>
                  <button
                    onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      ['clients', 'technicians', 'talent', 'suppliers', 'warehouse', 'talent_clients'].includes(activeTab)
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold shadow-sm shadow-sky-950'
                        : isResourcesMenuOpen
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    id="nav-tab-resources-folder"
                    title="Carpeta de Recursos: Clientes, Talento Humano, Proveedores y Bodega"
                  >
                    {isResourcesMenuOpen || ['clients', 'technicians', 'talent', 'suppliers', 'warehouse', 'talent_clients'].includes(activeTab) ? (
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-indigo-400/90" />
                    )}
                    <span>Directorio & Bodega</span>
                    {['clients', 'technicians', 'talent', 'suppliers', 'warehouse', 'talent_clients'].includes(activeTab) && (
                      <span className="hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-semibold">
                        {activeTab === 'clients'
                          ? 'Clientes'
                          : activeTab === 'technicians' || activeTab === 'talent'
                          ? 'Talento Humano'
                          : activeTab === 'suppliers'
                          ? 'Proveedores'
                          : 'Bodega'}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                        isResourcesMenuOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </button>

                  {/* Resources Dropdown Menu */}
                  {isResourcesMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/80 z-[100] p-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl ring-1 ring-white/10">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                          <FolderOpen className="w-4 h-4" />
                          <span>Carpeta de Directorio & Bodega</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">4 módulos</span>
                      </div>

                      <div className="space-y-1">
                        {/* 1. Clientes & Copropiedades */}
                        <button
                          onClick={() => {
                            onTabChange('clients');
                            setIsResourcesMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'clients'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-400 shrink-0 mt-0.5">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Clientes & Copropiedades</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 font-semibold border border-sky-600/40">
                                Clientes
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Copropiedades, administradores y equipos
                            </div>
                          </div>
                        </button>

                        {/* 2. Talento Humano & Técnicos */}
                        <button
                          onClick={() => {
                            onTabChange('technicians');
                            setIsResourcesMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'technicians' || activeTab === 'talent'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-400 shrink-0 mt-0.5">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Talento Humano & Técnicos</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-semibold border border-purple-600/40">
                                Personal
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Hojas de vida, contratos y licencias CONTE
                            </div>
                          </div>
                        </button>

                        {/* 3. Directorio de Proveedores */}
                        <button
                          onClick={() => {
                            onTabChange('suppliers');
                            setIsResourcesMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'suppliers'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Proveedores & Servicios</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-semibold border border-indigo-600/40">
                                Proveedores
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Directorio de repuestos, servicios y bancos
                            </div>
                          </div>
                        </button>

                        {/* 4. Bodega & Repuestos */}
                        <button
                          onClick={() => {
                            onTabChange('warehouse');
                            setIsResourcesMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'warehouse'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 mt-0.5">
                            <Boxes className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Bodega & Repuestos</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold border border-emerald-600/40">
                                Stock
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Inventario, stock crítico y entradas/salidas
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Carpeta de Contabilidad (Dropdown Folder) */}
                <div className="relative" ref={accountingMenuRef}>
                  <button
                    onClick={() => setIsAccountingMenuOpen(!isAccountingMenuOpen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      ['invoicing', 'finance', 'supplier_bills'].includes(activeTab)
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold shadow-sm shadow-sky-950'
                        : isAccountingMenuOpen
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    id="nav-tab-accounting-folder"
                    title="Carpeta de Contabilidad: Facturación DIAN, Caja Menor y Cuentas por Pagar"
                  >
                    {isAccountingMenuOpen || ['invoicing', 'finance', 'supplier_bills'].includes(activeTab) ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-400/90" />
                    )}
                    <span>Contabilidad</span>
                    {['invoicing', 'finance', 'supplier_bills'].includes(activeTab) && (
                      <span className="hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded-md bg-sky-600/30 text-sky-200 border border-sky-500/30 font-semibold">
                        {activeTab === 'invoicing'
                          ? 'Facturas'
                          : activeTab === 'finance'
                          ? 'Recaudo en Efectivo'
                          : 'Proveedores'}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                        isAccountingMenuOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </button>

                  {/* Accounting Dropdown Menu */}
                  {isAccountingMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/80 z-[100] p-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl ring-1 ring-white/10">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                          <FolderOpen className="w-4 h-4" />
                          <span>Carpeta de Contabilidad</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">3 módulos</span>
                      </div>

                      <div className="space-y-1">
                        {/* 1. Facturación Diaria & Pagos */}
                        <button
                          onClick={() => {
                            onTabChange('invoicing');
                            setIsAccountingMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'invoicing'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 mt-0.5">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Facturación Diaria & Pagos</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold border border-emerald-600/40">
                                DIAN
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Facturación electrónica, cartera y cobros
                            </div>
                          </div>
                        </button>

                        {/* 2. Recaudo en Efectivo & Caja Menor */}
                        <button
                          onClick={() => {
                            onTabChange('finance');
                            setIsAccountingMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'finance'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0 mt-0.5">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Recaudo en Efectivo & Caja Menor</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold border border-emerald-600/40">
                                Recaudo / Caja
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Cobro facturas, abonos, ingresos diarios/mes y arqueo
                            </div>
                          </div>
                        </button>

                        {/* 3. Proveedores & Servicios Públicos */}
                        <button
                          onClick={() => {
                            onTabChange('supplier_bills');
                            setIsAccountingMenuOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeTab === 'supplier_bills'
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 font-bold'
                              : 'hover:bg-slate-800/90 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-xs font-bold text-white">Proveedores & Servicios</div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-semibold border border-indigo-600/40">
                                Cuentas x Pagar
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              Facturas de compras, servicios y bancos
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onTabChange('dispatch_map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'dispatch_map'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Despacho & GPS
                </button>

                <button
                  onClick={() => onTabChange('predictive_ai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'predictive_ai'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  Predictivo IA Multimodal
                </button>
              </>
            )}

            {/* ================= TECHNICIAN TABS ================= */}
            {currentRole === 'technician' && (
              <>
                <button
                  onClick={() => onTabChange('tech_agenda')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'tech_agenda'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Mis Servicios Asignados
                </button>

                <button
                  onClick={() => onTabChange('visits_calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'visits_calendar'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Calendario de Visitas
                </button>

                <button
                  onClick={() => onTabChange('tech_report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'tech_report'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Hoja de Reporte Digital
                </button>

                <button
                  onClick={() => onTabChange('tech_reports_history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'tech_reports_history'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id="nav-tab-tech-reports-history-tech"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Historial Fichas del Mes
                </button>

                <button
                  onClick={() => onTabChange('warehouse')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'warehouse'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  Bodega & Repuestos
                </button>

                <button
                  onClick={() => onTabChange('tech_cash')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'tech_cash'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Recaudo en Efectivo
                </button>

                <button
                  onClick={() => onTabChange('predictive_ai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'predictive_ai'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  Copiloto & IA Multimodal
                </button>
              </>
            )}

            {/* ================= CLIENT PORTAL TABS ================= */}
            {currentRole === 'client' && (
              <>
                <button
                  onClick={() => onTabChange('client_portal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'client_portal'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Estado de Mis Equipos & Órdenes
                </button>

                <button
                  onClick={() => onTabChange('client_billing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'client_billing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  Facturación DIAN & Pagos PSE
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Android Native APK & Repository Checklist Modal */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
      />
    </header>
  );
};
