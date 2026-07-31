# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy root configs and package lock
COPY package*.json ./
COPY tsconfig.json ./

# Copy monorepo packages and workspaces
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/server ./apps/server

# Install all dependencies (including dev)
RUN npm ci

# Generate Prisma client and run tsc build across monorepo workspaces
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma
RUN npm run build

# Prune devDependencies to keep node_modules light for production
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy built outputs and pruned node_modules from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/shared ./packages/shared
COPY --from=builder /usr/src/app/packages/database ./packages/database
COPY --from=builder /usr/src/app/apps/server/dist ./apps/server/dist
COPY --from=builder /usr/src/app/apps/server/package*.json ./apps/server/

# Set up non-root user
USER node

EXPOSE 5000

CMD ["node", "apps/server/dist/index.js"]
