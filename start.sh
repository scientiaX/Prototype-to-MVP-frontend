#!/bin/sh
set -e

PORT=${PORT:-3000}

echo "Starting server on port: ${PORT}"

exec serve -s dist -l ${PORT}
