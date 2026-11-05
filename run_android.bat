@echo off
title Péthar Android Wallet Launcher
cd /d "d:\Pethar\pethar-wallet"
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
set "ANDROID_HOME=C:\Users\jacks\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%"

echo ============================================================
echo   Starting Péthar Android Emulator (Pixel_PeThar)
echo ============================================================

start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_PeThar -gpu host

echo.
echo Waiting for Android device to connect...
"%ANDROID_HOME%\platform-tools\adb.exe" wait-for-device

echo Android device connected! Waiting for boot completion...
:wait_boot
for /f "tokens=*" %%a in ('"%ANDROID_HOME%\platform-tools\adb.exe" shell getprop sys.boot_completed 2^>nul') do set BOOT=%%a
if "%BOOT%"=="1" goto booted
timeout /t 2 /nobreak >nul
goto wait_boot

:booted
echo Android emulator is ready!
echo Deploying Péthar Wallet app...
flutter run -d Pixel_PeThar
pause

