# Dockerfile for production deployment
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build argument for build-time env vars
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next's standalone-output file tracer misses sharp's native bindings — it
# dlopen's libvips-cpp.so at runtime, which is a dynamic load the tracer
# can't follow statically, so it's dropped from the trimmed node_modules it
# builds. Copy the full packages in explicitly (this is sharp's own
# documented workaround for Next.js standalone deployments) — without this,
# photo uploads fail at runtime with ERR_DLOPEN_FAILED even though the build
# itself succeeds.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img

# User-uploaded photos (see src/lib/photoStorage.ts). In production this path
# is bind-mounted from a host directory (docker-compose.prod.yml) so uploads
# survive every deploy — this mkdir just gives the mount point the right
# ownership before anything is mounted over it.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
ENV UPLOADS_DIR=/app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
