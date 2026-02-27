FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY build-dist ./dist

EXPOSE 5000
CMD ["npm", "start"]
