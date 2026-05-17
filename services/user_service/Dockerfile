FROM node:20-alpine

RUN addgroup -S userservice1406 && adduser -S userservice1406 -G userservice1406

# Install shared schema dependencies
COPY shared/package.json /home/shared/package.json
RUN cd /home/shared && npm install

WORKDIR /home/userservice1406/app

COPY services/user_service/package*.json ./
RUN npm install

COPY services/user_service/ .
COPY shared /home/shared

USER userservice1406

EXPOSE 4001

CMD ["node", "index.js"]
