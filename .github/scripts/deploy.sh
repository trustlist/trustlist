#!/bin/bash
set -ex

env=$1
 
tasks="trustlist-frontend-$env trustlist-relayer-$env trustlist-node-$env"
for task in $tasks; do
  trustlist_revision=$(aws ecs describe-task-definition --task-definition $task --query "taskDefinition.revision")
  aws ecs update-service --cluster trustlist-$env --service $task --force-new-deployment --task-definition $task:$trustlist_revision
done

for loop in {1..2}; do
  aws ecs wait services-stable --cluster trustlist-$env --services $tasks && break || continue
done

exit 0
