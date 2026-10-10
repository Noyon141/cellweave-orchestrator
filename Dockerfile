# Multi-stage Dockerfile for CellWeave Temporal Worker (Phase 0 Foundation)
# Build command from workspace root:
#   docker build -f Dockerfile -t cellweave-orchestrator:test ..
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Copy contracts dependency to /app/cellweave-contracts so relative file:../cellweave-contracts resolves
COPY cellweave-contracts /app/cellweave-contracts

# Copy orchestrator source and manifests
WORKDIR /app/cellweave-orchestrator
COPY cellweave-orchestrator/package.json cellweave-orchestrator/tsconfig.json cellweave-orchestrator/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY cellweave-orchestrator/src ./src
RUN pnpm run build

# Production runner stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

COPY --from=builder /app/cellweave-contracts /app/cellweave-contracts
WORKDIR /app/cellweave-orchestrator
COPY cellweave-orchestrator/package.json cellweave-orchestrator/pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false

COPY --from=builder /app/cellweave-orchestrator/dist ./dist

# Run Temporal worker
CMD ["node", "dist/worker.js"]
