# Use Node.js for building
FROM node:18 as build

# Set working directory
WORKDIR /app

# Add ARG instruction to receive NPM_FLAGS
ARG NPM_FLAGS=""

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install ${NPM_FLAGS}

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lightweight server for production
FROM node:18-alpine

WORKDIR /app

# Copy built Next.js app
COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]
