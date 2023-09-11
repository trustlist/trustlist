#!/bin/bash
set -ex

env=$1
 
tasks="unirep-frontend-$env unirep-relayer-$env unirep-node-$env"
for task in $tasks; do
  service_name=$(echo $task | awk -F- '{ print $2 }')
  unirep_revision=$(aws ecs describe-task-definition --task-definition $task --query "taskDefinition.revision")
  aws ecs update-service --cluster unirep-$env --service $service_name --force-new-deployment --task-definition $task:$unirep_revision
done

aws ecs wait services-stable --cluster unirep-$env --services $tasks

exit 0
