# docker/api.Dockerfile
FROM puretome/base:latest

# Set working directory to the API app
WORKDIR /app/apps/e2e

RUN yarn install
RUN yarn playwright install-deps
RUN yarn playwright install
# Expose the port the API runs on
EXPOSE 9323

# Start command
CMD ["yarn", "test:e2e"]