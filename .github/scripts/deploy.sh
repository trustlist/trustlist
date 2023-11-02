#!/bin/bash
set -ex

env=$1
 
tasks="trustlist-node-$env trustlist-relayer-$env trustlist-frontend-$env"
for task in $tasks; do
  trustlist_revision=$(aws ecs describe-task-definition --task-definition $task --query "taskDefinition.revision")
  aws ecs update-service --cluster trustlist-$env --service $task --force-new-deployment --task-definition $task:$trustlist_revision
done

aws ecs wait services-stable --cluster trustlist-$env --services $tasks

exit 0
