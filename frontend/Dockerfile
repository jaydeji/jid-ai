# Stage 1 — build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN printenv | grep VITE_

# Install build tools (for some native deps)
RUN apk add --no-cache python3 make g++ bash

# Copy package files and install deps
COPY package.json package-lock.json vite.config.ts tsconfig.json ./
RUN npm ci

# Accept build arguments and set as ENV vars
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy source and build
COPY . .

RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: remove default nginx config if you have a custom one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
