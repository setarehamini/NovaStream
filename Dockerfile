# Multi-stage Docker build for NovaStream
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Create data directory for file-backed storage fallback if DATABASE_URL is omitted
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
