FROM node:16 AS builder

WORKDIR /usr/src/historian

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npx nx export frontend

WORKDIR /usr/src/historian/apps/backend/
RUN npx prisma generate

WORKDIR /usr/src/historian
RUN npm run backend:build:prod

FROM node:16

COPY --from=builder /usr/src/historian/dist/ /usr/src/historian/dist/
COPY --from=builder /usr/src/historian/package*.json /usr/src/historian/
COPY --from=builder /usr/src/historian/node_modules /usr/src/historian/node_modules

CMD [ "npm", "run", "backend:run:prod" ]