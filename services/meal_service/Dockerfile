FROM node:20-alpine

RUN addgroup -S mealservice1406 && adduser -S mealservice1406 -G mealservice1406

# Install shared schema dependencies
COPY shared/package.json /home/shared/package.json
RUN cd /home/shared && npm install

WORKDIR /home/mealservice1406/app

COPY services/meal_service/package*.json ./
RUN npm install

COPY services/meal_service/ .
COPY shared /home/shared

USER mealservice1406

EXPOSE 4002

CMD ["node", "index.js"]
