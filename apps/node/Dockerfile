FROM node:16-buster
RUN apt-get update ; apt-get install -y netcat-openbsd

COPY . /src

WORKDIR /src

RUN yarn
RUN yarn build

ARG PORT=8545
EXPOSE ${PORT}

CMD ["./apps/node/run.sh"]
