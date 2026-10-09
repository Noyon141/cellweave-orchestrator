# Multi-stage Dockerfile for CellWeave Temporal Worker (Phase 0 Foundation)
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Copy contracts dependency
COPY ../cellweave-contracts /cellweave-contracts

# Copy orchestrator source and manifests
COPY package.json tsconfig.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY src ./src
RUN pnpm run build

# Production runner stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

COPY ../cellweave-contracts /cellweave-contracts
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/dist ./dist

# Run Temporal worker
CMD ["node", "dist/worker.js"]
