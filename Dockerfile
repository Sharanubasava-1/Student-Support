# Build the backend service.
FROM node:22-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache openssl
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# Run the backend service.
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="edumerge_super_secret_jwt_key_2026"

COPY --from=server-builder /app/server ./server

WORKDIR /app/server
EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/prisma/seed.js && npm start"]
