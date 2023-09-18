FROM node:16-buster
RUN apt-get update ; apt-get install -y netcat-openbsd

COPY . /src

WORKDIR /src

RUN yarn
RUN yarn build

ARG PORT=4000
EXPOSE ${PORT}

CMD ["yarn", "frontend", "start"]
