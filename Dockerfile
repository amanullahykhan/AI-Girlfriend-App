# syntax=docker/dockerfile:1
FROM node:20-slim

WORKDIR /app

# 1. FIX CACHE PERMISSIONS FOR LOCAL AI
# Hugging Face Spaces (user 1000) needs a writable place to download AI models
RUN mkdir -p /app/.cache && chmod -R 777 /app/.cache
ENV HF_HOME=/app/.cache
ENV XDG_CACHE_HOME=/app/.cache

# Install dependencies and build
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Switch to root to create the startup script
USER root

# --- USE HEREDOC TO CREATE THE STARTUP SCRIPT ---
# We use 'serve' which you added to your package.json dependencies
RUN <<EOF cat > /app/start.sh
#!/bin/sh
echo "window.APP_CONFIG = {" > ./dist/config.js
echo "  VITE_FIREBASE_API_KEY: \"\$VITE_FIREBASE_API_KEY\"," >> ./dist/config.js
echo "  VITE_FIREBASE_AUTH_DOMAIN: \"\$VITE_FIREBASE_AUTH_DOMAIN\"," >> ./dist/config.js
echo "  VITE_FIREBASE_PROJECT_ID: \"\$VITE_FIREBASE_PROJECT_ID\"," >> ./dist/config.js
echo "  VITE_FIREBASE_APP_ID: \"\$VITE_FIREBASE_APP_ID\"," >> ./dist/config.js
echo "  VITE_GOOGLE_API_KEY: \"\$VITE_GOOGLE_API_KEY\"" >> ./dist/config.js
echo "};" >> ./dist/config.js

# Use the 'serve' you installed in package.json
exec npx serve -s dist -l 7860
EOF

RUN chmod +x /app/start.sh
RUN chown -R 1000:1000 /app

# Switch back to the Hugging Face user (UID 1000)
USER 1000

ENV HOST=0.0.0.0
ENV PORT=7860
EXPOSE 7860

# Start via the script
CMD ["/bin/sh", "/app/start.sh"]
