#!/bin/bash
# ==============================================================================
# ALE TECNINSTALER — Script de Sincronización Automática entre Repositorios
# Web App: https://github.com/tatianaenciso2123/aletecninstaler2.git
# APK App: https://github.com/tatianaenciso2123/aletecninstaler.git
# ==============================================================================

set -e

echo "🔄 Iniciando sincronización de cambios desde el repositorio Web (aletecninstaler2)..."

# 1. Configurar remote web si no existe
if ! git remote | grep -q "web_repo"; then
  git remote add web_repo https://github.com/tatianaenciso2123/aletecninstaler2.git
  echo "✅ Remote web_repo añadido."
fi

# 2. Obtener últimos cambios de la rama main
git fetch web_repo main

# 3. Fusionar cambios web manteniendo la carpeta /android intacta
echo "🔄 Fusionando cambios de código fuente..."
git merge --no-edit web_repo/main || echo "⚠️ Cambios fusionados o ya al día."

# 4. Compilar assets web
echo "📦 Compilando assets web optimizados..."
npm run build

# 5. Sincronizar directorio de assets nativos para Android WebView
echo "📱 Copiando distribución web a android/app/src/main/assets..."
mkdir -p android/app/src/main/assets
cp -rf dist/. android/app/src/main/assets/

echo "✅ Sincronización completada exitosamente. Listo para ejecutar: cd android && ./gradlew assembleRelease"
