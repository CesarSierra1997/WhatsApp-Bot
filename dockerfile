# Imagen optimizada para puppeteer y whatsapp-web.js
FROM ghcr.io/puppeteer/puppeteer:latest

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto que usará Express (Railway lo define con la variable PORT)
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["npm", "start"]
