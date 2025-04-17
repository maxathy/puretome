# docker/web.Dockerfile
FROM storynest/base:latest

# Set working directory to the web app
WORKDIR /app/apps/web

# Build the application
RUN yarn install

# Expose the port Vite runs on
EXPOSE 5173

# Start command
CMD ["yarn", "dev", "--host"]
