@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem Arma dist\Farmasil: la carpeta lista para copiar a la laptop de la farmacia.
rem Requiere internet (solo para npm ci) y la carpeta "node" con node.exe portatil.

if not exist "node\node.exe" (
  echo Falta node\node.exe. Descargue el .zip de Node.js 24 LTS para Windows x64,
  echo descomprimalo y deje su contenido en la carpeta "node" de este proyecto.
  exit /b 1
)

for /f %%v in ('"node\node.exe" --version') do set "V_PORTATIL=%%v"
for /f %%v in ('node --version') do set "V_LOCAL=%%v"
if not "%V_PORTATIL%"=="%V_LOCAL%" (
  echo La version del Node portatil ^(%V_PORTATIL%^) no coincide con la del equipo ^(%V_LOCAL%^).
  echo Usen la misma version: better-sqlite3 descarga el binario de la version que ejecuta npm.
  exit /b 1
)

set "SALIDA=dist\Farmasil"
if exist "%SALIDA%" rmdir /s /q "%SALIDA%"
mkdir "%SALIDA%" || exit /b 1

xcopy "app" "%SALIDA%\app" /E /I /Q >nul || exit /b 1
xcopy "node" "%SALIDA%\node" /E /I /Q >nul || exit /b 1
xcopy "scripts" "%SALIDA%\scripts" /E /I /Q >nul || exit /b 1
copy /y "iniciar.bat" "%SALIDA%\" >nul || exit /b 1
copy /y "package.json" "%SALIDA%\" >nul || exit /b 1
copy /y "package-lock.json" "%SALIDA%\" >nul || exit /b 1

pushd "%SALIDA%"
call npm ci --omit=dev
if errorlevel 1 (
  popd
  echo Fallo npm ci.
  exit /b 1
)
popd

echo.
echo Listo: copie la carpeta "%SALIDA%" a la USB.
