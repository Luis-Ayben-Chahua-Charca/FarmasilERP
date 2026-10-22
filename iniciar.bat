@echo off
chcp 65001 >nul
title Farmasil
cd /d "%~dp0"

rem Usa el Node portatil de la carpeta "node"; si no existe, el instalado en el equipo
set "NODE=%~dp0node\node.exe"
if not exist "%NODE%" set "NODE=node"

"%NODE%" --version >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js. Revise que exista la carpeta "node" junto a este archivo.
  pause
  exit /b 1
)

if not exist "%~dp0node_modules" (
  echo Faltan archivos de la aplicacion ^(carpeta node_modules^). Vuelva a copiar la carpeta completa.
  pause
  exit /b 1
)

echo Iniciando Farmasil...
echo NO CIERRE ESTA VENTANA mientras use el sistema. Para salir, cierrela.
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
"%NODE%" app\server.js
echo.
echo El sistema se detuvo. Si no lo cerro usted, avise al equipo de soporte.
pause
