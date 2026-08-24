import React, { useState } from 'react';
import {
  Gauge,
  Droplets,
  Zap,
  Activity,
  Calculator,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';

export const HydraulicTools: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<'flow' | 'friction' | 'electrical' | 'pressure'>('flow');

  // 1. Flow Rate State
  const [tankVolumeLiters, setTankVolumeLiters] = useState<number>(500);
  const [fillTimeSeconds, setFillTimeSeconds] = useState<number>(45);

  const flowLitersPerSec = fillTimeSeconds > 0 ? (tankVolumeLiters / fillTimeSeconds) : 0;
  const flowGPM = flowLitersPerSec * 15.8503;
  const flowM3H = (flowLitersPerSec * 3600) / 1000;

  // 2. Friction Loss (Hazen-Williams)
  const [pipeDiameterInches, setPipeDiameterInches] = useState<number>(2.5); // 2.5 inches
  const [pipeLengthMeters, setPipeLengthMeters] = useState<number>(60);
  const [pipeFlowGpm, setPipeFlowGpm] = useState<number>(120);
  const [pipeMaterialC, setPipeMaterialC] = useState<number>(150); // PVC=150, HG=120, Steel=140

  // Hazen-Williams metric: hf = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
  const diameterMm = pipeDiameterInches * 25.4;
  const flowM3S = (pipeFlowGpm * 0.00378541) / 60;
  const frictionHeadLossM =
    pipeMaterialC > 0 && diameterMm > 0
      ? (10.67 * pipeLengthMeters * Math.pow(flowM3S, 1.852)) /
        (Math.pow(pipeMaterialC, 1.852) * Math.pow(diameterMm / 1000, 4.87))
      : 0;
  const frictionLossPsi = frictionHeadLossM * 1.42233;

  // 3. Electrical Phase Imbalance
  const [phaseR, setPhaseR] = useState<number>(28.5);
  const [phaseS, setPhaseS] = useState<number>(29.2);
  const [phaseT, setPhaseT] = useState<number>(32.8);
  const [nameplateCurrent, setNameplateCurrent] = useState<number>(26.5);

  const avgCurrent = (phaseR + phaseS + phaseT) / 3;
  const maxDeviation = Math.max(
    Math.abs(phaseR - avgCurrent),
    Math.abs(phaseS - avgCurrent),
    Math.abs(phaseT - avgCurrent)
  );
  const percentImbalance = avgCurrent > 0 ? (maxDeviation / avgCurrent) * 100 : 0;
  const overloadRatio = nameplateCurrent > 0 ? (Math.max(phaseR, phaseS, phaseT) / nameplateCurrent) * 100 : 100;

  // 4. Pressure Conversions
  const [inputPsi, setInputPsi] = useState<number>(70);
  const metersWaterColumn = inputPsi * 0.70307;
  const bars = inputPsi * 0.0689476;
  const buildingsFloorsEquiv = Math.round(metersWaterColumn / 3.0); // ~3m per floor

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-sky-600" />
            Suite de Cálculos & Diagnóstico Hidráulico en Campo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Herramientas técnicas normalizadas según NTC 1500, Hazen-Williams e IEC 60034 para ingenieros y técnicos.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveCalc('flow')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeCalc === 'flow'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Caudal (Q)
          </button>
          <button
            onClick={() => setActiveCalc('friction')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeCalc === 'friction'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Pérdidas Fricción
          </button>
          <button
            onClick={() => setActiveCalc('electrical')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeCalc === 'electrical'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Desbalance Trifásico
          </button>
          <button
            onClick={() => setActiveCalc('pressure')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeCalc === 'pressure'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Presión & Altura
          </button>
        </div>
      </div>

      {/* 1. Caudal Calculator */}
      {activeCalc === 'flow' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <Droplets className="w-5 h-5 text-sky-500" />
            Calculadora de Caudal Volumétrico (Q = V / t)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Volumen Medido (Litros):</label>
              <input
                type="number"
                value={tankVolumeLiters}
                onChange={(e) => setTankVolumeLiters(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Tiempo de Llenado (Segundos):</label>
              <input
                type="number"
                value={fillTimeSeconds}
                onChange={(e) => setFillTimeSeconds(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold"
              />
            </div>
          </div>

          {/* Results Card */}
          <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold uppercase">Litros por Segundo</div>
              <div className="text-2xl font-black text-sky-900 dark:text-sky-100 mt-1">{flowLitersPerSec.toFixed(2)} L/s</div>
            </div>
            <div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold uppercase">Galones por Minuto</div>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{flowGPM.toFixed(1)} GPM</div>
            </div>
            <div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold uppercase">Metros Cúbicos / Hora</div>
              <div className="text-2xl font-black text-sky-900 dark:text-sky-100 mt-1">{flowM3H.toFixed(2)} m³/h</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hazen-Williams Friction Losses */}
      {activeCalc === 'friction' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <Gauge className="w-5 h-5 text-indigo-500" />
            Cálculo de Pérdidas de Presión por Fricción (Hazen-Williams)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Diámetro Tubería (Pulgadas):</label>
              <input
                type="number"
                step="0.5"
                value={pipeDiameterInches}
                onChange={(e) => setPipeDiameterInches(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Longitud Total (Metros):</label>
              <input
                type="number"
                value={pipeLengthMeters}
                onChange={(e) => setPipeLengthMeters(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Caudal de Flujo (GPM):</label>
              <input
                type="number"
                value={pipeFlowGpm}
                onChange={(e) => setPipeFlowGpm(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Material (Coeficiente C):</label>
              <select
                value={pipeMaterialC}
                onChange={(e) => setPipeMaterialC(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value={150}>PVC Presión (C=150)</option>
                <option value={140}>Acero Ranurado Victaulic (C=140)</option>
                <option value={130}>Cobre Tipo L/K (C=130)</option>
                <option value={120}>Hierro Galvanizado (C=120)</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold uppercase">Pérdida de Carga Dinámica</div>
              <div className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mt-1">{frictionHeadLossM.toFixed(2)} m.c.a.</div>
            </div>
            <div>
              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold uppercase">Caída de Presión Estimada</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{frictionLossPsi.toFixed(2)} PSI</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desbalance Eléctrico Trifásico IEC 60034 */}
      {activeCalc === 'electrical' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <Zap className="w-5 h-5 text-amber-500" />
            Desbalance de Fases & Sobrecarga de Motor Eléctrico (Norma IEC / NEMA)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Fase R (Amperios):</label>
              <input
                type="number"
                step="0.1"
                value={phaseR}
                onChange={(e) => setPhaseR(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Fase S (Amperios):</label>
              <input
                type="number"
                step="0.1"
                value={phaseS}
                onChange={(e) => setPhaseS(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Fase T (Amperios):</label>
              <input
                type="number"
                step="0.1"
                value={phaseT}
                onChange={(e) => setPhaseT(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Corriente Placa (In):</label>
              <input
                type="number"
                step="0.1"
                value={nameplateCurrent}
                onChange={(e) => setNameplateCurrent(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${
              percentImbalance > 5
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300'
            }`}>
              <div className="text-xs font-semibold uppercase">Desbalance de Corriente (% NEMA):</div>
              <div className="text-2xl font-black mt-1">{percentImbalance.toFixed(1)}%</div>
              <div className="text-[11px] mt-1">
                {percentImbalance > 5
                  ? 'CRÍTICO: Excede límite admisible del 5%. Alto riesgo de sobrecalentamiento del devanado.'
                  : 'NORMAL: Dentro de los límites seguros (menor a 5%).'}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              overloadRatio > 105
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-300'
                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 text-sky-800 dark:text-sky-300'
            }`}>
              <div className="text-xs font-semibold uppercase">Factor de Carga de Motor:</div>
              <div className="text-2xl font-black mt-1">{overloadRatio.toFixed(1)}% de In</div>
              <div className="text-[11px] mt-1">
                {overloadRatio > 115
                  ? 'PELIGRO: Disparo térmico inminente en guardamotor.'
                  : 'Nivel de carga de motor balanceado.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Presión vs Altura */}
      {activeCalc === 'pressure' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <Activity className="w-5 h-5 text-emerald-500" />
            Conversor de Presión Hidrostática & Altura Edificios
          </div>

          <div className="text-xs">
            <label className="block text-slate-500 font-semibold mb-1">Presión en Manómetro (PSI):</label>
            <input
              type="number"
              value={inputPsi}
              onChange={(e) => setInputPsi(parseFloat(e.target.value) || 0)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-black text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Altura Manométrica (m.c.a.)</div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{metersWaterColumn.toFixed(1)} m</div>
            </div>
            <div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Presión en Bar</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{bars.toFixed(2)} Bar</div>
            </div>
            <div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Pisos de Edificio Aprox.</div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">~{buildingsFloorsEquiv} Pisos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
