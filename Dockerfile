FROM node:18-alpine as build

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_BASE_URL
ARG BUILD_DATE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV BUILD_DATE=$BUILD_DATE

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy build artifacts
COPY --from=build /app/dist .

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Fix line endings and make executable
RUN apk add --no-cache dos2unix && \
    dos2unix /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh && \
    apk del dos2unix

# Add build info for debugging
ARG BUILD_DATE
RUN echo "Build date: ${BUILD_DATE}" > /usr/share/nginx/html/build-info.txt

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
