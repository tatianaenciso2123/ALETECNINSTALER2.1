import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit for image and audio data uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ALE. TECNINSTALER S.A.S. Hydraulic Multimodal AI Engine' });
});

// 1. AI Predictive Hydraulic Diagnosis with Model Selection (gemini-3.1-pro-preview / gemini-3.5-flash / gemini-3.1-flash-lite)
app.post('/api/gemini/predictive-diagnosis', async (req, res) => {
  try {
    const {
      equipmentType,
      brand,
      model,
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
      selectedModel = 'gemini-3.1-pro-preview',
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Local fallback
      const currentRatio = nominalCurrentAmps ? motorCurrentAmps / nominalCurrentAmps : 1;
      const pressureDiff = (dischargePressurePsi || 0) - (suctionPressurePsi || 0);
      const isOverloaded = currentRatio > 1.15;
      const highVibration = vibrationLevel === 'critical' || vibrationLevel === 'high';
      const riskScore = Math.min(
        98,
        Math.max(
          18,
          Math.round(
            (operatingHours > 8000 ? 30 : 10) +
            (lastMaintenanceMonths > 6 ? 25 : 5) +
            (isOverloaded ? 25 : 0) +
            (highVibration ? 20 : 5) +
            (observedSymptoms?.length ? observedSymptoms.length * 8 : 0)
          )
        )
      );

      return res.json({
        success: true,
        source: 'local_heuristic_engine',
        riskLevel: riskScore > 75 ? 'CRÍTICO' : riskScore > 45 ? 'MODERADO' : 'NORMAL',
        riskPercentage: riskScore,
        estimatedMTBFDays: Math.max(7, Math.round(180 - (riskScore * 1.6))),
        cavitationRisk: suctionPressurePsi < 5 && pressureDiff > 50 ? 'ALTO' : 'BAJO',
        thermalOverloadRisk: isOverloaded ? 'CRÍTICO' : 'NORMAL',
        imminentFailureProbability: `${riskScore}%`,
        probableRootCauses: [
          isOverloaded ? 'Desbalance de fases o sobrecarga mecánica en rodete/impulsor.' : 'Desgaste progresivo de sellos mecánicos por fricción.',
          highVibration ? 'Desalineación angular de acople motor-bomba o desbalance dinámico.' : 'Sedimentación y calcificación en cuerpo de bomba.',
          suctionPressurePsi < 5 ? 'Vórtice en succión o válvula de pie parcialmente obstruida.' : 'Fatiga en devanados del motor por fluctuaciones de voltaje.'
        ],
        actionProtocol: [
          'Efectuar prueba termográfica en bornes de conexión y carcasa del motor.',
          'Inspeccionar holgura axial y reemplazar sellos mecánicos de carburo de silicio.',
          'Verificar set points de presostato o parámetros de rampa en Variador de Frecuencia (VFD).',
          'Comprobar estado de cheque de retención y amortiguadores de golpe de ariete.'
        ],
        recommendedParts: ['Sello Mecánico 1 1/4" Carburo', 'Juego Rodamientos SKF C3', 'Manómetro Glicerina 0-150 PSI', 'Válvula Check Anti-ariete'],
        executiveSummary: `El equipo ${equipmentType} ${brand || ''} ${model || ''} registra un nivel de riesgo ${riskScore > 75 ? 'CRÍTICO' : 'MODERADO'}. Se evidencia ${highVibration ? 'vibración anómala y ' : ''}${isOverloaded ? 'sobrecorriente del ' + Math.round((currentRatio - 1) * 100) + '% sobre placa' : 'desgaste por horas de servicio'}. Se recomienda intervención preventiva prioritaria.`,
      });
    }

    const prompt = `Actúa como el Ingeniero Jefe Senior de Diagnóstico Hidráulico de "ALE. TECNINSTALER S.A.S.", empresa experta en Colombia en mantenimiento y montaje de sistemas de bombeo, hidroneumáticos, redes contra incendio (RCI, NFPA 20/25) y plantas de tratamiento.
Analiza con rigor técnico los siguientes parámetros del equipo y devuelve un diagnóstico predictivo detallado:

Parámetros del equipo:
- Tipo de equipo: ${equipmentType || 'Bomba centrífuga / Hidroneumático'}
- Marca / Modelo: ${brand || 'No especificada'} ${model || ''}
- Horas de operación acumuladas: ${operatingHours || 4500} hrs
- Meses desde último mantenimiento: ${lastMaintenanceMonths || 4} meses
- Presión de succión: ${suctionPressurePsi ?? 'N/A'} PSI
- Presión de descarga: ${dischargePressurePsi ?? 'N/A'} PSI
- Amperaje medido: ${motorCurrentAmps ?? 'N/A'} A (Nominal en placa: ${nominalCurrentAmps ?? 'N/A'} A)
- Nivel de vibración reportado: ${vibrationLevel || 'moderado'}
- Tipo de fluido / agua: ${waterType || 'Agua potable / Tanque reserva'}
- Síntomas y observaciones: ${Array.isArray(observedSymptoms) ? observedSymptoms.join(', ') : observedSymptoms || 'Ninguno reportado'}
- Fallas previas: ${previousFailures || 'Ninguna reciente'}

Devuelve un JSON estrictamente estructurado con las siguientes propiedades:
{
  "riskLevel": "CRÍTICO" | "MODERADO" | "NORMAL",
  "riskPercentage": número entre 0 y 100,
  "estimatedMTBFDays": número estimado de días antes del próximo fallo probable,
  "cavitationRisk": "ALTO" | "MEDIO" | "BAJO",
  "thermalOverloadRisk": "CRÍTICO" | "MODERADO" | "BAJO",
  "imminentFailureProbability": string con porcentaje (ej: "78%"),
  "probableRootCauses": [string, string, string],
  "actionProtocol": [string, string, string, string],
  "recommendedParts": [string, string, string],
  "executiveSummary": string conciso y técnico dirigido al cliente y al administrador
}`;

    const validModel = selectedModel === 'gemini-3.1-pro-preview' || selectedModel === 'gemini-3.5-flash' || selectedModel === 'gemini-3.1-flash-lite'
      ? selectedModel
      : 'gemini-3.1-pro-preview';

    const response = await ai.models.generateContent({
      model: validModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      success: true,
      source: validModel,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in predictive diagnosis API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing predictive hydraulic diagnosis',
    });
  }
});

