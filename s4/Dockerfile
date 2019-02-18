FROM node:latest

WORKDIR /app

RUN chown 1000:1000 /app

ADD *.json ./
RUN npm install

ADD *.js ./

CMD node server.js
