# ---- Etapa de Construcción (Builder) ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# El script prebuild ya se encarga de 'prisma generate' aquí
RUN npm run build

# ---- Etapa de Producción (Production) ----
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
# Volvemos a generar el cliente de Prisma para el entorno de producción.
# Esto asegura que @prisma/client contenga nuestros modelos y enums.
RUN npx prisma generate
# ------------------------------------

# El comando para arrancar la aplicación en modo producción
CMD [ "npm", "run", "start:prod" ]