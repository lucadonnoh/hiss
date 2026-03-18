FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG PONDER_RPC_URL_8453
ENV PONDER_RPC_URL_8453=$PONDER_RPC_URL_8453

EXPOSE 42069
CMD ["npm", "run", "start"]
