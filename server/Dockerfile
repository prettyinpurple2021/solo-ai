FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port (Railway sends PORT env var, but good to document)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
