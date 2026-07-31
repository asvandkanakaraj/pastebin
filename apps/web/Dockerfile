# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/web ./apps/web

RUN npm ci

# Generate prisma client and compile builds
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma
RUN npm run build -w @pastebin/shared
RUN npm run build -w web

# Stage 2: Production Nginx
FROM nginx:alpine

# Copy built static client assets to Nginx html directory
COPY --from=builder /usr/src/app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
