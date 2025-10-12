# Stage 1: Runtime
FROM node:20-alpine AS runner

# Опционально: для корректной работы некоторых npm пакетов
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Копируем готовый билд NestJS
COPY apps/backend/dist ./
RUN npm install --omit=dev

# Настройки окружения
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

# Используем dumb-init для корректной обработки сигналов (SIGTERM/SIGINT)
CMD ["dumb-init", "node", "main.js"]
