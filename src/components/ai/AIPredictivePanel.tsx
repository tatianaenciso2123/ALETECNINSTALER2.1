import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Gauge,
  Activity,
  AlertTriangle,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Globe,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Layers,
  Upload,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Cpu,
  Sliders,
  FileText,
  Copy,
  Check,
  Play,
  Square,
  Radio,
} from 'lucide-react';

interface AIPredictivePanelProps {
  onOpenReportWithData?: (data: any) => void;
}

type AITab =
  | 'predictive'
  | 'copilot'
  | 'visual_analysis'
  | 'audio_transcribe'
  | 'image_generator'
  | 'live_voice';

export const AIPredictivePanel: React.FC<AIPredictivePanelProps> = ({ onOpenReportWithData }) => {
  const [activeTab, setActiveTab] = useState<AITab>('predictive');

  // ==========================================
  // 1. PREDICTIVE HYDRAULIC DIAGNOSIS STATE
  // ==========================================
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.1-pro-preview');
  const [equipmentType, setEquipmentType] = useState('Bomba Centrífuga Multietapa Vertical (Booster)');
  const [brand, setBrand] = useState('Barnes / Franklin Electric');
  const [modelNumber, setModelNumber] = useState('VR 15-06 10HP');
  const [hp, setHp] = useState<number>(10);
  const [operatingHours, setOperatingHours] = useState<number>(8450);
  const [lastMaintenanceMonths, setLastMaintenanceMonths] = useState<number>(7);
  const [suctionPressurePsi, setSuctionPressurePsi] = useState<number>(3.5);
  const [dischargePressurePsi, setDischargePressurePsi] = useState<number>(68);
  const [motorCurrentAmps, setMotorCurrentAmps] = useState<number>(31.4);
  const [nominalCurrentAmps, setNominalCurrentAmps] = useState<number>(26.5);
  const [vibrationLevel, setVibrationLevel] = useState<string>('high');
  const [waterType, setWaterType] = useState('Agua Potable (Tanque Subterráneo)');
  const [observedSymptoms, setObservedSymptoms] = useState<string>(
    'Ruido metálico similar a grava en la voluta, calentamiento en rodamiento superior (78°C) y ligera fluctuación de presión en el manómetro.'
  );
  const [previousFailures, setPreviousFailures] = useState<string>(
    'Reemplazo de sello mecánico hace 8 meses por goteo continuo.'
  );

  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // ==========================================
  // 2. TECNI-COPILOT CHAT & SEARCH GROUNDING
  // ==========================================
  const [copilotModel, setCopilotModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      text: string;
      time: string;
      groundingChunks?: Array<{ web?: { uri: string; title: string } }>;
      modelUsed?: string;
    }>
  >([
    {
      role: 'assistant',
      text: '¡Saludos! Soy **TECNI-COPILOT**, el asistente de ingeniería y normatividad hidráulica de **ALE. TECNINSTALER S.A.S.**\n\nCuento con conexión a **Búsqueda en Google en Tiempo Real** para consultar manuales de fabricantes (Barnes, Grundfos, Pedrollo, Evans, Danfoss, Square D), códigos de fontanería (NTC 1500, Decreto 1575) y normas de bombas contra incendio (NFPA 20/25). ¿En qué cálculo o diagnóstico te puedo apoyar hoy?',
      time: '08:00 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  // ==========================================
  // 3. MULTIMODAL IMAGE & VIDEO INSPECTION
  // ==========================================
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaMimeType, setMediaMimeType] = useState<string>('image/jpeg');
  const [visualPrompt, setVisualPrompt] = useState(
    'Realiza un peritaje visual exhaustivo: identifica tipo de equipo, lee la placa de características (HP, RPM, Voltaje, Amperaje), detecta fugas, corrosión, desgaste en acople o rodamientos y emite el dictamen técnico para la orden de trabajo.'
  );
  const [analyzingMedia, setAnalyzingMedia] = useState(false);
  const [mediaAnalysisResult, setMediaAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 4. AUDIO TRANSCRIPTION (TECHNICIAN NOTES)
  // ==========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // ==========================================
  // 5. IMAGE GENERATOR & SCHEMATIC EDITOR
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState(
    'Esquema isométrico 3D de ingeniería de una estación de bombeo hidroneumática con 3 bombas centrífugas multietapa verticales Barnes, múltiple de succión y descarga en acero al carbón de 3 pulgadas, válvulas check anti-ariete, 2 tanques hidroacumuladores de diafragma de 119 galones, presostatos diferenciales y tablero de control con variadores de frecuencia VFD Schneider.'
  );
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageReferenceBase64, setImageReferenceBase64] = useState<string | null>(null);
  const refImageInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 6. LIVE VOICE CONVERSATION STATE
  // ==========================================
  const [liveVoiceActive, setLiveVoiceActive] = useState(false);
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Kore' | 'Puck'>('Zephyr');
  const [liveTranscriptHistory, setLiveTranscriptHistory] = useState<
    Array<{ speaker: 'Técnico' | 'TECNI-COPILOT'; text: string }>
  >([
    {
      speaker: 'TECNI-COPILOT',
      text: 'Modo Manos Libres Activo. Puedes hablarme directamente desde el cuarto de bombas. Te escucharé y responderé en tiempo real con audio.',
    },
  ]);
  const [ttsLoading, setTtsLoading] = useState(false);

  // Copied toast state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Cleanup audio timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ----------------------------------------------------
  // HANDLERS: PREDICTIVE DIAGNOSIS
  // ----------------------------------------------------
  const handleRunPredictiveDiagnosis = async () => {
    setLoadingDiagnostic(true);
    setDiagnosticResult(null);

    try {
      const response = await fetch('/api/gemini/predictive-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentType,
          brand,
          model: modelNumber,
          hp,
          operatingHours,
          lastMaintenanceMonths,
          suctionPressurePsi,
          dischargePressurePsi,
          motorCurrentAmps,
          nominalCurrentAmps,
          vibrationLevel,
          waterType,
          observedSymptoms,
          previousFailures,
          selectedModel,
        }),
      });

      const data = await response.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      console.error('Error running diagnosis:', err);
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  const handleApplyPreset = (preset: 'cavitation' | 'overload' | 'optimal' | 'bearing_wear') => {
    if (preset === 'cavitation') {
      setSuctionPressurePsi(1.8);
      setDischargePressurePsi(72);
      setMotorCurrentAmps(29.8);
      setNominalCurrentAmps(26.5);
      setVibrationLevel('critical');
      setObservedSymptoms(
        'Golpeteo constante tipo cascajo metálico en la carcasa de la bomba, manómetro de succión en vacío parcial y pérdida de 20% en caudal de entrega.'
      );
    } else if (preset === 'overload') {
      setSuctionPressurePsi(12);
      setDischargePressurePsi(85);
      setMotorCurrentAmps(34.2);
      setNominalCurrentAmps(26.5);
      setVibrationLevel('high');
      setObservedSymptoms(
        'Motor recalentado a 88°C, disparo térmico del guardamotor cada 45 minutos y olor a aislamiento caliente.'
      );
    } else if (preset === 'bearing_wear') {
      setSuctionPressurePsi(10);
      setDischargePressurePsi(60);
      setMotorCurrentAmps(27.8);
      setNominalCurrentAmps(26.5);
      setVibrationLevel('high');
      setObservedSymptoms(
        'Zumbido de alta frecuencia en el extremo de accionamiento (DE), holgura radial detectada al girar el eje con la mano.'
      );
    } else {
      setSuctionPressurePsi(15);
      setDischargePressurePsi(65);
      setMotorCurrentAmps(24.2);
      setNominalCurrentAmps(26.5);
      setVibrationLevel('low');
      setObservedSymptoms('Operación suave, presión constante sin oscilación y temperatura normal (52°C).');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: COPILOT CHAT & SEARCH GROUNDING
  // ----------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text: userText, time: timeNow }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/gemini/technical-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          useSearchGrounding,
          selectedModel: copilotModel,
          contextRole: 'technician',
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Sin respuesta.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingChunks: data.groundingChunks || [],
          modelUsed: data.modelUsed || copilotModel,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Error de comunicación con el servicio de IA.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSpeakText = async (text: string, msgIndex: number) => {
    if (playingAudioId === msgIndex) {
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgIndex);
      const cleanText = text.replace(/[*_#`\[\]]/g, '').slice(0, 500);

      // Use Web Speech API as immediate zero-latency audio playback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-CO';
        utterance.rate = 1.05;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Speech error:', err);
      setPlayingAudioId(null);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: MULTIMODAL MEDIA INSPECTION
  // ----------------------------------------------------
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'image');
    setMediaMimeType(file.type || (isVid ? 'video/mp4' : 'image/jpeg'));

    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
      setMediaAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleMedia = (type: string) => {
    if (type === 'nameplate') {
      setMediaType('image');
      setMediaPreview(
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
      );
      setVisualPrompt(
        'Inspecciona la placa técnica del motor: extrae HP, RPM, factor de servicio, voltaje, amperaje nominal y calcula la corriente de sobrecarga admisible.'
      );
    } else if (type === 'impeller') {
      setMediaType('image');
      setMediaPreview(
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
      );
      setVisualPrompt(
        'Evalúa el estado del impulsor y voluta: detecta picaduras por cavitación, desgaste erosivo en álabes y determina si requiere rectificación o cambio total.'
      );
    } else {
      setMediaType('image');
      setMediaPreview(
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
      );
      setVisualPrompt(
        'Inspecciona el tablero eléctrico: identifica guardamotores, contactores, relés de sobrecarga térmica y evalúa si hay signos de sulfatación o cables flojos.'
      );
    }
    setMediaAnalysisResult(null);
  };

  const handleRunMediaAnalysis = async () => {
    if (!mediaPreview) return;
    setAnalyzingMedia(true);
    setMediaAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaBase64: mediaPreview,
          mimeType: mediaMimeType,
          prompt: visualPrompt,
          mediaType,
        }),
      });

      const data = await response.json();
      setMediaAnalysisResult(data.analysis || 'Análisis completado sin datos.');
    } catch (err: any) {
      setMediaAnalysisResult('Error al procesar el análisis visual con Gemini 3.1 Pro.');
    } finally {
      setAnalyzingMedia(false);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: AUDIO TRANSCRIPTION
  // ----------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Por favor autoriza los permisos de micrófono para grabar notas técnicas de campo.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBase64) return;
    setTranscribingAudio(true);
    setTranscriptionResult(null);

    try {
      const response = await fetch('/api/gemini/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: 'audio/webm',
          formatAsReport: true,
        }),
      });

      const data = await response.json();
      setTranscriptionResult(data.transcription || 'Transcripción vacía.');
    } catch (err) {
      setTranscriptionResult('Error en la transcripción con Gemini 3.5 Flash.');
    } finally {
      setTranscribingAudio(false);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: IMAGE GENERATOR & SCHEMATIC EDITOR
  // ----------------------------------------------------
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          referenceImageBase64: imageReferenceBase64,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        alert(data.error || 'No se pudo generar la imagen técnica.');
      }
    } catch (err: any) {
      alert('Error generando plano hidráulico con Gemini 3.1 Flash Image.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageReferenceBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // HANDLERS: LIVE VOICE CONVERSATION
  // ----------------------------------------------------
  const toggleLiveVoice = () => {
    if (liveVoiceActive) {
      setLiveVoiceActive(false);
      setLiveVoiceStatus('idle');
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setLiveVoiceActive(true);
      setLiveVoiceStatus('listening');

      // Greet user with speech
      if ('speechSynthesis' in window) {
        const greeting = new SpeechSynthesisUtterance(
          'Asistente de voz en vivo activado. Dime qué equipo estás inspeccionando o qué duda hidráulica tienes.'
        );
        greeting.lang = 'es-CO';
        greeting.rate = 1.05;
        window.speechSynthesis.speak(greeting);
      }
    }
  };

  const handleLiveVoicePrompt = (spokenText: string) => {
    setLiveTranscriptHistory((prev) => [...prev, { speaker: 'Técnico', text: spokenText }]);
    setLiveVoiceStatus('speaking');

    // Simulate direct voice answer
    setTimeout(() => {
      const answers: { [key: string]: string } = {
        presion:
          'Para regular el presostato Square D, aprieta la tuerca principal del resorte grande para subir la presión de corte y arranque simultáneamente. Luego ajusta la tuerca del diferencial pequeño para definir la ventana de encendido.',
        amperaje:
          'Si la bomba consume 31.4 Amperios y su placa indica 26.5, está operando con un 18% de sobrecarga. Verifica si la válvula de descarga está 100% abierta o si hay desgaste en los rodamientos aumentando la fricción.',
        cavitacion:
          'El ruido de cavitación ocurre por caída de presión en succión por debajo de la presión de vapor del agua. Revisa la canastilla de la válvula de pie o abre la llave de paso de succión.',
      };

      let answer =
        'Comprendido. Te recomiendo verificar el manómetro de glicerina y contrastar con la curva de la bomba para verificar que opera dentro de su punto de mayor eficiencia.';
      for (const [k, v] of Object.entries(answers)) {
        if (spokenText.toLowerCase().includes(k)) answer = v;
      }

      setLiveTranscriptHistory((prev) => [...prev, { speaker: 'TECNI-COPILOT', text: answer }]);

      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(answer);
        u.lang = 'es-CO';
        u.rate = 1.05;
        u.onend = () => setLiveVoiceStatus('listening');
        window.speechSynthesis.speak(u);
      } else {
        setLiveVoiceStatus('listening');
      }
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                CENTRO MULTIMODAL DE IA & DIAGNÓSTICO
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold">
                Gemini 3.1 Pro & 3.5 Flash
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingeniería Predictiva & Copiloto Hidráulico IA
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Plataforma avanzada con algoritmos STEM de predicción de fallas, visión artificial para peritaje de equipos, dictado por voz en campo, generación de planos isométricos y búsqueda en Google en tiempo real de manuales y normatividad colombiana.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('live_voice')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                activeTab === 'live_voice'
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              Asistente de Voz en Vivo
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('predictive')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'predictive'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-300" />
            <span>Diagnóstico STEM</span>
            <span className="text-[10px] font-normal opacity-80">Gemini 3.1 Pro</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'copilot'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-300" />
            <span>Copiloto + Google Search</span>
            <span className="text-[10px] font-normal opacity-80">Manuales & Normas</span>
          </button>

          <button
            onClick={() => setActiveTab('visual_analysis')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'visual_analysis'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>Visión & Video IA</span>
            <span className="text-[10px] font-normal opacity-80">Peritaje de Placas</span>
          </button>

          <button
            onClick={() => setActiveTab('audio_transcribe')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'audio_transcribe'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-300" />
            <span>Voz a Reporte</span>
            <span className="text-[10px] font-normal opacity-80">Dictado en Campo</span>
          </button>

          <button
            onClick={() => setActiveTab('image_generator')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'image_generator'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-indigo-300" />
            <span>Planos & Esquemas</span>
            <span className="text-[10px] font-normal opacity-80">Generación 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('live_voice')}
            className={`px-3.5 py-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
              activeTab === 'live_voice'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-300 animate-pulse" />
            <span>Voz Manos Libres</span>
            <span className="text-[10px] font-normal opacity-80">Live API</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STEM PREDICTIVE HYDRAULIC DIAGNOSIS                                */}
      {/* ========================================================================= */}
      {activeTab === 'predictive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Configuration Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Parámetros Operativos del Equipo
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedModel === 'gemini-3.1-pro-preview'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Gemini 3.1 Pro
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.5-flash')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedModel === 'gemini-3.5-flash'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    3.5 Flash
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedModel === 'gemini-3.1-flash-lite'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Flash Lite
                  </button>
                </div>
              </div>

              {/* Presets Bar */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Cargar Caso de Estudio / Falla Típica:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleApplyPreset('cavitation')}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    ⚠️ Cavitación Severa
                  </button>
                  <button
                    onClick={() => handleApplyPreset('overload')}
                    className="px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    🔥 Sobrecarga Motor
                  </button>
                  <button
                    onClick={() => handleApplyPreset('bearing_wear')}
                    className="px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors"
                  >
                    ⚙️ Desgaste Rodamientos
                  </button>
                  <button
                    onClick={() => handleApplyPreset('optimal')}
                    className="px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    ✅ Estado Óptimo
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipo de Equipo Hidráulico
                  </label>
                  <input
                    type="text"
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Marca y Fabricante
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Potencia Motor (HP)
                  </label>
                  <input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Presión Succión (PSI)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={suctionPressurePsi}
                    onChange={(e) => setSuctionPressurePsi(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Presión Descarga (PSI)
                  </label>
                  <input
                    type="number"
                    value={dischargePressurePsi}
                    onChange={(e) => setDischargePressurePsi(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Amperaje Medido (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={motorCurrentAmps}
                    onChange={(e) => setMotorCurrentAmps(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Amperaje Nominal Placa (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={nominalCurrentAmps}
                    onChange={(e) => setNominalCurrentAmps(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Síntomas Observados y Ruidos Anómalos
                  </label>
                  <textarea
                    rows={2}
                    value={observedSymptoms}
                    onChange={(e) => setObservedSymptoms(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleRunPredictiveDiagnosis}
                disabled={loadingDiagnostic}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {loadingDiagnostic ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Ejecutando Modelación STEM con {selectedModel}...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Calcular Diagnóstico Predictivo & MTBF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Results Panel */}
          <div className="lg:col-span-6 space-y-6">
            {diagnosticResult ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Dictamen de Ingeniería Predictiva
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Riesgo de Falla: {diagnosticResult.riskPercentage}% ({diagnosticResult.riskLevel})
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      diagnosticResult.riskLevel === 'CRÍTICO'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : diagnosticResult.riskLevel === 'MODERADO'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {diagnosticResult.riskLevel}
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">MTBF Estimado</span>
                    <strong className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {diagnosticResult.estimatedMTBFDays} días
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Riesgo Cavitación</span>
                    <strong
                      className={`text-base sm:text-lg font-black ${
                        diagnosticResult.cavitationRisk === 'ALTO'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {diagnosticResult.cavitationRisk}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sobrecarga Térmica</span>
                    <strong
                      className={`text-base sm:text-lg font-black ${
                        diagnosticResult.thermalOverloadRisk === 'CRÍTICO'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {diagnosticResult.thermalOverloadRisk}
                    </strong>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    Resumen Ejecutivo para la Copropiedad / Cliente
                  </h4>
                  <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                    {diagnosticResult.executiveSummary}
                  </p>
                </div>

                {/* Root Causes */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Causas Raíz Probables Detectadas:
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnosticResult.probableRootCauses?.map((cause: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Protocol Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Protocolo de Intervención Recomendado:
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnosticResult.actionProtocol?.map((action: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Parts */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Repuestos Sugeridos en Bodega:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnosticResult.recommendedParts?.map((part: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700"
                      >
                        📦 {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Motor de Predicción Listo
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Ingresa las mediciones de presión, amperaje y vibración tomadas en campo o pulsa uno de los botones de fallas típicas para generar el reporte predictivo inmediato.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TECNI-COPILOT CHAT WITH GOOGLE SEARCH GROUNDING                    */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Chat Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-black shadow-lg shadow-sky-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">TECNI-COPILOT</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-black">
                    En Línea
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Asistente Especializado en Ingeniería Hidráulica & NTC 1500
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Google Search Grounding Toggle */}
              <button
                onClick={() => setUseSearchGrounding(!useSearchGrounding)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  useSearchGrounding
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-sky-600 animate-spin' : 'text-slate-400'}`} />
                Google Search Grounding: {useSearchGrounding ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Consultas Rápidas:</span>
            <button
              onClick={() => setChatInput('¿Cómo calculo la Altura Dinámica Total (TDH) y el NPSH disponible para evitar cavitación en una bomba Barnes?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:border-sky-500 shrink-0 transition-colors"
            >
              📊 Cálculo TDH & NPSH
            </button>
            <button
              onClick={() => setChatInput('Instrucciones para regular un presostato Square D 40-60 PSI y precarga de aire en tanque de diafragma según NTC 1500.')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:border-sky-500 shrink-0 transition-colors"
            >
              ⚙️ Ajuste Presostato 40-60 PSI
            </button>
            <button
              onClick={() => setChatInput('Requisitos de la norma NFPA 20 para bombas contra incendio y pruebas de flujo con pitot en Colombia.')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:border-sky-500 shrink-0 transition-colors"
            >
              🚒 Red Contra Incendio NFPA 20
            </button>
            <button
              onClick={() => setChatInput('¿Qué procedimiento exige el Decreto 1575 de 2007 para lavado y desinfección de tanques de agua potable en Bogotá?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:border-sky-500 shrink-0 transition-colors"
            >
              🚰 Decreto 1575 Lavado Tanques
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-1">
                    <span className="font-bold text-[10px] opacity-70">
                      {msg.role === 'user' ? 'Técnico de Campo' : 'TECNI-COPILOT (ALE. TECNINSTALER)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-60">{msg.time}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleSpeakText(msg.text, i)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                          title="Escuchar respuesta"
                        >
                          {playingAudioId === i ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Google Search Grounding Badges */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Fuentes Verificadas en Google Search:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks.map((chunk, idx) => (
                          <a
                            key={idx}
                            href={chunk.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-[10px] font-semibold text-sky-700 dark:text-sky-300 hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            {chunk.web?.title || 'Documento Técnico'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  Consultando base de conocimientos y Google Grounding...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pregunta sobre curvas hidráulicas, presostatos, variadores de velocidad o normatividad..."
              className="flex-1 px-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTIMODAL IMAGE & VIDEO INSPECTION                                */}
      {/* ========================================================================= */}
      {activeTab === 'visual_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Peritaje Visual de Equipos & Placas
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black">
                  Gemini 3.1 Pro Multimodal
                </span>
              </div>

              {/* Sample Images Bar */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Ejemplos de Inspección Rápida:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSampleMedia('nameplate')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left text-xs bg-slate-50 dark:bg-slate-950 transition-colors"
                  >
                    🏷️ <strong>Placa de Motor</strong>
                    <span className="block text-[10px] text-slate-400">Lectura de HP y Amperaje</span>
                  </button>
                  <button
                    onClick={() => handleSampleMedia('impeller')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left text-xs bg-slate-50 dark:bg-slate-950 transition-colors"
                  >
                    ⚙️ <strong>Impulsor / Cavitación</strong>
                    <span className="block text-[10px] text-slate-400">Desgaste en álabes</span>
                  </button>
                  <button
                    onClick={() => handleSampleMedia('panel')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left text-xs bg-slate-50 dark:bg-slate-950 transition-colors"
                  >
                    ⚡ <strong>Tablero Eléctrico</strong>
                    <span className="block text-[10px] text-slate-400">Contactores y térmicos</span>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 text-center cursor-pointer hover:border-amber-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                {mediaPreview ? (
                  <div className="space-y-3">
                    {mediaType === 'video' ? (
                      <video src={mediaPreview} controls className="max-h-56 mx-auto rounded-2xl" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="max-h-56 mx-auto rounded-2xl object-cover" />
                    )}
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
                      ✓ Archivo cargado correctamente. Clic para cambiar.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Sube una fotografía de placa, bomba, sello o video de vibración
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      Formatos soportados: JPG, PNG, WEBP, MP4, WEBM
                    </span>
                  </div>
                )}
              </div>

              {/* Prompt Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Instrucción de Peritaje para la IA
                </label>
                <textarea
                  rows={3}
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleRunMediaAnalysis}
                disabled={!mediaPreview || analyzingMedia}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
              >
                {analyzingMedia ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analizando con Gemini 3.1 Pro Multimodal...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Ejecutar Inspección Visual & Diagnóstico
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Informe Técnico de Inspección Visual
                </h3>
              </div>

              {mediaAnalysisResult ? (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {mediaAnalysisResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">
                    Carga una foto o video y pulsa "Ejecutar Inspección Visual" para ver el informe estructurado generado por Gemini 3.1 Pro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIO TRANSCRIPTION (TECHNICIAN FIELD NOTES)                       */}
      {/* ========================================================================= */}
      {activeTab === 'audio_transcribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Grabadora de Notas de Campo
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                  Gemini 3.5 Flash Audio
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Dicta tus hallazgos, mediciones de manómetro y repuestos instalados con las manos libres en el cuarto de máquinas. La IA transcribirá y estructurará el texto para la Hoja de Reporte Digital.
              </p>

              {/* Mic Controls */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="relative inline-block">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 animate-pulse scale-110 shadow-rose-600/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40'
                    }`}
                  >
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isRecording ? 'Grabando Audio en Vivo...' : 'Presiona el Micrófono para Dictar'}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Duración: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {recordedAudioUrl && (
                  <div className="pt-2">
                    <audio src={recordedAudioUrl} controls className="w-full max-w-sm mx-auto" />
                  </div>
                )}
              </div>

              <button
                onClick={handleTranscribeAudio}
                disabled={!audioBase64 || transcribingAudio}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {transcribingAudio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transcribiendo y Estructurando con Gemini 3.5 Flash...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Transcribir & Formatear para Reporte Técnico
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Notas Estructuradas para Reporte
                </h3>
                {transcriptionResult && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptionResult);
                      setCopiedIndex(999);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 hover:bg-slate-200"
                  >
                    {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === 999 ? 'Copiado' : 'Copiar Texto'}
                  </button>
                )}
              </div>

              {transcriptionResult ? (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {transcriptionResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <Mic className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">
                    Graba tus notas de voz y pulsa "Transcribir & Formatear" para obtener el resumen listo para la hoja técnica.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GENERATIVE HYDRAULIC DIAGRAMS & IMAGE EDITING                      */}
      {/* ========================================================================= */}
      {activeTab === 'image_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Generador & Editor de Planos 3D
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-black">
                  Gemini 3.1 Flash Image
                </span>
              </div>

              {/* Sample Prompts */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Esquemas Predefinidos:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setImagePrompt(
                        'Esquema isométrico 3D de ingeniería de una estación de bombeo con 3 bombas multietapa Barnes, múltiple en acero de 3 pulgadas, tanques hidroacumuladores y tablero VFD Schneider.'
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 transition-colors"
                  >
                    🏢 <strong>Estación Booster 3 Bombas</strong>
                    <span className="block text-[10px] text-slate-400">Hidroneumático edificio</span>
                  </button>
                  <button
                    onClick={() =>
                      setImagePrompt(
                        'Corte transversal en corte CAD 3D de una bomba centrífuga horizontal mostrando rodamiento SKF, impulsor de bronce cerrado, sello mecánico de carburo y eje de acero inoxidable.'
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 transition-colors"
                  >
                    ⚙️ <strong>Corte Interno Bomba</strong>
                    <span className="block text-[10px] text-slate-400">Sello mecánico & rodetes</span>
                  </button>
                  <button
                    onClick={() =>
                      setImagePrompt(
                        'Diagrama unifilar eléctrico de fuerza y control para arrancador estrella-triángulo de bomba de 15HP con relé térmico y presostato de corte.'
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 transition-colors"
                  >
                    ⚡ <strong>Unifilar Estrella-Triángulo</strong>
                    <span className="block text-[10px] text-slate-400">Tablero de fuerza</span>
                  </button>
                  <button
                    onClick={() =>
                      setImagePrompt(
                        'Cuarto de bombas de Red Contra Incendio (RCI) según NFPA 20 con bomba principal diésel, bomba jockey eléctrica y múltiple de pruebas de flujo.'
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950 hover:border-indigo-500 transition-colors"
                  >
                    🚒 <strong>Cuarto RCI NFPA 20</strong>
                    <span className="block text-[10px] text-slate-400">Bomba diésel + jockey</span>
                  </button>
                </div>
              </div>

              {/* Prompt Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Descripción Técnica del Plano / Render Requerido
                </label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Relación de Aspecto:
                </span>
                <div className="flex gap-2">
                  {(['1:1', '16:9', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setImageAspectRatio(ratio)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
                        imageAspectRatio === ratio
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={generatingImage || !imagePrompt.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {generatingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generando Ilustración Técnica con Gemini 3.1 Flash Image...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Generar Plano / Render Isométrico
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Result Column */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  Visualización del Render Técnico
                </h3>
                {generatedImageUrl && (
                  <a
                    href={generatedImageUrl}
                    download="esquema-hidraulico-ale-tecninstaler.png"
                    className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                )}
              </div>

              {generatedImageUrl ? (
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 p-2">
                  <img
                    src={generatedImageUrl}
                    alt="Plano generado"
                    className="max-h-[480px] w-auto mx-auto rounded-xl object-contain shadow-2xl"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">
                    Ingresa los parámetros o selecciona un esquema predefinido para generar el render 3D de alta precisión.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LIVE HANDS-FREE VOICE ASSISTANT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'live_voice' && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 inline-flex items-center gap-1.5 mb-2">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                CANAL DE VOZ EN TIEMPO REAL
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Asistente de Voz Manos Libres para Cuarto de Bombas
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Diseñado para técnicos con las manos ocupadas en el manómetro o llaves de paso. Habla libremente para recibir soporte técnico de audio instantáneo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLiveVoice}
                className={`px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-2xl transition-all ${
                  liveVoiceActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40'
                }`}
              >
                {liveVoiceActive ? (
                  <>
                    <Square className="w-4 h-4" />
                    Detener Canal de Voz
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 animate-pulse" />
                    Iniciar Conversación por Voz
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Voice Pulse Waveform */}
          <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800 text-center space-y-6">
            <div className="flex items-center justify-center gap-1.5 h-16">
              {[40, 65, 85, 95, 75, 45, 60, 90, 100, 80, 50, 70, 90, 60, 40].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: liveVoiceActive ? `${Math.max(15, (h * (liveVoiceStatus === 'speaking' ? 1 : 0.4)))}%` : '15%',
                  }}
                  className={`w-2 rounded-full transition-all duration-150 ${
                    liveVoiceActive
                      ? liveVoiceStatus === 'speaking'
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-sky-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {liveVoiceActive
                  ? liveVoiceStatus === 'speaking'
                    ? '🔊 TECNI-COPILOT está respondiendo...'
                    : '🎙️ Escuchando tu consulta técnica...'
                  : 'Canal de voz en espera'}
              </h3>
              <span className="text-xs text-slate-400">
                {liveVoiceActive ? 'Habla claramente sobre cualquier anomalía o cálculo hidráulico' : 'Pulsa Iniciar Conversación por Voz'}
              </span>
            </div>

            {/* Quick Test Voice Commands */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                O pulsa para probar comandos por voz simulados:
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleLiveVoicePrompt('¿Cómo regulo la presión de arranque en el presostato?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700"
                >
                  🗣️ "Regular presión de arranque presostato"
                </button>
                <button
                  onClick={() => handleLiveVoicePrompt('El motor está consumiendo 31.4 Amperios y se calienta')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700"
                >
                  🗣️ "Motor con sobreamperaje 31.4A"
                </button>
                <button
                  onClick={() => handleLiveVoicePrompt('Siento ruido de cascajo en la tubería de succión')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700"
                >
                  🗣️ "Ruido de cavitación en succión"
                </button>
              </div>
            </div>
          </div>

          {/* Spoken History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Transcripción de la Conversación en Tiempo Real:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {liveTranscriptHistory.map((item, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl text-xs ${
                    item.speaker === 'Técnico'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-rose-950/40 border border-rose-900/50 text-rose-200'
                  }`}
                >
                  <strong className="block text-[11px] font-black opacity-80 mb-1">
                    {item.speaker}:
                  </strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
