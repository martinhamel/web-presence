FROM node:15 as dev
WORKDIR /app

CMD bash -c "npm ci && npm run start"

######################
FROM dev as prod

COPY package* ./
RUN npm ci 

COPY . .
RUN npm run test

RUN npm run build

CMD npm run start