FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist
# Removed start.sh dependency to separate concerns and avoid line-ending issues
# COPY start.sh ./start.sh
# RUN chmod +x start.sh

EXPOSE 3000

CMD ["/bin/sh", "-c", "serve -s dist -l ${PORT:-3000}"]
