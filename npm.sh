#!/bin/bash

# Always pull latest image
docker pull node:6

docker run \
  --rm -it \
  --name=npm-$(( $RANDOM % 99999 )) \
  -v $(pwd):/code \
  -w "/code" \
  node:6 npm --quiet ${*}
