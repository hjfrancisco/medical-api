# ---- Etapa de Construcción (Builder) ----
# Usamos una imagen de Node.js para instalar dependencias y compilar el proyecto
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Etapa de Producción (Production) ----
# Usamos una imagen más ligera y copiamos solo lo necesario
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos solo las dependencias de producción
RUN npm install --omit=dev
# Copiamos el código ya compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist
# Copiamos el schema de Prisma para que esté disponible en producción
COPY --from=builder /app/prisma ./prisma

# El comando para arrancar la aplicación
CMD ["node", "dist/main"]