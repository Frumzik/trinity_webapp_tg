# Stage 1: runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Устанавливаем serve для отдачи статических файлов
RUN npm install -g serve

# Копируем билд React приложения
COPY apps/admin/dist ./

# Настройка порта (можно переопределять через Docker)
ENV PORT=4201
EXPOSE ${PORT}

# Запуск сервера serve
CMD ["serve", "-s", ".", "-l", "4201"]
