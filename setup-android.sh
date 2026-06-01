#!/bin/bash
set -e

echo "=== Android SDK Setup ==="

# 1. Install Java JDK
echo "Installing Java JDK..."
sudo pacman -S --noconfirm jdk-openjdk

# 2. Create SDK directory structure
echo "Setting up Android SDK directories..."
mkdir -p ~/Android/sdk/platform-tools
mkdir -p ~/Android/sdk/platforms
mkdir -p ~/Android/sdk/build-tools

# 3. Symlink system adb into platform-tools
echo "Linking system adb..."
ln -sf /usr/sbin/adb ~/Android/sdk/platform-tools/adb

# 4. Set ANDROID_HOME in bashrc
echo "Setting ANDROID_HOME in ~/.bashrc..."
grep -q "ANDROID_HOME" ~/.bashrc || {
  echo "" >> ~/.bashrc
  echo "# Android SDK" >> ~/.bashrc
  echo 'export ANDROID_HOME=$HOME/Android/sdk' >> ~/.bashrc
  echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
}

# 5. Export for current session
export ANDROID_HOME=$HOME/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo ""
echo "=== Verification ==="
echo "ANDROID_HOME=$ANDROID_HOME"
echo "adb: $(which adb)"
echo "platform-tools/adb: $(ls -la ~/Android/sdk/platform-tools/adb 2>/dev/null | awk '{print $NF}')"
echo ""
echo "=== Done! ==="
echo "Now run:"
echo "  cd ~/Desktop/projects/gitPr/gssoc/UltimateHealth/frontend"
echo "  npx expo start"
