FROM node:argon

RUN mkdir -p /src/app

RUN npm install nodemon -g

WORKDIR /src/app
ADD package.json package.json
RUN npm install

ADD nodemon.json nodemon.json
