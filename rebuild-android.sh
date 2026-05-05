#!/bin/bash
# Script to rebuild Android app with native modules

echo "🧹 Cleaning Android build..."
npx expo prebuild --clean --platform android

echo "📱 Building and running on Android..."
npx expo run:android

echo "✅ Done! The app should launch with expo-image-picker working."
