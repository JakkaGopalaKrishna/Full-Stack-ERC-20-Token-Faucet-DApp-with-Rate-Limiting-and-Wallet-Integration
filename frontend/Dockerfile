# Build stage
FROM node:20-slim AS build

WORKDIR /app

ARG VITE_RPC_URL
ARG VITE_TOKEN_ADDRESS
ARG VITE_FAUCET_ADDRESS

ENV VITE_RPC_URL=$VITE_RPC_URL
ENV VITE_TOKEN_ADDRESS=$VITE_TOKEN_ADDRESS
ENV VITE_FAUCET_ADDRESS=$VITE_FAUCET_ADDRESS

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
