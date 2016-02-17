#!/bin/bash

# Always pull latest image
docker pull node:4

docker run \
    --rm -it \
    --name=npm-$(( $RANDOM % 99999 )) \
    -v $(pwd):/code \
    -w "/code" \
    node:4 npm --quiet ${*}
