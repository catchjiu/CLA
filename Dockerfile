# ---- Build Stage ----
FROM node:20-alpine as build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Consume build arguments for Vite environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build the Vite application
RUN npm run build

# ---- Production Stage (Nginx) ----
FROM nginx:alpine

# Copy the custom nginx configuration for SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to Coolify's internal network
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
