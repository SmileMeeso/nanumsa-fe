FROM node AS node

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN echo "VITE_APP_API_URL=http://nanumsa-api-server/api" > .env
RUN echo "VITE_APP_SOCKET_URL=http://nanumsa-socket-server/socket" > .env

RUN pnpm run build --base=/

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
