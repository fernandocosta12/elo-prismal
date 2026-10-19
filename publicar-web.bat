@echo off
cd /d "%~dp0"
set npm_config_yes=true
echo === Passo 1/3: componentes da versao web ===
call npx --yes expo install react-dom react-native-web @expo/metro-runtime
echo === Passo 2/3: gerando a versao web ===
if exist dist-web rmdir /s /q dist-web
call npx --yes expo export --platform web --output-dir dist-web --clear
if not exist dist-web\index.html (
  echo ERRO: a versao web nao foi gerada.
  echo FALHOU> dist-web-status.txt
  pause
  exit /b 1
)
copy /y dist-web\index.html dist-web\404.html >nul
echo OK> dist-web-status.txt
echo === Passo 3/3: pronto! Pode fechar esta janela. ===
pause
