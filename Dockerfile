FROM node:19-alpine

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
