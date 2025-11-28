# Build stage
FROM node:20-alpine as build

# Fix CVE-2024-58251 and CVE-2025-46394
RUN apk add --no-cache --upgrade busybox

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine as production

# Fix CVE-2024-58251 and CVE-2025-46394
RUN apk add --no-cache --upgrade busybox

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 9001

# Start the production server
CMD ["npm", "run", "server"]

# Development stage
FROM node:20-alpine as development

# Fix CVE-2024-58251 and CVE-2025-46394
RUN apk add --no-cache --upgrade busybox

WORKDIR /app

# Copy package files
COPY package*.json ./
# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]