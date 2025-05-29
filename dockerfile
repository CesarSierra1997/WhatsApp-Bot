FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
