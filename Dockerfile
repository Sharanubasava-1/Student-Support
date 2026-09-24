# Multi-stage Dockerfile for Edumerge Support Application

# Stage 1: Build Frontend Client
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# Stage 3: Final Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="edumerge_super_secret_jwt_key_2026"

COPY --from=server-builder /app/server ./server
COPY --from=client-builder /app/client/dist ./server/public

WORKDIR /app/server
EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/prisma/seed.js && npm start"]
