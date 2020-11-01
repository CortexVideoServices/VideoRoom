FROM node:14-alpine
WORKDIR /app
COPY frontend .
RUN yarn install
ENV PATH /app/node_modules/.bin:$PATH
RUN yarn build