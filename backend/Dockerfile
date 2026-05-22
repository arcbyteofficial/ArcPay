FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 3000

# Start the Node.js server
CMD ["npm", "start"]
