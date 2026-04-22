FROM node:18 AS frontend-build

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend .
RUN npm run build


#NGIX
FROM nginx:alpine

# Copy nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy frontend build into nginx
COPY --from=frontend-build /app/dist /usr/share/nginx/html