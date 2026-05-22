FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the frontend with the arguments
# Build the frontend with the arguments
ARG VITE_BACKEND_URL
ARG VITE_RAZORPAY_KEY
ARG VITE_PAYEE_VPA
ARG VITE_PAYEE_NAME

# Force Vite to see these variables by writing them directly into a .env file before building
RUN echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" >> .env && \
    echo "VITE_RAZORPAY_KEY=$VITE_RAZORPAY_KEY" >> .env && \
    echo "VITE_PAYEE_VPA=$VITE_PAYEE_VPA" >> .env && \
    echo "VITE_PAYEE_NAME=$VITE_PAYEE_NAME" >> .env

RUN npm run build

# Serve with Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle React Router and proper caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
