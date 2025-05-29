#!/usr/bin/env bash

# Update package lists
echo "Actualizando listas de paquetes..."
apt-get update

# Install dependencies required for Puppeteer/Chrome
echo "Instalando dependencias para Puppeteer/Chrome..."
apt-get install -y \
    libgobject-2.0-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    libsecret-1-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    xdg-utils \
    wget \
    ca-certificates \
    gstreamer1.0-gl \
    gstreamer1.0-plugins-base

echo "Dando permisos de ejecución a build.sh..."
chmod +x build.sh

echo "Instalación completada."

