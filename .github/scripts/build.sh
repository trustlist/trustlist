#!/bin/bash
set -ex

build=$1
env=$2

[ $build = "enable" ] || exit 0

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -t unirep-frontend-$env apps/frontend/Dockerfile .
docker tag unirep-frontend-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-frontend-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-frontend-$env:latest

docker build -t unirep-relayer-$env apps/relayer/Dockerfile .
docker tag unirep-relayer-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-relayer-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-relayer-$env:latest

docker build -t unirep-node-$env apps/node/Dockerfile .
docker tag unirep-node-$env:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-node-$env:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/unirep-node-$env:latest

exit 0
exit 0
