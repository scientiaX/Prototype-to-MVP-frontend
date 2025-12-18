FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy artifacts from build stage
COPY --from=build /app/dist .

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Fix line endings (CRLF -> LF) for Windows deployments
RUN apk add --no-cache dos2unix && dos2unix /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
