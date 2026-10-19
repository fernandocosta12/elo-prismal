@echo off
cd /d "%~dp0"
set npm_config_yes=true
if exist dist-web-status.txt del dist-web-status.txt
echo === Passo 1/4: dependencias ===
call npm install
findstr /c:"expo-notifications" package.json >nul || call npx --yes expo install expo-camera expo-notifications > install-log.txt 2>&1
echo === Passo 2/4: checando o codigo ===
call npx tsc --noEmit > tsc-log.txt 2>&1
echo === Passo 3/4: gerando a versao web ===
if exist dist-web rmdir /s /q dist-web
call npx --yes expo export --platform web --output-dir dist-web --clear > export-log.txt 2>&1
if not exist dist-web\index.html (
  echo ERRO: a versao web nao foi gerada. Veja export-log.txt
  echo FALHOU> dist-web-status.txt
  pause
  exit /b 1
)
copy /y dist-web\index.html dist-web\404.html >nul
echo OK> dist-web-status.txt
echo === Passo 4/4: pronto! Pode fechar esta janela. ===
pause
