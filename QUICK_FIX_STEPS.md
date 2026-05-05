# Quick Fix for "Unable to resolve expo-file-system" Error

## The Issue
Metro bundler is still running with the old cache and doesn't know about the newly installed `expo-file-system` package.

## Solution (Choose One)

### Option 1: Restart Metro with Cache Clear (Recommended)

1. **Stop Metro Bundler**
   - Go to the terminal where Metro is running
   - Press `Ctrl+C` to stop it

2. **Clear cache and restart**
   ```bash
   npx expo start -c
   ```

3. **Reload the app**
   - Press `R` in Metro terminal, or
   - Shake device and tap "Reload"

### Option 2: Full Rebuild (If Option 1 doesn't work)

1. **Stop Metro** (`Ctrl+C`)

2. **Clear cache**
   ```bash
   npx expo start -c
   ```

3. **In a NEW terminal, rebuild Android**
   ```bash
   npx expo run:android
   ```

### Option 3: Use the Helper Script

**Windows:**
```bash
restart-metro.bat
```

**Then reload the app on your device**

## Why This Happens

When you install a new native module (like `expo-file-system`):
1. The package is added to `node_modules`
2. But Metro bundler is still running with old cache
3. Metro doesn't know about the new package
4. You need to restart Metro to pick up the changes

## Verification

After restarting Metro, you should see:
```
✓ Metro waiting on exp://...
```

And the app should reload without the error.

## If Still Not Working

1. **Check package.json**
   - Verify `expo-file-system` is listed in dependencies
   - Should show: `"expo-file-system": "~55.0.19"`

2. **Reinstall dependencies**
   ```bash
   npm install
   ```

3. **Clear all caches**
   ```bash
   npx expo start -c --clear
   ```

4. **Rebuild from scratch**
   ```bash
   # Stop Metro
   # Delete build folders
   rm -rf android/app/build
   
   # Rebuild
   npx expo run:android
   ```

## Quick Commands Reference

```bash
# Clear cache and start
npx expo start -c

# Rebuild Android
npx expo run:android

# Reinstall dependencies
npm install

# Check if package is installed
npm list expo-file-system
```