// 2. Technical Copilot Assistant with Google Search Grounding (gemini-3.5-flash / gemini-3.1-pro-preview)
app.post('/api/gemini/technical-assistant', async (req, res) => {
  try {
    const { message, contextRole, useSearchGrounding = true, selectedModel = 'gemini-3.5-flash' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: `[Asistente Técnico ALE. TECNINSTALER]: Hemos recibido tu consulta sobre "${message}". Según las normas hidráulicas colombianas (NTC 1500 / RAS) y buenas prácticas de ALE. TECNINSTALER S.A.S., asegúrate de verificar la presión diferencial de corte (set points de presostato diferencial 20-40 PSI o 40-60 PSI), la precarga de aire en tanques de diafragma (2 PSI por debajo de la presión de encendido) y la rotación trifásica del motor.`,
        groundingChunks: [],
      });
    }

    const systemInstruction = `Eres "TECNI-COPILOT", el Asistente Técnico y de Ingeniería de "ALE. TECNINSTALER S.A.S.", empresa colombiana líder en ingeniería hidráulica, sistemas de bombeo hidroneumático, variadores de velocidad (VFD), redes contra incendio (NFPA 20/25) y tratamiento de agua.
Tu rol es asistir a ${contextRole === 'technician' ? 'TÉCNICOS E INGENIEROS DE CAMPO' : 'ADMINISTRADORES DE COPROPIEDADES Y CLIENTES FINALES'}.
Conocimientos clave:
- Marcas en Colombia: Barnes, Grundfos, Pedrollo, Franklin Electric, Evans, Goulds, Danfoss, Square D, Schneider Electric, WEG, Siemens.
- Curvas hidráulicas (Caudal Q vs Altura H), cálculo de NPSH disponible y evitación de cavitación.
- Ajuste de presostatos mecánicos (diferenciales 20/40, 30/50, 40/60 PSI), precarga de hidroacumuladores (tanques de diafragma).
- Normatividad: NTC 1500 (Código Colombiano de Fontanería), Decreto 1575 de 2007 (Lavado tanques agua potable), NSR-10, NFPA 20/25.
- Si usas búsqueda en Google, aporta especificaciones exactas, números de catálogo y referencias de repuestos.
- Tono: Profesional, directo, seguro y con formato Markdown claro con viñetas.`;

    const modelToUse = selectedModel === 'gemini-3.1-pro-preview' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';

    const config: any = {
      systemInstruction,
    };

    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: message,
      config,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      reply: response.text || 'Sin respuesta generada.',
      groundingChunks,
      modelUsed: modelToUse,
    });
  } catch (error: any) {
    console.error('Error in technical assistant:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Analyze Images & Video Content (gemini-3.1-pro-preview Multimodal Vision & Video Understanding)
app.post('/api/gemini/analyze-media', async (req, res) => {
  try {
    const {
      mediaBase64,
      mimeType,
      prompt = 'Analiza esta imagen o video de equipo hidráulico y genera un diagnóstico técnico de fallas, desgaste, placa de características y recomendaciones para el reporte técnico de ALE. TECNINSTALER S.A.S.',
      mediaType = 'image', // 'image' | 'video'
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: 'local_inspection_simulator',
        analysis: `[MODO INSPECCIÓN LOCAL ALE. TECNINSTALER]: Se ha procesado el archivo ${mediaType === 'video' ? 'de video' : 'de imagen'}. Se identifica visualmente conjunto de bombeo hidroneumático. Recomendación: Verificar hermeticidad en bridas, estado de pintura en tubería de impulsión y ausencia de goteo en el prensaestopa o sello mecánico.`,
      });
    }

    const cleanBase64 = mediaBase64.includes('base64,') ? mediaBase64.split('base64,')[1] : mediaBase64;

    const mediaPart = {
      inlineData: {
        mimeType: mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Actúa como Ingeniero Experto en Peritaje e Inspección Visual de "ALE. TECNINSTALER S.A.S." en Colombia.
Analiza detenidamente el material multimedia adjunto (${mediaType === 'video' ? 'Video en tiempo de operación' : 'Fotografía técnica de alta resolución'}).

Instrucciones de análisis:
1. **Identificación de Componentes**: Tipo de equipo (Bomba centrífuga, multietapa, sumergible, motor eléctrico, variador VFD, manómetro, presostato, válvula cheque, tanque de diafragma).
2. **Lectura de Placa de Características (si está visible)**: Marca, HP/KW, Voltaje (220V/440V), Amperaje nominal, RPM, Modelo.
3. **Detección de Anomalías / Daños**: Corrosión, fugas de agua en sello mecánico o empaquetadura, vibración o desalineación, cables sulfatados, manómetros dañados, desgaste por cavitación.
4. **Dictamen de Riesgo y Protocolo de Corrección**: Acciones inmediatas para el técnico de campo y repuestos sugeridos.

Pregunta / Contexto del usuario: "${prompt}"`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts: [mediaPart, textPart] },
    });

    return res.json({
      success: true,
      analysis: response.text || 'No se pudo generar el análisis visual.',
      modelUsed: 'gemini-3.1-pro-preview',
    });
  } catch (error: any) {
    console.error('Error in analyze-media:', error);
    return res.status(500).json({ error: error.message || 'Error analizando contenido multimedia' });
  }
});

// 4. Transcribe Technician Field Audio (gemini-3.5-flash Audio Transcription & Note Formatting)
app.post('/api/gemini/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', formatAsReport = true } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        transcription: 'Audio recibido en modo local. Transcripción simulada: "Se realizó mantenimiento preventivo a la bomba número 2. Se ajustaron bornes eléctricos, se limpió la canastilla de succión y la presión quedó estable en 55 PSI sin fugas."',
        formattedNotes: 'Mantenimiento preventivo ejecutado en Bomba #2. Ajuste de bornes eléctricos y limpieza de canastilla de succión. Presión de operación: 55 PSI.',
      });
    }

    const cleanBase64 = audioBase64.includes('base64,') ? audioBase64.split('base64,')[1] : audioBase64;

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const instructionText = formatAsReport
      ? `Transcribe con total exactitud las notas de voz del técnico de campo de "ALE. TECNINSTALER S.A.S." y devuélvelas en dos secciones claras en español:
1. **Transcripción Literal**: El texto hablado exacto.
2. **Resumen Técnico Estructurado para Hoja de Reporte**: Organizado con viñetas técnicas (Actividad Realizada, Parámetros Medidos, Repuestos Utilizados, Estado Final del Equipo).`
      : `Transcribe con total exactitud el audio en español.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [audioPart, { text: instructionText }] },
    });

    return res.json({
      success: true,
      transcription: response.text || 'Transcripción completada.',
      modelUsed: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Error in transcribe-audio:', error);
    return res.status(500).json({ error: error.message || 'Error transcribiendo audio' });
  }
});

// 5. Create & Edit Technical Hydraulic Images (gemini-3.1-flash-image / gemini-3.1-flash-lite-image)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      referenceImageBase64,
      referenceMimeType = 'image/jpeg',
      aspectRatio = '1:1',
      imageSize = '1K',
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      return res.status(400).json({
        error: 'Se requiere GEMINI_API_KEY para generación y edición de imágenes con Gemini.',
      });
    }

    const technicalPrompt = `Genera una ilustración técnica o esquema de ingeniería hidráulica profesional para "ALE. TECNINSTALER S.A.S.": ${prompt}. Estilo: Render de ingeniería CAD 3D de alta precisión, cortes transversales limpios de bombas, tuberías y válvulas de bronce/acero, etiquetas técnicas legibles, fondo industrial limpio y nítido.`;

    let response;

    if (referenceImageBase64) {
      // Image Editing with Gemini
      const cleanBase64 = referenceImageBase64.includes('base64,') ? referenceImageBase64.split('base64,')[1] : referenceImageBase64;
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: referenceMimeType,
              },
            },
            {
              text: `Edita y complementa esta imagen técnica de ingeniería hidráulica: ${prompt}`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '1:1',
            imageSize: (imageSize as any) || '1K',
          },
        },
      });
    } else {
      // New Image Generation
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: technicalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '1:1',
            imageSize: (imageSize as any) || '1K',
          },
        },
      });
    }

    let generatedImageUrl = '';
    let responseText = '';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        responseText += part.text;
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'El modelo no retornó una imagen. Mensaje: ' + (responseText || 'Sin datos de imagen.'),
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      text: responseText,
      modelUsed: 'gemini-3.1-flash-image',
    });
  } catch (error: any) {
    console.error('Error in generate-image:', error);
    return res.status(500).json({ error: error.message || 'Error generando imagen con Gemini' });
  }
});

