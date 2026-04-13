FROM node:22-alpine AS build

WORKDIR /app

COPY Yak/package.json Yak/package-lock.json ./
RUN npm ci

COPY Yak/ .

# Copy shared data (short words allowlist used by both frontend and backend)
# Placed at ../shared/ to mirror the local repo structure for import paths
COPY shared/ ../shared/

ARG VITE_DISCORD_CLIENT_ID
ENV VITE_DISCORD_CLIENT_ID=$VITE_DISCORD_CLIENT_ID

RUN npx vue-tsc && npx vite build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY Yak/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
