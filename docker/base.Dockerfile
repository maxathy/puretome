# docker/base.Dockerfile
FROM node

WORKDIR /app

# Install Yarn Berry globally
RUN npm install -gf yarn
RUN yarn set version berry

# Copy yarn configuration files
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Copy package.json and workspace definitions
COPY package.json .
COPY yarn.lock .

# Copy workspaces package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies - this respect the PnP architecture
RUN yarn install

# Copy the rest of the application
COPY . .
