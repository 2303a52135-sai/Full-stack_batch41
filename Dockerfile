FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first for better layer caching
COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

# Copy backend source only (single-service deploy)
COPY backend ./backend

WORKDIR /app/backend

# Keep runtime values overridable by platform env vars
ENV NODE_ENV=production
ENV PORT=5000

# Ensure uploads path exists when local storage is used
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]