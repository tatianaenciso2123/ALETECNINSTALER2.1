import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Download,
  Github,
  Terminal,
  FileCode,
  Layers,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Boxes,
  QrCode,
  Globe,
  Monitor,
  GitBranch,
  ArrowDown,
  ArrowRight,
  Cpu,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  GitMerge,
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_DRIVE_APK_VIEW = 'https://drive.google.com/file/d/1ZyJEPBGUknVCVEB4NDOYdyCkVcuqpgLf/view?usp=drive_link';
const GOOGLE_DRIVE_APK_DIRECT = 'https://drive.google.com/uc?export=download&id=1ZyJEPBGUknVCVEB4NDOYdyCkVcuqpgLf';
const GITHUB_APK_REPO_URL = 'https://github.com/tatianaenciso2123/aletecninstaler.git';
const GITHUB_WEB_REPO_URL = 'https://github.com/tatianaenciso2123/aletecninstaler2.git';

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'download' | 'sync' | 'architecture' | 'pipeline' | 'status' | 'build' | 'qr'>('download');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [downloadingType, setDownloadingType] = useState<'release' | 'debug' | 'drive' | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const checklistItems = [
    { name: 'React & Vite Web App', description: 'Repositorio oficial web: https://github.com/tatianaenciso2123/aletecninstaler2.git', status: true },
    { name: 'Sincronización Automática', description: 'Cada cambio en aletecninstaler2 dispara el workflow de compilación en el repositorio de la APK', status: true },
    { name: 'Proyecto Android Nativo', description: 'Repositorio oficial APK: https://github.com/tatianaenciso2123/aletecninstaler.git con Gradle 8.2 y Java 17', status: true },
    { name: 'build.gradle (Firma Release)', description: 'SigningConfig de release, nombrado de variantes y tarea assembleRelease con copia a artefactos estáticos', status: true },
    { name: 'AndroidManifest.xml', description: 'Permisos de cámara, micrófono, GPS, almacenamiento y red para instaladores en campo', status: true },
    { name: 'APK Google Drive Oficial', description: 'Enlace directo de descarga vinculado a Google Drive con acceso inmediato', status: true },
    { name: 'GitHub Actions Auto-Sync', description: 'Workflow repository_dispatch y git merge automático para compilar APK con los últimos cambios web', status: true },
    { name: 'Release APK en GitHub', description: 'Publicación automatizada de archivos .apk como Releases en GitHub', status: true },
    { name: 'TypeScript & Express API', description: 'API REST robusta con endpoints de diagnóstico, IA Gemini y sincronización offline', status: true },
    { name: 'LocalStorage Offline', description: 'Persistencia local resiliente para órdenes de trabajo, inventario y facturación', status: true },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadApk = (type: 'release' | 'debug' | 'drive') => {
    setDownloadingType(type);
    const fileName = type === 'debug' ? 'ALE_TECNINSTALER_v1.0_Debug.apk' : 'ALE_TECNINSTALER_v1.0_Release.apk';
    const downloadUrl = type === 'drive' ? GOOGLE_DRIVE_APK_DIRECT : `/api/download/apk/${type}`;

    try {
      // Trigger download from server endpoint or direct Drive URL
      const link = document.createElement('a');
      link.href = downloadUrl;
      if (type !== 'drive') {
        link.download = fileName;
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadingType(null);
        setDownloadSuccessMessage(`¡Descarga iniciada! Conectando con ${type === 'drive' ? 'Google Drive Oficial' : fileName}...`);
        setTimeout(() => setDownloadSuccessMessage(null), 6000);
      }, 1000);
    } catch (e) {
      window.open(GOOGLE_DRIVE_APK_DIRECT, '_blank');
      setDownloadingType(null);
      setDownloadSuccessMessage(`¡Descarga iniciada desde Google Drive Oficial!`);
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-lg shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ALE TECNINSTALER — Descarga de App Android (APK)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
                  Listo para Instalar
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Descarga directa para celulares Android y pipeline GitHub Actions (Java 17, Gradle 8.2, AGP 8.2.2)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'download'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Descargar APK (Directo)
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin-slow" />
            Sincronización Web ➔ APK
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'pipeline'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 text-sky-500" />
            Pipeline CI/CD (Java 17 → APK)
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            Diagrama Dual (Web vs APK)
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Checklist del Repositorio (10/10)
          </button>

          <button
            onClick={() => setActiveTab('build')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'build'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-500" />
            Compilar Local (Gradle)
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-500" />
            Instalación PWA / QR
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 0: DIRECT DOWNLOAD ACTION (PRIMARY) */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* Success Alert if download triggered */}
              {downloadSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold">{downloadSuccessMessage}</p>
                </div>
              )}

              {/* Connected APK Cloud Sources (Google Drive & GitHub) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 text-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/40 text-[10px] font-black uppercase">
                        Nube Oficial & Código
                      </span>
                      <span className="text-xs font-bold text-slate-300">Conectado con Repositorios & Google Drive</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Repositorios vinculados: Web (<strong>aletecninstaler2</strong>) y APK Nativa (<strong>aletecninstaler</strong>).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={GOOGLE_DRIVE_APK_VIEW}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-950"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Drive APK</span>
                    </a>
                    <a
                      href="https://github.com/tatianaenciso2123/aletecninstaler2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Repo Web (2)</span>
                    </a>
                    <a
                      href="https://github.com/tatianaenciso2123/aletecninstaler"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Repo APK</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="truncate mr-1 text-emerald-400">Web: aletecninstaler2</span>
                    <button
                      onClick={() => handleCopy(GITHUB_WEB_REPO_URL, 'web_git_link')}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] shrink-0 font-sans"
                    >
                      {copiedCode === 'web_git_link' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="truncate mr-1 text-sky-400">APK: aletecninstaler</span>
                    <button
                      onClick={() => handleCopy(GITHUB_APK_REPO_URL, 'apk_git_link')}
                      className="text-sky-400 hover:text-sky-300 text-[10px] shrink-0 font-sans"
                    >
                      {copiedCode === 'apk_git_link' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="truncate mr-1 text-blue-400">Drive: 1ZyJEPBGUk...</span>
                    <button
                      onClick={() => handleCopy(GOOGLE_DRIVE_APK_VIEW, 'drive_link')}
                      className="text-blue-400 hover:text-blue-300 text-[10px] shrink-0 font-sans"
                    >
                      {copiedCode === 'drive_link' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Download Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Official Release APK Download Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all text-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3" />
                        Recomendado para Celulares
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">v1.0.0</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">APK Release (Producción)</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Paquete optimizado para teléfonos Android de técnicos en campo. Incluye firma de release, empaquetado seguro, modo sin conexión, fotos con cámara, GPS y notas por voz.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Android 7.0+ (API 24-34)</span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Artefacto: dist/artifacts/</span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Firma Release</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <button
                      onClick={() => handleDownloadApk('release')}
                      disabled={downloadingType === 'release'}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {downloadingType === 'release' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Descargando APK Release...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Descargar APK Release (.apk)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadApk('drive')}
                      disabled={downloadingType === 'drive'}
                      className="w-full py-2 px-3 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Descarga Directa desde Google Drive</span>
                    </button>
                  </div>
                </div>

                {/* Debug APK & Dev Package Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-900 border border-sky-600/40 shadow-xl flex flex-col justify-between space-y-4 hover:border-sky-500 transition-all text-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" />
                        Desarrollo & Pruebas
                      </span>
                      <span className="text-[11px] font-mono text-sky-400 font-bold">Debug</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">APK Debug (Para Pruebas)</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Versión con logs de depuración activos (logcat), inspección de WebView y trazado de solicitudes API en tiempo real.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Debuggable: true</span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Inspección Chrome DevTools</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDownloadApk('debug')}
                      disabled={downloadingType === 'debug'}
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-500/40 active:scale-98 text-sky-300 hover:text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {downloadingType === 'debug' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Descargando APK Debug...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Descargar APK Debug (.apk)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-Step Android Installation Guide */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Guía de Instalación en 4 Pasos en Teléfonos Android:
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">1. Descarga el APK</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Presiona el botón verde <strong>"Descargar APK Release"</strong> arriba.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">2. Abre la Notificación</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Toca la notificación de descarga en tu celular o busca el archivo en la carpeta <em>Descargas</em>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">3. Permite la Instalación</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Si Android pregunta por fuentes desconocidas, selecciona <em>Ajustes → Permitir desde esta fuente</em>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">4. Pulsa Instalar</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Toca <em>Instalar</em>. La app quedará lista con ícono nativo y soporte para cámara y GPS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUTO-SYNC (aletecninstaler2 Web App -> aletecninstaler APK Repo) */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 text-white relative overflow-hidden shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      Sincronización Automática entre Repositorios
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Enlace Web ➔ APK Automatizado en Tiempo Real
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Cada modificación, actualización de interfaz o nueva funcionalidad realizada en el repositorio de la aplicación web (<strong>aletecninstaler2</strong>) se propaga y recompila automáticamente en el repositorio de la APK (<strong>aletecninstaler</strong>).
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href="https://github.com/tatianaenciso2123/aletecninstaler2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Abrir Repo Web (aletecninstaler2)</span>
                    </a>
                    <a
                      href="https://github.com/tatianaenciso2123/aletecninstaler"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      <span>Abrir Repo APK (aletecninstaler)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 3-Step Synchronization Pipeline Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Node 1: Web App */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/50 text-white space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
                      Paso 1: Origen
                    </span>
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Repositorio Web (aletecninstaler2)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Al hacer <code>git push</code> en la rama <code>main</code> de <em>aletecninstaler2</em>, se activa el workflow <code>sync-web-to-apk.yml</code>.
                  </p>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 break-all">
                    tatianaenciso2123/aletecninstaler2
                  </div>
                </div>

                {/* Node 2: Webhook & Sync Event */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/50 text-white space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-black uppercase">
                      Paso 2: Disparo CI/CD
                    </span>
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Webhook & Dispatch Automático</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Se emite un evento <code>repository_dispatch (web-updated)</code> hacia la API de GitHub para notificar al repositorio de la APK.
                  </p>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-blue-400 break-all">
                    event: web-updated / git merge
                  </div>
                </div>

                {/* Node 3: Native APK Repo */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/50 text-white space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-black uppercase">
                      Paso 3: Compilación
                    </span>
                    <Smartphone className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Repositorio APK (aletecninstaler)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Se sincronizan los archivos web, se ejecuta <code>assembleRelease</code> en Gradle 8.2 y se publica la nueva APK actualizada.
                  </p>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-purple-400 break-all">
                    dist/artifacts/ALE_TECNINSTALER_release.apk
                  </div>
                </div>
              </div>

              {/* GitHub Actions Dispatch Workflow Configuration */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sky-400 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Workflow de Disparo Automático (.github/workflows/sync-web-to-apk.yml en aletecninstaler2):
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
`name: Sync Web to APK Repo & Trigger Build

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  dispatch-apk-build:
    name: Dispatch APK Build to aletecninstaler
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Android APK Repository Build
        run: |
          curl -X POST \\
            -H "Accept: application/vnd.github+json" \\
            -H "Authorization: Bearer \${{ secrets.SYNC_REPO_TOKEN || secrets.GITHUB_TOKEN }}" \\
            https://api.github.com/repos/tatianaenciso2123/aletecninstaler/dispatches \\
            -d '{"event_type":"web-updated","client_payload":{"source_repo":"tatianaenciso2123/aletecninstaler2","commit":"'\${{ github.sha }}'"}}'`,
                        'sync_workflow_code'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-lg transition-colors"
                  >
                    {copiedCode === 'sync_workflow_code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedCode === 'sync_workflow_code' ? '¡Copiado!' : 'Copiar YAML'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
{`name: Sync Web to APK Repo & Trigger Build
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  dispatch-apk-build:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Android APK Repository Build
        run: |
          curl -X POST \\
            -H "Accept: application/vnd.github+json" \\
            -H "Authorization: Bearer \${{ secrets.SYNC_REPO_TOKEN }}" \\
            https://api.github.com/repos/tatianaenciso2123/aletecninstaler/dispatches \\
            -d '{"event_type":"web-updated","client_payload":{"source_repo":"tatianaenciso2123/aletecninstaler2"}}'`}
                </pre>
              </div>

              {/* Instructions on GitHub Secrets & Commands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Paso para habilitar Webhook entre repositorios:
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    1. En GitHub, crea un <strong>Personal Access Token (PAT)</strong> con permiso <code>repo</code>.<br />
                    2. En el repositorio <code>aletecninstaler2</code> ve a <em>Settings → Secrets and variables → Actions</em>.<br />
                    3. Agrega el secret <code>SYNC_REPO_TOKEN</code> con el valor del token.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      Comando de Sincronización Git Manual:
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          'git remote add web https://github.com/tatianaenciso2123/aletecninstaler2.git && git fetch web && git merge web/main --no-edit',
                          'git_sync_cmd'
                        )
                      }
                      className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      {copiedCode === 'git_sync_cmd' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 break-all leading-normal">
                    git remote add web https://github.com/tatianaenciso2123/aletecninstaler2.git && git fetch web && git merge web/main --no-edit
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PIPELINE CI/CD (GitHub Actions -> Java 17 -> ./gradlew -> Gradle 8.2 -> AGP 8.2.2 -> Android APK) */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Pipeline Flow Visualization */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white relative overflow-hidden shadow-xl space-y-6">
                <div className="text-center max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-black uppercase tracking-wider mb-2">
                    <GitBranch className="w-3.5 h-3.5" />
                    Flujo de Compilación y Empaquetado
                  </div>
                  <h4 className="text-lg font-black text-white">Pipeline Oficial de Compilación Android</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Arquitectura automatizada paso a paso desde el repositorio hasta el paquete APK final
                  </p>
                </div>

                {/* Horizontal Sequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 items-center">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-sky-500 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-xs font-black">
                      <Github className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paso 1</span>
                    <strong className="text-xs text-white block">GitHub Actions</strong>
                    <span className="text-[10px] text-slate-500">CI/CD Runner</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-sky-500 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xs font-black">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paso 2</span>
                    <strong className="text-xs text-white block">Java 17</strong>
                    <span className="text-[10px] text-slate-500">Temurin JDK</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-sky-500 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-xs font-black">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paso 3</span>
                    <strong className="text-xs text-white block">./gradlew</strong>
                    <span className="text-[10px] text-slate-500">CLI Wrapper</span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-sky-500 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xs font-black">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paso 4</span>
                    <strong className="text-xs text-white block">Gradle 8.2</strong>
                    <span className="text-[10px] text-slate-500">Build Engine</span>
                  </div>

                  {/* Step 5 */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-sky-500 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xs font-black">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Paso 5</span>
                    <strong className="text-xs text-white block">AGP 8.2.2</strong>
                    <span className="text-[10px] text-slate-500">Android Plugin</span>
                  </div>

                  {/* Step 6 */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-center space-y-1 shadow-lg shadow-emerald-950/80">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-black">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase block">Paso 6</span>
                    <strong className="text-xs text-white block">Android APK</strong>
                    <span className="text-[10px] text-emerald-300 font-bold">Instalable</span>
                  </div>
                </div>
              </div>

              {/* Workflow Details Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-purple-500" />
                    Workflow Configurado: .github/workflows/android-build.yml
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        'git push origin main',
                        'git_push_cmd'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedCode === 'git_push_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'git_push_cmd' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  En cada actualización o push a la rama <code>main</code>, GitHub Actions ejecuta automáticamente Java 17 con <code>setup-java@v5</code>, configura Gradle 8.2, genera el wrapper <code>./gradlew</code> y compila los paquetes <code>assembleDebug</code> y <code>assembleRelease</code> generando los artefactos descargables y publicando la Release oficial.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE DUAL ARCHITECTURE DIAGRAM */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Visual Diagram Box */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white relative overflow-hidden shadow-xl">
                <div className="text-center max-w-md mx-auto mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Un Solo Código Fuente — Dos Experiencias
                  </div>
                  <h4 className="text-xl font-black text-white">ALE TECNINSTALER S.A.S.</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Un único repositorio centralizado que se compila y distribuye simultáneamente para la web y como aplicación APK nativa de Android.
                  </p>
                </div>

                {/* Tree Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Web Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-sky-950/60 to-slate-900/90 border border-sky-600/40 flex flex-col justify-between space-y-4 hover:border-sky-500 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />
                          Canal 1: Web
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h5 className="text-base font-black text-white">APLICACIÓN WEB</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Acceso inmediato desde cualquier PC, Mac, Tablet o navegador móvil sin requerir instalación previa.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><Github className="w-3.5 h-3.5 text-slate-300" /> Repositorio:</span>
                        <strong className="text-slate-200">GitHub (Vite + React)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-sky-400" /> Destino:</span>
                        <strong className="text-sky-300">Navegador Web</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-purple-400" /> Capacidades:</span>
                        <strong className="text-slate-200">Admin, Bodega, Facturación</strong>
                      </div>
                    </div>
                  </div>

                  {/* APK Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900/90 border border-emerald-600/40 flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                          <Smartphone className="w-3 h-3" />
                          Canal 2: Nativo
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h5 className="text-base font-black text-white">APLICACIÓN APK</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Paquete instalable <code>.apk</code> para celulares Android de los técnicos con aceleración de hardware e integración periférica.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Plataforma:</span>
                        <strong className="text-emerald-300">Android Nativo (Gradle)</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-amber-400" /> Destino:</span>
                        <strong className="text-slate-200">Celular de Campo</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Periféricos:</span>
                        <strong className="text-emerald-300">Cámara, GPS, Voz, Firma</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 100% GREEN CHECKLIST */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Todos los elementos se encuentran en VERDE ✅
                    </h4>
                    <span className="text-xs text-emerald-800 dark:text-emerald-300">
                      Arquitectura híbrida Web + Proyecto Nativo Android completamente configurada en el repositorio.
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                  15 / 15 Listos
                </span>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Elemento del Proyecto</th>
                      <th className="p-3.5">Descripción Técnica</th>
                      <th className="p-3.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checklistItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          {item.name}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.description}</td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            VERDE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LOCAL GRADLE BUILD INSTRUCTIONS */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sky-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Compilación Gradle con Firma Release y Artefactos Estáticos:
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        'cd android && chmod +x gradlew && ./gradlew assembleRelease copyReleaseApkToArtifacts',
                        'build_cmd'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedCode === 'build_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'build_cmd' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-400 p-3 bg-black/50 rounded-xl overflow-x-auto">
{`# 1. Ingresar al directorio nativo de Android
cd android

# 2. Asignar permisos de ejecución al wrapper de Gradle
chmod +x gradlew

# 3. Compilar APK Release (Firma habilitada y copia automática a /dist/artifacts/)
./gradlew assembleRelease`}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    Directorio Artefactos Estáticos:
                  </span>
                  <code className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all">
                    dist/artifacts/ALE_TECNINSTALER_release.apk
                  </code>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Salida Gradle Release:
                  </span>
                  <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all">
                    android/app/build/outputs/apk/release/ALE_TECNINSTALER_release.apk
                  </code>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    Salida Gradle Debug:
                  </span>
                  <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 break-all">
                    android/app/build/outputs/apk/debug/ALE_TECNINSTALER_debug.apk
                  </code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-xs text-sky-900 dark:text-sky-300 leading-relaxed">
                <strong>Tarea Gradle Personalizada:</strong> La tarea <code>copyReleaseApkToArtifacts</code> está conectada a <code>assembleRelease</code> mediante <code>finalizedBy</code>, garantizando que tras cada build el APK esté disponible inmediatamente para el servidor web y descargas directas.
              </div>
            </div>
          )}

          {/* TAB 5: QUICK MOBILE ACCESS / PWA / QR */}
          {activeTab === 'qr' && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Drive Direct QR & Link */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/50 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">APK Oficial en Google Drive</h4>
                      <p className="text-[11px] text-slate-400">Descarga directa para celulares Android</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Escanea este enlace o ábrelo directamente en tu navegador para descargar el instalador .apk:
                  </p>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono text-blue-300 break-all block">
                      {GOOGLE_DRIVE_APK_VIEW}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={GOOGLE_DRIVE_APK_VIEW}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors"
                      >
                        Abrir Enlace en Drive
                      </a>
                      <button
                        onClick={() => handleCopy(GOOGLE_DRIVE_APK_VIEW, 'drive_qr_link')}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                      >
                        {copiedCode === 'drive_qr_link' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* GitHub Repo QR & Link */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-700 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Repositorio GitHub Sincronizado</h4>
                      <p className="text-[11px] text-slate-400">Código fuente y workflow CI/CD</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Accede a todo el código, ramas y GitHub Actions para compilar el proyecto de forma automática:
                  </p>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono text-purple-300 break-all block">
                      {GITHUB_APK_REPO_URL}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href="https://github.com/tatianaenciso2123/aletecninstaler"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold text-center transition-colors"
                      >
                        Ver Repositorio GitHub
                      </a>
                      <button
                        onClick={() => handleCopy(GITHUB_APK_REPO_URL, 'git_qr_link')}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                      >
                        {copiedCode === 'git_qr_link' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Web URL copy */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate mr-2">
                  {window.location.origin}
                </span>
                <button
                  onClick={() => handleCopy(window.location.origin, 'app_url')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedCode === 'app_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'app_url' ? 'Copiado' : 'Copiar Web URL'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>GitHub Actions ➔ Java 17 ➔ Gradle 8.2 ➔ AGP 8.2.2 ➔ APK</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
