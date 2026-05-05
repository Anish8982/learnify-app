@echo off
REM Script to rebuild Android app with native modules

echo 🧹 Cleaning Android build...
call npx expo prebuild --clean --platform android

echo 📱 Building and running on Android...
call npx expo run:android

echo ✅ Done! The app should launch with expo-image-picker working.
