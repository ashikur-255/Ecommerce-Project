# Stage 1: Build React App
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (utilizing layer caching)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build Arguments for Vite environment variables
ARG VITE_API_BASE_URL=/api
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLISHABLE_KEY=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Build production assets
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

