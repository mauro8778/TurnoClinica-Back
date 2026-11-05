# ==========================================
# Multi-stage Dockerfile para Alta Disponibilidad
# ==========================================

# Etapa 1: Build & Dependencias
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Runtime de Producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Usuario no privilegiado para seguridad bancaria / médica (Principle of Least Privilege)
USER node

EXPOSE 3001

CMD ["node", "dist/index.js"]
