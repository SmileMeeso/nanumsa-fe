FROM node AS node

WORKDIR /app

ARG VITE_APP_ACCESS_KEY_ID
ARG VITE_APP_SECRET_ACCESS_KEY

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN echo "VITE_APP_API_URL=/api" > /app/.env \
    && echo "VITE_APP_SOCKET_URL=/socket" >> /app/.env \
    && echo "VITE_APP_ACCESS_KEY_ID=${VITE_APP_ACCESS_KEY_ID}" >> /app/.env \
    && echo "VITE_APP_SECRET_ACCESS_KEY=${VITE_APP_SECRET_ACCESS_KEY}" >> /app/.env

RUN pnpm run build --base=/

RUN rm .env

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
