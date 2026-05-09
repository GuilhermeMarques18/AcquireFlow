FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache \
    postgresql-client \
    dumb-init \
    curl

COPY package*.json ./

FROM base AS deps

RUN npm ci --frozen-lockfile

FROM deps AS builder

COPY . .

RUN npm run build

FROM deps AS development

ENV NODE_ENV=development
ENV PORT=3000

COPY . .

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]


FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

RUN npm ci --frozen-lockfile --omit=dev && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/drizzle ./drizzle


COPY --from=builder /app/package.json ./package.json


RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]