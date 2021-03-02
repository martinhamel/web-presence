FROM node:15 as dev
WORKDIR /app

CMD bash -c "npm ci && npm run dev"

######################
FROM dev as prod

COPY . .

RUN npm ci
RUN npm run test

CMD npm run start