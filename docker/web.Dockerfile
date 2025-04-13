FROM node
WORKDIR /app
COPY apps/web/package.json .
RUN yarn install
COPY apps/web .
CMD ["yarn", "dev"]