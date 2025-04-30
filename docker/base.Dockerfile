# docker/base.Dockerfile
FROM node AS deps

WORKDIR /app

# Install Yarn Berry globally
RUN npm install -gf yarn
RUN yarn set version berry

# Copy yarn configuration files
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Copy package.json and workspace definitions
COPY package.json yarn.lock ./


# Copy workspaces package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/e2e/package.json ./apps/e2e/

# multi-stage builds
FROM node AS builder
WORKDIR /app
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.pnp.* ./

# Copy the rest of the application
COPY . .
