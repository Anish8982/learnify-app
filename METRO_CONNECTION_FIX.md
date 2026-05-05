# Metro Connection Fix for Android

## Quick Fix (Try First)
```bash
adb reverse tcp:8081 tcp:8081
```
Then tap **RELOAD** on your device.

## If Quick Fix Doesn't Work

### Option 1: Restart Everything
```bash
# 1. Stop Metro bundler (Ctrl+C in the terminal running it)

# 2. Clear Metro cache
npx expo start -c

# 3. In another terminal, run:
adb reverse tcp:8081 tcp:8081

# 4. Reload the app on device (shake device > Reload)
```

### Option 2: Use Dev Settings on Device
1. Shake your device or press `Ctrl+M` (emulator) / `Cmd+M` (Mac)
2. Tap "Settings"
3. Tap "Debug server host & port for device"
4. Enter: `localhost:8081`
5. Go back and tap "Reload"

### Option 3: Check Firewall
Make sure Windows Firewall isn't blocking port 8081:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and make sure both Private and Public are checked

### Option 4: Use Your Computer's IP
If USB connection isn't working, use WiFi:

1. Find your computer's IP address:
```bash
ipconfig
```
Look for "IPv4 Address" (usually 192.168.x.x)

2. On device, shake and go to Settings
3. Enter: `YOUR_IP:8081` (e.g., `192.168.1.100:8081`)
4. Make sure device and computer are on same WiFi network

### Option 5: Rebuild the App
```bash
# Stop Metro
# Clear cache
npx expo start -c

# In another terminal, rebuild
npx expo run:android
```

## Common Issues

### Issue: "Unable to load script"
**Solution:** Run `adb reverse tcp:8081 tcp:8081` and reload

### Issue: Metro is running but device can't connect
**Solution:** 
- Check if another process is using port 8081
- Try killing all node processes and restart Metro

### Issue: Works on emulator but not physical device
**Solution:**
- Use WiFi connection method (Option 4 above)
- Or ensure USB debugging is enabled and cable is good

## Verify Connection
After applying fix, you should see in Metro terminal:
```
Android Bundling complete 1234ms
```

And the app should load successfully on your device.
