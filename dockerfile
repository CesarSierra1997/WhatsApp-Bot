# Imagen base de Node.js ligera
FROM node:18-slim

# Instala dependencias del sistema necesarias para Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
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
    --no-install-recommends \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Crea la carpeta de trabajo
WORKDIR /app

# Copia package.json e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto de la app
COPY . .

# Expone el puerto (importante para Railway)
EXPOSE 8080

# Inicia la aplicación
CMD ["npm", "start"]
