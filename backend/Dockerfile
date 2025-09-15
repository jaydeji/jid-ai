# Stage 1 — install deps and build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ bash

# Copy package files and install deps
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 — runtime
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy built files and package manifest
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# Install only production deps
RUN npm ci --omit=dev
# RUN npm run seed:prod

EXPOSE 3001

CMD ["node", "dist/index.js"]
