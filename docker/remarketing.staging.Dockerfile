FROM node:12-alpine as builder

WORKDIR /build
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build:staging

FROM node:12-alpine

RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

WORKDIR /app
COPY --from=builder /build/node_modules node_modules
COPY --from=builder /build/package.json package.json
COPY --from=builder /build/build .

EXPOSE 5000

CMD ["npm", "run", "start:staging"]