// 6. Text-to-Speech (TTS) Voice Generation (gemini-3.1-flash-tts-preview)
app.post('/api/gemini/tts-voice', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(400).json({ error: 'GEMINI_API_KEY no disponible para TTS' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Di con tono técnico y seguro en español: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: (voiceName as any) || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No se generó audio' });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/pcm;rate=24000',
    });
  } catch (error: any) {
    console.error('Error in tts-voice:', error);
    return res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// Android APK & Native Package Download Endpoints
// Conectado con Web App (aletecninstaler2) + APK (aletecninstaler) + Google Drive
// =========================================================================
const GOOGLE_DRIVE_APK_VIEW = 'https://drive.google.com/file/d/1ZyJEPBGUknVCVEB4NDOYdyCkVcuqpgLf/view?usp=drive_link';
const GOOGLE_DRIVE_APK_DIRECT = 'https://drive.google.com/uc?export=download&id=1ZyJEPBGUknVCVEB4NDOYdyCkVcuqpgLf';
const GITHUB_APK_REPO_URL = 'https://github.com/tatianaenciso2123/aletecninstaler.git';
const GITHUB_WEB_REPO_URL = 'https://github.com/tatianaenciso2123/aletecninstaler2.git';

app.get('/api/download/apk/drive', (req, res) => {
  return res.redirect(GOOGLE_DRIVE_APK_DIRECT);
});

app.get('/api/sync/status', (req, res) => {
  res.json({
    status: 'connected',
    webRepository: GITHUB_WEB_REPO_URL,
    apkRepository: GITHUB_APK_REPO_URL,
    googleDriveApk: GOOGLE_DRIVE_APK_VIEW,
    autoSyncEnabled: true,
    ciPipeline: 'GitHub Actions (push/repository_dispatch) -> Sync -> npm run build -> Gradle 8.2 assembleRelease -> APK Release'
  });
});

app.get('/api/download/apk/release', (req, res) => {
  const possiblePaths = [
    // Artefactos estáticos generados por Gradle assembleRelease
    path.join(process.cwd(), 'dist/artifacts/ALE_TECNINSTALER_release.apk'),
    path.join(process.cwd(), 'public/artifacts/ALE_TECNINSTALER_release.apk'),
    path.join(process.cwd(), 'android/artifacts/ALE_TECNINSTALER_release.apk'),
    // Salidas estándar de compilación
    path.join(process.cwd(), 'android/app/build/outputs/apk/release/signed/ALE_TECNINSTALER_Release_Signed.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/release/ALE_TECNINSTALER_release.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/release/app-release-unsigned.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/release/app-release.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/debug/app-debug.apk'),
  ];

  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      return res.download(apkPath, 'ALE_TECNINSTALER_Release.apk');
    }
  }

  // Si no está en disco local, redirigir transparentemente al enlace directo oficial de Google Drive
  if (req.query.source === 'drive' || req.query.direct === 'true') {
    return res.redirect(GOOGLE_DRIVE_APK_DIRECT);
  }

  // Redirección por defecto al enlace de descarga de Google Drive oficial
  return res.redirect(GOOGLE_DRIVE_APK_DIRECT);
});

