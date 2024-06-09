#!/bin/bash

sharp -i src/assets/logo.png -o src/assets/icon/favicon-16x16.png resize 16 16
sharp -i src/assets/logo.png -o src/assets/icon/favicon-32x32.png resize 32 32
sharp -i src/assets/logo.png -o src/assets/icon/android-chrome-192x192.png resize 192 192
sharp -i src/assets/logo.png -o src/assets/icon/android-chrome-512x512.png resize 512 512
sharp -i src/assets/logo.png -o src/assets/icon/apple-touch-icon.png resize 180 180
sharp -i src/assets/logo.png -o src/assets/icon/favicon.ico resize 48 48