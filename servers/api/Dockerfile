# syntax = docker/dockerfile:1.2

FROM oven/bun:latest AS base

ENV NODE_ENV="production"
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3 ca-certificates

FROM base as codegen
WORKDIR /usr/src/app

# Copy source code
COPY . .

# Run turbo prune for docker build
RUN bun install turbo --global && \
    bun x turbo prune @saitamafun/api --docker

FROM base as builder
WORKDIR /usr/src/app

# Install node modules
COPY --from=codegen /usr/src/app/out/json .
RUN bun install --frozen-lockfile

# Build application
COPY --from=codegen /usr/src/app/out/full . 
RUN  bun x turbo build

FROM base as runner 
WORKDIR /usr/src/app

# Copy built application f
COPY --from=builder /usr/src/app/ .
WORKDIR /usr/src/app/servers/api

ENV HOST="0.0.0.0"
ENV PORT=10009
ENV NODE_ENV=production

CMD ["bun", "x", "pm2-runtime", "start", "ecosystem.config.js"]
