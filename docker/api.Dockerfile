# docker/api.Dockerfile
FROM puretome/base:latest

# Set working directory to the API app
WORKDIR /app/apps/api

RUN yarn install
# Expose the port the API runs on
EXPOSE 5000

# Start command
CMD ["yarn", "dev"]