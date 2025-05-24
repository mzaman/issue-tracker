# Stage 1: Build stage (development)
FROM node:20 AS development

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Install nodemon globally for dev hot reload
RUN npm install -g nodemon

EXPOSE 8080

CMD ["nodemon", "index.js"]


# Stage 2: Production stage
FROM node:20 AS production

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]