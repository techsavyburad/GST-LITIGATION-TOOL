FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8058

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8058

CMD ["node", "server.js"]
