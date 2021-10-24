# Base image
FROM node:latest

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions & Install app dependencies
COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock

RUN yarn install

COPY . /usr/src/app

CMD ["yarn", "dev"]