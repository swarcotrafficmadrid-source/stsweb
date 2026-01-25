FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_STAGING_GATE_ENABLED
ENV VITE_STAGING_GATE_ENABLED=$VITE_STAGING_GATE_ENABLED
ARG VITE_STAGING_USER
ENV VITE_STAGING_USER=$VITE_STAGING_USER
ARG VITE_STAGING_PASS
ENV VITE_STAGING_PASS=$VITE_STAGING_PASS
COPY package.json ./
RUN npm cache clean --force && npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
