FROM node:20-alpine

RUN addgroup -S chickenservice && adduser -S chickenservice -G chickenservice

WORKDIR /home/chickenservice/app

COPY services/chicken_service/package*.json ./
RUN npm install

COPY services/chicken_service/ .

USER chickenservice

EXPOSE 4004

CMD ["node", "index.js"]