app.get('/api/download/apk/debug', (req, res) => {
  const possiblePaths = [
    path.join(process.cwd(), 'dist/artifacts/ALE_TECNINSTALER_debug.apk'),
    path.join(process.cwd(), 'android/artifacts/ALE_TECNINSTALER_debug.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/debug/ALE_TECNINSTALER_debug.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/debug/app-debug.apk'),
    path.join(process.cwd(), 'android/app/build/outputs/apk/release/signed/ALE_TECNINSTALER_Release_Signed.apk'),
  ];

  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      return res.download(apkPath, 'ALE_TECNINSTALER_Debug.apk');
    }
  }

  return res.redirect(GOOGLE_DRIVE_APK_DIRECT);
});

async function startServer() {
  const server = http.createServer(app);

  // WebSocket Server for Gemini Live Voice & Multimodal Audio Streaming
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Gemini Live WS] Client connected to real-time voice channel');
    const ai = getGenAI();

    if (!ai) {
      clientWs.send(
        JSON.stringify({
          error: 'GEMINI_API_KEY no configurado en el servidor para Live API.',
        })
      );
      clientWs.close();
      return;
    }

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'Eres TECNI-COPILOT de ALE. TECNINSTALER S.A.S., un asistente de ingeniería hidráulica por voz en tiempo real para técnicos en campo. Responde de forma concisa, técnica y clara en español de Colombia.',
        },
        callbacks: {
          onmessage: (message: any) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            // Send any text transcriptions
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
              clientWs.send(JSON.stringify({ text }));
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.video) {
            session.sendRealtimeInput({
              video: { data: parsed.video, mimeType: 'image/jpeg' },
            });
          } else if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (e) {
          console.error('[Gemini Live WS] Error processing message:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error('[Gemini Live WS] Connection error:', err);
      clientWs.send(JSON.stringify({ error: err.message }));
      clientWs.close();
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ALE. TECNINSTALER S.A.S. Server running on port ${PORT}`);
  });
}

startServer();
