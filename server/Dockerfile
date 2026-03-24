# Build from repository root (Railway: set root directory to "." and Dockerfile path "server/Dockerfile").
# The API compiles against monorepo paths: ../src/lib/shared, ../src/types, etc.
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --legacy-peer-deps

COPY server/ ./server/
COPY src/lib/shared /app/src/lib/shared
COPY src/types /app/src/types
COPY src/lib/agent-id-normalize.ts /app/src/lib/agent-id-normalize.ts

RUN cd server && npm run build

# Expose the port (Railway sends PORT env var, but good to document)
EXPOSE 5000

# Start the application
CMD ["sh", "-c", "cd server && npm start"]
