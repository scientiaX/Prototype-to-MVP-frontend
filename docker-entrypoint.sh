#!/bin/sh
set -e

# Railway provides PORT environment variable
PORT=${PORT:-80}

# Create nginx config with dynamic port
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    include /etc/nginx/mime.types;
    index index.html;

    error_log /dev/stdout info;
    access_log /dev/stdout;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF

echo "Nginx will listen on port: ${PORT}"
cat /etc/nginx/conf.d/default.conf

exec "$@"
