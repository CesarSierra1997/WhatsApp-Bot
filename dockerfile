FROM node:18-slim

# Evita problemas con Puppeteer (porque puppeteer-core no incluye Chromium)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instala Chromium y dependencias necesarias
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm-dev \
    libgtk-3-0 \
    libxshmfence-dev \
    libgconf-2-4 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /app

# Copia dependencias y código
COPY package*.json ./
RUN npm install
COPY . .

# Expone el puerto (opcional pero útil en Railway)
EXPOSE 8080

# Inicia la app
CMD ["npm", "start"]
