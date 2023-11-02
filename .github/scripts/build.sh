#!/bin/bash
set -ex

build=$1
env=$2

[ $build = "enable" ] || exit 0

# Workaround to set env variables for frontend
sed -i "s/http:\/\/127.0.0.1:8000/https:\/\/trustlist-api-$env.pse.dev/g" packages/frontend/src/config.ts
sed -i "s/http:\/\/127.0.0.1:8545/https:\/\/trustlist-node-$env.pse.dev/g" config.ts

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -t trustlist-frontend-$env -f apps/frontend/Dockerfile .
docker tag trustlist-frontend-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-frontend-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-frontend-$env:latest

docker build -t trustlist-relayer-$env -f apps/relayer/Dockerfile .
docker tag trustlist-relayer-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-relayer-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-relayer-$env:latest

docker build -t trustlist-node-$env -f apps/node/Dockerfile .
docker tag trustlist-node-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-node-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/trustlist-node-$env:latest

exit 0
